/**
 * セーブ・ロードシステム - ゲーム状態の永続化と復元
 */

import type { GameState, SaveSlotInfo, GameConfig } from "../types/core.js";
import type { ISaveSystem, SceneInfo } from "../types/interfaces.js";

export interface SaveData {
  /** セーブデータバージョン */
  version: string;
  /** セーブID */
  saveId: string;
  /** セーブ日時 */
  timestamp: number;
  /** ゲーム状態 */
  gameState: GameState;
  /** スクリーンショット（Base64） */
  screenshot?: string;
  /** セーブ時のシーン情報 */
  sceneInfo?: {
    scenarioPath: string;
    sceneId: string;
    sceneTitle?: string;
    characterName?: string;
    currentText?: string;
  };
  /** セーブファイルサイズ */
  dataSize?: number;
}

export interface SaveSystemConfig {
  /** 最大セーブスロット数 */
  maxSaveSlots: number;
  /** オートセーブの有効化 */
  enableAutoSave: boolean;
  /** オートセーブ間隔（秒） */
  autoSaveInterval: number;
  /** クイックセーブの有効化 */
  enableQuickSave: boolean;
  /** スクリーンショットの保存 */
  saveScreenshots: boolean;
  /** 圧縮の有効化 */
  enableCompression: boolean;
  /** 暗号化の有効化 */
  enableEncryption: boolean;
  /** ローカルストレージキー */
  storageKey: string;
}

export class SaveLoadSystem implements ISaveSystem {
  private config: SaveSystemConfig;
  private gameConfig: GameConfig;
  private autoSaveTimer: number | null = null;
  // TODO: Phase 5 - 暗号化機能で使用予定
  // private encryptionKey: string = "nanatau_novel_game";

  constructor(gameConfig: GameConfig, config?: Partial<SaveSystemConfig>) {
    this.gameConfig = gameConfig;
    this.config = {
      maxSaveSlots: 20,
      enableAutoSave: true,
      autoSaveInterval: 300, // 5分
      enableQuickSave: true,
      saveScreenshots: true,
      enableCompression: false,
      enableEncryption: false,
      storageKey: "nanatau_novel_saves",
      ...config,
    };
  }

  /**
   * セーブシステムの初期化
   */
  async initialize(): Promise<void> {
    try {
      // セーブディレクトリの確認・作成
      await this.initializeStorage();

      // オートセーブの開始
      if (this.config.enableAutoSave) {
        this.startAutoSave();
      }

      console.log("SaveLoadSystem initialized");
    } catch (error) {
      console.error("Failed to initialize SaveLoadSystem:", error);
    }
  }

