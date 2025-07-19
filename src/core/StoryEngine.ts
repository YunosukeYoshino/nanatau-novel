/**
 * ストーリーエンジン - ゲームのシーン管理とストーリー進行を制御
 */

import type { GameState, ScenarioData, SceneData } from "../types/core.js";
import type { IScenarioParser, IStoryEngine } from "../types/interfaces.js";
import { ScenarioParser } from "./ScenarioParser.js";

export class StoryEngine implements IStoryEngine {
  private scenarioParser: IScenarioParser;
  private currentScenario: ScenarioData | null = null;
  private currentSceneIndex: number = 0;
  private gameState: GameState;

  constructor() {
    this.scenarioParser = new ScenarioParser();
    this.gameState = this.createInitialGameState();
  }

  /**
   * 初期ゲーム状態を作成
   */
  private createInitialGameState(): GameState {
    return {
      currentScenarioPath: "",
      currentSceneIndex: 0,
      currentRouteId: "main",
      variables: new Map<string, unknown>(),
      flags: new Map<string, boolean>(),
      visitedScenes: new Set<string>(),
      choices: [],
      inventory: [],
      playerName: "",
      lastSaveTimestamp: Date.now(),
    };
  }

  /**
   * ストーリーエンジンの初期化
   */
  async initialize(): Promise<void> {
    // 初期化処理（設定読み込みなど）
    console.log("StoryEngine initialized");
  }

  /**
   * シナリオファイルの読み込み
   */
  async loadScenario(filePath: string): Promise<ScenarioData> {
    try {
      // ファイル読み込み（実際の実装では fetch や fs を使用）
      const response = await fetch(filePath);
      const content = await response.text();

      // シナリオパーサーでパース
      this.currentScenario = this.scenarioParser.parseScenarioFile(content);
      this.gameState.currentScenarioPath = filePath;
      this.currentSceneIndex = 0;

      return this.currentScenario;
    } catch (error) {
      throw new Error(`Failed to load scenario: ${filePath}. ${error}`);
    }
  }

  /**
   * 現在のシーンを取得
   */
  getCurrentScene(): SceneData | null {
    if (!this.currentScenario || !this.currentScenario.scenes) {
      return null;
    }

    const scene = this.currentScenario.scenes[this.currentSceneIndex];
    if (!scene) {
      return null;
    }

    // 訪問済みシーンとしてマーク
    this.gameState.visitedScenes.add(scene.id);

    return scene;
  }

  /**
   * ストーリーを次のシーンへ進行
   */
  advanceStory(): void {
    if (!this.currentScenario) {
      console.warn("No scenario loaded");
      return;
    }

    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      console.warn("No current scene");
      return;
    }

    // 選択肢がある場合は進行を停止
    if (currentScene.choices && currentScene.choices.length > 0) {
      console.log("Waiting for player choice");
      return;
    }

    // 次のシーンへ進行
    this.currentSceneIndex++;
    this.gameState.currentSceneIndex = this.currentSceneIndex;

    // シナリオ終了チェック
    if (this.currentSceneIndex >= this.currentScenario.scenes.length) {
      console.log("Scenario completed");
      return;
    }

    console.log(`Advanced to scene ${this.currentSceneIndex}`);
  }

  /**
   * 選択肢の処理
   */
  processChoice(choiceId: string): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene || !currentScene.choices) {
      console.warn("No choices available");
      return;
    }

    const choice = currentScene.choices.find((c) => c.id === choiceId);
    if (!choice) {
      console.warn(`Choice not found: ${choiceId}`);
      return;
    }

    // 選択履歴に追加
    this.gameState.choices.push({
      sceneId: currentScene.id,
      choiceId: choice.id,
      choiceText: choice.text,
      timestamp: Date.now(),
    });

    // フラグ設定の処理
    if (choice.flags) {
      for (const [flag, value] of Object.entries(choice.flags)) {
        this.gameState.flags.set(flag, value);
      }
    }

    // 変数設定の処理
    if (choice.variables) {
      for (const [variable, value] of Object.entries(choice.variables)) {
        this.gameState.variables.set(variable, value);
      }
    }

    // ジャンプ先の処理
    if (choice.jumpTo) {
      this.jumpToScene(choice.jumpTo);
    } else {
      // 通常の進行
      this.advanceStory();
    }

    console.log(`Processed choice: ${choiceId}`);
  }

  /**
   * 特定のシーンにジャンプ
   */
  private jumpToScene(sceneId: string): void {
    if (!this.currentScenario) {
      console.warn("No scenario loaded");
      return;
    }

    const sceneIndex = this.currentScenario.scenes.findIndex(
      (scene) => scene.id === sceneId
    );
    if (sceneIndex === -1) {
      console.warn(`Scene not found: ${sceneId}`);
      return;
    }

    this.currentSceneIndex = sceneIndex;
    this.gameState.currentSceneIndex = this.currentSceneIndex;
    console.log(`Jumped to scene: ${sceneId} (index: ${sceneIndex})`);
  }

  /**
   * ルート分岐の管理
   */
  switchRoute(routeId: string): void {
    this.gameState.currentRouteId = routeId;
    console.log(`Switched to route: ${routeId}`);

    // ルート切り替え後の処理（必要に応じてシナリオを再読み込み）
    // 実装予定: ルート別シナリオファイルの読み込み
  }

  /**
   * 現在のゲーム状態を取得
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * ゲーム状態の設定
   */
  setGameState(gameState: GameState): void {
    this.gameState = { ...gameState };
    this.currentSceneIndex = gameState.currentSceneIndex;
  }

  /**
   * 変数の取得
   */
  getVariable(name: string): unknown {
    return this.gameState.variables.get(name);
  }

  /**
   * 変数の設定
   */
  setVariable(name: string, value: unknown): void {
    this.gameState.variables.set(name, value);
  }

  /**
   * フラグの取得
   */
  getFlag(name: string): boolean {
    return this.gameState.flags.get(name) ?? false;
  }

  /**
   * フラグの設定
   */
  setFlag(name: string, value: boolean): void {
    this.gameState.flags.set(name, value);
  }

  /**
   * シナリオの進行度を取得
   */
  getProgress(): number {
    if (!this.currentScenario) {
      return 0;
    }
    return (this.currentSceneIndex / this.currentScenario.scenes.length) * 100;
  }

  /**
   * デバッグ情報の取得
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      currentScenarioPath: this.gameState.currentScenarioPath,
      currentSceneIndex: this.currentSceneIndex,
      currentRouteId: this.gameState.currentRouteId,
      progress: this.getProgress(),
      variablesCount: this.gameState.variables.size,
      flagsCount: this.gameState.flags.size,
      visitedScenesCount: this.gameState.visitedScenes.size,
      choicesCount: this.gameState.choices.length,
    };
  }
}
