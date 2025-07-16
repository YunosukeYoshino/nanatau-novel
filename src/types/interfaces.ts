/**
 * システムインターフェース定義
 */

import {
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
