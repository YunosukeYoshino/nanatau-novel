/**
 * ルート分岐システム - ストーリールートの管理と分岐処理
 */

import type {
  GameState,
  RouteCondition,
  RouteDefinition,
} from "../types/core.js";
import type {
  IRouteBranchSystem,
  BranchPointInfo,
  RouteInfo,
} from "../types/interfaces.js";

export interface RouteNode {
  /** ルートID */
  id: string;
  /** ルート名 */
  name: string;
  /** 説明 */
  description?: string;
  /** 親ルート */
  parentRoute?: string;
  /** 子ルート */
  childRoutes: string[];
  /** このルートに入る条件 */
  conditions: RouteCondition[];
  /** シナリオファイルパス */
  scenarioPath: string;
  /** ルートの優先度 */
  priority: number;
  /** ルートタイプ */
  type: "main" | "branch" | "ending" | "special";
  /** このルートが一度だけ実行可能か */
  oneTimeOnly?: boolean;
  /** 実行済みかどうか */
  visited?: boolean;
}

export interface RouteGraph {
  /** ルートノードのマップ */
  nodes: Map<string, RouteNode>;
  /** ルート間の接続関係 */
  connections: Map<string, string[]>;
  /** 現在のルート */
  currentRoute: string;
  /** ルート履歴 */
  routeHistory: string[];
}

export interface RouteTransition {
  /** 遷移元ルート */
  fromRoute: string;
  /** 遷移先ルート */
  toRoute: string;
  /** 遷移条件 */
  conditions: RouteCondition[];
  /** 遷移時に実行されるアクション */
  actions?: {
    setFlags?: Record<string, boolean>;
    setVariables?: Record<string, unknown>;
    jumpToScene?: string;
  };
}

export class RouteBranchSystem implements IRouteBranchSystem {
  private routeGraph: RouteGraph;
  private routeTransitions: Map<string, RouteTransition[]> = new Map();
  private routeDefinitions: Map<string, RouteDefinition> = new Map();
  // TODO: Phase 5 - ゲーム状態の管理に使用予定
  // private currentGameState: GameState | null = null;

  constructor() {
    this.routeGraph = {
      nodes: new Map(),
      connections: new Map(),
      currentRoute: "main",
      routeHistory: ["main"],
    };

    this.initializeDefaultRoutes();
  }

  /**
   * システムの初期化
   */
  async initialize(): Promise<void> {
    console.log("RouteBranchSystem initialized");
  }

  /**
   * デフォルトルートの初期化
   */
  private initializeDefaultRoutes(): void {
    // メインルートの定義
    this.addRoute({
      id: "main",
      name: "メインルート",
      description: "メインストーリーライン",
      childRoutes: [],
      conditions: [],
      scenarioPath: "scenarios/main/",
      priority: 0,
      type: "main",
    });

    console.log("Default routes initialized");
  }

  /**
   * ルートの追加
   */
  addRoute(routeNode: RouteNode): void {
    this.routeGraph.nodes.set(routeNode.id, routeNode);
    this.routeGraph.connections.set(routeNode.id, routeNode.childRoutes);

    // 親子関係の設定
    if (routeNode.parentRoute) {
      const parentNode = this.routeGraph.nodes.get(routeNode.parentRoute);
      if (parentNode) {
        parentNode.childRoutes.push(routeNode.id);
        this.routeGraph.connections.set(
          routeNode.parentRoute,
          parentNode.childRoutes
        );
      }
    }

    console.log(`Route added: ${routeNode.id}`);
  }

  /**
   * ルートの削除
   */
  removeRoute(routeId: string): void {
    const routeNode = this.routeGraph.nodes.get(routeId);
    if (!routeNode) {
      console.warn(`Route not found: ${routeId}`);
      return;
    }

    // 子ルートを親ルートに接続
    if (routeNode.parentRoute && routeNode.childRoutes.length > 0) {
      const parentNode = this.routeGraph.nodes.get(routeNode.parentRoute);
      if (parentNode) {
        parentNode.childRoutes = parentNode.childRoutes
          .filter((id) => id !== routeId)
          .concat(routeNode.childRoutes);
        this.routeGraph.connections.set(
          routeNode.parentRoute,
          parentNode.childRoutes
        );
      }
    }

    // ルートの削除
    this.routeGraph.nodes.delete(routeId);
    this.routeGraph.connections.delete(routeId);

    console.log(`Route removed: ${routeId}`);
  }

  /**
   * ルート遷移の追加
   */
  addRouteTransition(transition: RouteTransition): void {
    const transitions = this.routeTransitions.get(transition.fromRoute) || [];
    transitions.push(transition);
    this.routeTransitions.set(transition.fromRoute, transitions);

    console.log(
      `Route transition added: ${transition.fromRoute} -> ${transition.toRoute}`
    );
  }

