import { narration } from "@drincs/pixi-vn";

// 入力収集システム
export class InputCollectionSystem {
  private static currentInputModal: HTMLElement | null = null;
  private static inputHistory: Array<{
    type: string;
    value: any;
    timestamp: Date;
  }> = [];

  // プレイヤー名入力モーダルを作成
  static createNameInputModal(): HTMLElement {
    const modal = document.createElement("div");
    modal.id = "name-input-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3000;
    `;

    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      text-align: center;
      min-width: 300px;
      max-width: 500px;
    `;

    const title = document.createElement("h2");
    title.textContent = "お名前を教えてください";
    title.style.cssText = `
      color: white;
      margin-bottom: 20px;
      font-size: 24px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    `;

    const inputContainer = document.createElement("div");
    inputContainer.style.cssText = `
      margin-bottom: 20px;
    `;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "player-name-input";
    nameInput.placeholder = "ここにお名前を入力";
    nameInput.maxLength = 20;
    nameInput.style.cssText = `
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      text-align: center;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    `;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `;

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "決定";
    confirmButton.style.cssText = `
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    `;

    const skipButton = document.createElement("button");
    skipButton.textContent = "スキップ";
    skipButton.style.cssText = `
      background: #9E9E9E;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    `;

    // イベントリスナー設定
    confirmButton.addEventListener("click", () => {
      const playerName = nameInput.value.trim();
      InputCollectionSystem.handleNameInputConfirm(playerName || "プレイヤー");
    });

    skipButton.addEventListener("click", () => {
      InputCollectionSystem.handleNameInputConfirm("プレイヤー");
    });

    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const playerName = nameInput.value.trim();
        InputCollectionSystem.handleNameInputConfirm(
          playerName || "プレイヤー"
        );
      }
    });

    // ホバー効果
    confirmButton.addEventListener("mouseover", () => {
      confirmButton.style.backgroundColor = "#45a049";
    });
    confirmButton.addEventListener("mouseout", () => {
      confirmButton.style.backgroundColor = "#4CAF50";
    });

    inputContainer.appendChild(nameInput);
    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(skipButton);
    modalContent.appendChild(title);
    modalContent.appendChild(inputContainer);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    return modal;
  }

  // 名前入力確定処理
  private static handleNameInputConfirm(playerName: string): void {
    console.log(`Player name set: ${playerName}`);

    // 入力履歴に記録
    InputCollectionSystem.inputHistory.push({
      type: "name_input",
      value: playerName,
      timestamp: new Date(),
    });

    // グローバルに保存
    InputCollectionSystem.setPlayerData("name", playerName);

    // モーダルを閉じる
    InputCollectionSystem.hideCurrentModal();

    // ゲームに反映
    InputCollectionSystem.onNameInputComplete(playerName);
  }

  // 名前入力完了コールバック
  private static onNameInputComplete(playerName: string): void {
    // 次のダイアログに進む
    (narration as any).dialogue = {
      character: "ななたう",
      text: `${playerName}さん、素敵なお名前ですね。これからよろしくお願いします。`,
    };

    // ダイアログ更新イベントを発火
    const updateEvent = new CustomEvent("updateDialogue");
    window.dispatchEvent(updateEvent);

    // 次のステップに進む
    setTimeout(() => {
      narration.goNext({});
    }, 2000);
  }

  // 高度な選択肢システム
  static createAdvancedChoiceModal(
    choices: Array<{
      id: string;
      text: string;
      description?: string;
      condition?: () => boolean;
      consequence?: string;
    }>
  ): HTMLElement {
    const modal = document.createElement("div");
    modal.id = "advanced-choice-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3000;
    `;

    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 80%;
      overflow-y: auto;
    `;

    const title = document.createElement("h2");
    title.textContent = "選択してください";
    title.style.cssText = `
      color: white;
      margin-bottom: 20px;
      font-size: 24px;
      text-align: center;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    `;

    const choicesContainer = document.createElement("div");
    choicesContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
    `;

    // 利用可能な選択肢のみをフィルタ
    const availableChoices = choices.filter(
      (choice) => !choice.condition || choice.condition()
    );

    availableChoices.forEach((choice, index) => {
      const choiceButton = document.createElement("button");
      choiceButton.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        padding: 15px;
        border-radius: 10px;
        cursor: pointer;
        text-align: left;
        transition: all 0.3s;
        font-size: 16px;
      `;

      const choiceText = document.createElement("div");
      choiceText.textContent = choice.text;
      choiceText.style.cssText = `
        font-weight: bold;
        margin-bottom: 5px;
      `;

      choiceButton.appendChild(choiceText);

      if (choice.description) {
        const choiceDescription = document.createElement("div");
        choiceDescription.textContent = choice.description;
        choiceDescription.style.cssText = `
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          font-style: italic;
        `;
        choiceButton.appendChild(choiceDescription);
      }

      if (choice.consequence) {
        const consequenceHint = document.createElement("div");
        consequenceHint.textContent = `→ ${choice.consequence}`;
        consequenceHint.style.cssText = `
          font-size: 12px;
          color: #ffdd44;
          margin-top: 5px;
        `;
        choiceButton.appendChild(consequenceHint);
      }

      // ホバー効果
      choiceButton.addEventListener("mouseover", () => {
        choiceButton.style.background = "rgba(255, 255, 255, 0.2)";
        choiceButton.style.borderColor = "rgba(255, 255, 255, 0.6)";
        choiceButton.style.transform = "translateX(5px)";
      });

      choiceButton.addEventListener("mouseout", () => {
        choiceButton.style.background = "rgba(255, 255, 255, 0.1)";
        choiceButton.style.borderColor = "rgba(255, 255, 255, 0.3)";
        choiceButton.style.transform = "translateX(0)";
      });

      // クリックイベント
      choiceButton.addEventListener("click", () => {
        InputCollectionSystem.handleAdvancedChoiceSelect(choice);
      });

      // キーボードナビゲーション
      choiceButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          InputCollectionSystem.handleAdvancedChoiceSelect(choice);
        }
      });

      choiceButton.tabIndex = index;
      choicesContainer.appendChild(choiceButton);
    });

    modalContent.appendChild(title);
    modalContent.appendChild(choicesContainer);
    modal.appendChild(modalContent);

    return modal;
  }

  // 高度な選択肢選択処理
  private static handleAdvancedChoiceSelect(choice: any): void {
    console.log(`Advanced choice selected: ${choice.id}`);

    // 選択履歴に記録
    InputCollectionSystem.inputHistory.push({
      type: "advanced_choice",
      value: choice,
      timestamp: new Date(),
    });

    // モーダルを閉じる
    InputCollectionSystem.hideCurrentModal();

    // 選択結果をゲームに反映
    InputCollectionSystem.onAdvancedChoiceComplete(choice);
  }

  // 高度な選択肢完了コールバック
  private static onAdvancedChoiceComplete(choice: any): void {
    // 選択結果に応じたダイアログ
    (narration as any).dialogue = {
      character: "ななたう",
      text: `「${choice.text}」を選んでくれたのですね。${choice.consequence || "ありがとうございます。"}`,
    };

    // ダイアログ更新イベントを発火
    const updateEvent = new CustomEvent("updateDialogue");
    window.dispatchEvent(updateEvent);

    // 次のステップに進む
    setTimeout(() => {
      narration.goNext({});
    }, 2000);
  }

  // プレイヤー名入力を表示
  static showNameInput(): void {
    const modal = InputCollectionSystem.createNameInputModal();
    InputCollectionSystem.currentInputModal = modal;
    document.body.appendChild(modal);

    // 入力フィールドにフォーカス
    setTimeout(() => {
      const input = document.getElementById(
        "player-name-input"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  // 高度な選択肢を表示
  static showAdvancedChoice(choices: any[]): void {
    const modal = InputCollectionSystem.createAdvancedChoiceModal(choices);
    InputCollectionSystem.currentInputModal = modal;
    document.body.appendChild(modal);
  }

  // 現在のモーダルを非表示
  private static hideCurrentModal(): void {
    if (InputCollectionSystem.currentInputModal) {
      InputCollectionSystem.currentInputModal.remove();
      InputCollectionSystem.currentInputModal = null;
    }
  }

  // プレイヤーデータの保存
  private static setPlayerData(key: string, value: any): void {
    try {
      const playerData = JSON.parse(
        localStorage.getItem("nanatau_player_data") || "{}"
      );
      playerData[key] = value;
      localStorage.setItem("nanatau_player_data", JSON.stringify(playerData));
    } catch (error) {
      console.warn("Failed to save player data:", error);
    }
  }

  // プレイヤーデータの取得
  static getPlayerData(key: string): any {
    try {
      const playerData = JSON.parse(
        localStorage.getItem("nanatau_player_data") || "{}"
      );
      return playerData[key];
    } catch (error) {
      console.warn("Failed to load player data:", error);
      return null;
    }
  }

  // 入力履歴の取得
  static getInputHistory(): Array<any> {
    return [...InputCollectionSystem.inputHistory];
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Input Collection System...");

    // ESCキーでモーダルを閉じる
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && InputCollectionSystem.currentInputModal) {
        // 名前入力の場合はデフォルト値で進む
        if (InputCollectionSystem.currentInputModal.id === "name-input-modal") {
          InputCollectionSystem.handleNameInputConfirm("プレイヤー");
        } else {
          InputCollectionSystem.hideCurrentModal();
        }
      }
    });

    console.log("Input Collection System initialized successfully");
  }
}
