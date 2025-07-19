/**
 * 選択肢処理とルート分岐システム
 */

import type {
  ChoiceData,
  ChoiceHistory,
  GameState,
  RouteCondition,
} from "../types/core.js";

export interface ChoiceSystemConfig {
  enableChoiceHistory: boolean;
  maxHistorySize: number;
  enableUndo: boolean;
  undoStackSize: number;
}

export class ChoiceSystem {
  private config: ChoiceSystemConfig;
  private undoStack: GameState[] = [];

  constructor(config?: Partial<ChoiceSystemConfig>) {
    this.config = {
      enableChoiceHistory: true,
      maxHistorySize: 100,
      enableUndo: false,
      undoStackSize: 10,
      ...config,
    };
  }

  /**
   * 選択肢の条件評価
   */
  evaluateChoiceConditions(
    choices: ChoiceData[],
    gameState: GameState
  ): ChoiceData[] {
    return choices.filter((choice) => {
      // 条件が設定されていない場合は常に表示
      if (!choice.conditions) {
        return true;
      }

      return this.evaluateConditions(choice.conditions, gameState);
    });
  }

  /**
   * 条件の評価
   */
  private evaluateConditions(
    conditions: RouteCondition[],
    gameState: GameState
  ): boolean {
    return conditions.every((condition) => {
      switch (condition.type) {
        case "flag":
          return this.evaluateFlagCondition(condition, gameState);
        case "variable":
          return this.evaluateVariableCondition(condition, gameState);
        case "choice_history":
          return this.evaluateChoiceHistoryCondition(condition, gameState);
        case "route":
          return this.evaluateRouteCondition(condition, gameState);
        default:
          console.warn(`Unknown condition type: ${condition.type}`);
          return true;
      }
    });
  }

  /**
   * フラグ条件の評価
   */
  private evaluateFlagCondition(
    condition: RouteCondition,
    gameState: GameState
  ): boolean {
    const flagValue = gameState.flags.get(condition.key) ?? false;

    switch (condition.operator) {
      case "equals":
        return flagValue === condition.value;
      case "not_equals":
        return flagValue !== condition.value;
      default:
        console.warn(
          `Invalid operator for flag condition: ${condition.operator}`
        );
        return false;
    }
  }

  /**
   * 変数条件の評価
   */
  private evaluateVariableCondition(
    condition: RouteCondition,
    gameState: GameState
  ): boolean {
    const variableValue = gameState.variables.get(condition.key);

    switch (condition.operator) {
      case "equals":
        return variableValue === condition.value;
      case "not_equals":
        return variableValue !== condition.value;
      case "greater_than":
        return (
          typeof variableValue === "number" &&
          typeof condition.value === "number" &&
          variableValue > condition.value
        );
      case "less_than":
        return (
          typeof variableValue === "number" &&
          typeof condition.value === "number" &&
          variableValue < condition.value
        );
      case "greater_equal":
        return (
          typeof variableValue === "number" &&
          typeof condition.value === "number" &&
          variableValue >= condition.value
        );
      case "less_equal":
        return (
          typeof variableValue === "number" &&
          typeof condition.value === "number" &&
          variableValue <= condition.value
        );
      default:
        console.warn(
          `Invalid operator for variable condition: ${condition.operator}`
        );
        return false;
    }
  }

  /**
   * 選択履歴条件の評価
   */
  private evaluateChoiceHistoryCondition(
    condition: RouteCondition,
    gameState: GameState
  ): boolean {
    const hasChoice = gameState.choices.some(
      (choice) => choice.choiceId === condition.value
    );

    switch (condition.operator) {
      case "equals":
        return hasChoice;
      case "not_equals":
        return !hasChoice;
      default:
        console.warn(
          `Invalid operator for choice_history condition: ${condition.operator}`
        );
        return false;
    }
  }

  /**
   * ルート条件の評価
   */
  private evaluateRouteCondition(
    condition: RouteCondition,
    gameState: GameState
  ): boolean {
    switch (condition.operator) {
      case "equals":
        return gameState.currentRouteId === condition.value;
      case "not_equals":
        return gameState.currentRouteId !== condition.value;
      default:
        console.warn(
          `Invalid operator for route condition: ${condition.operator}`
        );
        return false;
    }
  }

