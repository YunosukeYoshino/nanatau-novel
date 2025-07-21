// スキップ・オート機能システム
export class SkipAutoSystem {
  private static isSkipMode = false;
  private static isAutoMode = false;
  private static skipSpeed = 1000; // ミリ秒
  private static autoSpeed = 3000; // ミリ秒
  private static skipTimer: NodeJS.Timeout | null = null;
  private static autoTimer: NodeJS.Timeout | null = null;
  private static currentIndicator: HTMLElement | null = null;

  // スキップモード切り替え
  static toggleSkipMode(): void {
    if (SkipAutoSystem.isSkipMode) {
      SkipAutoSystem.stopSkipMode();
    } else {
      SkipAutoSystem.startSkipMode();
    }
  }

  // スキップモード開始
  static startSkipMode(): void {
    if (SkipAutoSystem.isSkipMode) {
      return;
    }

    console.log("⏭️ Starting skip mode");
    
    // オートモードが有効な場合は停止
    if (SkipAutoSystem.isAutoMode) {
      SkipAutoSystem.stopAutoMode();
    }

    SkipAutoSystem.isSkipMode = true;
    
    // インジケーター表示
    SkipAutoSystem.showModeIndicator("SKIP", "#FF6B6B");
    
    // スキップタイマー開始
    SkipAutoSystem.startSkipTimer();
    
    // イベント発火
    const skipStartEvent = new CustomEvent("skipModeStart");
    window.dispatchEvent(skipStartEvent);
  }

  // スキップモード停止
  static stopSkipMode(): void {
    if (!SkipAutoSystem.isSkipMode) {
      return;
    }

    console.log("⏹️ Stopping skip mode");
    
    SkipAutoSystem.isSkipMode = false;
    
    // タイマー停止
    SkipAutoSystem.stopSkipTimer();
    
    // インジケーター非表示
    SkipAutoSystem.hideModeIndicator();
    
    // イベント発火
    const skipStopEvent = new CustomEvent("skipModeStop");
    window.dispatchEvent(skipStopEvent);
  }

  // オートモード切り替え
  static toggleAutoMode(): void {
    if (SkipAutoSystem.isAutoMode) {
      SkipAutoSystem.stopAutoMode();
    } else {
      SkipAutoSystem.startAutoMode();
    }
  }

  // オートモード開始
  static startAutoMode(): void {
    if (SkipAutoSystem.isAutoMode) {
      return;
    }

    console.log("▶️ Starting auto mode");
    
    // スキップモードが有効な場合は停止
    if (SkipAutoSystem.isSkipMode) {
      SkipAutoSystem.stopSkipMode();
    }

    SkipAutoSystem.isAutoMode = true;
    
    // インジケーター表示
    SkipAutoSystem.showModeIndicator("AUTO", "#4ECDC4");
    
    // オートタイマー開始
    SkipAutoSystem.startAutoTimer();
    
    // イベント発火
    const autoStartEvent = new CustomEvent("autoModeStart");
    window.dispatchEvent(autoStartEvent);
  }

  // オートモード停止
  static stopAutoMode(): void {
    if (!SkipAutoSystem.isAutoMode) {
      return;
    }

    console.log("⏹️ Stopping auto mode");
    
    SkipAutoSystem.isAutoMode = false;
    
    // タイマー停止
    SkipAutoSystem.stopAutoTimer();
    
    // インジケーター非表示
    SkipAutoSystem.hideModeIndicator();
    
    // イベント発火
    const autoStopEvent = new CustomEvent("autoModeStop");
    window.dispatchEvent(autoStopEvent);
  }

  // スキップタイマー開始
  private static startSkipTimer(): void {
    SkipAutoSystem.stopSkipTimer(); // 既存のタイマーを停止
    
    SkipAutoSystem.skipTimer = setInterval(() => {
      if (SkipAutoSystem.isSkipMode) {
        // 次のシーンに進むイベントを発火
        const nextEvent = new CustomEvent("skipNext");
        window.dispatchEvent(nextEvent);
      }
    }, SkipAutoSystem.skipSpeed);
  }

  // スキップタイマー停止
  private static stopSkipTimer(): void {
    if (SkipAutoSystem.skipTimer) {
      clearInterval(SkipAutoSystem.skipTimer);
      SkipAutoSystem.skipTimer = null;
    }
  }

  // オートタイマー開始
  private static startAutoTimer(): void {
    SkipAutoSystem.stopAutoTimer(); // 既存のタイマーを停止
    
    SkipAutoSystem.autoTimer = setInterval(() => {
      if (SkipAutoSystem.isAutoMode) {
        // 次のシーンに進むイベントを発火
        const nextEvent = new CustomEvent("autoNext");
        window.dispatchEvent(nextEvent);
      }
    }, SkipAutoSystem.autoSpeed);
  }

  // オートタイマー停止
  private static stopAutoTimer(): void {
    if (SkipAutoSystem.autoTimer) {
      clearInterval(SkipAutoSystem.autoTimer);
      SkipAutoSystem.autoTimer = null;
    }
  }

