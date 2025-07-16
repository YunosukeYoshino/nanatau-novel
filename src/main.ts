import { Application } from "pixi.js";
import PixiVN from "@drincs/pixi-vn";

// アプリケーションの初期化
const app = new Application({
  width: 1280,
  height: 720,
  backgroundColor: 0x1a1a2e,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

// Canvasを取得してアプリケーションに追加
const canvas = document.getElementById("pixi-canvas") as HTMLCanvasElement;
if (canvas) {
  canvas.replaceWith(app.view as HTMLCanvasElement);
} else {
  document.body.appendChild(app.view as HTMLCanvasElement);
}

// Pixi'VNの初期化
PixiVN.initialize(app, {
  width: 1280,
  height: 720,
});

// ゲームの開始
async function startGame() {
  try {
    console.log("ななたう - 硝子の心、たう（届く）まで");
    console.log("Pixi'VN Engine initialized successfully!");

    // 基本的なテキスト表示のテスト
    PixiVN.dialogue.text = "ななたう - 硝子の心、たう（届く）まで";
    PixiVN.dialogue.character = "システム";

    // 画面を更新
    PixiVN.run();
  } catch (error) {
    console.error("Game initialization failed:", error);
  }
}

// ゲーム開始
startGame();
