import { SplashScreenSystem } from "./SplashScreenSystem";
import { TitleScreenSystem } from "./TitleScreenSystem";

// オープニングシーケンス管理システム
export class OpeningSequenceSystem {
  private static isRunning = false;
  private static currentStep = 0;
  private static sequenceSteps = [
    "splash",     // ブランドスプラッシュ
    "title",      // タイトル画面
    "game_start"  // ゲーム開始
  ];

  // オープニングシーケンス実行
  static async runOpeningSequence(): Promise<void> {
    if (OpeningSequenceSystem.isRunning) {
      console.warn("Opening sequence already running");
      return;
    }

    console.log("🎬 Starting opening sequence...");
    OpeningSequenceSystem.isRunning = true;
    OpeningSequenceSystem.currentStep = 0;

    try {
      // Phase 1: ブランドスプラッシュスクリーン表示
      await OpeningSequenceSystem.executeStep("splash");
      
      // Phase 2: タイトル画面表示（ユーザー操作待ち）
      await OpeningSequenceSystem.executeStep("title");
      
      // Phase 3はユーザーの操作で実行される（自動実行しない）
      console.log("✅ Opening sequence completed - Waiting for user input");
      
    } catch (error) {
      console.error("Opening sequence failed:", error);
    } finally {
      OpeningSequenceSystem.isRunning = false;
    }
  }

  // 個別ステップ実行
  private static async executeStep(step: string): Promise<void> {
    console.log(`🎬 Executing opening step: ${step}`);
    
    switch (step) {
      case "splash":
        await OpeningSequenceSystem.showSplashStep();
        break;
        
      case "title":
        await OpeningSequenceSystem.showTitleStep();
        break;
        
      case "game_start":
        await OpeningSequenceSystem.startGameStep();
        break;
        
      default:
        console.warn(`Unknown opening step: ${step}`);
    }
    
    OpeningSequenceSystem.currentStep++;
  }

  // スプラッシュステップ
  private static async showSplashStep(): Promise<void> {
    console.log("🎨 Phase 1: Brand splash screen");
    
    // ブランドスプラッシュを3秒間表示
    await SplashScreenSystem.showSplash(3500);
    
    console.log("✅ Splash step completed");
  }

  // タイトルステップ
  private static async showTitleStep(): Promise<void> {
    console.log("🎵 Phase 2: Title screen");
    
    // タイトル画面を表示（ユーザー操作で終了）
    await TitleScreenSystem.showTitleScreen();
    
    // タイトル画面は非同期で表示され、ユーザー操作で終了する
    // この時点では表示開始だけ完了
    console.log("✅ Title step started - Waiting for user interaction");
  }

  // ゲーム開始ステップ
  private static async startGameStep(): Promise<void> {
    console.log("🎮 Phase 3: Game start transition");
    
    try {
      // クイックスプラッシュでゲーム開始を示す
      await SplashScreenSystem.showQuickSplash("ゲーム開始...", 1000);
      
      // ゲーム開始の準備
      OpeningSequenceSystem.prepareGameStart();
      
      console.log("✅ Game start step completed");
      
    } catch (error) {
      console.error("Failed to start game step:", error);
    }
  }

