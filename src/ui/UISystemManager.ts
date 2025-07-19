/**
 * UI統合システムマネージャー - 全UIシステムの統合管理
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig, GameState } from "../types/core.js";
import type {
  IUISystemManager,
  IMainMenuSystem,
  IGameMenuSystem,
  ISettingsSystem,
  ISaveLoadMenuSystem,
  ITitleScreenSystem,
  IUIStateManager,
  UIState,
  TransitionOptions,
} from "./interfaces.js";

// 各システムのインポート
import { MainMenuSystem } from "./MainMenuSystem.js";
import { GameMenuSystem } from "./GameMenuSystem.js";
import { SettingsSystem } from "./SettingsSystem.js";
import { SaveLoadMenuSystem } from "./SaveLoadMenuSystem.js";
import { TitleScreenSystem } from "./TitleScreenSystem.js";
import { UIStateManager } from "./UIStateManager.js";

export interface UISystemConfig {
  /** 初期画面 */
  initialScreen: "title" | "mainMenu";
  /** 画面遷移の設定 */
  transitions: {
    defaultDuration: number;
    defaultEasing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  };
  /** グローバル設定 */
  global: {
    enableKeyboardShortcuts: boolean;
    enableMouseGestures: boolean;
    enableTouchControls: boolean;
  };
}

export class UISystemManager implements IUISystemManager {
  private config: GameConfig;
  private systemConfig: UISystemConfig;

  // サブシステム
  private mainMenuSystem: IMainMenuSystem;
  private gameMenuSystem: IGameMenuSystem;
  private settingsSystem: ISettingsSystem;
  private saveLoadMenuSystem: ISaveLoadMenuSystem;
  private titleScreenSystem: ITitleScreenSystem;
  private uiStateManager: IUIStateManager;

  // 外部システムとの連携
  private onNewGameCallback: (() => Promise<void>) | undefined = undefined;
  private onContinueGameCallback: (() => Promise<void>) | undefined = undefined;
  private onLoadGameCallback: ((slotId: string) => Promise<void>) | undefined =
    undefined;
  private onSaveGameCallback: ((slotId: string) => Promise<void>) | undefined =
    undefined;
  private onDeleteSaveCallback:
    | ((slotId: string) => Promise<void>)
    | undefined = undefined;
  private onExitGameCallback: (() => Promise<void>) | undefined = undefined;
  private onReturnToMainMenuCallback: (() => Promise<void>) | undefined =
    undefined;

  // ゲーム状態管理
  private getCurrentGameStateCallback: (() => GameState | null) | undefined =
    undefined;
  private getSaveSlotsCallback:
    | (() => Array<{
        id: string;
        timestamp: number;
        scenarioPath: string;
        sceneTitle: string;
        characterName: string;
        currentText: string;
        screenshot: string;
        dataSize: number;
      }>)
    | undefined = undefined;

  constructor(config: GameConfig, systemConfig?: Partial<UISystemConfig>) {
    this.config = config;
    this.systemConfig = {
      initialScreen: "title",
      transitions: {
        defaultDuration: 300,
        defaultEasing: "ease-in-out",
      },
      global: {
        enableKeyboardShortcuts: true,
        enableMouseGestures: true,
        enableTouchControls: true,
      },
      ...systemConfig,
    };

    // サブシステムの初期化
    this.mainMenuSystem = new MainMenuSystem(config);
    this.gameMenuSystem = new GameMenuSystem(config);
    this.settingsSystem = new SettingsSystem(config);
    this.saveLoadMenuSystem = new SaveLoadMenuSystem(config);
    this.titleScreenSystem = new TitleScreenSystem(config);
    this.uiStateManager = new UIStateManager();
  }

  /**
   * システムの初期化
   */
  async initialize(config: GameConfig): Promise<void> {
    try {
      this.config = config;

      // 各サブシステムの初期化
      await this.initializeSubSystems();

      // サブシステム間の連携設定
      this.setupSystemConnections();

      // グローバルイベントリスナーの設定
      this.setupGlobalEventListeners();

      // 初期画面の表示
      await this.showInitialScreen();

      // this.isInitialized = true; // プロパティを削除したためコメントアウト
      console.log("UISystemManager initialized");
    } catch (error) {
      console.error("Failed to initialize UISystemManager:", error);
      throw error;
    }
  }

  /**
   * メインメニューシステムの取得
   */
  getMainMenuSystem(): IMainMenuSystem {
    return this.mainMenuSystem;
  }

  /**
   * ゲームメニューシステムの取得
   */
  getGameMenuSystem(): IGameMenuSystem {
    return this.gameMenuSystem;
  }

