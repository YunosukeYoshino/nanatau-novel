/**
 * メインメニューシステム - ゲーム開始画面とナビゲーション
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig } from "../types/core.js";
import type { IMainMenuSystem, MenuItem, UIButton } from "./interfaces.js";

export interface MainMenuConfig {
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
    imagePath?: string;
    color?: string;
    opacity?: number;
  };
  /** メニューアイテムの設定 */
  menuItems: {
    spacing: number;
    fontSize: number;
    fontFamily: string;
  };
  /** アニメーション設定 */
  animation: {
    fadeInDuration: number;
    fadeOutDuration: number;
    itemDelay: number;
  };
}

export class MainMenuSystem implements IMainMenuSystem {
  private menuConfig: MainMenuConfig;
  private isVisible: boolean = false;
  private isInitialized: boolean = false;

  // UI要素
  private menuButtons: UIButton[] = [];
  private containerElement: HTMLElement | null = null;

  // メニューアイテム
  private menuItems: MenuItem[] = [];

  // 外部システムとの連携
  private onNewGameCallback: (() => Promise<void>) | undefined = undefined;
  private onContinueGameCallback: (() => Promise<void>) | undefined = undefined;
  private onLoadGameCallback: (() => Promise<void>) | undefined = undefined;
  private onSettingsCallback: (() => Promise<void>) | undefined = undefined;
  private onExitGameCallback: (() => Promise<void>) | undefined = undefined;

  constructor(config: GameConfig, menuConfig?: Partial<MainMenuConfig>) {
    this.menuConfig = {
      position: { x: 0, y: 0 },
      size: {
        width: config.screenWidth || 1280,
        height: config.screenHeight || 720,
      },
      background: {
        color: "#1a1a2e",
        opacity: 0.9,
      },
      menuItems: {
        spacing: 60,
        fontSize: 24,
        fontFamily: "Noto Sans JP, Arial, sans-serif",
      },
      animation: {
        fadeInDuration: 1000,
        fadeOutDuration: 500,
        itemDelay: 100,
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
      console.log("MainMenuSystem initialized");
    } catch (error) {
      console.error("Failed to initialize MainMenuSystem:", error);
      throw error;
    }
  }

  /**
   * メインメニューの表示
   */
  async showMainMenu(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("MainMenuSystem not initialized");
    }

    if (this.isVisible) {
      console.warn("Main menu is already visible");
      return;
    }

    try {
      // コンテナを表示
      if (this.containerElement) {
        this.containerElement.style.display = "block";
      }

      // フェードインアニメーション
      await this.animateMenuIn();

      this.isVisible = true;
      console.log("Main menu shown");
    } catch (error) {
      console.error("Failed to show main menu:", error);
      throw error;
    }
  }

  /**
   * メインメニューの非表示
   */
  async hideMainMenu(): Promise<void> {
    if (!this.isVisible) {
      console.warn("Main menu is not visible");
      return;
    }

    try {
      // フェードアウトアニメーション
      await this.animateMenuOut();

      // コンテナを非表示
      if (this.containerElement) {
        this.containerElement.style.display = "none";
      }

      this.isVisible = false;
      console.log("Main menu hidden");
    } catch (error) {
      console.error("Failed to hide main menu:", error);
      throw error;
    }
  }

  /**
   * 新規ゲーム開始
   */
  async startNewGame(): Promise<void> {
    try {
      console.log("Starting new game");

      if (this.onNewGameCallback) {
        await this.onNewGameCallback();
      } else {
        console.warn("No new game callback set");
      }
    } catch (error) {
      console.error("Failed to start new game:", error);
      throw error;
    }
  }

  /**
   * ゲーム続行
   */
  async continueGame(): Promise<void> {
    try {
      console.log("Continuing game");

      if (this.onContinueGameCallback) {
        await this.onContinueGameCallback();
      } else {
        console.warn("No continue game callback set");
      }
    } catch (error) {
      console.error("Failed to continue game:", error);
      throw error;
    }
  }

  /**
   * セーブデータ読み込み
   */
  async loadGameFromMenu(): Promise<void> {
    try {
      console.log("Loading game from menu");

      if (this.onLoadGameCallback) {
        await this.onLoadGameCallback();
      } else {
        console.warn("No load game callback set");
      }
    } catch (error) {
      console.error("Failed to load game from menu:", error);
      throw error;
    }
  }

  /**
   * 設定画面を開く
   */
  async openSettings(): Promise<void> {
    try {
      console.log("Opening settings");

      if (this.onSettingsCallback) {
        await this.onSettingsCallback();
      } else {
        console.warn("No settings callback set");
      }
    } catch (error) {
      console.error("Failed to open settings:", error);
      throw error;
    }
  }

  /**
   * ゲーム終了
   */
  async exitGame(): Promise<void> {
    try {
      console.log("Exiting game");

      if (this.onExitGameCallback) {
        await this.onExitGameCallback();
      } else {
        // デフォルトの終了処理
        if (typeof window !== "undefined") {
          window.close();
        }
      }
    } catch (error) {
      console.error("Failed to exit game:", error);
      throw error;
    }
  }

  /**
   * メニューの状態確認
   */
  isMainMenuVisible(): boolean {
    return this.isVisible;
  }

  /**
   * コールバック関数の設定
   */
  setCallbacks(callbacks: {
    onNewGame?: () => Promise<void>;
    onContinueGame?: () => Promise<void>;
    onLoadGame?: () => Promise<void>;
    onSettings?: () => Promise<void>;
    onExitGame?: () => Promise<void>;
  }): void {
    this.onNewGameCallback = callbacks.onNewGame;
    this.onContinueGameCallback = callbacks.onContinueGame;
    this.onLoadGameCallback = callbacks.onLoadGame;
    this.onSettingsCallback = callbacks.onSettings;
    this.onExitGameCallback = callbacks.onExitGame;
  }

