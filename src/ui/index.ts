/**
 * UI/UXシステム - エクスポートファイル
 * Phase 5: UI/UX実装システム
 */

export { GameMenuSystem } from "./GameMenuSystem.js";
// 型定義の再エクスポート
export type {
  ButtonStyle,
  ControlSettings,
  DisplaySettings,
  IGameMenuSystem,
  // システムインターフェース
  IMainMenuSystem,
  ISaveLoadMenuSystem,
  ISettingsSystem,
  IThemeSystem,
  ITitleScreenSystem,
  IUIStateManager,
  IUISystemManager,
  MenuItem,
  TransitionOptions,
  UIButton,
  UIDialog,
  // UI要素の基本型
  UIElement,
  UILabel,
  UIMenu,
  UIPanel,
  UISlider,
  // UI状態管理
  UIState,
  // テーマシステム
  UITheme,
  UserSettings,
  // 設定関連
  VolumeSettings,
} from "./interfaces.js";
// インターフェース
export * from "./interfaces.js";
// 個別システム
export { MainMenuSystem } from "./MainMenuSystem.js";
export { SaveLoadMenuSystem } from "./SaveLoadMenuSystem.js";
export { SettingsSystem } from "./SettingsSystem.js";
export { TitleScreenSystem } from "./TitleScreenSystem.js";
export { UIStateManager } from "./UIStateManager.js";
// 統合マネージャー
export { UISystemManager } from "./UISystemManager.js";