  /**
   * 設定システムの取得
   */
  getSettingsSystem(): ISettingsSystem {
    return this.settingsSystem;
  }

  /**
   * セーブ・ロードメニューシステムの取得
   */
  getSaveLoadMenuSystem(): ISaveLoadMenuSystem {
    return this.saveLoadMenuSystem;
  }

  /**
   * タイトル画面システムの取得
   */
  getTitleScreenSystem(): ITitleScreenSystem {
    return this.titleScreenSystem;
  }

  /**
   * UI状態マネージャーの取得
   */
  getUIStateManager(): IUIStateManager {
    return this.uiStateManager;
  }

  /**
   * 画面遷移の管理
   */
  async transitionToScreen(
    screen: string,
    options?: TransitionOptions
  ): Promise<void> {
    try {
      const currentState = this.uiStateManager.getCurrentState();

      console.log(
        `Transitioning from ${currentState.currentScreen} to ${screen}`
      );

      // 現在の画面を非表示
      await this.hideCurrentScreen();

      // 新しい画面を表示
      await this.showScreen(screen, options);

      // UI状態を更新
      const newState: UIState = {
        currentScreen: screen as
          | "title"
          | "mainMenu"
          | "game"
          | "settings"
          | "saveLoad",
        previousScreen: currentState.currentScreen,
        timestamp: Date.now(),
      };

      this.uiStateManager.setState(newState);

      console.log(`Transition to ${screen} completed`);
    } catch (error) {
      console.error(`Failed to transition to screen: ${screen}`, error);
      throw error;
    }
  }

  /**
   * グローバルなキーボード・マウス入力処理
   */
  handleGlobalInput(event: KeyboardEvent | MouseEvent): void {
    if (
      !this.systemConfig.global.enableKeyboardShortcuts &&
      event instanceof KeyboardEvent
    ) {
      return;
    }

    if (
      !this.systemConfig.global.enableMouseGestures &&
      event instanceof MouseEvent
    ) {
      return;
    }

    const currentState = this.uiStateManager.getCurrentState();

    // グローバルショートカット
    if (event instanceof KeyboardEvent) {
      switch (event.key) {
        case "F11":
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case "F5":
          if (currentState.currentScreen === "game") {
            event.preventDefault();
            this.quickSave();
          }
          break;
        case "F9":
          if (currentState.currentScreen === "game") {
            event.preventDefault();
            this.quickLoad();
          }
          break;
        case "Escape":
          event.preventDefault();
          this.handleEscapeKey();
          break;
      }
    }
  }

  /**
   * レスポンシブレイアウトの管理
   */
  updateLayout(screenWidth: number, screenHeight: number): void {
    this.config.screenWidth = screenWidth;
    this.config.screenHeight = screenHeight;

    console.log(`Layout updated: ${screenWidth}x${screenHeight}`);

    // 各システムにレイアウト更新を通知（実装は各システムで対応）
    // this.mainMenuSystem.updateLayout?.(screenWidth, screenHeight);
    // this.gameMenuSystem.updateLayout?.(screenWidth, screenHeight);
    // this.settingsSystem.updateLayout?.(screenWidth, screenHeight);
    // this.saveLoadMenuSystem.updateLayout?.(screenWidth, screenHeight);
    // this.titleScreenSystem.updateLayout?.(screenWidth, screenHeight);
  }

  /**
   * 外部システムとの連携設定
   */
  setCallbacks(callbacks: {
    onNewGame?: () => Promise<void>;
    onContinueGame?: () => Promise<void>;
    onLoadGame?: (slotId: string) => Promise<void>;
    onSaveGame?: (slotId: string) => Promise<void>;
    onDeleteSave?: (slotId: string) => Promise<void>;
    onExitGame?: () => Promise<void>;
    onReturnToMainMenu?: () => Promise<void>;
    getCurrentGameState?: () => GameState | null;
    getSaveSlots?: () => Array<{
      id: string;
      timestamp: number;
      scenarioPath: string;
      sceneTitle: string;
      characterName: string;
      currentText: string;
      screenshot: string;
      dataSize: number;
    }>;
  }): void {
    this.onNewGameCallback = callbacks.onNewGame;
    this.onContinueGameCallback = callbacks.onContinueGame;
    this.onLoadGameCallback = callbacks.onLoadGame;
    this.onSaveGameCallback = callbacks.onSaveGame;
    this.onDeleteSaveCallback = callbacks.onDeleteSave;
    this.onExitGameCallback = callbacks.onExitGame;
    this.onReturnToMainMenuCallback = callbacks.onReturnToMainMenu;
    this.getCurrentGameStateCallback = callbacks.getCurrentGameState;
    this.getSaveSlotsCallback = callbacks.getSaveSlots;
  }

