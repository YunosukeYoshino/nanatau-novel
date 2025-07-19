/**
 * ゲーム内メニューシステム - ゲームプレイ中のメニュー管理
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig } from "../types/core.js";
import type { IGameMenuSystem, MenuItem, UIButton } from "./interfaces.js";

export interface GameMenuConfig {
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
  /** 背景の設定 */
  background: {
    color: string;
    opacity: number;
  };
  /** メニューアイテムの設定 */
  menuItems: {
    spacing: number;
    fontSize: number;
    fontFamily: string;
  };
  /** アニメーション設定 */
  animation: {
    slideInDuration: number;
    slideOutDuration: number;
    itemDelay: number;
  };
  /** 表示トリガー設定 */
  triggers: {
    key: string;
    mouseButton: "right" | "middle" | null;
  };
}

export class GameMenuSystem implements IGameMenuSystem {
  private menuConfig: GameMenuConfig;
  private isVisible: boolean = false;
  private isInitialized: boolean = false;

  // UI要素
  private containerElement: HTMLElement | null = null;
  private menuButtons: UIButton[] = [];

  // メニューアイテム
  private menuItems: MenuItem[] = [];

  // 外部システムとの連携
  private onQuickSaveCallback: (() => Promise<void>) | undefined = undefined;
  private onQuickLoadCallback: (() => Promise<void>) | undefined = undefined;
  private onOpenSaveMenuCallback: (() => Promise<void>) | undefined = undefined;
  private onOpenLoadMenuCallback: (() => Promise<void>) | undefined = undefined;
  private onOpenSettingsCallback: (() => Promise<void>) | undefined = undefined;
  private onReturnToMainMenuCallback: (() => Promise<void>) | undefined =
    undefined;
  private onCloseCallback: (() => void) | undefined = undefined;

