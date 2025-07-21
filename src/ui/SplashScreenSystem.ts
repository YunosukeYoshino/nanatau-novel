// スプラッシュスクリーン・ローディングシステム
export class SplashScreenSystem {
  private static currentSplashElement: HTMLElement | null = null;
  private static isShowing = false;

  // ブランドロゴスプラッシュスクリーンを作成
  static createBrandSplash(): HTMLElement {
    const splashContainer = document.createElement("div");
    splashContainer.id = "brand-splash-container";
    splashContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 5000;
      opacity: 0;
      transition: opacity 1s ease-in-out;
    `;

    // ブランドロゴ（テキストベース）
    const brandLogo = document.createElement("div");
    brandLogo.style.cssText = `
      font-family: 'Yu Gothic', 'Meiryo', serif;
      font-size: 48px;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      margin-bottom: 30px;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
      opacity: 0;
      transform: translateY(20px);
      transition: all 1.5s ease-out;
    `;
    brandLogo.innerHTML = `
      <div style="color: #FFE4E1; margin-bottom: 10px;">ななたう</div>
      <div style="font-size: 24px; color: #cccccc; font-weight: normal;">硝子の心、たう（届く）まで</div>
    `;

    // ローディングアニメーション
    const loadingContainer = document.createElement("div");
    loadingContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0;
      transition: opacity 1s ease-in-out 1s;
    `;

    const loadingBar = document.createElement("div");
    loadingBar.style.cssText = `
      width: 300px;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 15px;
    `;

    const loadingProgress = document.createElement("div");
    loadingProgress.id = "loading-progress";
    loadingProgress.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #81C784);
      border-radius: 2px;
      transition: width 0.3s ease;
    `;

    const loadingText = document.createElement("div");
    loadingText.id = "loading-text";
    loadingText.style.cssText = `
      color: #cccccc;
      font-size: 14px;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
    `;
    loadingText.textContent = "ゲームを読み込んでいます...";

    // ステンドグラス風パーティクル効果
    const particleContainer = document.createElement("div");
    particleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    `;

    // パーティクルを生成
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 6 + 4}px;
        height: ${Math.random() * 6 + 4}px;
        background: ${SplashScreenSystem.getRandomStainedGlassColor()};
        border-radius: 50%;
        opacity: ${Math.random() * 0.8 + 0.2};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
        box-shadow: 0 0 10px ${SplashScreenSystem.getRandomStainedGlassColor()};
      `;
      particleContainer.appendChild(particle);
    }

    // CSSアニメーション定義
    if (!document.getElementById("splash-animations")) {
      const style = document.createElement("style");
      style.id = "splash-animations";
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    loadingBar.appendChild(loadingProgress);
    loadingContainer.appendChild(loadingBar);
    loadingContainer.appendChild(loadingText);
    
    splashContainer.appendChild(particleContainer);
    splashContainer.appendChild(brandLogo);
    splashContainer.appendChild(loadingContainer);

    return splashContainer;
  }

  // ステンドグラス風カラーを取得
  private static getRandomStainedGlassColor(): string {
    const colors = [
      "#FFE4E1", // ライトピンク
      "#E6E6FA", // ラベンダー  
      "#F0F8FF", // アリスブルー
      "#FFF8DC", // コーンシルク
      "#F5F5DC", // ベージュ
      "#E0FFFF", // ライトシアン
      "#FFFACD", // レモンシフォン
      "#FFE4B5"  // モカシン
    ];
    return colors[Math.floor(Math.random() * colors.length)] || "#FFE4E1";
  }

  // スプラッシュスクリーンを表示
  static async showSplash(duration: number = 3000): Promise<void> {
    if (SplashScreenSystem.isShowing) {
      return;
    }

    SplashScreenSystem.isShowing = true;
    
    console.log("🎨 Showing brand splash screen...");

    const splash = SplashScreenSystem.createBrandSplash();
    SplashScreenSystem.currentSplashElement = splash;
    document.body.appendChild(splash);

    // フェードイン開始
    setTimeout(() => {
      splash.style.opacity = "1";
      
      // ロゴアニメーション
      const brandLogo = splash.querySelector("div");
      if (brandLogo) {
        (brandLogo as HTMLElement).style.opacity = "1";
        (brandLogo as HTMLElement).style.transform = "translateY(0)";
      }
    }, 100);

    // ローディング開始
    setTimeout(() => {
      const loadingContainer = splash.querySelector("div:last-child");
      if (loadingContainer) {
        (loadingContainer as HTMLElement).style.opacity = "1";
      }
      
      SplashScreenSystem.startLoadingAnimation();
    }, 1000);

    // 指定時間後に自動終了
    return new Promise((resolve) => {
      setTimeout(() => {
        SplashScreenSystem.hideSplash().then(resolve);
      }, duration);
    });
  }

  // ローディングアニメーション
  private static startLoadingAnimation(): void {
    const progressBar = document.getElementById("loading-progress");
    const loadingText = document.getElementById("loading-text");
    
    if (!progressBar || !loadingText) return;

    const steps = [
      { progress: 20, text: "アセットを読み込んでいます..." },
      { progress: 40, text: "シナリオファイルを解析中..." },
      { progress: 60, text: "キャラクターを初期化中..." },
      { progress: 80, text: "音楽システムを準備中..." },
      { progress: 100, text: "準備完了！" }
    ];

    let currentStep = 0;

    const updateProgress = () => {
      if (currentStep >= steps.length) return;

      const step = steps[currentStep];
      if (step) {
        progressBar.style.width = `${step.progress}%`;
        loadingText.textContent = step.text;
      }

      currentStep++;

      if (currentStep < steps.length) {
        setTimeout(updateProgress, 400 + Math.random() * 300);
      }
    };

    updateProgress();
  }

  // スプラッシュスクリーンを非表示
  static async hideSplash(): Promise<void> {
    if (!SplashScreenSystem.currentSplashElement || !SplashScreenSystem.isShowing) {
      return;
    }

    console.log("🎨 Hiding splash screen...");

    const splash = SplashScreenSystem.currentSplashElement;
    
    // フェードアウトアニメーション
    splash.style.opacity = "0";
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
        
        SplashScreenSystem.currentSplashElement = null;
        SplashScreenSystem.isShowing = false;
        
        console.log("✅ Splash screen hidden");
        resolve();
      }, 1000);
    });
  }

  // ローディング進行状況を手動更新
  static updateLoadingProgress(progress: number, text?: string): void {
    const progressBar = document.getElementById("loading-progress");
    const loadingText = document.getElementById("loading-text");
    
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
    
    if (loadingText && text) {
      loadingText.textContent = text;
    }
  }

  // クイックフェードスプラッシュ（シーン遷移用）
  static async showQuickSplash(text: string, duration: number = 1500): Promise<void> {
    const quickSplash = document.createElement("div");
    quickSplash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(26, 26, 46, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 4000;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    `;

