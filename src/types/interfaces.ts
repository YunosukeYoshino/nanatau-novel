/**
 * システムインターフェース定義
 */

import type {
  ScenarioData,
  SceneData,
  ChoiceData,
  GameState,
  SaveSlotInfo,
  DirectiveData,
  DialogueData,
  MenuType,
  GameConfig,
} from "./core.js";

// ストーリーエンジンインターフェース
export interface IStoryEngine {
  // シナリオファイルの読み込み
  loadScenario(filePath: string): Promise<ScenarioData>;

  // 現在のストーリー状態
  getCurrentScene(): SceneData | null;

  // 次のシーンへ進行
  advanceStory(): void;

  // 選択肢の処理
  processChoice(choiceId: string): void;

  // ルート分岐の管理
  switchRoute(routeId: string): void;

  // 初期化
  initialize(): Promise<void>;
}

// シナリオパーサーインターフェース
export interface IScenarioParser {
  // テキストファイルをパース
  parseScenarioFile(content: string): ScenarioData;

  // 特殊タグの解析
  parseDirectives(line: string): DirectiveData | null;

  // キャラクター台詞の解析
  parseDialogue(line: string): DialogueData | null;

  // 選択肢の解析
  parseChoices(lines: string[]): ChoiceData[];
}

// アセット管理インターフェース
export interface IAssetManager {
  // 画像の読み込み
  loadImage(path: string): Promise<HTMLImageElement>;

  // 音声の読み込み
  loadAudio(path: string): Promise<HTMLAudioElement>;

  // アセットのプリロード
  preloadAssets(assetList: string[]): Promise<void>;

  // キャッシュ管理
  clearCache(): void;

  // アセットの存在確認
  assetExists(path: string): boolean;
}

// セーブ・ロードシステムインターフェース
export interface ISaveSystem {
  // ゲーム状態の保存
  saveGame(slotId: string, gameState: GameState): Promise<void>;

  // ゲーム状態の読み込み
  loadGame(slotId: string): Promise<GameState>;

  // セーブスロット一覧
  getSaveSlots(): SaveSlotInfo[];

  // セーブデータの削除
  deleteSave(slotId: string): Promise<void>;

  // セーブデータの存在確認
  saveExists(slotId: string): boolean;
}

// UI管理インターフェース
export interface IUIManager {
  // メニューの表示/非表示
  showMenu(menuType: MenuType): void;
  hideMenu(): void;

  // ダイアログボックスの管理
  showDialogue(character: string, text: string): void;
  hideDialogue(): void;

  // 選択肢の表示
  showChoices(choices: ChoiceData[]): void;
  hideChoices(): void;

  // 設定画面の管理
  showSettings(): void;

  // 初期化
  initialize(): void;
}

// 音声管理インターフェース
export interface IAudioManager {
  // BGMの再生
  playBGM(path: string, loop?: boolean): Promise<void>;

  // 効果音の再生
  playSE(path: string): Promise<void>;

  // BGMの停止
  stopBGM(): void;

  // 効果音の停止
  stopSE(): void;

  // 音量設定
  setMasterVolume(volume: number): void;
  setBGMVolume(volume: number): void;
  setSEVolume(volume: number): void;

  // フェード効果
  fadeBGM(duration: number, targetVolume: number): Promise<void>;
}

// テキスト表示システムインターフェース
export interface ITextDisplaySystem {
  // システムの初期化
  initialize(): Promise<void>;

  // シーンの表示
  displayScene(scene: SceneData): Promise<void>;

  // ダイアログの表示
  displayDialogue(dialogue: DialogueData): Promise<void>;

  // テキストの表示
  displayText(text: string): Promise<void>;

  // テキスト表示のスキップ
  skipToEnd(): void;

  // テキストの消去
  clearText(): void;

  // 表示中かどうかの確認
  isTextDisplaying(): boolean;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// キャラクター表示システムインターフェース
export interface ICharacterDisplaySystem {
  // システムの初期化
  initialize(): Promise<void>;

  // キャラクターの表示
  showCharacter(characterId: string, expression?: string, position?: string): Promise<void>;

  // キャラクターの非表示
  hideCharacter(characterId: string): Promise<void>;

  // キャラクターの表情変更
  changeExpression(characterId: string, expression: string): Promise<void>;

  // キャラクターの移動
  moveCharacter(characterId: string, newPosition: string): Promise<void>;

  // 全キャラクターの非表示
  hideAllCharacters(): Promise<void>;

  // 表示中のキャラクター確認
  isCharacterDisplayed(characterId: string): boolean;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// 背景表示システムインターフェース
export interface IBackgroundDisplaySystem {
  // システムの初期化
  initialize(): Promise<void>;

  // 背景の表示
  showBackground(imagePath: string): Promise<void>;

  // 背景の非表示
  hideBackground(): Promise<void>;

  // 背景のプリロード
  preloadBackground(imagePath: string): Promise<void>;

  // 前の背景に戻る
  goToPreviousBackground(): Promise<void>;

  // 現在の背景情報取得
  getCurrentBackground(): string | null;

  // 背景が表示中かどうか確認
  isBackgroundDisplayed(): boolean;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// 選択肢UIシステムインターフェース
export interface IChoiceUISystem {
  // システムの初期化
  initialize(): Promise<void>;

  // 選択肢の表示
  showChoices(choices: ChoiceData[], gameState: GameState, onChoiceSelected: (choice: ChoiceData) => void): Promise<void>;

  // 選択肢の非表示
  hideChoices(): Promise<void>;

  // キーボード入力処理
  handleKeyboardInput(key: string): void;

  // 選択肢が表示中かどうか確認
  isChoicesDisplayed(): boolean;

  // 現在の選択肢数取得
  getCurrentChoicesCount(): number;

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// ルート分岐システムインターフェース
export interface IRouteBranchSystem {
  // システムの初期化
  initialize(): Promise<void>;

  // 利用可能なルートの評価
  evaluateAvailableRoutes(gameState: GameState): string[];

  // ルートの切り替え
  switchToRoute(routeId: string, gameState: GameState): Promise<GameState>;

  // 最適なルートの自動選択
  selectBestRoute(gameState: GameState): string;

  // ルート分岐点の検出
  detectBranchPoints(gameState: GameState): Array<any>;

  // 現在のルート情報取得
  getCurrentRoute(): any;

  // ルート履歴の取得
  getRouteHistory(): string[];

  // システムのリセット
  reset(): void;

  // システムの終了処理
  dispose(): void;
}

// ゲーム設定管理インターフェース
export interface IConfigManager {
  // 設定の読み込み
  loadConfig(): GameConfig;

  // 設定の保存
  saveConfig(config: GameConfig): void;

  // デフォルト設定の取得
  getDefaultConfig(): GameConfig;

  // 設定の更新
  updateConfig(partialConfig: Partial<GameConfig>): void;
}
