import { Game, narration, newLabel } from "@drincs/pixi-vn";

// Window型拡張（テスト用）
declare global {
  interface Window {
    Game: typeof Game;
    narration: typeof narration;
  }
}

// 簡易ダイアログUI作成関数
function createDialogueUI(): HTMLElement {
  const dialogueContainer = document.createElement("div");
  dialogueContainer.id = "dialogue-container";
  dialogueContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 800px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    border: 2px solid #444;
    font-family: 'Arial', sans-serif;
    font-size: 18px;
    line-height: 1.5;
    z-index: 1000;
    display: none;
  `;

  const characterName = document.createElement("div");
  characterName.id = "character-name";
  characterName.style.cssText = `
    color: #ffdd44;
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 20px;
  `;

  const dialogueText = document.createElement("div");
  dialogueText.id = "dialogue-text";
  dialogueText.style.cssText = `
    color: #ffffff;
    margin-bottom: 15px;
  `;

  const continueButton = document.createElement("button");
  continueButton.id = "continue-button";
  continueButton.textContent = "▶ 続ける";
  continueButton.style.cssText = `
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    float: right;
  `;

  continueButton.addEventListener("click", () => {
    narration.goNext({});
  });

  dialogueContainer.appendChild(characterName);
  dialogueContainer.appendChild(dialogueText);
  dialogueContainer.appendChild(continueButton);

  return dialogueContainer;
}

// ダイアログ更新関数
function updateDialogueDisplay(): void {
  const container = document.getElementById("dialogue-container");
  const characterElement = document.getElementById("character-name");
  const textElement = document.getElementById("dialogue-text");

  if (!container || !characterElement || !textElement) {
    return;
  }

  const currentDialogue = narration.dialogue;

  if (currentDialogue) {
    // キャラクター名を設定
    if (typeof currentDialogue === "object" && currentDialogue.character) {
      characterElement.textContent = currentDialogue.character;
      characterElement.style.display = "block";
    } else {
      characterElement.style.display = "none";
    }

    // テキストを設定
    const text =
      typeof currentDialogue === "string"
        ? currentDialogue
        : currentDialogue.text || "";
    textElement.textContent = text;

    // ダイアログを表示
    container.style.display = "block";
  } else {
    // ダイアログを非表示
    container.style.display = "none";
  }
}

// メイン初期化関数
async function initializeGame() {
  try {
    console.log("Starting game initialization...");

    // ゲームコンテナを取得
    console.log("Getting game container...");
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      throw new Error("Game container element not found");
    }

    // Pixi'VNの初期化
    console.log("Initializing Pixi'VN...");
    Game.init(gameContainer, {
      width: 1280,
      height: 720,
      backgroundColor: "#1a1a2e",
    });
    console.log("Pixi'VN initialized successfully");

    console.log("ななたう - 硝子の心、たう（届く）まで");
    console.log("Pixi'VN Engine initialized successfully!");

    // ダイアログUIを作成・追加
    console.log("Creating dialogue UI...");
    const dialogueUI = createDialogueUI();
    document.body.appendChild(dialogueUI);

    // Labelを定義してナラティブフローを開始
    console.log("Setting up initial story label...");
    const introLabel = newLabel("intro", [
      () => {
        console.log("Step 1: Setting initial dialogue...");
        narration.dialogue = {
          character: "システム",
          text: "ななたう - 硝子の心、たう（届く）まで",
        };
        updateDialogueDisplay();
      },
      () => {
        console.log("Step 2: Setting welcome message...");
        narration.dialogue = {
          character: "ななたう",
          text: "こんにちは...私はななたう。あなたに会えて嬉しいです。",
        };
        updateDialogueDisplay();
      },
      () => {
        console.log("Step 3: Setting next message...");
        narration.dialogue = {
          character: "ななたう",
          text: "このゲームは正常に動作しています。続ける ボタンをクリックして次に進めます。",
        };
        updateDialogueDisplay();
      },
    ]);

    // ナラティブフローを開始
    console.log("Starting narrative flow...");
    await narration.callLabel(introLabel, {});
    console.log("Initial story step started");

    // グローバルに公開（テスト用）
    window.Game = Game;
    window.narration = narration;

    console.log("Game initialization completed successfully!");
    console.log(
      "画面をクリックするか、コンソールで 'narration.goNext({})' を実行して進めてください。"
    );
  } catch (error) {
    console.error("Game initialization failed:", error);
    console.error("Error details:", error);
    // エラーをより詳細に表示
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

// ゲーム開始
initializeGame();
