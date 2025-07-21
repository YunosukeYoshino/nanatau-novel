import {
  Game,
  narration,
  newLabel,
  canvas,
  ImageSprite,
  sound,
  RegisteredCharacters,
  ZoomTicker,
  RotateTicker,
} from "@drincs/pixi-vn";

// コアシステムをインポート
import { ScenarioParser } from "./core/ScenarioParser.js";
import { HistorySystem } from "./core/HistorySystem.js";
import { AdvancedAssetManager } from "./core/AdvancedAssetManager.js";
import { InputCollectionSystem } from "./core/InputCollectionSystem.js";
import { AssetMappingStrategy } from "./core/AssetMappingStrategy.js";
import { ScenarioIntegrationSystem } from "./core/ScenarioIntegrationSystem.js";
import { AssetGenerationGuide } from "./core/AssetGenerationGuide.js";
import { QuickMenuSystem } from "./core/QuickMenuSystem.js";
import { SkipAutoSystem } from "./core/SkipAutoSystem.js";

// UIシステムをインポート
import { SplashScreenSystem } from "./ui/SplashScreenSystem.js";
import { TitleScreenSystem } from "./ui/TitleScreenSystem.js";
import { OpeningSequenceSystem } from "./ui/OpeningSequenceSystem.js";

// 型定義
interface GameState {
  currentChapter: string;
  currentSceneIndex: number;
  playerName: string;
  visitedScenes: Set<string>;
  gameFlags: Record<string, boolean>;
  chosenRoute: "A" | "B" | null;
}

// Window型拡張
declare global {
  interface Window {
    Game: typeof Game;
    narration: typeof narration;
    gameState: GameState;
  }
}

// ゲーム状態
const gameState: GameState = {
  currentChapter: "00_prologue",
  currentSceneIndex: 0,
  playerName: "ゆうくん",
  visitedScenes: new Set(),
  gameFlags: {},
  chosenRoute: null,
};

// シナリオデータキャッシュ
const scenarioCache = new Map<string, any>();
const parser = new ScenarioParser();

