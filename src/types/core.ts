/**
 * ゲームの基本データ型定義
 */

// ゲーム設定
export interface GameConfig {
  // ゲーム情報
  version?: string;

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

  // 画面サイズのアクセサー（後方互換性のため）
  screenWidth?: number;
  screenHeight?: number;
}

// シーンデータ
export interface SceneData {
  id: string;
  type: "dialogue" | "choice" | "background" | "character" | "directive";
  character: string | null;
  text: string;
  choices: ChoiceData[] | null;
  directives: DirectiveData[];
  dialogue?: DialogueData;
  metadata: {
    sceneNumber: number;
    tags: string[];
    estimatedReadTime: number;
  };
}

// 選択肢データ
export interface ChoiceData {
  id: string;
  text: string;
  flags?: Record<string, boolean>;
  variables?: Record<string, unknown>;
  routeId?: string;
  jumpTo?: string;
  conditions?: RouteCondition[];
}

// シナリオデータ
export interface ScenarioData {
  metadata: {
    title: string;
    author: string;
    version: string;
    description: string;
    tags: string[];
    estimatedPlayTime: number;
    lastModified: Date;
  };
  scenes: SceneData[];
}

// ゲーム状態
export interface GameState {
  currentScenarioPath: string;
  currentSceneIndex: number;
  currentRouteId: string;
  variables: Map<string, unknown>;
  flags: Map<string, boolean>;
  visitedScenes: Set<string>;
  choices: ChoiceHistory[];
  inventory: string[];
  playerName: string;
  lastSaveTimestamp: number;
}

// セーブスロット情報
export interface SaveSlotInfo {
  id: string;
  timestamp: number;
  scenarioPath: string;
  sceneTitle: string;
  characterName: string;
  currentText: string;
  screenshot?: string;
  dataSize: number;
}

// ディレクティブデータ
export interface DirectiveData {
  type:
    | "background"
    | "bgm"
    | "se"
    | "character"
    | "choice"
    | "emotion"
    | "effect";
  value: string;
  options?: Record<string, unknown>;
}

// 台詞データ
export interface DialogueData {
  character: string;
  text: string;
  isMonologue: boolean;
  emotion?: string;
  characterExpression?: string;
  voice?: string;
}

// メニュータイプ
export enum MenuType {
  MAIN = "main",
  SAVE = "save",
  LOAD = "load",
  SETTINGS = "settings",
}

// 選択履歴
export interface ChoiceHistory {
  sceneId: string;
  choiceId: string;
  choiceText: string;
  timestamp: number;
}

// ルート条件
export interface RouteCondition {
  type: "flag" | "variable" | "choice_history" | "route" | "scene_visited";
  key: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "greater_equal"
    | "less_equal";
  value: unknown;
}

// ルート定義
export interface RouteDefinition {
  id: string;
  name: string;
  description?: string;
  scenarioPath: string;
  conditions: RouteCondition[];
}
