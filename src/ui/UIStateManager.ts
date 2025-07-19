/**
 * UI状態管理システム - UIの状態とナビゲーション履歴の管理
 * Phase 5: UI/UX実装システム
 */

import type { IUIStateManager, UIState } from "./interfaces.js";

export class UIStateManager implements IUIStateManager {
  private currentState: UIState;
  private stateHistory: UIState[] = [];
  private stateChangeCallbacks: Array<(state: UIState) => void> = [];
  private maxHistorySize: number = 50;

  constructor() {
    // デフォルト状態の初期化
    this.currentState = {
      currentScreen: "title",
      timestamp: Date.now(),
    };
  }

  /**
   * 現在のUI状態の取得
   */
  getCurrentState(): UIState {
    return { ...this.currentState };
  }

  /**
   * UI状態の変更
   */
  setState(newState: UIState): void {
    const previousState = this.currentState;

    // 新しい状態を設定
    this.currentState = {
      ...newState,
      timestamp: Date.now(),
    };

    // 状態変更の通知
    this.notifyStateChange(this.currentState);

    console.log(
      `UI state changed: ${previousState.currentScreen} -> ${this.currentState.currentScreen}`
    );
  }

  /**
   * UI状態を履歴にプッシュ
   */
  pushState(state: UIState): void {
    // 現在の状態を履歴に追加
    this.stateHistory.push({ ...this.currentState });

    // 履歴サイズの制限
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    // 新しい状態を設定
    this.setState(state);
  }

  /**
   * 履歴から前の状態を取得・復元
   */
  popState(): UIState | null {
    if (this.stateHistory.length === 0) {
      console.warn("No state history available");
      return null;
    }

    const previousState = this.stateHistory.pop();
    if (previousState) {
      this.setState(previousState);
      return { ...previousState };
    }

    return null;
  }

  /**
   * 状態履歴のクリア
   */
  clearHistory(): void {
    this.stateHistory = [];
    console.log("UI state history cleared");
  }

