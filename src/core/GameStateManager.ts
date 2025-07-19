/**
 * ゲーム状態管理システム
 */

import type { GameState } from "../types/core.js";

export interface GameStateManagerConfig {
  autoSaveInterval: number; // 自動セーブ間隔（ミリ秒）
  maxAutoSaves: number; // 最大自動セーブ数
  enablePersistence: boolean; // 永続化の有効/無効
  compressionEnabled: boolean; // データ圧縮の有効/無効
}

export interface SaveData {
  gameState: GameState;
  metadata: {
    version: string;
    timestamp: number;
    playTime: number;
    scenePreview?: string;
    thumbnailData?: string;
  };
}

export class GameStateManager {
  private config: GameStateManagerConfig;
  private currentGameState: GameState;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private startTime: number;
  private totalPlayTime: number = 0;

  constructor(
    initialGameState?: GameState,
    config?: Partial<GameStateManagerConfig>
  ) {
    this.config = {
      autoSaveInterval: 300000, // 5分
      maxAutoSaves: 5,
      enablePersistence: true,
      compressionEnabled: false,
      ...config,
    };

    this.currentGameState = this.deepCloneGameState(
      initialGameState || this.createDefaultGameState()
    );
    this.startTime = Date.now();

    if (this.config.enablePersistence) {
      this.setupPersistence();
    }
  }