// UI作成関数
function createGameUI(): HTMLElement {
  const gameContainer = document.createElement("div");
  gameContainer.id = "game-ui-container";
  gameContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    pointer-events: none;
  `;

  // ダイアログコンテナ
  const dialogueContainer = document.createElement("div");
  dialogueContainer.id = "dialogue-container";
  dialogueContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 800px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 20px;
    border-radius: 15px;
    border: 2px solid #444;
    font-family: 'Yu Gothic', 'Meiryo', sans-serif;
    font-size: 18px;
    line-height: 1.6;
    z-index: 1001;
    display: none;
    pointer-events: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  // キャラクター名
  const characterName = document.createElement("div");
  characterName.id = "character-name";
  characterName.style.cssText = `
    color: #FFE4E1;
    font-weight: bold;
    margin-bottom: 12px;
    font-size: 20px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  `;

  // ダイアログテキスト
  const dialogueText = document.createElement("div");
  dialogueText.id = "dialogue-text";
  dialogueText.style.cssText = `
    color: #ffffff;
    margin-bottom: 15px;
    min-height: 60px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  `;

  // 続けるボタン
  const continueButton = document.createElement("button");
  continueButton.id = "continue-button";
  continueButton.textContent = "▶ 続ける";
  continueButton.style.cssText = `
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    float: right;
    transition: all 0.3s ease;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  `;

  continueButton.addEventListener("click", () => {
    nextScene();
  });

  continueButton.addEventListener("mouseenter", () => {
    continueButton.style.transform = "scale(1.05)";
    continueButton.style.background =
      "linear-gradient(45deg, #5CBF60, #4CAF50)";
  });

  continueButton.addEventListener("mouseleave", () => {
    continueButton.style.transform = "scale(1)";
    continueButton.style.background =
      "linear-gradient(45deg, #4CAF50, #45a049)";
  });

  dialogueContainer.appendChild(characterName);
  dialogueContainer.appendChild(dialogueText);
  dialogueContainer.appendChild(continueButton);
  gameContainer.appendChild(dialogueContainer);

  return gameContainer;
}

// シナリオファイルを読み込む
async function loadScenarioFile(filename: string): Promise<any> {
  if (scenarioCache.has(filename)) {
    return scenarioCache.get(filename);
  }

  try {
    const response = await fetch(`/scenario/${filename}.txt`);
    if (!response.ok) {
      throw new Error(`Failed to load scenario: ${filename}`);
    }

    const content = await response.text();
    const scenarioData = parser.parseScenarioFile(content);
    scenarioCache.set(filename, scenarioData);
    return scenarioData;
  } catch (error) {
    console.error(`Error loading scenario ${filename}:`, error);
    throw error;
  }
}

// ダイアログ表示を更新
function updateDialogueDisplay(scene: any): void {
  const container = document.getElementById("dialogue-container");
  const characterElement = document.getElementById("character-name");
  const textElement = document.getElementById("dialogue-text");

  if (!container || !characterElement || !textElement) {
    return;
  }

  // キャラクター名の表示
  if (scene.character?.trim()) {
    let displayName = scene.character;

    // 特別なキャラクター名の変換
    if (scene.character === "主人公") {
      displayName = gameState.playerName;
    } else if (scene.character.includes("主人公（モノローグ）")) {
      characterElement.style.display = "none";
    } else if (scene.character === "ななたう") {
      displayName = "ななたう";
      characterElement.style.color = "#FFE4E1";
    } else if (scene.character === "システム") {
      displayName = "システム";
      characterElement.style.color = "#DDDDDD";
    }

    if (!scene.character.includes("モノローグ")) {
      characterElement.textContent = displayName;
      characterElement.style.display = "block";
    }
  } else {
    characterElement.style.display = "none";
  }

  // テキストを表示（タイプライター効果）
  typewriterEffect(textElement, scene.text || "");

  // コンテナを表示
  container.style.display = "block";
}

// タイプライター効果
function typewriterEffect(
  element: HTMLElement,
  text: string,
  speed: number = 50
): void {
  element.textContent = "";
  let index = 0;

  const type = () => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  };

  type();
}

// 次のシーンに進む
async function nextScene(): Promise<void> {
  try {
    const currentScenario = await loadScenarioFile(gameState.currentChapter);

    if (gameState.currentSceneIndex < currentScenario.scenes.length - 1) {
      gameState.currentSceneIndex++;
      const scene = currentScenario.scenes[gameState.currentSceneIndex];

      // シーンタイプに応じた処理
      if (scene.type === "choice") {
        await handleChoiceScene(scene);
      } else if (scene.type === "directive") {
        await handleDirectiveScene(scene);
      } else {
        await handleDialogueScene(scene);
      }
    } else {
      // 章の終了 - 次の章へ
      await loadNextChapter();
    }
  } catch (error) {
    console.error("Error in nextScene:", error);
  }
}

// 台詞シーンの処理
async function handleDialogueScene(scene: any): Promise<void> {
  // 訪問済みシーンに追加
  gameState.visitedScenes.add(scene.id);

  // ディレクティブの処理
  if (scene.directives && scene.directives.length > 0) {
    for (const directive of scene.directives) {
      await processDirective(directive);
    }
  }

  // ダイアログの表示
  updateDialogueDisplay(scene);
}

// ディレクティブシーンの処理
async function handleDirectiveScene(scene: any): Promise<void> {
  if (scene.directives && scene.directives.length > 0) {
    for (const directive of scene.directives) {
      await processDirective(directive);
    }
  }

  // ディレクティブのみのシーンは自動で次へ
  setTimeout(() => {
    nextScene();
  }, 1000);
}

// 選択肢シーンの処理
async function handleChoiceScene(scene: any): Promise<void> {
  if (!scene.choices || scene.choices.length === 0) {
    nextScene();
    return;
  }

  // 第3章の最後の選択肢かチェック
  if (
    gameState.currentChapter === "03_chapter_three" &&
    scene.choices.length === 2
  ) {
    // ルート分岐の選択肢
    await showRouteBranchChoice(scene.choices);
  } else {
    // 通常の選択肢
    await showNormalChoice(scene.choices);
  }
}

// ルート分岐選択肢の表示
async function showRouteBranchChoice(choices: any[]): Promise<void> {
  const modal = document.createElement("div");
  modal.id = "route-choice-modal";
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
    z-index: 2000;
  `;

  const container = document.createElement("div");
  container.style.cssText = `
    background: linear-gradient(135deg, #2c1810, #4a2c1a);
    padding: 40px;
    border-radius: 20px;
    border: 3px solid #d4af37;
    max-width: 600px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  `;

  const title = document.createElement("h2");
  title.textContent = "💔 運命の選択 💔";
  title.style.cssText = `
    color: #d4af37;
    margin-bottom: 30px;
    font-size: 28px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  `;

  const description = document.createElement("p");
  description.textContent = "ななたうの運命を決める、最後の選択です...";
  description.style.cssText = `
    color: #ffffff;
    margin-bottom: 30px;
    font-size: 18px;
    line-height: 1.6;
  `;

  container.appendChild(title);
  container.appendChild(description);

  // 選択肢ボタンを作成
  choices.forEach((choice, index) => {
    const button = document.createElement("button");

    if (index === 0) {
      // ルートA: 別れのルート
      button.textContent = "💔 ななたうを解放する";
      button.style.background = "linear-gradient(45deg, #667eea, #764ba2)";
    } else {
      // ルートB: 一緒にいるルート
      button.textContent = "❤️ ななたうと一緒にいる";
      button.style.background = "linear-gradient(45deg, #f093fb, #f5576c)";
    }

    button.style.cssText += `
      color: white;
      border: none;
      padding: 15px 30px;
      margin: 10px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      transition: all 0.3s ease;
      min-width: 200px;
    `;

    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.05) translateY(-2px)";
      button.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1) translateY(0)";
      button.style.boxShadow = "none";
    });

    button.addEventListener("click", () => {
      // ルート選択を保存
      gameState.chosenRoute = index === 0 ? "A" : "B";
      document.body.removeChild(modal);

      // 選択したルートに移行
      loadRouteChapter();
    });

    container.appendChild(button);
  });

  modal.appendChild(container);
  document.body.appendChild(modal);
}