  /**
   * 各サブシステムの初期化
   */
  private async initializeSubSystems(): Promise<void> {
    const initPromises = [
      this.mainMenuSystem.initialize(),
      this.gameMenuSystem.initialize(),
      this.settingsSystem.initialize(),
      this.saveLoadMenuSystem.initialize(),
      this.titleScreenSystem.initialize(),
    ];

    await Promise.all(initPromises);
    console.log("All UI subsystems initialized");
  }

  /**
   * サブシステム間の連携設定
   */
  private setupSystemConnections(): void {
    // メインメニューシステムの連携
    this.mainMenuSystem.setCallbacks({
      onNewGame: async () => {
        if (this.onNewGameCallback) {
          await this.transitionToScreen("game");
          await this.onNewGameCallback();
        }
      },
      onContinueGame: async () => {
        if (this.onContinueGameCallback) {
          await this.transitionToScreen("game");
          await this.onContinueGameCallback();
        }
      },
      onLoadGame: async () => {
        await this.transitionToScreen("saveLoad");
        await this.saveLoadMenuSystem.showLoadMenu();
      },
      onSettings: async () => {
        await this.settingsSystem.showSettings();
      },
      onExitGame: async () => {
        if (this.onExitGameCallback) {
          await this.onExitGameCallback();
        }
      },
    });

    // ゲームメニューシステムの連携
    this.gameMenuSystem.setCallbacks({
      onQuickSave: async () => {
        await this.quickSave();
      },
      onQuickLoad: async () => {
        await this.quickLoad();
      },
      onOpenSaveMenu: async () => {
        await this.saveLoadMenuSystem.showSaveMenu();
      },
      onOpenLoadMenu: async () => {
        await this.saveLoadMenuSystem.showLoadMenu();
      },
      onOpenSettings: async () => {
        await this.settingsSystem.showSettings();
      },
      onReturnToMainMenu: async () => {
        if (this.onReturnToMainMenuCallback) {
          await this.onReturnToMainMenuCallback();
          await this.transitionToScreen("mainMenu");
        }
      },
    });

    // 設定システムの連携
    this.settingsSystem.setCallbacks({
      onVolumeChange: (settings) => {
        // 音量設定の変更を外部システムに通知
        console.log("Volume settings changed:", settings);
      },
      onDisplayChange: (settings) => {
        // 表示設定の変更を外部システムに通知
        console.log("Display settings changed:", settings);
      },
      onControlChange: (settings) => {
        // 操作設定の変更を外部システムに通知
        console.log("Control settings changed:", settings);
      },
      onClose: () => {
        // 設定画面が閉じられた時の処理
        console.log("Settings closed");
      },
    });

    // セーブ・ロードメニューシステムの連携
    this.saveLoadMenuSystem.setCallbacks({
      onSave: async (slotId: string) => {
        if (this.onSaveGameCallback) {
          await this.onSaveGameCallback(slotId);
        }
      },
      onLoad: async (slotId: string) => {
        if (this.onLoadGameCallback) {
          await this.onLoadGameCallback(slotId);
          await this.transitionToScreen("game");
        }
      },
      onDelete: async (slotId: string) => {
        if (this.onDeleteSaveCallback) {
          await this.onDeleteSaveCallback(slotId);
        }
      },
      onClose: () => {
        // セーブ・ロードメニューが閉じられた時の処理
        console.log("SaveLoad menu closed");
      },
      getSaveSlots: () => {
        return this.getSaveSlotsCallback ? this.getSaveSlotsCallback() : [];
      },
      getCurrentGameState: () => {
        return this.getCurrentGameStateCallback
          ? this.getCurrentGameStateCallback()
          : null;
      },
    });

    // タイトル画面システムの連携
    this.titleScreenSystem.setCallbacks({
      onTitleClick: async () => {
        await this.transitionToScreen("mainMenu");
      },
      onVideoEnd: async () => {
        console.log("Opening video ended");
      },
      onVideoSkip: async () => {
        console.log("Opening video skipped");
      },
    });

    console.log("System connections established");
  }

  /**
   * グローバルイベントリスナーの設定
   */
  private setupGlobalEventListeners(): void {
    if (typeof window === "undefined") return;

    // キーボードイベント
    window.addEventListener("keydown", (event) => {
      this.handleGlobalInput(event);
    });

    // マウスイベント（必要に応じて）
    if (this.systemConfig.global.enableMouseGestures) {
      window.addEventListener("contextmenu", (event) => {
        // 右クリックメニューを無効化（ゲームメニューで処理）
        event.preventDefault();
      });
    }

    // リサイズイベント
    window.addEventListener("resize", () => {
      this.updateLayout(window.innerWidth, window.innerHeight);
    });

    console.log("Global event listeners set up");
  }