  /**
   * デフォルトのゲーム状態を作成
   */
  private createDefaultGameState(): GameState {
    return {
      currentScenarioPath: "",
      currentSceneIndex: 0,
      currentRouteId: "main",
      variables: new Map<string, unknown>(),
      flags: new Map<string, boolean>(),
      visitedScenes: new Set<string>(),
      choices: [],
      inventory: [],
      playerName: "",
      lastSaveTimestamp: Date.now(),
    };
  }

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    // 必要に応じて初期化処理を追加
    console.log("GameStateManager initialized");
  }

  /**
   * 破棄処理
   */
  async destroy(): Promise<void> {
    // オートセーブタイマーを停止
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    console.log("GameStateManager destroyed");
  }

  /**
   * 現在のゲーム状態を取得
   */
  getGameState(): GameState {
    return this.deepCloneGameState(this.currentGameState);
  }

  /**
   * ゲーム状態を更新
   */
  updateGameState(partialState: Partial<GameState>): void {
    this.currentGameState = {
      ...this.currentGameState,
      ...partialState,
      lastSaveTimestamp: Date.now(),
    };

    // マップとセットの適切な更新
    if (partialState.variables) {
      this.currentGameState.variables = new Map(partialState.variables);
    }
    if (partialState.flags) {
      this.currentGameState.flags = new Map(partialState.flags);
    }
    if (partialState.visitedScenes) {
      this.currentGameState.visitedScenes = new Set(partialState.visitedScenes);
    }

    this.validateGameState();
  }

  /**
   * ゲーム状態を完全に置換
   */
  setGameState(newGameState: GameState): void {
    this.currentGameState = this.deepCloneGameState(newGameState);
    this.validateGameState();
  }

  /**
   * 変数の取得
   */
  getVariable(name: string): unknown {
    return this.currentGameState.variables.get(name);
  }

  /**
   * 変数の設定
   */
  setVariable(name: string, value: unknown): void {
    this.currentGameState.variables.set(name, value);
    this.currentGameState.lastSaveTimestamp = Date.now();
  }

  /**
   * 複数の変数を一括設定
   */
  setVariables(variables: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(variables)) {
      this.currentGameState.variables.set(name, value);
    }
    this.currentGameState.lastSaveTimestamp = Date.now();
  }

  /**
   * フラグの取得
   */
  getFlag(name: string): boolean {
    return this.currentGameState.flags.get(name) ?? false;
  }

  /**
   * フラグの設定
   */
  setFlag(name: string, value: boolean): void {
    this.currentGameState.flags.set(name, value);
    this.currentGameState.lastSaveTimestamp = Date.now();
  }

  /**
   * 複数のフラグを一括設定
   */
  setFlags(flags: Record<string, boolean>): void {
    for (const [name, value] of Object.entries(flags)) {
      this.currentGameState.flags.set(name, value);
    }
    this.currentGameState.lastSaveTimestamp = Date.now();
  }

  /**
   * シーンを訪問済みとしてマーク
   */
  markSceneVisited(sceneId: string): void {
    this.currentGameState.visitedScenes.add(sceneId);
  }

  /**
   * シーンが訪問済みかどうかをチェック
   */
  isSceneVisited(sceneId: string): boolean {
    return this.currentGameState.visitedScenes.has(sceneId);
  }

  /**
   * アイテムをインベントリに追加
   */
  addToInventory(itemId: string): void {
    if (!this.currentGameState.inventory.includes(itemId)) {
      this.currentGameState.inventory.push(itemId);
      this.currentGameState.lastSaveTimestamp = Date.now();
    }
  }

  /**
   * アイテムをインベントリから削除
   */
  removeFromInventory(itemId: string): void {
    const index = this.currentGameState.inventory.indexOf(itemId);
    if (index !== -1) {
      this.currentGameState.inventory.splice(index, 1);
      this.currentGameState.lastSaveTimestamp = Date.now();
    }
  }

  /**
   * アイテムがインベントリにあるかどうかをチェック
   */
  hasInInventory(itemId: string): boolean {
    return this.currentGameState.inventory.includes(itemId);
  }

  /**
   * ゲームの進行状況を取得
   */
  getProgress(): {
    currentSceneIndex: number;
    totalVisitedScenes: number;
    totalChoices: number;
    playTime: number;
  } {
    return {
      currentSceneIndex: this.currentGameState.currentSceneIndex,
      totalVisitedScenes: this.currentGameState.visitedScenes.size,
      totalChoices: this.currentGameState.choices.length,
      playTime: this.getTotalPlayTime(),
    };
  }

  /**
   * 総プレイ時間を取得（ミリ秒）
   */
  getTotalPlayTime(): number {
    const currentSessionTime = Date.now() - this.startTime;
    return this.totalPlayTime + currentSessionTime;
  }

  /**
   * ゲーム状態をローカルストレージに保存
   */
  async saveToLocalStorage(slotId: string): Promise<void> {
    if (!this.config.enablePersistence) {
      throw new Error("Persistence is disabled");
    }

    try {
      const saveData: SaveData = {
        gameState: this.getGameState(),
        metadata: {
          version: "1.0.0",
          timestamp: Date.now(),
          playTime: this.getTotalPlayTime(),
        },
      };

      const serializedData = this.serializeGameState(saveData);
      localStorage.setItem(`nanatau_save_${slotId}`, serializedData);

      console.log(`Game saved to slot: ${slotId}`);
    } catch (error) {
      throw new Error(`Failed to save game: ${error}`);
    }
  }

  /**
   * ローカルストレージからゲーム状態を読み込み
   */
  async loadFromLocalStorage(slotId: string): Promise<GameState> {
    if (!this.config.enablePersistence) {
      throw new Error("Persistence is disabled");
    }

    try {
      const serializedData = localStorage.getItem(`nanatau_save_${slotId}`);
      if (!serializedData) {
        throw new Error(`Save slot not found: ${slotId}`);
      }

      const saveData = this.deserializeGameState(serializedData);
      this.setGameState(saveData.gameState);
      this.totalPlayTime = saveData.metadata.playTime;

      console.log(`Game loaded from slot: ${slotId}`);
      return this.getGameState();
    } catch (error) {
      throw new Error(`Failed to load game: ${error}`);
    }
  }

  /**
   * 自動セーブの実行
   */
  async autoSave(): Promise<void> {
    const autoSaveSlot = `auto_${Date.now()}`;
    await this.saveToLocalStorage(autoSaveSlot);

    // 古い自動セーブの削除
    this.cleanupAutoSaves();
  }

  /**
   * 古い自動セーブファイルのクリーンアップ
   */
  private cleanupAutoSaves(): void {
    const autoSaveKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith("nanatau_save_auto_"))
      .sort()
      .reverse(); // 新しい順にソート

    // 最大数を超えた分を削除
    if (autoSaveKeys.length > this.config.maxAutoSaves) {
      const keysToDelete = autoSaveKeys.slice(this.config.maxAutoSaves);
      keysToDelete.forEach((key) => localStorage.removeItem(key));
    }
  }

  /**
   * 自動セーブの開始
   */
  startAutoSave(): void {
    if (!this.config.enablePersistence) {
      return;
    }

    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      this.autoSave().catch((error) => {
        console.error("Auto save failed:", error);
      });
    }, this.config.autoSaveInterval);
  }

  /**
   * 自動セーブの停止
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * ゲーム状態のディープクローン
   */
  private deepCloneGameState(gameState: GameState): GameState {
    return {
      ...gameState,
      variables: new Map(gameState.variables),
      flags: new Map(gameState.flags),
      visitedScenes: new Set(gameState.visitedScenes),
      choices: [...gameState.choices],
      inventory: [...gameState.inventory],
    };
  }

  /**
   * ゲーム状態のシリアライズ
   */
  private serializeGameState(saveData: SaveData): string {
    const serializable = {
      ...saveData,
      gameState: {
        ...saveData.gameState,
        variables: Array.from(saveData.gameState.variables.entries()),
        flags: Array.from(saveData.gameState.flags.entries()),
        visitedScenes: Array.from(saveData.gameState.visitedScenes),
      },
    };

    return JSON.stringify(serializable);
  }

  /**
   * ゲーム状態のデシリアライズ
   */
  private deserializeGameState(serializedData: string): SaveData {
    const data = JSON.parse(serializedData);

    return {
      ...data,
      gameState: {
        ...data.gameState,
        variables: new Map(data.gameState.variables),
        flags: new Map(data.gameState.flags),
        visitedScenes: new Set(data.gameState.visitedScenes),
      },
    };
  }

  /**
   * ゲーム状態の検証
   */
  private validateGameState(): void {
    const state = this.currentGameState;

    if (state.currentSceneIndex < 0) {
      throw new Error("Invalid scene index: must be non-negative");
    }

    if (!state.currentRouteId) {
      throw new Error("Invalid route ID: must be non-empty");
    }

    if (!state.currentScenarioPath) {
      throw new Error("Invalid scenario path: must be non-empty");
    }
  }

  /**
   * 永続化の初期設定
   */
  private setupPersistence(): void {
    // ブラウザがサポートしているかチェック
    if (typeof Storage === "undefined" || typeof localStorage === "undefined") {
      console.warn("LocalStorage is not supported");
      this.config.enablePersistence = false;
      return;
    }

    // 自動セーブの開始
    this.startAutoSave();
  }

  /**
   * 設定の更新
   */
  updateConfig(newConfig: Partial<GameStateManagerConfig>): void {
    const oldEnablePersistence = this.config.enablePersistence;
    this.config = { ...this.config, ...newConfig };

    // 永続化設定が変更された場合の処理
    if (oldEnablePersistence !== this.config.enablePersistence) {
      if (this.config.enablePersistence) {
        this.setupPersistence();
      } else {
        this.stopAutoSave();
      }
    }
  }

  /**
   * リソースのクリーンアップ
   */
  dispose(): void {
    this.stopAutoSave();
  }

  /**
   * デバッグ情報の取得
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      currentSceneIndex: this.currentGameState.currentSceneIndex,
      currentRouteId: this.currentGameState.currentRouteId,
      variablesCount: this.currentGameState.variables.size,
      flagsCount: this.currentGameState.flags.size,
      visitedScenesCount: this.currentGameState.visitedScenes.size,
      choicesCount: this.currentGameState.choices.length,
      inventoryCount: this.currentGameState.inventory.length,
      playTime: this.getTotalPlayTime(),
      autoSaveEnabled: this.autoSaveTimer !== null,
      config: this.config,
    };
  }
}