  constructor(config: GameConfig, menuConfig?: Partial<GameMenuConfig>) {
    this.menuConfig = {
      position: {
        x: (config.screenWidth || 1280) - 250,
        y: 50,
      },
      size: {
        width: 200,
        height: 400,
      },
      background: {
        color: "#2a2a3e",
        opacity: 0.95,
      },
      menuItems: {
        spacing: 45,
        fontSize: 16,
        fontFamily: "Noto Sans JP, Arial, sans-serif",
      },
      animation: {
        slideInDuration: 250,
        slideOutDuration: 200,
        itemDelay: 30,
      },
      triggers: {
        key: "Escape",
        mouseButton: "right",
      },
      ...menuConfig,
    };

    this.initializeMenuItems();
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
      console.log("GameMenuSystem initialized");
    } catch (error) {
      console.error("Failed to initialize GameMenuSystem:", error);
      throw error;
    }
  }

  /**
   * ゲーム内メニューの表示
   */
  async showGameMenu(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("GameMenuSystem not initialized");
    }

    if (this.isVisible) {
      console.warn("Game menu is already visible");
      return;
    }

    try {
      // コンテナを表示
      if (this.containerElement) {
        this.containerElement.style.display = "block";
      }

      // スライドインアニメーション
      await this.animateMenuIn();

      this.isVisible = true;
      console.log("Game menu shown");
    } catch (error) {
      console.error("Failed to show game menu:", error);
      throw error;
    }
  }

  /**
   * ゲーム内メニューの非表示
   */
  async hideGameMenu(): Promise<void> {
    if (!this.isVisible) {
      console.warn("Game menu is not visible");
      return;
    }

    try {
      // スライドアウトアニメーション
      await this.animateMenuOut();

      // コンテナを非表示
      if (this.containerElement) {
        this.containerElement.style.display = "none";
      }

      this.isVisible = false;
      console.log("Game menu hidden");

      // 閉じるコールバックを呼び出し
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    } catch (error) {
      console.error("Failed to hide game menu:", error);
      throw error;
    }
  }

  /**
   * クイックセーブ
   */
  async quickSave(): Promise<void> {
    try {
      console.log("Quick save triggered");

      if (this.onQuickSaveCallback) {
        await this.onQuickSaveCallback();

        // 成功メッセージの表示
        this.showNotification("クイックセーブしました", "success");
      } else {
        console.warn("No quick save callback set");
        this.showNotification("クイックセーブに失敗しました", "error");
      }
    } catch (error) {
      console.error("Failed to quick save:", error);
      this.showNotification("クイックセーブに失敗しました", "error");
    }
  }

  /**
   * クイックロード
   */
  async quickLoad(): Promise<void> {
    try {
      console.log("Quick load triggered");

      if (this.onQuickLoadCallback) {
        await this.onQuickLoadCallback();

        // 成功メッセージの表示
        this.showNotification("クイックロードしました", "success");
      } else {
        console.warn("No quick load callback set");
        this.showNotification("クイックロードに失敗しました", "error");
      }
    } catch (error) {
      console.error("Failed to quick load:", error);
      this.showNotification("クイックロードに失敗しました", "error");
    }
  }

  /**
   * セーブ画面を開く
   */
  async openSaveMenu(): Promise<void> {
    try {
      console.log("Opening save menu");

      // まずゲームメニューを閉じる
      await this.hideGameMenu();

      if (this.onOpenSaveMenuCallback) {
        await this.onOpenSaveMenuCallback();
      } else {
        console.warn("No open save menu callback set");
      }
    } catch (error) {
      console.error("Failed to open save menu:", error);
      throw error;
    }
  }

  /**
   * ロード画面を開く
   */
  async openLoadMenu(): Promise<void> {
    try {
      console.log("Opening load menu");

      // まずゲームメニューを閉じる
      await this.hideGameMenu();

      if (this.onOpenLoadMenuCallback) {
        await this.onOpenLoadMenuCallback();
      } else {
        console.warn("No open load menu callback set");
      }
    } catch (error) {
      console.error("Failed to open load menu:", error);
      throw error;
    }
  }

  /**
   * 設定画面を開く
   */
  async openSettings(): Promise<void> {
    try {
      console.log("Opening settings from game menu");

      // まずゲームメニューを閉じる
      await this.hideGameMenu();

      if (this.onOpenSettingsCallback) {
        await this.onOpenSettingsCallback();
      } else {
        console.warn("No open settings callback set");
      }
    } catch (error) {
      console.error("Failed to open settings:", error);
      throw error;
    }
  }

  /**
   * メインメニューに戻る
   */
  async returnToMainMenu(): Promise<void> {
    try {
      console.log("Returning to main menu");

      // 確認ダイアログを表示
      const confirmed = await this.showConfirmDialog(
        "メインメニューに戻りますか？",
        "保存していない進行状況は失われます。"
      );

      if (confirmed) {
        // まずゲームメニューを閉じる
        await this.hideGameMenu();

        if (this.onReturnToMainMenuCallback) {
          await this.onReturnToMainMenuCallback();
        } else {
          console.warn("No return to main menu callback set");
        }
      }
    } catch (error) {
      console.error("Failed to return to main menu:", error);
      throw error;
    }
  }

  /**
   * メニューの状態確認
   */
  isGameMenuVisible(): boolean {
    return this.isVisible;
  }

  /**
   * メニューの表示切り替え
   */
  async toggleGameMenu(): Promise<void> {
    if (this.isVisible) {
      await this.hideGameMenu();
    } else {
      await this.showGameMenu();
    }
  }

  /**
   * コールバック関数の設定
   */
  setCallbacks(callbacks: {
    onQuickSave?: () => Promise<void>;
    onQuickLoad?: () => Promise<void>;
    onOpenSaveMenu?: () => Promise<void>;
    onOpenLoadMenu?: () => Promise<void>;
    onOpenSettings?: () => Promise<void>;
    onReturnToMainMenu?: () => Promise<void>;
    onClose?: () => void;
  }): void {
    this.onQuickSaveCallback = callbacks.onQuickSave;
    this.onQuickLoadCallback = callbacks.onQuickLoad;
    this.onOpenSaveMenuCallback = callbacks.onOpenSaveMenu;
    this.onOpenLoadMenuCallback = callbacks.onOpenLoadMenu;
    this.onOpenSettingsCallback = callbacks.onOpenSettings;
    this.onReturnToMainMenuCallback = callbacks.onReturnToMainMenu;
    this.onCloseCallback = callbacks.onClose;
  }

  /**
   * メニューアイテムの初期化
   */
  private initializeMenuItems(): void {
    this.menuItems = [
      {
        id: "quick_save",
        text: "クイックセーブ",
        icon: "💾",
        action: () => this.quickSave(),
      },
      {
        id: "quick_load",
        text: "クイックロード",
        icon: "📂",
        action: () => this.quickLoad(),
      },
      {
        id: "save_menu",
        text: "セーブ",
        icon: "💿",
        action: () => this.openSaveMenu(),
      },
      {
        id: "load_menu",
        text: "ロード",
        icon: "📋",
        action: () => this.openLoadMenu(),
      },
      {
        id: "settings",
        text: "設定",
        icon: "⚙️",
        action: () => this.openSettings(),
      },
      {
        id: "main_menu",
        text: "メインメニュー",
        icon: "🏠",
        action: () => this.returnToMainMenu(),
      },
      {
        id: "close",
        text: "閉じる",
        icon: "❌",
        action: () => this.hideGameMenu(),
      },
    ];
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
    this.containerElement.id = "game-menu-container";
    this.containerElement.style.cssText = `
      position: fixed;
      top: ${this.menuConfig.position.y}px;
      right: -${this.menuConfig.size.width}px;
      width: ${this.menuConfig.size.width}px;
      height: ${this.menuConfig.size.height}px;
      display: none;
      z-index: 1500;
      font-family: ${this.menuConfig.menuItems.fontFamily};
      transition: right ${this.menuConfig.animation.slideInDuration}ms ease;
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

    // 背景パネルの作成
    this.createBackgroundPanel();

    // メニューボタンの作成
    this.createMenuButtons();
  }

  /**
   * 背景パネルの作成
   */
  private createBackgroundPanel(): void {
    if (!this.containerElement) return;

    const backgroundDiv = document.createElement("div");
    backgroundDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.menuConfig.background.color};
      opacity: ${this.menuConfig.background.opacity};
      border-radius: 12px 0 0 12px;
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-right: none;
    `;

    this.containerElement.appendChild(backgroundDiv);
  }

  /**
   * メニューボタンの作成
   */
  private createMenuButtons(): void {
    if (!this.containerElement) return;

    const menuContainer = document.createElement("div");
    menuContainer.style.cssText = `
      position: absolute;
      top: 20px;
      left: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 15px;
    `;

    this.containerElement.appendChild(menuContainer);

    // メニューボタンを作成
    this.menuItems.forEach((item, index) => {
      const button = this.createMenuButton(item, index);
      menuContainer.appendChild(button.element);
      this.menuButtons.push(button.uiButton);
    });
  }

  /**
   * 個別のメニューボタンを作成
   */
  private createMenuButton(
    item: MenuItem,
    index: number
  ): { element: HTMLElement; uiButton: UIButton } {
    const buttonElement = document.createElement("button");
    buttonElement.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #ffffff;
      font-size: ${this.menuConfig.menuItems.fontSize}px;
      font-family: ${this.menuConfig.menuItems.fontFamily};
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateX(20px);
    `;

    // アイコンとテキストを設定
    if (item.icon) {
      const iconSpan = document.createElement("span");
      iconSpan.textContent = item.icon;
      iconSpan.style.fontSize = "14px";
      buttonElement.appendChild(iconSpan);
    }

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;
    buttonElement.appendChild(textSpan);

    // ホバー効果
    buttonElement.addEventListener("mouseenter", () => {
      if (!item.disabled) {
        buttonElement.style.background = "rgba(255, 255, 255, 0.2)";
        buttonElement.style.borderColor = "rgba(255, 255, 255, 0.4)";
        buttonElement.style.transform = "translateX(0) scale(1.02)";
      }
    });

    buttonElement.addEventListener("mouseleave", () => {
      buttonElement.style.background = "rgba(255, 255, 255, 0.1)";
      buttonElement.style.borderColor = "rgba(255, 255, 255, 0.2)";
      buttonElement.style.transform = "translateX(0) scale(1)";
    });

    // クリックイベント
    buttonElement.addEventListener("click", () => {
      if (!item.disabled) {
        item.action();
      }
    });

    // 無効状態の処理
    if (item.disabled) {
      buttonElement.style.opacity = "0.5";
      buttonElement.style.cursor = "not-allowed";
    }

    const uiButton: UIButton = {
      id: item.id,
      visible: true,
      enabled: !item.disabled,
      x: 0,
      y: index * this.menuConfig.menuItems.spacing,
      width: this.menuConfig.size.width - 30,
      height: 32,
      zIndex: 3,
      text: item.text,
      onClick: item.action,
      disabled: Boolean(item.disabled),
    };

    return { element: buttonElement, uiButton };
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // キーボード操作のサポート
    if (typeof window !== "undefined") {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === this.menuConfig.triggers.key) {
          event.preventDefault();
          this.toggleGameMenu();
        }
      };

      // 右クリックメニューの無効化とゲームメニュー表示
      const handleContextMenu = (event: MouseEvent) => {
        if (this.menuConfig.triggers.mouseButton === "right") {
          event.preventDefault();
          this.toggleGameMenu();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      window.addEventListener("contextmenu", handleContextMenu);
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
      font-family: ${this.menuConfig.menuItems.fontFamily};
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
        font-family: ${this.menuConfig.menuItems.fontFamily};
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
   * メニューのスライドインアニメーション
   */
  private async animateMenuIn(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      // スライドイン
      this.containerElement.style.right = "0px";

      // ボタンのアニメーション
      const buttons = this.containerElement.querySelectorAll("button");
      buttons.forEach((button, index) => {
        setTimeout(() => {
          (button as HTMLElement).style.transition = "all 0.3s ease";
          (button as HTMLElement).style.opacity = "1";
          (button as HTMLElement).style.transform = "translateX(0)";
        }, index * this.menuConfig.animation.itemDelay);
      });

      setTimeout(
        () => {
          resolve();
        },
        this.menuConfig.animation.slideInDuration +
          buttons.length * this.menuConfig.animation.itemDelay
      );
    });
  }

  /**
   * メニューのスライドアウトアニメーション
   */
  private async animateMenuOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      // ボタンを非表示
      const buttons = this.containerElement.querySelectorAll("button");
      buttons.forEach((button) => {
        (button as HTMLElement).style.opacity = "0";
        (button as HTMLElement).style.transform = "translateX(20px)";
      });

      // スライドアウト
      setTimeout(() => {
        if (this.containerElement) {
          this.containerElement.style.right = `-${this.menuConfig.size.width}px`;
        }

        setTimeout(() => {
          resolve();
        }, this.menuConfig.animation.slideOutDuration);
      }, 100);
    });
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.isVisible = false;

    if (this.containerElement) {
      this.containerElement.style.display = "none";
      this.containerElement.style.right = `-${this.menuConfig.size.width}px`;

      // ボタンのリセット
      const buttons = this.containerElement.querySelectorAll("button");
      buttons.forEach((button) => {
        (button as HTMLElement).style.opacity = "0";
        (button as HTMLElement).style.transform = "translateX(20px)";
      });
    }

    console.log("GameMenuSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    // DOM要素の削除
    if (this.containerElement?.parentNode) {
      this.containerElement.parentNode.removeChild(this.containerElement);
    }

    // 参照の削除
    this.containerElement = null;
    this.menuButtons = [];
    this.menuItems = [];

    this.isInitialized = false;
    this.isVisible = false;

    console.log("GameMenuSystem disposed");
  }
}
