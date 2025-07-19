/**
 * UI/UXシステムインターフェース定義
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig, GameState } from "../types/core.js";

// UI要素の基本インターフェース
export interface UIElement {
  id: string;
  visible: boolean;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

// ボタンインターフェース
export interface UIButton extends UIElement {
  text: string;
  onClick: () => void;
  disabled: boolean;
  style?: ButtonStyle;
}

// ボタンスタイル
export interface ButtonStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: number;
  fontFamily: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  borderRadius: number;
  hoverColor?: string;
  activeColor?: string;
}

// パネルインターフェース
export interface UIPanel extends UIElement {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
}

// テキストラベルインターフェース
export interface UILabel extends UIElement {
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: "left" | "center" | "right";
  wordWrap?: boolean;
}

// スライダーインターフェース
export interface UISlider extends UIElement {
  min: number;
  max: number;
  value: number;
  step: number;
  onChange: (value: number) => void;
  thumbColor?: string;
  trackColor?: string;
  fillColor?: string;
}

// メニューアイテム
export interface MenuItem {
  id: string;
  text: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  children?: MenuItem[];
}

// メニューインターフェース
export interface UIMenu extends UIElement {
  items: MenuItem[];
  orientation: "horizontal" | "vertical";
  spacing: number;
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
}

// ダイアログインターフェース
export interface UIDialog extends UIPanel {
  title: string;
  content: string;
  buttons: UIButton[];
  modal: boolean;
  onClose?: () => void;
}

// メインメニューシステムインターフェース
export interface IMainMenuSystem {
  // システムの初期化
  initialize(): Promise<void>;

  // メインメニューの表示
  showMainMenu(): Promise<void>;

  // メインメニューの非表示
  hideMainMenu(): Promise<void>;

  // 新規ゲーム開始
  startNewGame(): Promise<void>;

  // ゲーム続行
  continueGame(): Promise<void>;

  // セーブデータ読み込み
  loadGameFromMenu(): Promise<void>;

  // 設定画面を開く
  openSettings(): Promise<void>;

  // ゲーム終了
  exitGame(): Promise<void>;

  // メニューの状態確認
  isMainMenuVisible(): boolean;

  // コールバック関数の設定
  setCallbacks(callbacks: {
    onNewGame?: () => Promise<void>;
    onContinueGame?: () => Promise<void>;
    onLoadGame?: () => Promise<void>;
    onSettings?: () => Promise<void>;
    onExitGame?: () => Promise<void>;
  }): void;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// ゲーム内メニューシステムインターフェース
export interface IGameMenuSystem {
  // システムの初期化
  initialize(): Promise<void>;

  // ゲーム内メニューの表示
  showGameMenu(): Promise<void>;

  // ゲーム内メニューの非表示
  hideGameMenu(): Promise<void>;

  // クイックセーブ
  quickSave(): Promise<void>;

  // クイックロード
  quickLoad(): Promise<void>;

  // セーブ画面を開く
  openSaveMenu(): Promise<void>;

  // ロード画面を開く
  openLoadMenu(): Promise<void>;

  // 設定画面を開く
  openSettings(): Promise<void>;

  // メインメニューに戻る
  returnToMainMenu(): Promise<void>;

  // メニューの状態確認
  isGameMenuVisible(): boolean;

  // メニューの表示切り替え
  toggleGameMenu(): Promise<void>;

  // コールバック関数の設定
  setCallbacks(callbacks: {
    onQuickSave?: () => Promise<void>;
    onQuickLoad?: () => Promise<void>;
    onOpenSaveMenu?: () => Promise<void>;
    onOpenLoadMenu?: () => Promise<void>;
    onOpenSettings?: () => Promise<void>;
    onReturnToMainMenu?: () => Promise<void>;
    onClose?: () => void;
  }): void;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// 設定システムインターフェース
export interface ISettingsSystem {
  // システムの初期化
  initialize(): Promise<void>;

  // 設定画面の表示
  showSettings(): Promise<void>;

  // 設定画面の非表示
  hideSettings(): Promise<void>;

  // 音量設定の変更
  updateVolumeSettings(settings: VolumeSettings): void;

  // 表示設定の変更
  updateDisplaySettings(settings: DisplaySettings): void;

  // 操作設定の変更
  updateControlSettings(settings: ControlSettings): void;

  // 設定のリセット
  resetToDefaults(): void;

  // 設定の保存
  saveSettings(): void;

  // 設定の読み込み
  loadSettings(): void;

  // 現在の設定取得
  getCurrentSettings(): UserSettings;

  // 設定画面の状態確認
  isSettingsVisible(): boolean;

  // コールバック関数の設定
  setCallbacks(callbacks: {
    onVolumeChange?: (settings: VolumeSettings) => void;
    onDisplayChange?: (settings: DisplaySettings) => void;
    onControlChange?: (settings: ControlSettings) => void;
    onClose?: () => void;
  }): void;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// 音量設定
export interface VolumeSettings {
  master: number; // 0.0 - 1.0
  bgm: number; // 0.0 - 1.0
  se: number; // 0.0 - 1.0
  voice: number; // 0.0 - 1.0
}

// 表示設定
export interface DisplaySettings {
  textSpeed: number; // 1-10
  autoSpeed: number; // 1-10
  skipMode: "all" | "unread"; // 既読のみ or すべて
  fullscreen: boolean;
  resolution: {
    width: number;
    height: number;
  };
  uiScale: number; // 0.5 - 2.0
}

// 操作設定
export interface ControlSettings {
  keyBindings: {
    advance: string[]; // テキスト進行
    skip: string[]; // スキップ
    auto: string[]; // オート
    quickSave: string[]; // クイックセーブ
    quickLoad: string[]; // クイックロード
    hideUI: string[]; // UI非表示
    menu: string[]; // メニュー
  };
  mouseControls: {
    leftClick: "advance" | "menu";
    rightClick: "advance" | "menu" | "skip";
    middleClick: "auto" | "skip" | "none";
    wheelUp: "backlog" | "none";
    wheelDown: "advance" | "none";
  };
}

// ユーザー設定全体
export interface UserSettings {
  volume: VolumeSettings;
  display: DisplaySettings;
  controls: ControlSettings;
  version: string;
  lastModified: number;
}

// セーブ・ロードメニューシステムインターフェース
export interface ISaveLoadMenuSystem {
  // システムの初期化
  initialize(): Promise<void>;

  // セーブメニューの表示
  showSaveMenu(): Promise<void>;

  // ロードメニューの表示
  showLoadMenu(): Promise<void>;

  // メニューの非表示
  hideMenu(): Promise<void>;

  // セーブスロットの表示更新
  refreshSaveSlots(): Promise<void>;

  // セーブ実行
  performSave(slotId: string): Promise<void>;

  // ロード実行
  performLoad(slotId: string): Promise<void>;

  // セーブデータ削除
  deleteSaveData(slotId: string): Promise<void>;

  // セーブ・ロードメニューの状態確認
  isMenuVisible(): boolean;

  // 現在のモード取得
  getCurrentMode(): "save" | "load" | null;

  // コールバック関数の設定
  setCallbacks(callbacks: {
    onSave?: (slotId: string) => Promise<void>;
    onLoad?: (slotId: string) => Promise<void>;
    onDelete?: (slotId: string) => Promise<void>;
    onClose?: () => void;
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
    getCurrentGameState?: () => GameState | null;
  }): void;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// タイトル画面システムインターフェース
export interface ITitleScreenSystem {
  // システムの初期化
  initialize(): Promise<void>;

  // タイトル画面の表示
  showTitleScreen(): Promise<void>;

  // タイトル画面の非表示
  hideTitleScreen(): Promise<void>;

  // オープニング動画の再生
  playOpeningVideo(): Promise<void>;

  // タイトル画面の状態確認
  isTitleScreenVisible(): boolean;

  // コールバック関数の設定
  setCallbacks(callbacks: {
    onTitleClick?: () => Promise<void>;
    onVideoEnd?: () => Promise<void>;
    onVideoSkip?: () => Promise<void>;
  }): void;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// UI状態管理インターフェース
export interface IUIStateManager {
  // 現在のUI状態
  getCurrentState(): UIState;

  // UI状態の変更
  setState(newState: UIState): void;

  // UI状態の履歴管理
  pushState(state: UIState): void;
  popState(): UIState | null;
  clearHistory(): void;

  // 状態変更の監視
  onStateChange(callback: (state: UIState) => void): void;
  removeStateChangeListener(callback: (state: UIState) => void): void;
}

// UI状態
export interface UIState {
  currentScreen: "title" | "mainMenu" | "game" | "settings" | "saveLoad";
  previousScreen?: string;
  gameState?: GameState;
  menuContext?: {
    selectedItem?: string;
    scrollPosition?: number;
    filters?: Record<string, unknown>;
  };
  timestamp: number;
}

// UI統合システムマネージャー
export interface IUISystemManager {
  // システムの初期化
  initialize(config: GameConfig): Promise<void>;

  // 各サブシステムの取得
  getMainMenuSystem(): IMainMenuSystem;
  getGameMenuSystem(): IGameMenuSystem;
  getSettingsSystem(): ISettingsSystem;
  getSaveLoadMenuSystem(): ISaveLoadMenuSystem;
  getTitleScreenSystem(): ITitleScreenSystem;
  getUIStateManager(): IUIStateManager;

  // 画面遷移の管理
  transitionToScreen(
    screen: string,
    options?: TransitionOptions
  ): Promise<void>;

  // グローバルなキーボード・マウス入力処理
  handleGlobalInput(event: KeyboardEvent | MouseEvent): void;

  // レスポンシブレイアウトの管理
  updateLayout(screenWidth: number, screenHeight: number): void;

  // システム全体のリセット
  reset(): void;

  // システム全体の終了処理
  dispose(): void;
}

// 画面遷移オプション
export interface TransitionOptions {
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  direction?: "fade" | "slide-left" | "slide-right" | "slide-up" | "slide-down";
  saveCurrentState?: boolean;
}

// テーマシステムインターフェース
export interface IThemeSystem {
  // テーマの読み込み
  loadTheme(themeName: string): Promise<void>;

  // 現在のテーマ取得
  getCurrentTheme(): UITheme;

  // テーマの適用
  applyTheme(theme: UITheme): void;

  // ダークモード切り替え
  toggleDarkMode(): void;

  // カスタムテーマの作成
  createCustomTheme(baseTheme: string, overrides: Partial<UITheme>): UITheme;
}

// UIテーマ
export interface UITheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    warning: string;
    success: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    ui: string;
  };
  sizes: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}
