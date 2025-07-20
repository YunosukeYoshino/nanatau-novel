// History/Backlog システム
export class HistorySystem {
  private static historyEnabled = true;
  private static maxHistorySize = 100;

  // 履歴機能を有効化
  static enableHistory(): void {
    HistorySystem.historyEnabled = true;
    console.log("History system enabled");
  }

  // 履歴機能を無効化
  static disableHistory(): void {
    HistorySystem.historyEnabled = false;
    console.log("History system disabled");
  }

  // 履歴状態を取得
  static isHistoryEnabled(): boolean {
    return HistorySystem.historyEnabled;
  }

  // 最大履歴サイズを取得
  static getMaxHistorySize(): number {
    return HistorySystem.maxHistorySize;
  }

  // バックログUIを作成
  static createBacklogUI(): HTMLElement {
    const backlogContainer = document.createElement("div");
    backlogContainer.id = "backlog-container";
    backlogContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      z-index: 2000;
      display: none;
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    `;

    const header = document.createElement("div");
    header.style.cssText = `
      position: sticky;
      top: 0;
      background: rgba(0, 0, 0, 0.8);
      padding: 10px 0;
      border-bottom: 2px solid #444;
      margin-bottom: 20px;
    `;

    const title = document.createElement("h2");
    title.textContent = "バックログ";
    title.style.cssText = `
      margin: 0;
      color: #ffdd44;
      text-align: center;
    `;

    const closeButton = document.createElement("button");
    closeButton.textContent = "× 閉じる";
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff4444;
      color: white;
      border: none;
      padding: 5px 15px;
      border-radius: 5px;
      cursor: pointer;
    `;

    closeButton.addEventListener("click", () => {
      HistorySystem.hideBacklog();
    });

    const historyList = document.createElement("div");
    historyList.id = "history-list";
    historyList.style.cssText = `
      max-width: 800px;
      margin: 0 auto;
    `;

    header.appendChild(title);
    header.appendChild(closeButton);
    backlogContainer.appendChild(header);
    backlogContainer.appendChild(historyList);

    return backlogContainer;
  }

  // バックログを表示
  static showBacklog(): void {
    const container = document.getElementById("backlog-container");
    if (container) {
      HistorySystem.updateBacklogContent();
      container.style.display = "block";
    }
  }

  // バックログを非表示
  static hideBacklog(): void {
    const container = document.getElementById("backlog-container");
    if (container) {
      container.style.display = "none";
    }
  }

  // バックログ内容を更新
  private static updateBacklogContent(): void {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    // @drincs/pixi-vnのstepHistoryを利用
    try {
      // 履歴データを取得（実際のAPIに応じて調整）
      const history = HistorySystem.getGameHistory();

      historyList.innerHTML = "";

      if (history.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.textContent = "まだ履歴がありません";
        emptyMessage.style.cssText =
          "text-align: center; color: #888; padding: 20px;";
        historyList.appendChild(emptyMessage);
        return;
      }

      history.forEach((entry) => {
        const historyItem = document.createElement("div");
        historyItem.style.cssText = `
          background: rgba(255, 255, 255, 0.1);
          margin-bottom: 10px;
          padding: 15px;
          border-radius: 5px;
          border-left: 3px solid #4CAF50;
        `;

        const characterName = document.createElement("div");
        characterName.textContent = entry.character || "システム";
        characterName.style.cssText = `
          color: ${entry.color || "#ffdd44"};
          font-weight: bold;
          margin-bottom: 5px;
        `;

        const dialogueText = document.createElement("div");
        dialogueText.textContent = entry.text;
        dialogueText.style.cssText = `
          color: #ffffff;
          line-height: 1.5;
        `;

        const timestamp = document.createElement("div");
        timestamp.textContent = entry.timestamp;
        timestamp.style.cssText = `
          color: #888;
          font-size: 12px;
          text-align: right;
          margin-top: 5px;
        `;

        historyItem.appendChild(characterName);
        historyItem.appendChild(dialogueText);
        historyItem.appendChild(timestamp);
        historyList.appendChild(historyItem);
      });
    } catch (error) {
      console.warn("Failed to update backlog content:", error);
      historyList.innerHTML =
        "<div style='text-align: center; color: #ff4444;'>履歴の読み込みに失敗しました</div>";
    }
  }

  // 履歴データを取得（プレースホルダー実装）
  private static getGameHistory(): Array<{
    character: string;
    text: string;
    color?: string;
    timestamp: string;
  }> {
    // 実際のstepHistoryデータを取得する実装
    // 現在はサンプルデータを返す
    return [
      {
        character: "システム",
        text: "ななたう - 硝子の心、たう（届く）まで",
        color: "#DDDDDD",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        character: "ななたう",
        text: "こんにちは...私はななたう。あなたに会えて嬉しいです。",
        color: "#FFE4E1",
        timestamp: new Date().toLocaleTimeString(),
      },
    ];
  }

  // 戻る機能
  static goBack(): boolean {
    try {
      // @drincs/pixi-vnのgoBack()機能を使用
      // 実際のAPIに応じて実装を調整
      console.log("Attempting to go back in history...");

      // プレースホルダー実装
      const success = HistorySystem.attemptGoBack();

      if (success) {
        console.log("Successfully went back in history");
        return true;
      } else {
        console.warn("Cannot go back - at beginning of history");
        return false;
      }
    } catch (error) {
      console.error("Failed to go back:", error);
      return false;
    }
  }

  // 実際の戻る処理（プレースホルダー）
  private static attemptGoBack(): boolean {
    // 実際の@drincs/pixi-vn goBack()実装
    // 現在はfalseを返して実装中であることを示す
    return false;
  }

  // キーボードショートカットを設定
  static setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", (event) => {
      // Hキーでバックログ表示
      if (event.key.toLowerCase() === "h" && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        HistorySystem.showBacklog();
      }

      // Escキーでバックログ閉じる
      if (event.key === "Escape") {
        HistorySystem.hideBacklog();
      }

      // BackspaceまたはArrow Leftで戻る
      if (
        (event.key === "Backspace" || event.key === "ArrowLeft") &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        HistorySystem.goBack();
      }
    });

    console.log(
      "History keyboard shortcuts enabled (H: backlog, ←/Backspace: go back)"
    );
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing History System...");

    // バックログUIを作成・追加
    const backlogUI = HistorySystem.createBacklogUI();
    document.body.appendChild(backlogUI);

    // キーボードショートカット設定
    HistorySystem.setupKeyboardShortcuts();

    // 履歴機能を有効化
    HistorySystem.enableHistory();

    console.log("History System initialized successfully");
  }
}