    const textElement = document.createElement("div");
    textElement.style.cssText = `
      color: #ffffff;
      font-size: 24px;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
    `;
    textElement.textContent = text;

    quickSplash.appendChild(textElement);
    document.body.appendChild(quickSplash);

    // フェードイン
    setTimeout(() => {
      quickSplash.style.opacity = "1";
    }, 50);

    return new Promise((resolve) => {
      setTimeout(() => {
        // フェードアウト
        quickSplash.style.opacity = "0";
        
        setTimeout(() => {
          if (quickSplash.parentNode) {
            quickSplash.parentNode.removeChild(quickSplash);
          }
          resolve();
        }, 500);
      }, duration);
    });
  }

  // 現在の表示状態をチェック
  static isCurrentlyShowing(): boolean {
    return SplashScreenSystem.isShowing;
  }

  // スプラッシュスクリーンを強制非表示（緊急用）
  static forceHide(): void {
    if (SplashScreenSystem.currentSplashElement) {
      const splash = SplashScreenSystem.currentSplashElement;
      if (splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
      SplashScreenSystem.currentSplashElement = null;
    }
    SplashScreenSystem.isShowing = false;
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Splash Screen System...");
    
    // 既存のスプラッシュスクリーンをクリーンアップ
    SplashScreenSystem.forceHide();
    
    console.log("Splash Screen System initialized successfully");
  }
}