  /**
   * 初期画面の表示
   */
  private async showInitialScreen(): Promise<void> {
    const initialScreen = this.systemConfig.initialScreen;

    await this.showScreen(initialScreen);

    const initialState: UIState = {
      currentScreen: initialScreen,
      timestamp: Date.now(),
    };

    this.uiStateManager.setState(initialState);
  }

  /**
   * 指定された画面の表示
   */
  private async showScreen(
    screen: string,
    _options?: TransitionOptions
  ): Promise<void> {
    switch (screen) {
      case "title":
        await this.titleScreenSystem.showTitleScreen();
        break;
      case "mainMenu":
        await this.mainMenuSystem.showMainMenu();
        break;
      case "game":
        // ゲーム画面への遷移（外部システムが管理）
        break;
      case "settings":
        await this.settingsSystem.showSettings();
        break;
      case "saveLoad":
        // セーブ・ロードメニューは個別にshowSaveMenu/showLoadMenuを呼ぶ
        break;
      default:
        console.warn(`Unknown screen: ${screen}`);
    }
  }

  /**
   * 現在の画面を非表示
   */
  private async hideCurrentScreen(): Promise<void> {
    const currentState = this.uiStateManager.getCurrentState();

    switch (currentState.currentScreen) {
      case "title":
        if (this.titleScreenSystem.isTitleScreenVisible()) {
          await this.titleScreenSystem.hideTitleScreen();
        }
        break;
      case "mainMenu":
        if (this.mainMenuSystem.isMainMenuVisible()) {
          await this.mainMenuSystem.hideMainMenu();
        }
        break;
      case "settings":
        if (this.settingsSystem.isSettingsVisible()) {
          await this.settingsSystem.hideSettings();
        }
        break;
      case "saveLoad":
        if (this.saveLoadMenuSystem.isMenuVisible()) {
          await this.saveLoadMenuSystem.hideMenu();
        }
        break;
    }
  }

  /**
   * フルスクリーン切り替え
   */
  private toggleFullscreen(): void {
    if (typeof document === "undefined") return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => {
        console.error("Failed to enter fullscreen:", error);
      });
    } else {
      document.exitFullscreen().catch((error) => {
        console.error("Failed to exit fullscreen:", error);
      });
    }
  }

  /**
   * クイックセーブ
   */
  private async quickSave(): Promise<void> {
    try {
      if (this.onSaveGameCallback) {
        await this.onSaveGameCallback("quicksave");
        console.log("Quick save completed");
      }
    } catch (error) {
      console.error("Quick save failed:", error);
    }
  }

  /**
   * クイックロード
   */
  private async quickLoad(): Promise<void> {
    try {
      if (this.onLoadGameCallback) {
        await this.onLoadGameCallback("quicksave");
        console.log("Quick load completed");
      }
    } catch (error) {
      console.error("Quick load failed:", error);
    }
  }

  /**
   * Escapeキーの処理
   */
  private async handleEscapeKey(): Promise<void> {
    const currentState = this.uiStateManager.getCurrentState();

    switch (currentState.currentScreen) {
      case "game":
        // ゲーム中の場合、ゲームメニューを表示
        await this.gameMenuSystem.toggleGameMenu();
        break;
      case "settings":
        // 設定画面の場合、閉じる
        await this.settingsSystem.hideSettings();
        break;
      case "saveLoad":
        // セーブ・ロードメニューの場合、閉じる
        await this.saveLoadMenuSystem.hideMenu();
        break;
      default:
        // その他の場合は何もしない
        break;
    }
  }

  /**
   * システム全体のリセット
   */
  reset(): void {
    // 各サブシステムのリセット
    this.mainMenuSystem.reset();
    this.gameMenuSystem.reset();
    this.settingsSystem.reset();
    this.saveLoadMenuSystem.reset();
    this.titleScreenSystem.reset();

    // 初期状態にリセット
    const initialState: UIState = {
      currentScreen: this.systemConfig.initialScreen,
      timestamp: Date.now(),
    };
    this.uiStateManager.setState(initialState);

    console.log("UISystemManager reset");
  }

  /**
   * システム全体の終了処理
   */
  dispose(): void {
    // 各サブシステムの終了処理
    this.mainMenuSystem.dispose();
    this.gameMenuSystem.dispose();
    this.settingsSystem.dispose();
    this.saveLoadMenuSystem.dispose();
    this.titleScreenSystem.dispose();

    // this.isInitialized = false; // プロパティを削除したためコメントアウト

    console.log("UISystemManager disposed");
  }
}