// 通常選択肢の表示
async function showNormalChoice(choices: any[]): Promise<void> {
  // InputCollectionSystemを使用して選択肢を表示
  const enhancedChoices = choices.map((choice, index) => ({
    id: choice.id || `choice_${index}`,
    text: choice.text,
    description: `選択肢 ${index + 1}`,
    consequence: "ゲームが進行します",
  }));

  InputCollectionSystem.showAdvancedChoice(enhancedChoices);
}

// ディレクティブの処理
async function processDirective(directive: any): Promise<void> {
  switch (directive.type) {
    case "background":
      await setBackground(directive.value);
      break;
    case "bgm":
      await playBGM(directive.value);
      break;
    case "se":
      await playSE(directive.value);
      break;
    case "character":
      await showCharacter(directive.value);
      break;
    case "effect":
      await applyEffect(directive.value);
      break;
  }
}

// 背景設定
async function setBackground(backgroundName: string): Promise<void> {
  try {
    // 既存の背景を削除
    canvas.removeAll();

    // 新しい背景を設定
    const backgroundSprite = new ImageSprite({
      anchor: { x: 0.5, y: 0.5 },
      x: 640,
      y: 360,
      width: 1280,
      height: 720,
      texture: undefined, // 画像がない場合はデフォルト
    });

    await canvas.add("background", backgroundSprite);
    console.log(`Background set: ${backgroundName}`);
  } catch (error) {
    console.warn(`Failed to set background: ${backgroundName}`, error);
  }
}

// BGM再生
async function playBGM(bgmName: string): Promise<void> {
  try {
    sound.stopAll();
    // 音声ファイルが存在すれば再生
    console.log(`BGM should play: ${bgmName}`);
  } catch (error) {
    console.warn(`Failed to play BGM: ${bgmName}`, error);
  }
}

// 効果音再生
async function playSE(seName: string): Promise<void> {
  try {
    console.log(`SE should play: ${seName}`);
  } catch (error) {
    console.warn(`Failed to play SE: ${seName}`, error);
  }
}

// キャラクター表示
async function showCharacter(characterName: string): Promise<void> {
  try {
    if (characterName.includes("ななたう")) {
      const nanatauSprite = new ImageSprite({
        anchor: { x: 0.5, y: 1 },
        x: 640,
        y: 650,
        width: 300,
        height: 400,
        texture: undefined,
      });

      await canvas.add("nanatau", nanatauSprite);

      // ななたうにアニメーション効果を追加
      canvas.addTicker(
        "nanatau",
        new ZoomTicker({
          type: "zoom",
          limit: 1.1,
          speed: 30,
          clockwise: true,
        })
      );
    }
    console.log(`Character shown: ${characterName}`);
  } catch (error) {
    console.warn(`Failed to show character: ${characterName}`, error);
  }
}

// 効果適用
async function applyEffect(effectName: string): Promise<void> {
  try {
    if (effectName.includes("ズーム") || effectName.includes("zoom")) {
      // ズーム効果
      canvas.addTicker(
        "background",
        new ZoomTicker({
          type: "zoom",
          limit: 1.2,
          speed: 50,
          clockwise: true,
        })
      );
    } else if (effectName.includes("回転") || effectName.includes("rotate")) {
      // 回転効果
      canvas.addTicker(
        "background",
        new RotateTicker({
          speed: 0.5,
          clockwise: false,
        })
      );
    }
    console.log(`Effect applied: ${effectName}`);
  } catch (error) {
    console.warn(`Failed to apply effect: ${effectName}`, error);
  }
}

// 次の章を読み込む
async function loadNextChapter(): Promise<void> {
  const chapterOrder = [
    "00_prologue",
    "01_chapter_one",
    "02_chapter_two",
    "03_chapter_three",
  ];

  const currentIndex = chapterOrder.indexOf(gameState.currentChapter);

  if (currentIndex < chapterOrder.length - 1) {
    gameState.currentChapter = chapterOrder[currentIndex + 1];
    gameState.currentSceneIndex = 0;

    const nextScenario = await loadScenarioFile(gameState.currentChapter);
    const firstScene = nextScenario.scenes[0];

    if (firstScene) {
      await handleDialogueScene(firstScene);
    }
  } else {
    // 第3章終了後は選択肢によるルート分岐
    if (gameState.chosenRoute) {
      await loadRouteChapter();
    }
  }
}

