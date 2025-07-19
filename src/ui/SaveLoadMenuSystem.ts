/**
 * セーブ・ロードメニューシステム - セーブデータの管理とUI
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig } from "../types/core.js";
import type { ISaveLoadMenuSystem } from "./interfaces.js";

// SaveSlotInfo 型定義
interface SaveSlotInfo {
  id: string;
  timestamp: number;
  scenarioPath: string;
  sceneTitle: string;
  characterName: string;
  currentText: string;
  screenshot: string;
  dataSize: number;
}

export interface SaveLoadMenuConfig {
  /** メニューの表示位置 */
  position: {
    x: number;
    y: number;
  };
  /** メニューのサイズ */
  size: {
    width: number;
    height: number;
  };
  /** スロット表示設定 */
  slots: {
    columns: number;
    rows: number;
    spacing: number;
    slotWidth: number;
    slotHeight: number;
  };
  /** 背景の設定 */
  background: {
    color: string;
    opacity: number;
  };
  /** アニメーション設定 */
  animation: {
    fadeInDuration: number;
    fadeOutDuration: number;
    slotHoverDuration: number;
  };
}

export class SaveLoadMenuSystem implements ISaveLoadMenuSystem {
  private menuConfig: SaveLoadMenuConfig;
  private isVisible: boolean = false;
  private isInitialized: boolean = false;
  private currentMode: "save" | "load" | null = null;

  // UI要素
  private containerElement: HTMLElement | null = null;
  private titleElement: HTMLElement | null = null;
  private slotsContainer: HTMLElement | null = null;
  private saveSlots: SaveSlotInfo[] = [];

  // 外部システムとの連携
  private onSaveCallback: ((slotId: string) => Promise<void>) | undefined =
    undefined;
  private onLoadCallback: ((slotId: string) => Promise<void>) | undefined =
    undefined;
  private onDeleteCallback: ((slotId: string) => Promise<void>) | undefined =
    undefined;
  private onCloseCallback: (() => void) | undefined = undefined;
  private getSaveSlotsCallback: (() => SaveSlotInfo[]) | undefined = undefined;

  constructor(
    gameConfig: GameConfig,
    menuConfig?: Partial<SaveLoadMenuConfig>
  ) {
    this.menuConfig = {
      position: { x: 0, y: 0 },
      size: {
        width: gameConfig.screenWidth || 1280,
        height: gameConfig.screenHeight || 720,
      },
      slots: {
        columns: 4,
        rows: 3,
        spacing: 20,
        slotWidth: 280,
        slotHeight: 160,
      },
      background: {
        color: "#1a1a2e",
        opacity: 0.95,
      },
      animation: {
        fadeInDuration: 300,
        fadeOutDuration: 200,
        slotHoverDuration: 150,
      },
      ...menuConfig,
    };
  }

  /**
   * システムの初期化
   */
  async initialize(): Promise<void> {
    try {
      // コンテナ要素の作成
      this.createContainerElement();

      // UI要素の初期化
      await this.initializeUIElements();

      // イベントリスナーの設定
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("SaveLoadMenuSystem initialized");
    } catch (error) {
      console.error("Failed to initialize SaveLoadMenuSystem:", error);
      throw error;
    }
  }

  /**
   * セーブメニューの表示
   */
  async showSaveMenu(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("SaveLoadMenuSystem not initialized");
    }