  /**
   * 利用可能なルートの評価
   */
  evaluateAvailableRoutes(gameState: GameState): string[] {
    // TODO: Phase 5 - this.currentGameState = gameState;
    const currentRoute = gameState.currentRouteId || "main";
    console.log(`Evaluating routes from current route: ${currentRoute}`);
    const availableRoutes: string[] = [];

    // 現在のルートから遷移可能なルートを確認
    const transitions = this.routeTransitions.get(currentRoute) || [];

    for (const transition of transitions) {
      if (this.evaluateRouteConditions(transition.conditions, gameState)) {
        const targetRoute = this.routeGraph.nodes.get(transition.toRoute);
        if (targetRoute && this.canEnterRoute(targetRoute, gameState)) {
          availableRoutes.push(transition.toRoute);
        }
      }
    }

    // 直接の子ルートも確認
    const childRoutes = this.routeGraph.connections.get(currentRoute) || [];
    for (const childRouteId of childRoutes) {
      const childRoute = this.routeGraph.nodes.get(childRouteId);
      if (childRoute && this.canEnterRoute(childRoute, gameState)) {
        if (!availableRoutes.includes(childRouteId)) {
          availableRoutes.push(childRouteId);
        }
      }
    }

    return availableRoutes;
  }

  /**
   * ルートに入れるかどうかの判定
   */
  private canEnterRoute(route: RouteNode, gameState: GameState): boolean {
    // 一度だけ実行可能なルートの確認
    if (route.oneTimeOnly && route.visited) {
      return false;
    }

    // 条件の評価
    return this.evaluateRouteConditions(route.conditions, gameState);
  }

