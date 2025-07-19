/**
 * タイトル画面システム - ゲーム開始時の初期画面
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig } from "../types/core.js";
import type { ITitleScreenSystem } from "./interfaces.js";

export interface TitleScreenConfig {
  /** 背景設定 */
  background: {
    imagePath?: string;
    color?: string;
    videoPath?: string;
  };
  /** タイトルロゴ設定 */
  titleLogo: {
    imagePath?: string;
    text: string;
    position: { x: number; y: number };
    fontSize: number;
    fontFamily: string;
    color: string;
  };
  /** アニメーション設定 */
  animation: {
    logoFadeInDuration: number;
    logoFadeInDelay: number;
    pressKeyFadeInDuration: number;
    pressKeyFadeInDelay: number;
    pressKeyBlinkInterval: number;
  };
  /** オープニング動画設定 */
  openingVideo: {
    path?: string;
    skipable: boolean;
    autoPlay: boolean;
  };
}

export class TitleScreenSystem implements ITitleScreenSystem {
  private titleConfig: TitleScreenConfig;
  private isVisible: boolean = false;
  private isInitialized: boolean = false;
  private isVideoPlaying: boolean = false;

  // UI要素
  private containerElement: HTMLElement | null = null;
  private backgroundElement: HTMLElement | null = null;
  private titleLogoElement: HTMLElement | null = null;
  private pressKeyElement: HTMLElement | null = null;
  private videoElement: HTMLVideoElement | null = null;

  // アニメーション管理
  private blinkInterval: number | null = null;
  private fadeTimeout: number | null = null;

  // 外部システムとの連携
  private onTitleClickCallback: (() => Promise<void>) | undefined = undefined;
  private onVideoEndCallback: (() => Promise<void>) | undefined = undefined;
  private onVideoSkipCallback: (() => Promise<void>) | undefined = undefined;

  constructor(
    _gameConfig: GameConfig,
    titleConfig?: Partial<TitleScreenConfig>
  ) {
    this.titleConfig = {
      background: {
        color: "#0f0f23",
      },
      titleLogo: {
        text: "ななたう",
        position: { x: 50, y: 30 }, // パーセンテージ
        fontSize: 64,
        fontFamily: "Noto Sans JP, Arial, sans-serif",
        color: "#ffffff",
      },
      animation: {
        logoFadeInDuration: 2000,
        logoFadeInDelay: 1000,
        pressKeyFadeInDuration: 1000,
        pressKeyFadeInDelay: 3000,
        pressKeyBlinkInterval: 2000,
      },
      openingVideo: {
        skipable: true,
        autoPlay: false,
      },
      ...titleConfig,
    };
  }

  /**
   * システムの初期化
   */
  async initialize(): Promise<void> {
    try {
      // コンテナ要素の作成
      this.createContainerElement();

      // UI要素の初期化
      await this.initializeUIElements();

      // イベントリスナーの設定
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("TitleScreenSystem initialized");
    } catch (error) {
      console.error("Failed to initialize TitleScreenSystem:", error);
      throw error;
    }
  }

  /**
   * タイトル画面の表示
   */
  async showTitleScreen(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("TitleScreenSystem not initialized");
    }

    if (this.isVisible) {
      console.warn("Title screen is already visible");
      return;
    }