    this.currentMode = "save";
    await this.showMenu("セーブ");
  }

  /**
   * ロードメニューの表示
   */
  async showLoadMenu(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("SaveLoadMenuSystem not initialized");
    }

    this.currentMode = "load";
    await this.showMenu("ロード");
  }

  /**
   * メニューの非表示
   */
  async hideMenu(): Promise<void> {
    if (!this.isVisible) {
      console.warn("SaveLoad menu is not visible");
      return;
    }

    try {
      // フェードアウトアニメーション
      await this.animateOut();

      // コンテナを非表示
      if (this.containerElement) {
        this.containerElement.style.display = "none";
      }

      this.isVisible = false;
      this.currentMode = null;
      console.log("SaveLoad menu hidden");

      // 閉じるコールバックを呼び出し
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    } catch (error) {
      console.error("Failed to hide SaveLoad menu:", error);
      throw error;
    }
  }

  /**
   * セーブスロットの表示更新
   */
  async refreshSaveSlots(): Promise<void> {
    try {
      // セーブスロット情報を取得
      if (this.getSaveSlotsCallback) {
        this.saveSlots = this.getSaveSlotsCallback();
      } else {
        this.saveSlots = [];
      }

      // スロットUIを更新
      this.updateSlotsUI();

      console.log("Save slots refreshed");
    } catch (error) {
      console.error("Failed to refresh save slots:", error);
    }
  }

  /**
   * セーブ実行
   */
  async performSave(slotId: string): Promise<void> {
    try {
      console.log(`Saving to slot: ${slotId}`);

      if (this.onSaveCallback) {
        await this.onSaveCallback(slotId);

        // スロット情報を更新
        await this.refreshSaveSlots();

        // 成功メッセージの表示
        this.showNotification("セーブしました", "success");
      } else {
        console.warn("No save callback set");
        this.showNotification("セーブに失敗しました", "error");
      }
    } catch (error) {
      console.error("Failed to perform save:", error);
      this.showNotification("セーブに失敗しました", "error");
    }
  }

  /**
   * ロード実行
   */
  async performLoad(slotId: string): Promise<void> {
    try {
      console.log(`Loading from slot: ${slotId}`);

      if (this.onLoadCallback) {
        await this.onLoadCallback(slotId);

        // メニューを閉じる
        await this.hideMenu();

        // 成功メッセージの表示
        this.showNotification("ロードしました", "success");
      } else {
        console.warn("No load callback set");
        this.showNotification("ロードに失敗しました", "error");
      }
    } catch (error) {
      console.error("Failed to perform load:", error);
      this.showNotification("ロードに失敗しました", "error");
    }
  }

  /**
   * セーブデータ削除
   */
  async deleteSaveData(slotId: string): Promise<void> {
    try {
      // 確認ダイアログを表示
      const confirmed = await this.showConfirmDialog(
        "セーブデータを削除しますか？",
        "この操作は取り消せません。"
      );

      if (confirmed) {
        console.log(`Deleting save slot: ${slotId}`);

        if (this.onDeleteCallback) {
          await this.onDeleteCallback(slotId);

          // スロット情報を更新
          await this.refreshSaveSlots();

          // 成功メッセージの表示
          this.showNotification("セーブデータを削除しました", "success");
        } else {
          console.warn("No delete callback set");
          this.showNotification("削除に失敗しました", "error");
        }
      }
    } catch (error) {
      console.error("Failed to delete save data:", error);
      this.showNotification("削除に失敗しました", "error");
    }
  }

  /**
   * メニューの状態確認
   */
  isMenuVisible(): boolean {
    return this.isVisible;
  }

  /**
   * 現在のモード取得
   */
  getCurrentMode(): "save" | "load" | null {
    return this.currentMode;
  }

  /**
   * コールバック関数の設定
   */
  setCallbacks(callbacks: {
    onSave?: (slotId: string) => Promise<void>;
    onLoad?: (slotId: string) => Promise<void>;
    onDelete?: (slotId: string) => Promise<void>;
    onClose?: () => void;
    getSaveSlots?: () => SaveSlotInfo[];
  }): void {
    this.onSaveCallback = callbacks.onSave;
    this.onLoadCallback = callbacks.onLoad;
    this.onDeleteCallback = callbacks.onDelete;
    this.onCloseCallback = callbacks.onClose;
    this.getSaveSlotsCallback = callbacks.getSaveSlots;
  }

  /**
   * メニューの表示（共通処理）
   */
  private async showMenu(title: string): Promise<void> {
    if (this.isVisible) {
      console.warn("SaveLoad menu is already visible");
      return;
    }

    try {
      // タイトルを更新
      if (this.titleElement) {
        this.titleElement.textContent = title;
      }

      // セーブスロット情報を更新
      await this.refreshSaveSlots();

      // コンテナを表示
      if (this.containerElement) {
        this.containerElement.style.display = "block";
      }

      // フェードインアニメーション
      await this.animateIn();

      this.isVisible = true;
      console.log(`${title} menu shown`);
    } catch (error) {
      console.error(`Failed to show ${title} menu:`, error);
      throw error;
    }
  }

  /**
   * コンテナ要素の作成
   */
  private createContainerElement(): void {
    if (typeof document === "undefined") {
      console.warn("DOM not available");
      return;
    }

    this.containerElement = document.createElement("div");
    this.containerElement.id = "saveload-menu-container";
    this.containerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 2000;
      font-family: Noto Sans JP, Arial, sans-serif;
    `;

    document.body.appendChild(this.containerElement);
  }

  /**
   * UI要素の初期化
   */
  private async initializeUIElements(): Promise<void> {
    if (!this.containerElement) {
      throw new Error("Container element not created");
    }

    // メインパネルの作成
    const mainPanel = document.createElement("div");
    mainPanel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${this.menuConfig.background.color};
      border-radius: 12px;
      width: ${this.menuConfig.size.width - 100}px;
      height: ${this.menuConfig.size.height - 100}px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
      transition: all ${this.menuConfig.animation.fadeInDuration}ms ease;
    `;

    this.containerElement.appendChild(mainPanel);

    // タイトルの作成
    this.createTitle(mainPanel);

    // スロットコンテナの作成
    this.createSlotsContainer(mainPanel);

    // アクションボタンの作成
    this.createActionButtons(mainPanel);
  }

  /**
   * タイトルの作成
   */
  private createTitle(parent: HTMLElement): void {
    const titleContainer = document.createElement("div");
    titleContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    `;

    this.titleElement = document.createElement("h2");
    this.titleElement.style.cssText = `
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
    `;
    this.titleElement.textContent = "セーブ・ロード";

    const closeButton = document.createElement("button");
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #ffffff;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      transition: background 0.2s ease;
    `;
    closeButton.textContent = "✕";
    closeButton.addEventListener("click", () => this.hideMenu());
    closeButton.addEventListener("mouseenter", () => {
      closeButton.style.background = "rgba(255, 255, 255, 0.1)";
    });
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.background = "none";
    });

    titleContainer.appendChild(this.titleElement);
    titleContainer.appendChild(closeButton);
    parent.appendChild(titleContainer);
  }

  /**
   * スロットコンテナの作成
   */
  private createSlotsContainer(parent: HTMLElement): void {
    this.slotsContainer = document.createElement("div");
    this.slotsContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.menuConfig.slots.columns}, 1fr);
      grid-template-rows: repeat(${this.menuConfig.slots.rows}, 1fr);
      gap: ${this.menuConfig.slots.spacing}px;
      height: 80%;
      overflow-y: auto;
      padding: 10px;
    `;

    parent.appendChild(this.slotsContainer);
  }

  /**
   * アクションボタンの作成
   */
  private createActionButtons(parent: HTMLElement): void {
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
    `;

    // 閉じるボタン
    const closeButton = this.createButton("閉じる", () => {
      this.hideMenu();
    });
    buttonContainer.appendChild(closeButton);

    parent.appendChild(buttonContainer);
  }

  /**
   * スロットUIの更新
   */
  private updateSlotsUI(): void {
    if (!this.slotsContainer) return;

    // 既存のスロットを削除
    this.slotsContainer.innerHTML = "";

    // スロット数分のエレメントを作成
    const totalSlots =
      this.menuConfig.slots.columns * this.menuConfig.slots.rows;

    for (let i = 0; i < totalSlots; i++) {
      const slotId = `slot_${i + 1}`;
      const saveSlot = this.saveSlots.find((slot) => slot.id === slotId);

      const slotElement = this.createSlotElement(slotId, saveSlot);
      this.slotsContainer.appendChild(slotElement);
    }
  }

  /**
   * スロット要素の作成
   */
  private createSlotElement(
    slotId: string,
    saveData?: SaveSlotInfo
  ): HTMLElement {
    const slotElement = document.createElement("div");
    slotElement.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all ${this.menuConfig.animation.slotHoverDuration}ms ease;
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    `;

    // ホバー効果
    slotElement.addEventListener("mouseenter", () => {
      slotElement.style.borderColor = "rgba(255, 255, 255, 0.5)";
      slotElement.style.transform = "scale(1.02)";
    });

    slotElement.addEventListener("mouseleave", () => {
      slotElement.style.borderColor = "rgba(255, 255, 255, 0.2)";
      slotElement.style.transform = "scale(1)";
    });

    if (saveData) {
      // セーブデータがある場合
      this.populateSlotWithSaveData(slotElement, slotId, saveData);
    } else {
      // 空のスロットの場合
      this.populateEmptySlot(slotElement, slotId);
    }

    return slotElement;
  }

  /**
   * セーブデータありスロットの内容作成
   */
  private populateSlotWithSaveData(
    element: HTMLElement,
    slotId: string,
    saveData: SaveSlotInfo
  ): void {
    // スロット番号
    const slotNumber = document.createElement("div");
    slotNumber.style.cssText = `
      color: #ffffff;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    `;
    slotNumber.textContent = `スロット ${slotId.replace("slot_", "")}`;

    // スクリーンショット（プレースホルダー）
    const screenshot = document.createElement("div");
    screenshot.style.cssText = `
      background: #4a4a5e;
      height: 60px;
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cccccc;
      font-size: 12px;
    `;

    if (saveData.screenshot) {
      screenshot.style.backgroundImage = `url(${saveData.screenshot})`;
      screenshot.style.backgroundSize = "cover";
      screenshot.style.backgroundPosition = "center";
      screenshot.textContent = "";
    } else {
      screenshot.textContent = "スクリーンショット";
    }

    // セーブ情報
    const saveInfo = document.createElement("div");
    saveInfo.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    const sceneTitle = document.createElement("div");
    sceneTitle.style.cssText = `
      color: #ffffff;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
    sceneTitle.textContent = saveData.sceneTitle || "シーン情報なし";

    const characterName = document.createElement("div");
    characterName.style.cssText = `
      color: #cccccc;
      font-size: 11px;
      margin-bottom: 5px;
    `;
    characterName.textContent = saveData.characterName || "";

    const timestamp = document.createElement("div");
    timestamp.style.cssText = `
      color: #999999;
      font-size: 10px;
    `;
    timestamp.textContent = new Date(saveData.timestamp).toLocaleString(
      "ja-JP"
    );

    saveInfo.appendChild(sceneTitle);
    saveInfo.appendChild(characterName);
    saveInfo.appendChild(timestamp);

    element.appendChild(slotNumber);
    element.appendChild(screenshot);
    element.appendChild(saveInfo);

    // クリックイベント
    element.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + クリック で削除
        this.deleteSaveData(slotId);
      } else {
        if (this.currentMode === "save") {
          this.performSave(slotId);
        } else if (this.currentMode === "load") {
          this.performLoad(slotId);
        }
      }
    });

    // 削除ボタン
    const deleteButton = document.createElement("button");
    deleteButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(220, 53, 69, 0.8);
      border: none;
      border-radius: 3px;
      color: #ffffff;
      font-size: 10px;
      padding: 2px 6px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.deleteSaveData(slotId);
    });

    element.addEventListener("mouseenter", () => {
      deleteButton.style.opacity = "1";
    });

    element.addEventListener("mouseleave", () => {
      deleteButton.style.opacity = "0";
    });

    element.appendChild(deleteButton);
  }

  /**
   * 空スロットの内容作成
   */
  private populateEmptySlot(element: HTMLElement, slotId: string): void {
    // スロット番号
    const slotNumber = document.createElement("div");
    slotNumber.style.cssText = `
      color: #ffffff;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
    `;
    slotNumber.textContent = `スロット ${slotId.replace("slot_", "")}`;

    // 空スロット表示
    const emptyMessage = document.createElement("div");
    emptyMessage.style.cssText = `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666666;
      font-size: 14px;
      text-align: center;
    `;
    emptyMessage.textContent =
      this.currentMode === "save" ? "クリックしてセーブ" : "データなし";

    element.appendChild(slotNumber);
    element.appendChild(emptyMessage);

    // クリックイベント（セーブモードのみ）
    if (this.currentMode === "save") {
      element.addEventListener("click", () => {
        this.performSave(slotId);
      });
    } else {
      element.style.opacity = "0.5";
      element.style.cursor = "not-allowed";
    }
  }

  /**
   * ボタンの作成
   */
  private createButton(text: string, onClick: () => void): HTMLElement {
    const button = document.createElement("button");
    button.style.cssText = `
      background: #007bff;
      border: none;
      border-radius: 6px;
      color: #ffffff;
      font-size: 14px;
      padding: 10px 20px;
      cursor: pointer;
      transition: background 0.2s ease;
    `;
    button.textContent = text;

    button.addEventListener("mouseenter", () => {
      button.style.background = "#0056b3";
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = "#007bff";
    });

    button.addEventListener("click", onClick);

    return button;
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (typeof window !== "undefined") {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (!this.isVisible) return;

        if (event.key === "Escape") {
          event.preventDefault();
          this.hideMenu();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
    }
  }

  /**
   * 通知メッセージの表示
   */
  private showNotification(message: string, type: "success" | "error"): void {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#28a745" : "#dc3545"};
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: Noto Sans JP, Arial, sans-serif;
      font-size: 14px;
      z-index: 3000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // アニメーション
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 50);

    // 自動削除
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * 確認ダイアログの表示
   */
  private async showConfirmDialog(
    title: string,
    message: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog = document.createElement("div");
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
        font-family: Noto Sans JP, Arial, sans-serif;
      `;

      const dialogContent = document.createElement("div");
      dialogContent.style.cssText = `
        background: #2a2a3e;
        border-radius: 8px;
        padding: 30px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      `;

      const titleEl = document.createElement("h3");
      titleEl.style.cssText = `
        color: #ffffff;
        margin: 0 0 15px 0;
        font-size: 18px;
      `;
      titleEl.textContent = title;

      const messageEl = document.createElement("p");
      messageEl.style.cssText = `
        color: #cccccc;
        margin: 0 0 25px 0;
        line-height: 1.5;
      `;
      messageEl.textContent = message;

      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
      `;

      const cancelButton = document.createElement("button");
      cancelButton.style.cssText = `
        background: #6c757d;
        border: none;
        border-radius: 4px;
        color: #ffffff;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
      `;
      cancelButton.textContent = "キャンセル";
      cancelButton.addEventListener("click", () => {
        document.body.removeChild(dialog);
        resolve(false);
      });

      const confirmButton = document.createElement("button");
      confirmButton.style.cssText = `
        background: #dc3545;
        border: none;
        border-radius: 4px;
        color: #ffffff;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
      `;
      confirmButton.textContent = "OK";
      confirmButton.addEventListener("click", () => {
        document.body.removeChild(dialog);
        resolve(true);
      });

      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(confirmButton);
      dialogContent.appendChild(titleEl);
      dialogContent.appendChild(messageEl);
      dialogContent.appendChild(buttonContainer);
      dialog.appendChild(dialogContent);
      document.body.appendChild(dialog);
    });
  }

  /**
   * フェードインアニメーション
   */
  private async animateIn(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      const panel = this.containerElement.querySelector("div") as HTMLElement;
      if (panel) {
        setTimeout(() => {
          panel.style.opacity = "1";
          panel.style.transform = "translate(-50%, -50%) scale(1)";
        }, 50);

        setTimeout(() => {
          resolve();
        }, this.menuConfig.animation.fadeInDuration);
      } else {
        resolve();
      }
    });
  }

  /**
   * フェードアウトアニメーション
   */
  private async animateOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      const panel = this.containerElement.querySelector("div") as HTMLElement;
      if (panel) {
        panel.style.opacity = "0";
        panel.style.transform = "translate(-50%, -50%) scale(0.9)";

        setTimeout(() => {
          resolve();
        }, this.menuConfig.animation.fadeOutDuration);
      } else {
        resolve();
      }
    });
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.isVisible = false;
    this.currentMode = null;

    if (this.containerElement) {
      this.containerElement.style.display = "none";
      const panel = this.containerElement.querySelector("div") as HTMLElement;
      if (panel) {
        panel.style.opacity = "0";
        panel.style.transform = "translate(-50%, -50%) scale(0.9)";
      }
    }

    this.saveSlots = [];

    console.log("SaveLoadMenuSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    // DOM要素の削除
    if (this.containerElement && this.containerElement.parentNode) {
      this.containerElement.parentNode.removeChild(this.containerElement);
    }

    // 参照の削除
    this.containerElement = null;
    this.titleElement = null;
    this.slotsContainer = null;
    this.saveSlots = [];

    this.isInitialized = false;
    this.isVisible = false;
    this.currentMode = null;

    console.log("SaveLoadMenuSystem disposed");
  }
}
