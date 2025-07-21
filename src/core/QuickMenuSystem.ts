// クイックメニューシステム - セーブ・ロード・スキップ等の標準機能
export class QuickMenuSystem {
  private static currentQuickMenu: HTMLElement | null = null;
  private static isVisible = false;
  private static isEnabled = true;

  // クイックメニューボタン定義
  private static menuButtons = [
    { id: "save", text: "セーブ", icon: "💾", hotkey: "S", action: "openSaveMenu" },
    { id: "load", text: "ロード", icon: "📂", hotkey: "L", action: "openLoadMenu" },
    { id: "history", text: "履歴", icon: "📜", hotkey: "H", action: "openHistory" },
    { id: "skip", text: "スキップ", icon: "⏭️", hotkey: "Space", action: "toggleSkip" },
    { id: "auto", text: "オート", icon: "▶️", hotkey: "A", action: "toggleAuto" },
    { id: "settings", text: "設定", icon: "⚙️", hotkey: "O", action: "openSettings" },
    { id: "title", text: "タイトル", icon: "🏠", hotkey: "T", action: "returnToTitle" }
  ];

  // クイックメニューUI作成
  static createQuickMenu(): HTMLElement {
    const quickMenu = document.createElement("div");
    quickMenu.id = "quick-menu-container";
    quickMenu.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 2000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-in-out;
      background: rgba(26, 26, 46, 0.9);
      padding: 15px;
      border-radius: 15px;
      border: 2px solid rgba(255, 228, 225, 0.3);
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    `;

    // タイトル
    const title = document.createElement("div");
    title.style.cssText = `
      color: #FFE4E1;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
    `;
    title.textContent = "クイックメニュー";

    // ボタンコンテナ
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 160px;
    `;

    QuickMenuSystem.menuButtons.forEach(button => {
      const menuButton = QuickMenuSystem.createMenuButton(button);
      buttonContainer.appendChild(menuButton);
    });

    quickMenu.appendChild(title);
    quickMenu.appendChild(buttonContainer);

    return quickMenu;
  }