    try {
      // コンテナを表示
      if (this.containerElement) {
        this.containerElement.style.display = "block";
      }

      // オープニング動画の自動再生チェック
      if (
        this.titleConfig.openingVideo.autoPlay &&
        this.titleConfig.openingVideo.path
      ) {
        await this.playOpeningVideo();
      } else {
        // タイトル画面のアニメーション開始
        await this.startTitleAnimation();
      }

      this.isVisible = true;
      console.log("Title screen shown");
    } catch (error) {
      console.error("Failed to show title screen:", error);
      throw error;
    }
  }

  /**
   * タイトル画面の非表示
   */
  async hideTitleScreen(): Promise<void> {
    if (!this.isVisible) {
      console.warn("Title screen is not visible");
      return;
    }

    try {
      // アニメーションの停止
      this.stopAnimations();

      // フェードアウト
      await this.fadeOut();

      // コンテナを非表示
      if (this.containerElement) {
        this.containerElement.style.display = "none";
      }

      this.isVisible = false;
      console.log("Title screen hidden");
    } catch (error) {
      console.error("Failed to hide title screen:", error);
      throw error;
    }
  }

  /**
   * オープニング動画の再生
   */
  async playOpeningVideo(): Promise<void> {
    if (!this.titleConfig.openingVideo.path) {
      console.warn("No opening video path specified");
      return;
    }

    try {
      console.log("Playing opening video");

      // 動画要素の作成と設定
      await this.setupVideoElement();

      if (this.videoElement) {
        this.isVideoPlaying = true;

        // 動画を表示して再生
        this.videoElement.style.display = "block";
        await this.videoElement.play();
      }
    } catch (error) {
      console.error("Failed to play opening video:", error);
      // 動画再生に失敗した場合、タイトル画面にフォールバック
      await this.onVideoEnd();
    }
  }

  /**
   * タイトル画面の状態確認
   */
  isTitleScreenVisible(): boolean {
    return this.isVisible;
  }

  /**
   * 動画再生中かどうかの確認
   */
  isVideoCurrentlyPlaying(): boolean {
    return this.isVideoPlaying;
  }

  /**
   * コールバック関数の設定
   */
  setCallbacks(callbacks: {
    onTitleClick?: () => Promise<void>;
    onVideoEnd?: () => Promise<void>;
    onVideoSkip?: () => Promise<void>;
  }): void {
    this.onTitleClickCallback = callbacks.onTitleClick;
    this.onVideoEndCallback = callbacks.onVideoEnd;
    this.onVideoSkipCallback = callbacks.onVideoSkip;
  }

  /**
   * コンテナ要素の作成
   */
  private createContainerElement(): void {
    if (typeof document === "undefined") {
      console.warn("DOM not available");
      return;
    }

    this.containerElement = document.createElement("div");
    this.containerElement.id = "title-screen-container";
    this.containerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      z-index: 1000;
      font-family: ${this.titleConfig.titleLogo.fontFamily};
      overflow: hidden;
    `;

    document.body.appendChild(this.containerElement);
  }

  /**
   * UI要素の初期化
   */
  private async initializeUIElements(): Promise<void> {
    if (!this.containerElement) {
      throw new Error("Container element not created");
    }

    // 背景要素の作成
    this.createBackgroundElement();

    // タイトルロゴの作成
    this.createTitleLogo();

    // "Press any key"テキストの作成
    this.createPressKeyText();
  }

  /**
   * 背景要素の作成
   */
  private createBackgroundElement(): void {
    if (!this.containerElement) return;

    this.backgroundElement = document.createElement("div");
    this.backgroundElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    `;

    // 背景設定の適用
    if (this.titleConfig.background.imagePath) {
      this.backgroundElement.style.backgroundImage = `url(${this.titleConfig.background.imagePath})`;
      this.backgroundElement.style.backgroundSize = "cover";
      this.backgroundElement.style.backgroundPosition = "center";
      this.backgroundElement.style.backgroundRepeat = "no-repeat";
    } else if (this.titleConfig.background.color) {
      this.backgroundElement.style.background =
        this.titleConfig.background.color;
    }

    // グラデーションオーバーレイ
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
    `;

    this.backgroundElement.appendChild(overlay);
    this.containerElement.appendChild(this.backgroundElement);
  }

  /**
   * タイトルロゴの作成
   */
  private createTitleLogo(): void {
    if (!this.containerElement) return;

    this.titleLogoElement = document.createElement("div");
    this.titleLogoElement.style.cssText = `
      position: absolute;
      left: ${this.titleConfig.titleLogo.position.x}%;
      top: ${this.titleConfig.titleLogo.position.y}%;
      transform: translate(-50%, -50%);
      z-index: 3;
      opacity: 0;
      transition: opacity ${this.titleConfig.animation.logoFadeInDuration}ms ease;
    `;

    if (this.titleConfig.titleLogo.imagePath) {
      // 画像ロゴの場合
      const logoImage = document.createElement("img");
      logoImage.src = this.titleConfig.titleLogo.imagePath;
      logoImage.style.cssText = `
        max-width: 100%;
        height: auto;
        user-select: none;
        filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.5));
      `;
      this.titleLogoElement.appendChild(logoImage);
    } else {
      // テキストロゴの場合
      this.titleLogoElement.style.cssText += `
        font-size: ${this.titleConfig.titleLogo.fontSize}px;
        font-family: ${this.titleConfig.titleLogo.fontFamily};
        color: ${this.titleConfig.titleLogo.color};
        font-weight: bold;
        text-align: center;
        text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.7);
        user-select: none;
        letter-spacing: 4px;
      `;
      this.titleLogoElement.textContent = this.titleConfig.titleLogo.text;
    }

    this.containerElement.appendChild(this.titleLogoElement);
  }

  /**
   * "Press any key"テキストの作成
   */
  private createPressKeyText(): void {
    if (!this.containerElement) return;

    this.pressKeyElement = document.createElement("div");
    this.pressKeyElement.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: 15%;
      transform: translateX(-50%);
      z-index: 3;
      opacity: 0;
      transition: opacity ${this.titleConfig.animation.pressKeyFadeInDuration}ms ease;
      font-size: 18px;
      color: ${this.titleConfig.titleLogo.color};
      text-align: center;
      user-select: none;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
    `;
    this.pressKeyElement.textContent = "クリックまたはキーを押してください";

    this.containerElement.appendChild(this.pressKeyElement);
  }

  /**
   * 動画要素のセットアップ
   */
  private async setupVideoElement(): Promise<void> {
    if (!this.containerElement || !this.titleConfig.openingVideo.path) return;

    // 既存の動画要素を削除
    if (this.videoElement) {
      this.videoElement.remove();
    }

    this.videoElement = document.createElement("video");
    this.videoElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 2;
      display: none;
    `;

    this.videoElement.src = this.titleConfig.openingVideo.path;
    this.videoElement.muted = false; // 音声ありで再生
    this.videoElement.preload = "auto";

    // 動画イベントリスナー
    this.videoElement.addEventListener("ended", () => {
      this.onVideoEnd();
    });

    this.videoElement.addEventListener("error", (error) => {
      console.error("Video playback error:", error);
      this.onVideoEnd(); // エラー時もタイトル画面に移行
    });

    // スキップ可能な場合の処理
    if (this.titleConfig.openingVideo.skipable) {
      const skipButton = document.createElement("button");
      skipButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: #ffffff;
        font-size: 14px;
        padding: 8px 16px;
        cursor: pointer;
        z-index: 4;
        transition: background 0.2s ease;
      `;
      skipButton.textContent = "スキップ";
      skipButton.addEventListener("click", () => {
        this.skipVideo();
      });

      skipButton.addEventListener("mouseenter", () => {
        skipButton.style.background = "rgba(0, 0, 0, 0.9)";
      });

      skipButton.addEventListener("mouseleave", () => {
        skipButton.style.background = "rgba(0, 0, 0, 0.7)";
      });

      this.containerElement.appendChild(skipButton);
    }

    this.containerElement.appendChild(this.videoElement);
  }

  /**
   * 動画終了時の処理
   */
  private async onVideoEnd(): Promise<void> {
    this.isVideoPlaying = false;

    if (this.videoElement) {
      this.videoElement.style.display = "none";
    }

    // タイトル画面のアニメーション開始
    await this.startTitleAnimation();

    if (this.onVideoEndCallback) {
      await this.onVideoEndCallback();
    }
  }

  /**
   * 動画スキップ処理
   */
  private async skipVideo(): Promise<void> {
    if (!this.isVideoPlaying) return;

    console.log("Skipping opening video");

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
    }

    await this.onVideoEnd();

    if (this.onVideoSkipCallback) {
      await this.onVideoSkipCallback();
    }
  }

  /**
   * タイトル画面アニメーションの開始
   */
  private async startTitleAnimation(): Promise<void> {
    // ロゴのフェードイン
    if (this.titleLogoElement) {
      setTimeout(() => {
        this.titleLogoElement!.style.opacity = "1";
      }, this.titleConfig.animation.logoFadeInDelay);
    }

    // "Press any key"のフェードイン
    if (this.pressKeyElement) {
      setTimeout(() => {
        this.pressKeyElement!.style.opacity = "1";

        // 点滅アニメーション開始
        this.startBlinkAnimation();
      }, this.titleConfig.animation.pressKeyFadeInDelay);
    }
  }

  /**
   * 点滅アニメーションの開始
   */
  private startBlinkAnimation(): void {
    if (!this.pressKeyElement) return;

    this.blinkInterval = window.setInterval(() => {
      if (this.pressKeyElement) {
        this.pressKeyElement.style.opacity =
          this.pressKeyElement.style.opacity === "0.3" ? "1" : "0.3";
      }
    }, this.titleConfig.animation.pressKeyBlinkInterval);
  }

  /**
   * タイトルクリック処理
   */
  private async handleTitleClick(): Promise<void> {
    if (this.isVideoPlaying) {
      // 動画再生中の場合はスキップ
      await this.skipVideo();
      return;
    }

    try {
      console.log("Title screen clicked");

      if (this.onTitleClickCallback) {
        await this.onTitleClickCallback();
      }
    } catch (error) {
      console.error("Failed to handle title click:", error);
    }
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    // キーボード・マウスイベント
    const handleInteraction = (event: KeyboardEvent | MouseEvent) => {
      if (!this.isVisible) return;

      // 特定のキー以外は無視
      if (event instanceof KeyboardEvent) {
        const ignoreKeys = [
          "F1",
          "F2",
          "F3",
          "F4",
          "F5",
          "F6",
          "F7",
          "F8",
          "F9",
          "F10",
          "F11",
          "F12",
        ];
        if (ignoreKeys.includes(event.key)) return;
      }

      event.preventDefault();
      this.handleTitleClick();
    };

    // クリックイベント（コンテナ全体）
    if (this.containerElement) {
      this.containerElement.addEventListener("click", handleInteraction);
    }

    // キーボードイベント
    window.addEventListener("keydown", handleInteraction);
  }

  /**
   * フェードアウト処理
   */
  private async fadeOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      this.containerElement.style.transition = "opacity 500ms ease";
      this.containerElement.style.opacity = "0";

      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  /**
   * アニメーションの停止
   */
  private stopAnimations(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }

    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.isVisible = false;
    this.isVideoPlaying = false;

    // アニメーションの停止
    this.stopAnimations();

    // 動画の停止
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.currentTime = 0;
      this.videoElement.style.display = "none";
    }

    if (this.containerElement) {
      this.containerElement.style.display = "none";
      this.containerElement.style.opacity = "1";
    }

    // UI要素の初期化
    if (this.titleLogoElement) {
      this.titleLogoElement.style.opacity = "0";
    }

    if (this.pressKeyElement) {
      this.pressKeyElement.style.opacity = "0";
    }

    console.log("TitleScreenSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    // アニメーションとタイマーの停止
    this.stopAnimations();

    // 動画要素の削除
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.remove();
      this.videoElement = null;
    }

    // DOM要素の削除
    if (this.containerElement && this.containerElement.parentNode) {
      this.containerElement.parentNode.removeChild(this.containerElement);
    }

    // 参照の削除
    this.containerElement = null;
    this.backgroundElement = null;
    this.titleLogoElement = null;
    this.pressKeyElement = null;

    this.isInitialized = false;
    this.isVisible = false;
    this.isVideoPlaying = false;

    console.log("TitleScreenSystem disposed");
  }
}