  // ゲーム開始準備
  private static prepareGameStart(): void {
    console.log("🎮 Preparing game start...");
    
    // カスタムイベントを発火してメインゲームに開始を通知
    const gameStartEvent = new CustomEvent("gameSequenceStart", {
      detail: {
        fromOpening: true,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(gameStartEvent);
    console.log("🎮 Game start event dispatched");
  }

  // 手動でゲーム開始ステップを実行（タイトル画面からの呼び出し用）
  static async triggerGameStart(): Promise<void> {
    if (!OpeningSequenceSystem.isRunning) {
      // オープニングシーケンス外からの呼び出し
      console.log("🎮 Manual game start triggered");
      OpeningSequenceSystem.isRunning = true;
    }
    
    await OpeningSequenceSystem.executeStep("game_start");
    OpeningSequenceSystem.isRunning = false;
  }

  // 現在のステップを取得
  static getCurrentStep(): number {
    return OpeningSequenceSystem.currentStep;
  }

  // シーケンス実行中かチェック
  static isCurrentlyRunning(): boolean {
    return OpeningSequenceSystem.isRunning;
  }

  // シーケンスをスキップ（開発用）
  static async skipToTitle(): Promise<void> {
    console.log("⏭️ Skipping to title screen...");
    
    // スプラッシュ画面を強制非表示
    SplashScreenSystem.forceHide();
    
    // タイトル画面を直接表示
    await TitleScreenSystem.showTitleScreen();
    
    OpeningSequenceSystem.currentStep = 1; // タイトル画面ステップに設定
  }

  // シーケンスをスキップしてゲーム開始（開発用）
  static async skipToGame(): Promise<void> {
    console.log("⏭️ Skipping directly to game...");
    
    // 全ての画面を強制非表示
    SplashScreenSystem.forceHide();
    TitleScreenSystem.forceHide();
    
    // ゲーム開始を直接実行
    await OpeningSequenceSystem.triggerGameStart();
  }

  // オープニングシーケンスをリセット
  static reset(): void {
    console.log("🔄 Resetting opening sequence...");
    
    OpeningSequenceSystem.isRunning = false;
    OpeningSequenceSystem.currentStep = 0;
    
    // 全画面を強制非表示
    SplashScreenSystem.forceHide();
    TitleScreenSystem.forceHide();
    
    console.log("✅ Opening sequence reset completed");
  }

  // デバッグ情報を表示
  static logStatus(): void {
    console.group("🎬 Opening Sequence Status");
    console.log(`Running: ${OpeningSequenceSystem.isRunning}`);
    console.log(`Current Step: ${OpeningSequenceSystem.currentStep}/${OpeningSequenceSystem.sequenceSteps.length}`);
    console.log(`Current Phase: ${OpeningSequenceSystem.sequenceSteps[OpeningSequenceSystem.currentStep] || 'Completed'}`);
    console.log(`Splash Showing: ${SplashScreenSystem.isCurrentlyShowing()}`);
    console.log(`Title Showing: ${TitleScreenSystem.isCurrentlyShowing()}`);
    console.groupEnd();
  }

  // イベントリスナー設定
  static setupEventListeners(): void {
    // タイトル画面からのゲーム開始イベント
    window.addEventListener("startNewGame", async () => {
      console.log("🎮 Received startNewGame event from title screen");
      await OpeningSequenceSystem.triggerGameStart();
    });

    // 開発用キーボードショートカット
    document.addEventListener("keydown", (event) => {
      // Ctrl+Shift+Oでオープニングシーケンス再実行
      if (event.ctrlKey && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        console.log("🎬 Debug: Restarting opening sequence");
        OpeningSequenceSystem.reset();
        OpeningSequenceSystem.runOpeningSequence();
      }
      
      // Ctrl+Shift+Tでタイトル画面直接表示
      if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        console.log("🎬 Debug: Skipping to title");
        OpeningSequenceSystem.skipToTitle();
      }
      
      // Ctrl+Shift+Gでゲーム直接開始
      if (event.ctrlKey && event.shiftKey && event.key === 'G') {
        event.preventDefault();
        console.log("🎬 Debug: Skipping to game");
        OpeningSequenceSystem.skipToGame();
      }
      
      // Ctrl+Shift+Sでステータス表示
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        OpeningSequenceSystem.logStatus();
      }
    });
    
    console.log("🎬 Opening sequence event listeners set up");
    console.log("🔧 Debug shortcuts:");
    console.log("  Ctrl+Shift+O: Restart opening sequence");
    console.log("  Ctrl+Shift+T: Skip to title screen");
    console.log("  Ctrl+Shift+G: Skip to game");
    console.log("  Ctrl+Shift+S: Show status");
  }

  // イベントリスナー削除
  static removeEventListeners(): void {
    // TODO: 必要に応じて特定のリスナーを削除
    console.log("🎬 Opening sequence event listeners removed");
  }

  // カスタム設定でオープニングシーケンス実行
  static async runCustomSequence(config: {
    skipSplash?: boolean;
    splashDuration?: number;
    skipTitle?: boolean;
    autoStartGame?: boolean;
  }): Promise<void> {
    console.log("🎬 Running custom opening sequence", config);
    
    if (OpeningSequenceSystem.isRunning) {
      console.warn("Opening sequence already running");
      return;
    }

    OpeningSequenceSystem.isRunning = true;
    OpeningSequenceSystem.currentStep = 0;

    try {
      // スプラッシュステップ
      if (!config.skipSplash) {
        const duration = config.splashDuration || 3500;
        await SplashScreenSystem.showSplash(duration);
        OpeningSequenceSystem.currentStep++;
      }

      // タイトルステップ
      if (!config.skipTitle) {
        await TitleScreenSystem.showTitleScreen();
        OpeningSequenceSystem.currentStep++;
        
        // 自動ゲーム開始オプション
        if (config.autoStartGame) {
          setTimeout(async () => {
            await OpeningSequenceSystem.triggerGameStart();
          }, 2000);
        }
      } else if (config.autoStartGame) {
        // タイトルをスキップして直接ゲーム開始
        await OpeningSequenceSystem.triggerGameStart();
      }

      console.log("✅ Custom opening sequence completed");
      
    } catch (error) {
      console.error("Custom opening sequence failed:", error);
    } finally {
      OpeningSequenceSystem.isRunning = false;
    }
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Opening Sequence System...");
    
    // 既存の状態をリセット
    OpeningSequenceSystem.reset();
    
    // イベントリスナーを設定
    OpeningSequenceSystem.setupEventListeners();
    
    console.log("Opening Sequence System initialized successfully");
  }
}