  // モードインジケーター表示
  private static showModeIndicator(mode: string, color: string): void {
    SkipAutoSystem.hideModeIndicator(); // 既存のインジケーターを削除

    const indicator = document.createElement("div");
    indicator.id = "mode-indicator";
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      font-size: 14px;
      font-weight: bold;
      z-index: 2500;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      animation: fadeInScale 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    // アイコン
    const icon = document.createElement("span");
    icon.textContent = mode === "SKIP" ? "⏭️" : "▶️";
    icon.style.fontSize = "16px";

    // テキスト
    const text = document.createElement("span");
    text.textContent = mode;

    indicator.appendChild(icon);
    indicator.appendChild(text);

    // CSS アニメーション定義
    if (!document.getElementById("mode-indicator-animations")) {
      const style = document.createElement("style");
      style.id = "mode-indicator-animations";
      style.textContent = `
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // パルスアニメーション
    indicator.style.animation = "fadeInScale 0.3s ease-out, pulse 2s ease-in-out infinite";

    document.body.appendChild(indicator);
    SkipAutoSystem.currentIndicator = indicator;
  }

  // モードインジケーター非表示
  private static hideModeIndicator(): void {
    if (SkipAutoSystem.currentIndicator) {
      const indicator = SkipAutoSystem.currentIndicator;
      
      // フェードアウトアニメーション
      indicator.style.animation = "none";
      indicator.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
      indicator.style.opacity = "0";
      indicator.style.transform = "scale(0.8)";
      
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
      
      SkipAutoSystem.currentIndicator = null;
    }
  }

  // スピード設定
  static setSkipSpeed(milliseconds: number): void {
    SkipAutoSystem.skipSpeed = Math.max(100, milliseconds); // 最小100ms
    console.log(`Skip speed set to ${SkipAutoSystem.skipSpeed}ms`);
    
    // スキップモード中の場合はタイマーを再起動
    if (SkipAutoSystem.isSkipMode) {
      SkipAutoSystem.startSkipTimer();
    }
  }

  static setAutoSpeed(milliseconds: number): void {
    SkipAutoSystem.autoSpeed = Math.max(1000, milliseconds); // 最小1秒
    console.log(`Auto speed set to ${SkipAutoSystem.autoSpeed}ms`);
    
    // オートモード中の場合はタイマーを再起動
    if (SkipAutoSystem.isAutoMode) {
      SkipAutoSystem.startAutoTimer();
    }
  }

  // 現在の状態取得
  static getCurrentState(): {
    isSkipMode: boolean;
    isAutoMode: boolean;
    skipSpeed: number;
    autoSpeed: number;
  } {
    return {
      isSkipMode: SkipAutoSystem.isSkipMode,
      isAutoMode: SkipAutoSystem.isAutoMode,
      skipSpeed: SkipAutoSystem.skipSpeed,
      autoSpeed: SkipAutoSystem.autoSpeed
    };
  }

  // 全モード停止
  static stopAllModes(): void {
    SkipAutoSystem.stopSkipMode();
    SkipAutoSystem.stopAutoMode();
  }

  // キーボードショートカット設定
  static setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", (event) => {
      // Ctrlキーとの組み合わせ
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case "s": // Ctrl+S でスキップ切り替え
            event.preventDefault();
            SkipAutoSystem.toggleSkipMode();
            break;
          case "a": // Ctrl+A でオート切り替え
            event.preventDefault();
            SkipAutoSystem.toggleAutoMode();
            break;
        }
        return;
      }

      // 単体キー
      switch (event.key) {
        case " ": // スペースキーでスキップ切り替え
          event.preventDefault();
          SkipAutoSystem.toggleSkipMode();
          break;
        case "Enter": // エンターキーでオート切り替え
          event.preventDefault();
          SkipAutoSystem.toggleAutoMode();
          break;
      }
    });

    console.log("⌨️ Skip/Auto keyboard shortcuts set up");
    console.log("  Space: Toggle skip mode");
    console.log("  Enter: Toggle auto mode");
    console.log("  Ctrl+S: Toggle skip mode");
    console.log("  Ctrl+A: Toggle auto mode");
  }

  // 一時停止（ユーザー操作時）
  static pauseForUserInput(): void {
    const wasSkipping = SkipAutoSystem.isSkipMode;
    const wasAuto = SkipAutoSystem.isAutoMode;
    
    SkipAutoSystem.stopAllModes();
    
    // 少し待ってから復帰するかチェック
    setTimeout(() => {
      // 特定の条件で自動復帰（例：選択肢終了後）
      const resumeEvent = new CustomEvent("checkModeResume", {
        detail: { wasSkipping, wasAuto }
      });
      window.dispatchEvent(resumeEvent);
    }, 500);
  }

  // デバッグ情報表示
  static logStatus(): void {
    console.group("⏭️ Skip/Auto System Status");
    console.log(`Skip Mode: ${SkipAutoSystem.isSkipMode ? 'ON' : 'OFF'}`);
    console.log(`Auto Mode: ${SkipAutoSystem.isAutoMode ? 'ON' : 'OFF'}`);
    console.log(`Skip Speed: ${SkipAutoSystem.skipSpeed}ms`);
    console.log(`Auto Speed: ${SkipAutoSystem.autoSpeed}ms`);
    console.log(`Indicator Visible: ${SkipAutoSystem.currentIndicator !== null}`);
    console.groupEnd();
  }

  // クリーンアップ（緊急用）
  static cleanup(): void {
    SkipAutoSystem.stopAllModes();
    SkipAutoSystem.hideModeIndicator();
    console.log("🧹 Skip/Auto system cleanup completed");
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Skip/Auto System...");
    
    // 既存の状態をクリーンアップ
    SkipAutoSystem.cleanup();
    
    // キーボードショートカットを設定
    SkipAutoSystem.setupKeyboardShortcuts();
    
    console.log("Skip/Auto System initialized successfully");
  }
}