// ルート章を読み込む
async function loadRouteChapter(): Promise<void> {
  try {
    const routeChapter =
      gameState.chosenRoute === "A"
        ? "route_a/04_chapter_four_a"
        : "route_b/04_chapter_four_b";

    gameState.currentChapter = routeChapter;
    gameState.currentSceneIndex = 0;

    const routeScenario = await loadScenarioFile(routeChapter);
    const firstScene = routeScenario.scenes[0];

    if (firstScene) {
      await handleDialogueScene(firstScene);
    }
  } catch (error) {
    console.error("Error loading route chapter:", error);
  }
}

// プレイヤー名入力の処理
window.addEventListener("playerNameSubmitted", (event: any) => {
  gameState.playerName = event.detail.name;
  console.log(`Player name set: ${gameState.playerName}`);
});

// 選択肢選択の処理
window.addEventListener("choiceSelected", (event: any) => {
  console.log(`Choice selected: ${event.detail.choice.text}`);
  setTimeout(() => {
    nextScene();
  }, 1000);
});

// ゲーム初期化
async function initializeGame(): Promise<void> {
  try {
    console.log("🎮 ななたう - 硝子の心、たう（届く）まで 🎮");
    console.log("Starting game initialization...");

    // ゲームコンテナを取得
    const gameContainer = document.getElementById("game-container");
    if (!gameContainer) {
      throw new Error("Game container element not found");
    }

    // Pixi'VNの初期化
    Game.init(gameContainer, {
      width: 1280,
      height: 720,
      backgroundColor: "#1a1a2e",
    });

    // キャラクター登録
    RegisteredCharacters.add({
      id: "nanatau",
      name: "ななたう",
      color: "#FFE4E1",
    });

    RegisteredCharacters.add({
      id: "protagonist",
      name: "主人公",
      color: "#4A90E2",
    });

    RegisteredCharacters.add({
      id: "system",
      name: "システム",
      color: "#DDDDDD",
    });

    // 高度なシステムを初期化
    HistorySystem.initialize();
    await AdvancedAssetManager.initialize(); // AssetMappingStrategyも内部で初期化される
    InputCollectionSystem.initialize();
    ScenarioIntegrationSystem.initialize();
    AssetGenerationGuide.initialize();
    QuickMenuSystem.initialize();
    SkipAutoSystem.initialize();

    // UIシステムを初期化
    SplashScreenSystem.initialize();
    TitleScreenSystem.initialize();
    OpeningSequenceSystem.initialize();

    // ゲームUIを作成
    const gameUI = createGameUI();
    document.body.appendChild(gameUI);

    // オープニングシーケンス開始時にゲーム開始イベントをリッスン
    window.addEventListener("gameSequenceStart", async () => {
      console.log("🎮 Game sequence start event received");
      
      // クイックメニューを有効化
      QuickMenuSystem.setEnabled(true);
      
      // 最初のシナリオを読み込み
      const prologueScenario = await loadScenarioFile("00_prologue");
      const firstScene = prologueScenario.scenes[0];

      if (firstScene) {
        await handleDialogueScene(firstScene);
      }
    });

    // スキップ・オート関連イベントリスナー
    window.addEventListener("skipNext", () => {
      nextScene();
    });

    window.addEventListener("autoNext", () => {
      nextScene();
    });

    // クイックメニューからのスキップ・オート切り替え
    window.addEventListener("toggleSkipMode", () => {
      SkipAutoSystem.toggleSkipMode();
    });

    window.addEventListener("toggleAutoMode", () => {
      SkipAutoSystem.toggleAutoMode();
    });

    // タイトル復帰イベント
    window.addEventListener("returnToTitle", async () => {
      console.log("🏠 Returning to title screen...");
      
      // 全システムを停止
      SkipAutoSystem.stopAllModes();
      QuickMenuSystem.setEnabled(false);
      QuickMenuSystem.forceHide();
      
      // タイトル画面を表示
      await TitleScreenSystem.showTitleScreen();
    });

    // オープニングシーケンスを開始
    await OpeningSequenceSystem.runOpeningSequence();

    // グローバルに公開
    window.Game = Game;
    window.narration = narration;
    window.gameState = gameState;

    console.log("🎉 Game initialization completed successfully!");
    console.log(
      "ゲームが開始されました！続けるボタンをクリックしてゲームを進めてください。"
    );
  } catch (error) {
    console.error("Game initialization failed:", error);
  }
}

// ゲーム開始
initializeGame();
