import { sound } from "@drincs/pixi-vn";
import { AdvancedAssetManager } from "../core/AdvancedAssetManager";

// タイトル画面システム
export class TitleScreenSystem {
  private static currentTitleElement: HTMLElement | null = null;
  private static isShowing = false;
  private static titleMusic = "bgm_main";

  // タイトル画面メニューオプション
  private static menuOptions = [
    { id: "new_game", text: "新しいゲーム", action: "startNewGame", hotkey: "N" },
    { id: "load_game", text: "ゲームを読み込む", action: "loadGame", hotkey: "L" },
    { id: "settings", text: "設定", action: "openSettings", hotkey: "S" },
    { id: "gallery", text: "ギャラリー", action: "openGallery", hotkey: "G" },
    { id: "credits", text: "クレジット", action: "showCredits", hotkey: "C" }
  ];

  // タイトル画面を作成
  static createTitleScreen(): HTMLElement {
    const titleContainer = document.createElement("div");
    titleContainer.id = "title-screen-container";
    titleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #1a1a2e 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 3000;
      overflow: hidden;
    `;

    // 背景パーティクル効果
    const backgroundEffects = TitleScreenSystem.createBackgroundEffects();
    titleContainer.appendChild(backgroundEffects);

    // ゲームタイトル
    const gameTitle = document.createElement("div");
    gameTitle.style.cssText = `
      text-align: center;
      margin-bottom: 60px;
      z-index: 3001;
      position: relative;
    `;

    const mainTitle = document.createElement("h1");
    mainTitle.style.cssText = `
      font-family: 'Yu Gothic', 'Meiryo', serif;
      font-size: 64px;
      font-weight: bold;
      color: #FFE4E1;
      margin: 0 0 20px 0;
      text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.8);
      letter-spacing: 4px;
      opacity: 0;
      transform: translateY(-30px);
      animation: titleFadeIn 2s ease-out 0.5s forwards;
    `;
    mainTitle.textContent = "ななたう";

    const subTitle = document.createElement("h2");
    subTitle.style.cssText = `
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      font-size: 28px;
      font-weight: normal;
      color: #cccccc;
      margin: 0;
      text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.7);
      letter-spacing: 2px;
      opacity: 0;
      transform: translateY(30px);
      animation: titleFadeIn 2s ease-out 1s forwards;
    `;
    subTitle.textContent = "硝子の心、たう（届く）まで";

    gameTitle.appendChild(mainTitle);
    gameTitle.appendChild(subTitle);

    // メインメニュー
    const mainMenu = TitleScreenSystem.createMainMenu();
    
    // バージョン情報
    const versionInfo = document.createElement("div");
    versionInfo.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      font-family: 'Yu Gothic', 'Meiryo', monospace;
    `;
    versionInfo.textContent = "Ver 1.0.0 | Phase 9";

    // コピーライト
    const copyright = document.createElement("div");
    copyright.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
    `;
    copyright.textContent = "© 2024 ななたう Project";

    // CSS アニメーション定義
    TitleScreenSystem.addTitleScreenCSS();

    titleContainer.appendChild(gameTitle);
    titleContainer.appendChild(mainMenu);
    titleContainer.appendChild(versionInfo);
    titleContainer.appendChild(copyright);

    return titleContainer;
  }

  // 背景エフェクト作成
  private static createBackgroundEffects(): HTMLElement {
    const effectsContainer = document.createElement("div");
    effectsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    `;

    // ステンドグラス風フローティングパーティクル
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("div");
      const size = Math.random() * 10 + 5;
      const color = TitleScreenSystem.getRandomGlassColor();
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        opacity: ${Math.random() * 0.6 + 0.2};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
        box-shadow: 0 0 ${size * 2}px ${color};
        filter: blur(${Math.random() * 1}px);
      `;
      
      effectsContainer.appendChild(particle);
    }

    // ライトレイエフェクト
    for (let i = 0; i < 5; i++) {
      const ray = document.createElement("div");
      ray.style.cssText = `
        position: absolute;
        width: 2px;
        height: 100%;
        background: linear-gradient(180deg, transparent 0%, rgba(255, 228, 225, 0.3) 50%, transparent 100%);
        left: ${Math.random() * 100}%;
        top: 0;
        transform: rotate(${Math.random() * 20 - 10}deg);
        animation: shimmer ${Math.random() * 8 + 6}s ease-in-out infinite;
      `;
      
      effectsContainer.appendChild(ray);
    }

    return effectsContainer;
  }

  // メインメニュー作成
  private static createMainMenu(): HTMLElement {
    const menuContainer = document.createElement("div");
    menuContainer.id = "title-main-menu";
    menuContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      z-index: 3001;
      position: relative;
      opacity: 0;
      transform: translateY(50px);
      animation: menuFadeIn 1.5s ease-out 2s forwards;
    `;

    TitleScreenSystem.menuOptions.forEach((option, index) => {
      const menuButton = document.createElement("button");
      menuButton.id = `menu-${option.id}`;
      menuButton.style.cssText = `
        background: rgba(26, 26, 46, 0.8);
        border: 2px solid rgba(255, 228, 225, 0.3);
        color: #FFE4E1;
        padding: 15px 40px;
        font-size: 20px;
        font-family: 'Yu Gothic', 'Meiryo', sans-serif;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 280px;
        text-align: center;
        backdrop-filter: blur(5px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: buttonSlideIn 0.6s ease-out ${2.5 + (index * 0.2)}s forwards;
        opacity: 0;
        transform: translateX(-100px);
      `;
      
      menuButton.textContent = option.text;

      // ホットキー表示
      if (option.hotkey) {
        const hotkey = document.createElement("span");
        hotkey.style.cssText = `
          margin-left: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
        `;
        hotkey.textContent = `[${option.hotkey}]`;
        menuButton.appendChild(hotkey);
      }

      // ホバー効果
      menuButton.addEventListener("mouseenter", () => {
        menuButton.style.background = "rgba(255, 228, 225, 0.1)";
        menuButton.style.borderColor = "rgba(255, 228, 225, 0.6)";
        menuButton.style.transform = "translateX(10px) scale(1.05)";
        menuButton.style.boxShadow = "0 6px 20px rgba(255, 228, 225, 0.2)";
        
        // ホバー音効果（あれば）
        TitleScreenSystem.playHoverSound();
      });

      menuButton.addEventListener("mouseleave", () => {
        menuButton.style.background = "rgba(26, 26, 46, 0.8)";
        menuButton.style.borderColor = "rgba(255, 228, 225, 0.3)";
        menuButton.style.transform = "translateX(0) scale(1)";
        menuButton.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
      });

      // クリックイベント
      menuButton.addEventListener("click", () => {
        TitleScreenSystem.handleMenuSelection(option.action);
      });

      menuContainer.appendChild(menuButton);
    });

    return menuContainer;
  }

  // CSS アニメーション定義
  private static addTitleScreenCSS(): void {
    if (document.getElementById("title-screen-animations")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "title-screen-animations";
    style.textContent = `
      @keyframes titleFadeIn {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes menuFadeIn {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes buttonSlideIn {
        from {
          opacity: 0;
          transform: translateX(-100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes floatParticle {
        0% {
          transform: translateY(100vh) rotate(0deg);
        }
        100% {
          transform: translateY(-10vh) rotate(360deg);
        }
      }
      
      @keyframes shimmer {
        0%, 100% {
          opacity: 0.3;
          transform: scaleY(1) rotate(0deg);
        }
        50% {
          opacity: 0.8;
          transform: scaleY(1.2) rotate(5deg);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // ランダムガラス色取得
  private static getRandomGlassColor(): string {
    const colors = [
      "#FFE4E1", "#E6E6FA", "#F0F8FF", "#FFF8DC",
      "#F5F5DC", "#E0FFFF", "#FFFACD", "#FFE4B5",
      "#FFEFD5", "#F0FFFF", "#F5FFFA", "#FFFFF0"
    ];
    return colors[Math.floor(Math.random() * colors.length)] || "#FFE4E1";
  }

  // メニュー選択処理
  private static handleMenuSelection(action: string): void {
    console.log(`Menu action selected: ${action}`);
    
    // 選択音効果
    TitleScreenSystem.playSelectSound();

    switch (action) {
      case "startNewGame":
        TitleScreenSystem.startNewGame();
        break;
      case "loadGame":
        TitleScreenSystem.openLoadMenu();
        break;
      case "settings":
        TitleScreenSystem.openSettings();
        break;
      case "gallery":
        TitleScreenSystem.openGallery();
        break;
      case "showCredits":
        TitleScreenSystem.showCredits();
        break;
      default:
        console.warn(`Unknown menu action: ${action}`);
    }
  }

  // 新しいゲーム開始
  private static async startNewGame(): Promise<void> {
    console.log("🎮 Starting new game...");
    
    try {
      // タイトル画面を非表示
      await TitleScreenSystem.hideTitleScreen();
      
      // ゲーム開始イベントを発火
      const startGameEvent = new CustomEvent("startNewGame");
      window.dispatchEvent(startGameEvent);
      
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  }

  // ロードメニューを開く
  private static openLoadMenu(): void {
    console.log("📂 Opening load menu...");
    // TODO: ロードメニュー実装
    alert("ロード機能は今後実装予定です");
  }

  // 設定画面を開く
  private static openSettings(): void {
    console.log("⚙️ Opening settings...");
    // TODO: 設定画面実装
    alert("設定画面は今後実装予定です");
  }

  // ギャラリーを開く
  private static openGallery(): void {
    console.log("🖼️ Opening gallery...");
    // TODO: ギャラリー実装
    alert("ギャラリーは今後実装予定です");
  }

  // クレジット表示
  private static showCredits(): void {
    console.log("📋 Showing credits...");
    // TODO: クレジット画面実装
    alert("クレジット画面は今後実装予定です");
  }

  // 音効果
  private static playHoverSound(): void {
    try {
      // ホバー音効果（軽微なもの）
      sound.play("se_hover", { volume: 0.3 });
    } catch (error) {
      // 音声ファイルがない場合は無視
    }
  }

  private static playSelectSound(): void {
    try {
      // 選択音効果
      sound.play("se_select", { volume: 0.5 });
    } catch (error) {
      // 音声ファイルがない場合は無視
    }
  }

  // タイトル画面を表示
  static async showTitleScreen(): Promise<void> {
    if (TitleScreenSystem.isShowing) {
      return;
    }

    console.log("🎵 Showing title screen...");
    TitleScreenSystem.isShowing = true;

    try {
      // BGM開始
      await TitleScreenSystem.startTitleMusic();
      
      // タイトル画面作成
      const titleScreen = TitleScreenSystem.createTitleScreen();
      TitleScreenSystem.currentTitleElement = titleScreen;
      document.body.appendChild(titleScreen);

      // キーボードイベント設定
      TitleScreenSystem.setupKeyboardHandlers();

    } catch (error) {
      console.error("Failed to show title screen:", error);
    }
  }

  // タイトル画面を非表示
  static async hideTitleScreen(): Promise<void> {
    if (!TitleScreenSystem.currentTitleElement || !TitleScreenSystem.isShowing) {
      return;
    }

    console.log("🎵 Hiding title screen...");

    const titleElement = TitleScreenSystem.currentTitleElement;
    
    // フェードアウト
    titleElement.style.opacity = "0";
    titleElement.style.transition = "opacity 1s ease-in-out";

    return new Promise((resolve) => {
      setTimeout(() => {
        if (titleElement.parentNode) {
          titleElement.parentNode.removeChild(titleElement);
        }
        
        TitleScreenSystem.currentTitleElement = null;
        TitleScreenSystem.isShowing = false;
        
        // BGM停止
        TitleScreenSystem.stopTitleMusic();
        
        // キーボードハンドラー削除
        TitleScreenSystem.removeKeyboardHandlers();
        
        console.log("✅ Title screen hidden");
        resolve();
      }, 1000);
    });
  }

  // タイトル音楽開始
  private static async startTitleMusic(): Promise<void> {
    try {
      await AdvancedAssetManager.playBGM(TitleScreenSystem.titleMusic, {
        volume: 0.4,
        loop: true
      });
      console.log("🎵 Title music started");
    } catch (error) {
      console.warn("Title music not available:", error);
    }
  }

  // タイトル音楽停止
  private static stopTitleMusic(): void {
    try {
      sound.stop(TitleScreenSystem.titleMusic);
      console.log("🎵 Title music stopped");
    } catch (error) {
      console.warn("Failed to stop title music:", error);
    }
  }

  // キーボードハンドラー設定
  private static setupKeyboardHandlers(): void {
    document.addEventListener("keydown", TitleScreenSystem.handleKeyDown);
  }

  // キーボードハンドラー削除
  private static removeKeyboardHandlers(): void {
    document.removeEventListener("keydown", TitleScreenSystem.handleKeyDown);
  }

  // キーボード入力処理
  private static handleKeyDown(event: KeyboardEvent): void {
    if (!TitleScreenSystem.isShowing) return;

    const key = event.key.toLowerCase();
    
    // ホットキーでメニュー選択
    const option = TitleScreenSystem.menuOptions.find(opt => 
      opt.hotkey.toLowerCase() === key
    );
    
    if (option) {
      event.preventDefault();
      TitleScreenSystem.handleMenuSelection(option.action);
      return;
    }

    // エンターキーで新しいゲーム開始
    if (key === "enter") {
      event.preventDefault();
      TitleScreenSystem.startNewGame();
    }
  }

  // 現在の表示状態をチェック
  static isCurrentlyShowing(): boolean {
    return TitleScreenSystem.isShowing;
  }

  // 強制非表示（緊急用）
  static forceHide(): void {
    if (TitleScreenSystem.currentTitleElement) {
      const element = TitleScreenSystem.currentTitleElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      TitleScreenSystem.currentTitleElement = null;
    }
    TitleScreenSystem.isShowing = false;
    TitleScreenSystem.stopTitleMusic();
    TitleScreenSystem.removeKeyboardHandlers();
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Title Screen System...");
    
    // 既存のタイトル画面をクリーンアップ
    TitleScreenSystem.forceHide();
    
    console.log("Title Screen System initialized successfully");
  }
}