  /**
   * 状態変更の監視
   */
  onStateChange(callback: (state: UIState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * 状態変更リスナーの削除
   */
  removeStateChangeListener(callback: (state: UIState) => void): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * 特定の画面に戻る
   */
  goBackToScreen(targetScreen: string): boolean {
    // 履歴を逆順でチェック
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      const state = this.stateHistory[i];
      if (state && state.currentScreen === targetScreen) {
        // 対象の状態を復元
        this.setState(state);

        // 履歴を調整（対象より後の状態を削除）
        this.stateHistory = this.stateHistory.slice(0, i);

        return true;
      }
    }

    console.warn(`Screen "${targetScreen}" not found in history`);
    return false;
  }

  /**
   * 前の画面に戻る
   */
  goBack(): boolean {
    const previousState = this.popState();
    return previousState !== null;
  }

  /**
   * 履歴内で特定の画面が存在するかチェック
   */
  hasScreenInHistory(screen: string): boolean {
    return this.stateHistory.some((state) => state.currentScreen === screen);
  }

  /**
   * 現在の画面への滞在時間を取得
   */
  getCurrentScreenDuration(): number {
    return Date.now() - this.currentState.timestamp;
  }

  /**
   * 状態履歴の統計を取得
   */
  getHistoryStatistics(): {
    totalStates: number;
    uniqueScreens: string[];
    averageStayDuration: number;
    mostVisitedScreen: string | null;
  } {
    const totalStates = this.stateHistory.length;
    const uniqueScreens = [
      ...new Set(this.stateHistory.map((state) => state.currentScreen)),
    ];

    // 平均滞在時間の計算
    let totalDuration = 0;
    for (let i = 0; i < this.stateHistory.length - 1; i++) {
      const currentStateTime = this.stateHistory[i];
      const nextStateTime = this.stateHistory[i + 1];
      if (currentStateTime && nextStateTime) {
        totalDuration += nextStateTime.timestamp - currentStateTime.timestamp;
      }
    }
    const averageStayDuration =
      totalStates > 1 ? totalDuration / (totalStates - 1) : 0;

    // 最も訪問された画面の計算
    const screenCounts: Record<string, number> = {};
    this.stateHistory.forEach((state) => {
      screenCounts[state.currentScreen] =
        (screenCounts[state.currentScreen] || 0) + 1;
    });

    let mostVisitedScreen: string | null = null;
    let maxCount = 0;
    for (const [screen, count] of Object.entries(screenCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostVisitedScreen = screen;
      }
    }

    return {
      totalStates,
      uniqueScreens,
      averageStayDuration,
      mostVisitedScreen,
    };
  }

  /**
   * 状態のシリアライズ（デバッグ用）
   */
  serializeState(): string {
    return JSON.stringify(
      {
        currentState: this.currentState,
        historySize: this.stateHistory.length,
        statistics: this.getHistoryStatistics(),
      },
      null,
      2
    );
  }

  /**
   * 状態変更の通知
   */
  private notifyStateChange(state: UIState): void {
    this.stateChangeCallbacks.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error("Error in state change callback:", error);
      }
    });
  }

  /**
   * デバッグ情報の取得
   */
  getDebugInfo(): {
    currentState: UIState;
    historySize: number;
    lastScreens: string[];
    statistics: {
      totalStates: number;
      uniqueScreens: string[];
      averageStayDuration: number;
      mostVisitedScreen: string | null;
    };
  } {
    const lastScreens = this.stateHistory
      .slice(-5)
      .map((state) => state.currentScreen)
      .reverse();

    return {
      currentState: this.getCurrentState(),
      historySize: this.stateHistory.length,
      lastScreens,
      statistics: this.getHistoryStatistics(),
    };
  }

  /**
   * 状態の妥当性チェック
   */
  validateState(state: UIState): boolean {
    if (!state) {
      console.error("State is null or undefined");
      return false;
    }

    if (!state.currentScreen) {
      console.error("State missing currentScreen");
      return false;
    }

    if (!state.timestamp || typeof state.timestamp !== "number") {
      console.error("State missing or invalid timestamp");
      return false;
    }

    const validScreens = ["title", "mainMenu", "game", "settings", "saveLoad"];
    if (!validScreens.includes(state.currentScreen)) {
      console.error(`Invalid screen: ${state.currentScreen}`);
      return false;
    }

    return true;
  }

  /**
   * 履歴の最適化（古い状態の削除）
   */
  optimizeHistory(): void {
    const currentTime = Date.now();
    const maxAge = 30 * 60 * 1000; // 30分

    // 古い状態を削除
    this.stateHistory = this.stateHistory.filter((state) => {
      return currentTime - state.timestamp < maxAge;
    });

    console.log(
      `History optimized: ${this.stateHistory.length} states remaining`
    );
  }

  /**
   * 特定の条件に基づく状態の検索
   */
  findStateByCondition(predicate: (state: UIState) => boolean): UIState | null {
    // 現在の状態をチェック
    if (predicate(this.currentState)) {
      return { ...this.currentState };
    }

    // 履歴を逆順でチェック（新しいものから）
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      const state = this.stateHistory[i];
      if (state && predicate(state)) {
        return { ...state };
      }
    }

    return null;
  }

  /**
   * 状態履歴のエクスポート（保存用）
   */
  exportHistory(): string {
    return JSON.stringify({
      currentState: this.currentState,
      history: this.stateHistory,
      exportTimestamp: Date.now(),
    });
  }

  /**
   * 状態履歴のインポート（復元用）
   */
  importHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data);

      if (!parsed.currentState || !Array.isArray(parsed.history)) {
        console.error("Invalid history data format");
        return false;
      }

      // 状態の妥当性チェック
      if (!this.validateState(parsed.currentState)) {
        console.error("Invalid current state in import data");
        return false;
      }

      // 履歴の妥当性チェック
      for (const state of parsed.history) {
        if (!this.validateState(state)) {
          console.error("Invalid state in history data");
          return false;
        }
      }

      // インポート実行
      this.currentState = parsed.currentState;
      this.stateHistory = parsed.history;

      console.log("History imported successfully");
      return true;
    } catch (error) {
      console.error("Failed to import history:", error);
      return false;
    }
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.currentState = {
      currentScreen: "title",
      timestamp: Date.now(),
    };

    this.stateHistory = [];
    this.stateChangeCallbacks = [];

    console.log("UIStateManager reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.stateChangeCallbacks = [];
    this.stateHistory = [];

    console.log("UIStateManager disposed");
  }
}