  /**
   * ルート条件の評価
   */
  private evaluateRouteConditions(
    conditions: RouteCondition[],
    gameState: GameState
  ): boolean {
    if (conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => {
      switch (condition.type) {
        case "flag":
          return this.evaluateFlagCondition(condition, gameState);
        case "variable":
          return this.evaluateVariableCondition(condition, gameState);
        case "choice_history":
          return this.evaluateChoiceHistoryCondition(condition, gameState);
        case "route":
          return this.evaluateRouteHistoryCondition(condition, gameState);
        case "scene_visited":
          return this.evaluateSceneVisitedCondition(condition, gameState);
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
        return false;
    }
  }

  /**
   * ルート履歴条件の評価
   */
  private evaluateRouteHistoryCondition(
    condition: RouteCondition,
    gameState: GameState
  ): boolean {
    // TODO: Phase 5 - gameStateからのルート履歴情報も参照予定
    console.log("Evaluating route history for:", gameState.currentRouteId);
    const hasVisitedRoute = this.routeGraph.routeHistory.includes(
      condition.value as string
    );

    switch (condition.operator) {
      case "equals":
        return hasVisitedRoute;
      case "not_equals":
        return !hasVisitedRoute;
      default:
        return false;
    }
  }

  /**
   * シーン訪問条件の評価
   */
  private evaluateSceneVisitedCondition(
    condition: RouteCondition,
    gameState: GameState
  ): boolean {
    const hasVisitedScene = gameState.visitedScenes.has(
      condition.value as string
    );

    switch (condition.operator) {
      case "equals":
        return hasVisitedScene;
      case "not_equals":
        return !hasVisitedScene;
      default:
        return false;
    }
  }

  /**
   * ルートの切り替え
   */
  async switchToRoute(
    routeId: string,
    gameState: GameState
  ): Promise<GameState> {
    const targetRoute = this.routeGraph.nodes.get(routeId);
    if (!targetRoute) {
      throw new Error(`Route not found: ${routeId}`);
    }

    if (!this.canEnterRoute(targetRoute, gameState)) {
      throw new Error(`Cannot enter route: ${routeId}`);
    }

    // 新しいゲーム状態を作成
    const newGameState: GameState = {
      ...gameState,
      currentRouteId: routeId,
      variables: new Map(gameState.variables),
      flags: new Map(gameState.flags),
      visitedScenes: new Set(gameState.visitedScenes),
      choices: [...gameState.choices],
    };

    // ルート履歴の更新
    this.routeGraph.routeHistory.push(routeId);
    this.routeGraph.currentRoute = routeId;

    // ルートを訪問済みにマーク
    targetRoute.visited = true;

    // ルート遷移時のアクションを実行
    const transition = this.findTransition(gameState.currentRouteId, routeId);
    if (transition?.actions) {
      this.executeTransitionActions(transition.actions, newGameState);
    }

    console.log(`Switched to route: ${routeId}`);
    return newGameState;
  }

  /**
   * ルート遷移の検索
   */
  private findTransition(
    fromRoute: string,
    toRoute: string
  ): RouteTransition | undefined {
    const transitions = this.routeTransitions.get(fromRoute) || [];
    return transitions.find((t) => t.toRoute === toRoute);
  }

  /**
   * 遷移アクションの実行
   */
  private executeTransitionActions(
    actions: NonNullable<RouteTransition["actions"]>,
    gameState: GameState
  ): void {
    // フラグの設定
    if (actions.setFlags) {
      for (const [flag, value] of Object.entries(actions.setFlags)) {
        gameState.flags.set(flag, value);
      }
    }

    // 変数の設定
    if (actions.setVariables) {
      for (const [variable, value] of Object.entries(actions.setVariables)) {
        gameState.variables.set(variable, value);
      }
    }

    // TODO: シーンジャンプの処理
    if (actions.jumpToScene) {
      console.log(`Jump to scene: ${actions.jumpToScene}`);
    }
  }

  /**
   * 最適なルートの自動選択
   */
  selectBestRoute(gameState: GameState): string {
    const availableRoutes = this.evaluateAvailableRoutes(gameState);

    if (availableRoutes.length === 0) {
      return gameState.currentRouteId;
    }

    // 優先度が最も高いルートを選択
    let bestRoute: string = availableRoutes[0] || gameState.currentRouteId;
    let highestPriority = -1;

    for (const routeId of availableRoutes) {
      const route = this.routeGraph.nodes.get(routeId);
      if (route && route.priority > highestPriority) {
        highestPriority = route.priority;
        bestRoute = routeId;
      }
    }

    return bestRoute;
  }

  /**
   * ルート分岐点の検出
   */
  detectBranchPoints(gameState: GameState): BranchPointInfo[] {
    const availableRoutes = this.evaluateAvailableRoutes(gameState);
    const branchPoints: BranchPointInfo[] = [];

    for (const routeId of availableRoutes) {
      const route = this.routeGraph.nodes.get(routeId);
      if (route) {
        branchPoints.push({
          routeId: route.id,
          routeName: route.name,
          description: route.description ?? "No description available",
          requiredConditions: route.conditions,
        });
      }
    }

    return branchPoints;
  }

  /**
   * ルートグラフの可視化データ取得
   */
  getRouteGraphVisualization(): {
    nodes: Array<{ id: string; name: string; type: string; visited: boolean }>;
    edges: Array<{ from: string; to: string; conditions: RouteCondition[] }>;
  } {
    const nodes: Array<{
      id: string;
      name: string;
      type: string;
      visited: boolean;
    }> = [];
    const edges: Array<{
      from: string;
      to: string;
      conditions: RouteCondition[];
    }> = [];

    // ノードの収集
    for (const route of this.routeGraph.nodes.values()) {
      nodes.push({
        id: route.id,
        name: route.name,
        type: route.type,
        visited: route.visited || false,
      });
    }

    // エッジの収集
    for (const [fromRoute, transitions] of this.routeTransitions.entries()) {
      for (const transition of transitions) {
        edges.push({
          from: fromRoute,
          to: transition.toRoute,
          conditions: transition.conditions,
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * ルート統計情報の取得
   */
  getRouteStatistics(): {
    totalRoutes: number;
    visitedRoutes: number;
    currentRoute: string;
    routeHistory: string[];
    completionPercentage: number;
  } {
    const totalRoutes = this.routeGraph.nodes.size;
    const visitedRoutes = Array.from(this.routeGraph.nodes.values()).filter(
      (route) => route.visited
    ).length;

    return {
      totalRoutes,
      visitedRoutes,
      currentRoute: this.routeGraph.currentRoute,
      routeHistory: [...this.routeGraph.routeHistory],
      completionPercentage:
        totalRoutes > 0 ? (visitedRoutes / totalRoutes) * 100 : 0,
    };
  }

  /**
   * 現在のルート情報取得
   */
  getCurrentRoute(): RouteInfo | null {
    const currentRoute = this.routeGraph.nodes.get(
      this.routeGraph.currentRoute
    );
    if (!currentRoute) {
      return null;
    }

    return {
      id: currentRoute.id,
      name: currentRoute.name,
      description: currentRoute.description ?? "No description available",
      isActive: true,
      priority: currentRoute.priority,
      conditions: currentRoute.conditions,
    };
  }

  /**
   * ルート履歴の取得
   */
  getRouteHistory(): string[] {
    return [...this.routeGraph.routeHistory];
  }

  /**
   * ルート履歴のクリア
   */
  clearRouteHistory(): void {
    this.routeGraph.routeHistory = [this.routeGraph.currentRoute];
    console.log("Route history cleared");
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.routeGraph.currentRoute = "main";
    this.routeGraph.routeHistory = ["main"];

    // 全ルートの訪問状態をリセット
    for (const route of this.routeGraph.nodes.values()) {
      route.visited = false;
    }

    console.log("RouteBranchSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.routeGraph.nodes.clear();
    this.routeGraph.connections.clear();
    this.routeTransitions.clear();
    this.routeDefinitions.clear();
    console.log("RouteBranchSystem disposed");
  }
}