  // 個別メニューボタン作成
  private static createMenuButton(button: any): HTMLElement {
    const menuButton = document.createElement("button");
    menuButton.id = `quick-${button.id}`;
    menuButton.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 228, 225, 0.3);
      color: #FFE4E1;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-family: 'Yu Gothic', 'Meiryo', sans-serif;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-align: left;
    `;

    // アイコン
    const icon = document.createElement("span");
    icon.textContent = button.icon;
    icon.style.fontSize = "16px";

    // テキスト
    const text = document.createElement("span");
    text.textContent = button.text;
    text.style.flex = "1";

    // ホットキー表示
    const hotkey = document.createElement("span");
    hotkey.textContent = `[${button.hotkey}]`;
    hotkey.style.cssText = `
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    `;

    menuButton.appendChild(icon);
    menuButton.appendChild(text);
    menuButton.appendChild(hotkey);

    // ホバー効果
    menuButton.addEventListener("mouseenter", () => {
      menuButton.style.background = "rgba(255, 228, 225, 0.2)";
      menuButton.style.borderColor = "rgba(255, 228, 225, 0.6)";
      menuButton.style.transform = "translateX(-5px)";
    });

    menuButton.addEventListener("mouseleave", () => {
      menuButton.style.background = "rgba(255, 255, 255, 0.1)";
      menuButton.style.borderColor = "rgba(255, 228, 225, 0.3)";
      menuButton.style.transform = "translateX(0)";
    });

    // クリックイベント
    menuButton.addEventListener("click", () => {
      QuickMenuSystem.handleMenuAction(button.action);
    });

    return menuButton;
  }

  // メニューアクション処理
  private static handleMenuAction(action: string): void {
    console.log(`Quick menu action: ${action}`);

    switch (action) {
      case "openSaveMenu":
        QuickMenuSystem.openSaveMenu();
        break;
      case "openLoadMenu":
        QuickMenuSystem.openLoadMenu();
        break;
      case "openHistory":
        QuickMenuSystem.openHistory();
        break;
      case "toggleSkip":
        QuickMenuSystem.toggleSkip();
        break;
      case "toggleAuto":
        QuickMenuSystem.toggleAuto();
        break;
      case "openSettings":
        QuickMenuSystem.openSettings();
        break;
      case "returnToTitle":
        QuickMenuSystem.confirmReturnToTitle();
        break;
      default:
        console.warn(`Unknown quick menu action: ${action}`);
    }
  }

  // セーブメニューを開く
  private static openSaveMenu(): void {
    console.log("📝 Opening save menu...");
    // TODO: セーブメニュー実装
    alert("セーブ機能は今後実装予定です");
  }

  // ロードメニューを開く
  private static openLoadMenu(): void {
    console.log("📂 Opening load menu...");
    // TODO: ロードメニュー実装
    alert("ロード機能は今後実装予定です");
  }

  // 履歴表示
  private static openHistory(): void {
    console.log("📜 Opening history...");
    // TODO: 履歴表示実装
    alert("履歴機能は今後実装予定です");
  }

  // スキップ機能切り替え
  private static toggleSkip(): void {
    console.log("⏭️ Toggling skip mode...");
    // SkipAutoSystemと連携
    const skipAutoEvent = new CustomEvent("toggleSkipMode");
    window.dispatchEvent(skipAutoEvent);
  }

  // オート機能切り替え
  private static toggleAuto(): void {
    console.log("▶️ Toggling auto mode...");
    // SkipAutoSystemと連携
    const autoEvent = new CustomEvent("toggleAutoMode");
    window.dispatchEvent(autoEvent);
  }

  // 設定画面を開く
  private static openSettings(): void {
    console.log("⚙️ Opening settings...");
    // TODO: 設定画面実装
    alert("設定画面は今後実装予定です");
  }

  // タイトルに戻る（確認付き）
  private static confirmReturnToTitle(): void {
    const confirmed = confirm("タイトル画面に戻りますか？\n現在の進行状況は失われます。");
    if (confirmed) {
      console.log("🏠 Returning to title...");
      QuickMenuSystem.returnToTitle();
    }
  }

  private static returnToTitle(): void {
    // タイトル復帰イベントを発火
    const returnEvent = new CustomEvent("returnToTitle");
    window.dispatchEvent(returnEvent);
  }

  // クイックメニューを表示
  static showQuickMenu(): void {
    if (!QuickMenuSystem.isEnabled || QuickMenuSystem.isVisible) {
      return;
    }

    const quickMenu = QuickMenuSystem.createQuickMenu();
    QuickMenuSystem.currentQuickMenu = quickMenu;
    document.body.appendChild(quickMenu);

    // アニメーション開始
    setTimeout(() => {
      quickMenu.style.opacity = "1";
      quickMenu.style.transform = "translateX(0)";
    }, 50);

    QuickMenuSystem.isVisible = true;
    console.log("📋 Quick menu shown");
  }

  // クイックメニューを非表示
  static hideQuickMenu(): void {
    if (!QuickMenuSystem.isVisible || !QuickMenuSystem.currentQuickMenu) {
      return;
    }

    const quickMenu = QuickMenuSystem.currentQuickMenu;
    
    // アニメーション
    quickMenu.style.opacity = "0";
    quickMenu.style.transform = "translateX(100%)";

    setTimeout(() => {
      if (quickMenu.parentNode) {
        quickMenu.parentNode.removeChild(quickMenu);
      }
      QuickMenuSystem.currentQuickMenu = null;
      QuickMenuSystem.isVisible = false;
    }, 300);

    console.log("📋 Quick menu hidden");
  }

  // クイックメニュー表示切り替え
  static toggleQuickMenu(): void {
    if (QuickMenuSystem.isVisible) {
      QuickMenuSystem.hideQuickMenu();
    } else {
      QuickMenuSystem.showQuickMenu();
    }
  }

  // クイックメニュー有効・無効切り替え
  static setEnabled(enabled: boolean): void {
    QuickMenuSystem.isEnabled = enabled;
    
    if (!enabled && QuickMenuSystem.isVisible) {
      QuickMenuSystem.hideQuickMenu();
    }
    
    console.log(`Quick menu ${enabled ? 'enabled' : 'disabled'}`);
  }

  // 現在の表示状態を取得
  static isCurrentlyVisible(): boolean {
    return QuickMenuSystem.isVisible;
  }

  // キーボードショートカット設定
  static setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", (event) => {
      if (!QuickMenuSystem.isEnabled) return;

      // Escキーでクイックメニュー表示切り替え
      if (event.key === "Escape") {
        event.preventDefault();
        QuickMenuSystem.toggleQuickMenu();
        return;
      }

      // クイックメニューが表示されていない場合はホットキーを処理
      if (!QuickMenuSystem.isVisible) {
        return;
      }

      // 各ボタンのホットキーをチェック
      const button = QuickMenuSystem.menuButtons.find(btn => {
        const key = event.key.toLowerCase();
        const hotkey = btn.hotkey.toLowerCase();
        
        // スペースキーの特別処理
        if (hotkey === "space" && key === " ") {
          return true;
        }
        
        return key === hotkey;
      });

      if (button) {
        event.preventDefault();
        QuickMenuSystem.handleMenuAction(button.action);
      }
    });

    console.log("⌨️ Quick menu keyboard shortcuts set up");
    console.log("  ESC: Toggle quick menu");
    console.log("  S: Save, L: Load, H: History, Space: Skip, A: Auto, O: Settings, T: Title");
  }

  // キーボードショートカット削除
  static removeKeyboardShortcuts(): void {
    // TODO: 特定のリスナーを削除する実装
    console.log("⌨️ Quick menu keyboard shortcuts removed");
  }

  // 強制非表示（緊急用）
  static forceHide(): void {
    if (QuickMenuSystem.currentQuickMenu) {
      const menu = QuickMenuSystem.currentQuickMenu;
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
      QuickMenuSystem.currentQuickMenu = null;
    }
    QuickMenuSystem.isVisible = false;
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Quick Menu System...");
    
    // 既存のメニューをクリーンアップ
    QuickMenuSystem.forceHide();
    
    // キーボードショートカットを設定
    QuickMenuSystem.setupKeyboardShortcuts();
    
    console.log("Quick Menu System initialized successfully");
  }
}