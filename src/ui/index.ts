/**
 * UI/UXシステム - エクスポートファイル
 * Phase 5: UI/UX実装システム
 */

// インターフェース
export * from "./interfaces.js";

// 個別システム
export { MainMenuSystem } from "./MainMenuSystem.js";
export { GameMenuSystem } from "./GameMenuSystem.js";
export { SettingsSystem } from "./SettingsSystem.js";
export { SaveLoadMenuSystem } from "./SaveLoadMenuSystem.js";
export { TitleScreenSystem } from "./TitleScreenSystem.js";
export { UIStateManager } from "./UIStateManager.js";

// 統合マネージャー
export { UISystemManager } from "./UISystemManager.js";

// 型定義の再エクスポート
export type {
  // UI要素の基本型
  UIElement,
  UIButton,
  UIPanel,
  UILabel,
  UISlider,
  UIMenu,
  UIDialog,
  MenuItem,
  ButtonStyle,
  // システムインターフェース
  IMainMenuSystem,
  IGameMenuSystem,
  ISettingsSystem,
  ISaveLoadMenuSystem,
  ITitleScreenSystem,
  IUIStateManager,
  IUISystemManager,
  IThemeSystem,
  // 設定関連
  VolumeSettings,
  DisplaySettings,
  ControlSettings,
  UserSettings,
  // UI状態管理
  UIState,
  TransitionOptions,
  // テーマシステム
  UITheme,
} from "./interfaces.js";
