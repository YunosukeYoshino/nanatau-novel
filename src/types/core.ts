/**
 * ゲームの基本データ型定義
 */

// ゲーム設定
export interface GameConfig {
  // 画面設定
  screen: {
    width: number;
    height: number;
    fullscreen: boolean;
  };

  // 音声設定
  audio: {
    masterVolume: number;
    bgmVolume: number;
    seVolume: number;
    voiceVolume: number;
  };

  // テキスト設定
  text: {
    speed: number;
    autoAdvance: boolean;
    autoAdvanceDelay: number;
  };

  // その他設定
  skipRead: boolean;
  language: string;
}

// シーンデータ
export interface SceneData {
  id: string;
  type: "dialogue" | "choice" | "background" | "character" | "directive";
  content: string;
  character?: string;
  background?: string;
  bgm?: string;
  se?: string;
  choices?: ChoiceData[];
}

// 選択肢データ
export interface ChoiceData {
  id: string;
  text: string;
  nextScene: string;
  routeChange?: string;
}

// シナリオデータ
export interface ScenarioData {
  title: string;
  chapter: string;
  scenes: SceneData[];
}

// ゲーム状態
export interface GameState {
  currentScene: string;
  currentRoute: string;
  choiceHistory: string[];
  gameVariables: Record<string, any>;
  timestamp: number;
}

// セーブスロット情報
export interface SaveSlotInfo {
  slotId: string;
  timestamp: number;
  sceneName: string;
  previewImage?: string;
}

// ディレクティブデータ
export interface DirectiveData {
  type: "background" | "bgm" | "se" | "character";
  value: string;
  options?: Record<string, any>;
}

// 台詞データ
export interface DialogueData {
  character: string;
  text: string;
  isMonologue: boolean;
}

// メニュータイプ
export enum MenuType {
  MAIN = "main",
  SAVE = "save",
  LOAD = "load",
  SETTINGS = "settings",
}