  /**
   * ストレージの初期化
   */
  private async initializeStorage(): Promise<void> {
    try {
      // ローカルストレージの利用可能性チェック
      if (typeof localStorage === "undefined") {
        throw new Error("LocalStorage not available");
      }

      // 既存のセーブデータ構造の確認・マイグレーション
      await this.migrateSaveData();

      console.log("Storage initialized");
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  /**
   * セーブデータのマイグレーション
   */
  private async migrateSaveData(): Promise<void> {
    // TODO: 古いバージョンからのマイグレーション処理
    console.log("Save data migration completed");
  }

  /**
   * ゲーム状態の保存
   */
  async saveGame(
    slotId: string,
    gameState: GameState,
    sceneInfo?: SceneInfo
  ): Promise<void> {
    try {
      // スクリーンショットの取得
      let screenshot: string | undefined;
      if (this.config.saveScreenshots) {
        screenshot = await this.captureScreenshot();
      }

      // セーブデータの作成
      const saveData: SaveData = {
        version: this.gameConfig.version || "1.0.0",
        saveId: slotId,
        timestamp: Date.now(),
        gameState: this.cloneGameState(gameState),
        screenshot: screenshot || "",
        dataSize: 0,
      };

      // sceneInfoがある場合のみ追加
      if (sceneInfo) {
        saveData.sceneInfo = {
          scenarioPath: sceneInfo.scenarioPath,
          sceneId: sceneInfo.sceneTitle, // Map sceneTitle to sceneId for compatibility
          sceneTitle: sceneInfo.sceneTitle,
          characterName: sceneInfo.characterName,
          currentText: sceneInfo.currentText,
        };
      }

      // データサイズの計算
      const serializedData = JSON.stringify(saveData);
      saveData.dataSize = new Blob([serializedData]).size;

      // データの処理（圧縮・暗号化）
      let processedData = serializedData;
      if (this.config.enableCompression) {
        processedData = await this.compressData(processedData);
      }
      if (this.config.enableEncryption) {
        processedData = await this.encryptData(processedData);
      }

      // ストレージに保存
      await this.writeToStorage(slotId, processedData);

      // セーブスロット情報の更新
      await this.updateSaveSlotInfo(saveData);

      console.log(`Game saved to slot: ${slotId}`);
    } catch (error) {
      console.error(`Failed to save game to slot ${slotId}:`, error);
      throw new Error(`Save failed: ${error}`);
    }
  }

  /**
   * ゲーム状態の読み込み
   */
  async loadGame(slotId: string): Promise<GameState> {
    try {
      // ストレージからデータを読み込み
      let data = await this.readFromStorage(slotId);
      if (!data) {
        throw new Error(`Save slot not found: ${slotId}`);
      }

      // データの処理（復号化・展開）
      if (this.config.enableEncryption) {
        data = await this.decryptData(data);
      }
      if (this.config.enableCompression) {
        data = await this.decompressData(data);
      }

      // JSONパース
      const saveData: SaveData = JSON.parse(data);

      // バージョン確認
      if (!this.isCompatibleVersion(saveData.version)) {
        console.warn(`Incompatible save version: ${saveData.version}`);
      }

      // ゲーム状態の復元
      const gameState = this.restoreGameState(saveData.gameState);

      console.log(`Game loaded from slot: ${slotId}`);
      return gameState;
    } catch (error) {
      console.error(`Failed to load game from slot ${slotId}:`, error);
      throw new Error(`Load failed: ${error}`);
    }
  }

  /**
   * セーブスロット一覧の取得
   */
  getSaveSlots(): SaveSlotInfo[] {
    try {
      const slotsData = localStorage.getItem(`${this.config.storageKey}_slots`);
      if (!slotsData) {
        return [];
      }

      const slots: SaveSlotInfo[] = JSON.parse(slotsData);
      return slots.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Failed to get save slots:", error);
      return [];
    }
  }

  /**
   * セーブデータの削除
   */
  async deleteSave(slotId: string): Promise<void> {
    try {
      // ストレージからデータを削除
      localStorage.removeItem(`${this.config.storageKey}_${slotId}`);

      // スロット情報の更新
      const slots = this.getSaveSlots();
      const updatedSlots = slots.filter((slot) => slot.id !== slotId);
      localStorage.setItem(
        `${this.config.storageKey}_slots`,
        JSON.stringify(updatedSlots)
      );

      console.log(`Save deleted: ${slotId}`);
    } catch (error) {
      console.error(`Failed to delete save ${slotId}:`, error);
      throw new Error(`Delete failed: ${error}`);
    }
  }

  /**
   * セーブデータの存在確認
   */
  saveExists(slotId: string): boolean {
    try {
      const data = localStorage.getItem(`${this.config.storageKey}_${slotId}`);
      return data !== null;
    } catch (error) {
      console.error(`Failed to check save existence: ${slotId}`, error);
      return false;
    }
  }

  /**
   * クイックセーブ
   */
  async quickSave(gameState: GameState, sceneInfo?: SceneInfo): Promise<void> {
    if (!this.config.enableQuickSave) {
      throw new Error("Quick save is disabled");
    }

    await this.saveGame("quicksave", gameState, sceneInfo);
    console.log("Quick save completed");
  }

  /**
   * クイックロード
   */
  async quickLoad(): Promise<GameState> {
    if (!this.config.enableQuickSave) {
      throw new Error("Quick save is disabled");
    }

    if (!this.saveExists("quicksave")) {
      throw new Error("Quick save not found");
    }

    const gameState = await this.loadGame("quicksave");
    console.log("Quick load completed");
    return gameState;
  }

  /**
   * オートセーブ
   */
  async autoSave(gameState: GameState, sceneInfo?: SceneInfo): Promise<void> {
    if (!this.config.enableAutoSave) {
      return;
    }

    try {
      await this.saveGame("autosave", gameState, sceneInfo);
      console.log("Auto save completed");
    } catch (error) {
      console.error("Auto save failed:", error);
    }
  }

  /**
   * オートセーブタイマーの開始
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = window.setInterval(() => {
      // TODO: 現在のゲーム状態を取得してオートセーブ
      console.log("Auto save timer triggered");
    }, this.config.autoSaveInterval * 1000);
  }

  /**
   * オートセーブタイマーの停止
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * スクリーンショットの取得
   */
  private async captureScreenshot(): Promise<string | undefined> {
    try {
      // TODO: ゲーム画面のスクリーンショット取得
      // const canvas = PixiVN.app?.view as HTMLCanvasElement;
      // return canvas.toDataURL('image/jpeg', 0.8);
      return undefined;
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      return undefined;
    }
  }

  /**
   * ストレージへの書き込み
   */
  private async writeToStorage(slotId: string, data: string): Promise<void> {
    try {
      const key = `${this.config.storageKey}_${slotId}`;
      localStorage.setItem(key, data);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new Error("Storage quota exceeded");
      }
      throw error;
    }
  }

  /**
   * ストレージからの読み込み
   */
  private async readFromStorage(slotId: string): Promise<string | null> {
    const key = `${this.config.storageKey}_${slotId}`;
    return localStorage.getItem(key);
  }

  /**
   * ゲーム状態のクローン
   */
  private cloneGameState(gameState: GameState): GameState {
    return {
      ...gameState,
      variables: new Map(gameState.variables),
      flags: new Map(gameState.flags),
      visitedScenes: new Set(gameState.visitedScenes),
      choices: [...gameState.choices],
    };
  }

  /**
   * ゲーム状態の復元
   */
  private restoreGameState(savedState: Partial<GameState>): GameState {
    return {
      currentScenarioPath: savedState.currentScenarioPath || "",
      currentSceneIndex: savedState.currentSceneIndex || 0,
      currentRouteId: savedState.currentRouteId || "main",
      variables: new Map(Object.entries(savedState.variables || {})),
      flags: new Map(Object.entries(savedState.flags || {})),
      visitedScenes: new Set(savedState.visitedScenes || []),
      choices: savedState.choices || [],
      inventory: savedState.inventory || [],
      playerName: savedState.playerName || "",
      lastSaveTimestamp: savedState.lastSaveTimestamp || Date.now(),
    };
  }

  /**
   * セーブスロット情報の更新
   */
  private async updateSaveSlotInfo(saveData: SaveData): Promise<void> {
    const slots = this.getSaveSlots();

    // 既存スロットの更新または新規追加
    const existingIndex = slots.findIndex(
      (slot) => slot.id === saveData.saveId
    );
    const slotInfo: SaveSlotInfo = {
      id: saveData.saveId,
      timestamp: saveData.timestamp,
      scenarioPath: saveData.sceneInfo?.scenarioPath || "",
      sceneTitle: saveData.sceneInfo?.sceneTitle || "Unknown Scene",
      characterName: saveData.sceneInfo?.characterName || "",
      currentText: saveData.sceneInfo?.currentText || "",
      screenshot: saveData.screenshot || "",
      dataSize: saveData.dataSize || 0,
    };

    if (existingIndex !== -1) {
      slots[existingIndex] = slotInfo;
    } else {
      slots.push(slotInfo);
    }

    // スロット数制限の適用
    if (slots.length > this.config.maxSaveSlots) {
      const sortedSlots = slots.sort((a, b) => b.timestamp - a.timestamp);
      const keptSlots = sortedSlots.slice(0, this.config.maxSaveSlots);

      // 削除されるスロットのデータも削除
      const removedSlots = sortedSlots.slice(this.config.maxSaveSlots);
      for (const slot of removedSlots) {
        localStorage.removeItem(`${this.config.storageKey}_${slot.id}`);
      }

      localStorage.setItem(
        `${this.config.storageKey}_slots`,
        JSON.stringify(keptSlots)
      );
    } else {
      localStorage.setItem(
        `${this.config.storageKey}_slots`,
        JSON.stringify(slots)
      );
    }
  }

  /**
   * バージョン互換性チェック
   */
  private isCompatibleVersion(saveVersion: string): boolean {
    // TODO: Phase 5 - セーブデータバージョンの互換性チェック
    console.log(`Checking compatibility for save version: ${saveVersion}`);
    return true;
  }

  /**
   * データの圧縮
   */
  private async compressData(data: string): Promise<string> {
    // TODO: データ圧縮の実装
    return data;
  }

  /**
   * データの展開
   */
  private async decompressData(data: string): Promise<string> {
    // TODO: データ展開の実装
    return data;
  }

  /**
   * データの暗号化
   */
  private async encryptData(data: string): Promise<string> {
    // TODO: データ暗号化の実装
    return data;
  }

  /**
   * データの復号化
   */
  private async decryptData(data: string): Promise<string> {
    // TODO: データ復号化の実装
    return data;
  }

  /**
   * ストレージ使用量の取得
   */
  getStorageUsage(): { used: number; quota: number; percentage: number } {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.storageKey)) {
          const value = localStorage.getItem(key) || "";
          totalSize += new Blob([value]).size;
        }
      }

      // LocalStorageの制限は通常5-10MB
      const quota = 5 * 1024 * 1024; // 5MB
      const percentage = (totalSize / quota) * 100;

      return {
        used: totalSize,
        quota,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      console.error("Failed to get storage usage:", error);
      return { used: 0, quota: 0, percentage: 0 };
    }
  }

  /**
   * セーブデータのエクスポート
   */
  async exportSaveData(slotId: string): Promise<string> {
    try {
      const data = await this.readFromStorage(slotId);
      if (!data) {
        throw new Error(`Save slot not found: ${slotId}`);
      }

      // Base64エンコードしてエクスポート用データ作成
      const exportData = btoa(unescape(encodeURIComponent(data)));
      console.log(`Save data exported: ${slotId}`);
      return exportData;
    } catch (error) {
      console.error(`Failed to export save data: ${slotId}`, error);
      throw error;
    }
  }

  /**
   * セーブデータのインポート
   */
  async importSaveData(slotId: string, exportData: string): Promise<void> {
    try {
      // Base64デコード
      const data = decodeURIComponent(escape(atob(exportData)));

      // データの妥当性チェック
      const saveData = JSON.parse(data);
      if (!saveData.version || !saveData.gameState) {
        throw new Error("Invalid save data format");
      }

      // ストレージに保存
      await this.writeToStorage(slotId, data);

      // スロット情報の更新
      await this.updateSaveSlotInfo(saveData);

      console.log(`Save data imported: ${slotId}`);
    } catch (error) {
      console.error(`Failed to import save data: ${slotId}`, error);
      throw error;
    }
  }

  /**
   * 設定の更新
   */
  updateConfig(newConfig: Partial<SaveSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // オートセーブ設定の更新
    if (this.config.enableAutoSave) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }

    console.log("SaveLoadSystem config updated");
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): SaveSystemConfig {
    return { ...this.config };
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.stopAutoSave();
    console.log("SaveLoadSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.stopAutoSave();
    console.log("SaveLoadSystem disposed");
  }
}