  /**
   * 選択肢の実行
   */
  executeChoice(
    choice: ChoiceData,
    gameState: GameState,
    currentSceneId: string
  ): GameState {
    // undo用の状態保存
    if (this.config.enableUndo) {
      this.saveStateForUndo(gameState);
    }

    // 新しいゲーム状態のコピーを作成
    const newGameState: GameState = {
      ...gameState,
      variables: new Map(gameState.variables),
      flags: new Map(gameState.flags),
      visitedScenes: new Set(gameState.visitedScenes),
      choices: [...gameState.choices],
    };

    // 選択履歴に追加
    if (this.config.enableChoiceHistory) {
      this.addToChoiceHistory(choice, currentSceneId, newGameState);
    }

    // フラグの更新
    if (choice.flags) {
      for (const [flag, value] of Object.entries(choice.flags)) {
        newGameState.flags.set(flag, value);
      }
    }

    // 変数の更新
    if (choice.variables) {
      for (const [variable, value] of Object.entries(choice.variables)) {
        newGameState.variables.set(variable, value);
      }
    }

    // ルート変更
    if (choice.routeId) {
      newGameState.currentRouteId = choice.routeId;
    }

    return newGameState;
  }

  /**
   * 選択履歴に追加
   */
  private addToChoiceHistory(
    choice: ChoiceData,
    sceneId: string,
    gameState: GameState
  ): void {
    const historyEntry: ChoiceHistory = {
      sceneId,
      choiceId: choice.id,
      choiceText: choice.text,
      timestamp: Date.now(),
    };

    gameState.choices.push(historyEntry);

    // 履歴サイズの制限
    if (gameState.choices.length > this.config.maxHistorySize) {
      gameState.choices.shift();
    }
  }

  /**
   * undo用の状態保存
   */
  private saveStateForUndo(gameState: GameState): void {
    this.undoStack.push({
      ...gameState,
      variables: new Map(gameState.variables),
      flags: new Map(gameState.flags),
      visitedScenes: new Set(gameState.visitedScenes),
      choices: [...gameState.choices],
    });

    // undoスタックサイズの制限
    if (this.undoStack.length > this.config.undoStackSize) {
      this.undoStack.shift();
    }
  }

  /**
   * 選択をundo
   */
  undoLastChoice(): GameState | null {
    if (!this.config.enableUndo || this.undoStack.length === 0) {
      return null;
    }

    const previousState = this.undoStack.pop();
    return previousState || null;
  }

  /**
   * ルート分岐の判定
   */
  determineRoute(
    availableRoutes: string[],
    gameState: GameState,
    routeConditions: Map<string, RouteCondition[]>
  ): string {
    // 条件を満たす最初のルートを返す
    for (const route of availableRoutes) {
      const conditions = routeConditions.get(route);
      if (!conditions || this.evaluateConditions(conditions, gameState)) {
        return route;
      }
    }

    // デフォルトルート（最初のルート）を返す
    return availableRoutes[0] || "main";
  }

  /**
   * 選択肢の統計情報を取得
   */
  getChoiceStatistics(gameState: GameState): Record<string, unknown> {
    const choicesByScene = new Map<string, number>();
    const choicesByChoice = new Map<string, number>();

    gameState.choices.forEach((choice) => {
      // シーン別集計
      const sceneCount = choicesByScene.get(choice.sceneId) || 0;
      choicesByScene.set(choice.sceneId, sceneCount + 1);

      // 選択肢別集計
      const choiceCount = choicesByChoice.get(choice.choiceId) || 0;
      choicesByChoice.set(choice.choiceId, choiceCount + 1);
    });

    return {
      totalChoices: gameState.choices.length,
      uniqueScenes: choicesByScene.size,
      uniqueChoices: choicesByChoice.size,
      choicesByScene: Object.fromEntries(choicesByScene),
      choicesByChoice: Object.fromEntries(choicesByChoice),
      undoStackSize: this.undoStack.length,
    };
  }

  /**
   * 選択履歴をクリア（ゲーム状態から）
   */
  clearChoiceHistory(gameState: GameState): void {
    gameState.choices = [];
  }

  /**
   * undoスタックをクリア
   */
  clearUndoStack(): void {
    this.undoStack = [];
  }

  /**
   * 設定の更新
   */
  updateConfig(newConfig: Partial<ChoiceSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): ChoiceSystemConfig {
    return { ...this.config };
  }
}