  /**
   * メニューアイテムの初期化
   */
  private initializeMenuItems(): void {
    this.menuItems = [
      {
        id: "new_game",
        text: "新しいストーリー",
        action: () => this.startNewGame(),
      },
      {
        id: "continue",
        text: "続きから",
        action: () => this.continueGame(),
      },
      {
        id: "load_game",
        text: "セーブデータ",
        action: () => this.loadGameFromMenu(),
      },
      {
        id: "settings",
        text: "設定",
        action: () => this.openSettings(),
      },
      {
        id: "exit",
        text: "終了",
        action: () => this.exitGame(),
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
    this.containerElement.id = "main-menu-container";
    this.containerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      z-index: 1000;
      font-family: ${this.menuConfig.menuItems.fontFamily};
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

    // タイトルラベルの作成
    this.createTitleLabel();

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
      background: ${this.menuConfig.background.color || "#1a1a2e"};
      opacity: ${this.menuConfig.background.opacity || 0.9};
    `;

    // 背景画像がある場合
    if (this.menuConfig.background.imagePath) {
      backgroundDiv.style.backgroundImage = `url(${this.menuConfig.background.imagePath})`;
      backgroundDiv.style.backgroundSize = "cover";
      backgroundDiv.style.backgroundPosition = "center";
      backgroundDiv.style.backgroundRepeat = "no-repeat";
    }

    this.containerElement.appendChild(backgroundDiv);
  }

  /**
   * タイトルラベルの作成
   */
  private createTitleLabel(): void {
    if (!this.containerElement) return;

    const titleDiv = document.createElement("div");
    titleDiv.style.cssText = `
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 48px;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
      user-select: none;
    `;
    titleDiv.textContent = "ななたう";

    this.containerElement.appendChild(titleDiv);
  }

  /**
   * メニューボタンの作成
   */
  private createMenuButtons(): void {
    if (!this.containerElement) return;

    const menuContainer = document.createElement("div");
    menuContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${this.menuConfig.menuItems.spacing}px;
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
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: #ffffff;
      font-size: ${this.menuConfig.menuItems.fontSize}px;
      font-family: ${this.menuConfig.menuItems.fontFamily};
      padding: 12px 32px;
      min-width: 200px;
      cursor: pointer;
      transition: all 0.3s ease;
      user-select: none;
      opacity: 0;
      transform: translateY(20px);
    `;

    buttonElement.textContent = item.text;

    // ホバー効果
    buttonElement.addEventListener("mouseenter", () => {
      if (!item.disabled) {
        buttonElement.style.background = "rgba(255, 255, 255, 0.2)";
        buttonElement.style.borderColor = "rgba(255, 255, 255, 0.6)";
        buttonElement.style.transform = "scale(1.05)";
      }
    });

    buttonElement.addEventListener("mouseleave", () => {
      buttonElement.style.background = "rgba(255, 255, 255, 0.1)";
      buttonElement.style.borderColor = "rgba(255, 255, 255, 0.3)";
      buttonElement.style.transform = "scale(1)";
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
      width: 200,
      height: 48,
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
        if (!this.isVisible) return;

        switch (event.key) {
          case "Escape":
            event.preventDefault();
            this.hideMainMenu();
            break;
          case "Enter":
            event.preventDefault();
            // 選択されているボタンをクリック（実装は簡略化）
            break;
        }
      };

      window.addEventListener("keydown", handleKeyPress);
    }
  }

  /**
   * メニューのフェードインアニメーション
   */
  private async animateMenuIn(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      // タイトルのアニメーション
      const titleElement = this.containerElement.querySelector(
        "div"
      ) as HTMLElement;
      if (titleElement) {
        titleElement.style.opacity = "0";
        titleElement.style.transform = "translateX(-50%) translateY(-20px)";

        setTimeout(() => {
          titleElement.style.transition = "all 0.8s ease";
          titleElement.style.opacity = "1";
          titleElement.style.transform = "translateX(-50%) translateY(0)";
        }, 100);
      }

      // ボタンのアニメーション
      const buttons = this.containerElement.querySelectorAll("button");
      buttons.forEach((button, index) => {
        setTimeout(
          () => {
            (button as HTMLElement).style.transition = "all 0.6s ease";
            (button as HTMLElement).style.opacity = "1";
            (button as HTMLElement).style.transform = "translateY(0)";
          },
          300 + index * this.menuConfig.animation.itemDelay
        );
      });

      // 全アニメーション完了を待つ
      setTimeout(
        () => {
          resolve();
        },
        300 + buttons.length * this.menuConfig.animation.itemDelay + 600
      );
    });
  }

  /**
   * メニューのフェードアウトアニメーション
   */
  private async animateMenuOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      // 全要素を同時にフェードアウト
      this.containerElement.style.transition = `opacity ${this.menuConfig.animation.fadeOutDuration}ms ease`;
      this.containerElement.style.opacity = "0";

      setTimeout(() => {
        resolve();
      }, this.menuConfig.animation.fadeOutDuration);
    });
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.isVisible = false;

    if (this.containerElement) {
      this.containerElement.style.opacity = "1";
      this.containerElement.style.display = "none";
    }

    console.log("MainMenuSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    // イベントリスナーの削除
    // （実装では具体的なリスナー管理が必要）

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

    console.log("MainMenuSystem disposed");
  }
}
