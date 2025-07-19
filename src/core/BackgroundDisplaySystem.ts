/**
 * 背景表示システム - 背景画像の表示と管理
 */

import PixiVN from "@drincs/pixi-vn";
import type { GameConfig } from "../types/core.js";
import type { IBackgroundDisplaySystem } from "../types/interfaces.js";

export interface BackgroundTransition {
  /** トランジション時間（ミリ秒） */
  duration?: number;
  /** トランジションタイプ */
  type?: "fade" | "slide" | "zoom" | "instant";
  /** スライド方向（slide使用時） */
  slideDirection?: "left" | "right" | "up" | "down";
  /** イージング関数 */
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface BackgroundConfig {
  /** 背景画像のパス */
  imagePath: string;
  /** フィット方式 */
  fitMode?: "cover" | "contain" | "fill" | "stretch";
  /** 位置調整 */
  position?: {
    x: number;
    y: number;
  };
  /** スケール */
  scale?: number;
  /** 不透明度 */
  alpha?: number;
  /** フィルター効果 */
  filters?: string[];
}

export class BackgroundDisplaySystem implements IBackgroundDisplaySystem {
  private config: GameConfig;
  private currentBackground: any = null; // Pixi'VNの背景オブジェクト
  private backgroundHistory: string[] = [];
  private preloadedBackgrounds: Map<string, any> = new Map();

  constructor(config: GameConfig) {
    this.config = config;
  }

  /**
   * 背景表示システムの初期化
   */
  async initialize(): Promise<void> {
    console.log("BackgroundDisplaySystem initialized");
  }

  /**
   * 背景の表示
   */
  async showBackground(
    imagePath: string,
    backgroundConfig: Partial<BackgroundConfig> = {},
    transition: BackgroundTransition = {}
  ): Promise<void> {
    try {
      const config = {
        imagePath,
        fitMode: "cover",
        alpha: 1,
        ...backgroundConfig,
      } as BackgroundConfig;

      // 前の背景を保存（履歴用）
      if (this.currentBackground && imagePath !== this.backgroundHistory[this.backgroundHistory.length - 1]) {
        this.backgroundHistory.push(this.backgroundHistory[this.backgroundHistory.length - 1] || "");
        // 履歴サイズ制限（最大10個）
        if (this.backgroundHistory.length > 10) {
          this.backgroundHistory.shift();
        }
      }

      // トランジションタイプに応じた表示処理
      switch (transition.type) {
        case "fade":
          await this.fadeTransition(config, transition);
          break;
        case "slide":
          await this.slideTransition(config, transition);
          break;
        case "zoom":
          await this.zoomTransition(config, transition);
          break;
        case "instant":
        default:
          await this.instantTransition(config);
          break;
      }

      // 履歴に追加
      this.backgroundHistory.push(imagePath);

      console.log(`Background displayed: ${imagePath}`);
    } catch (error) {
      console.error(`Failed to show background: ${imagePath}`, error);
    }
  }

  /**
   * 瞬間的な背景切り替え
   */
  private async instantTransition(config: BackgroundConfig): Promise<void> {
    // TODO: Pixi'VN APIでの背景表示実装
    // 古い背景を削除
    if (this.currentBackground) {
      // PixiVN.background.hide();
      console.log("Hide current background");
    }

    // 新しい背景を表示
    // this.currentBackground = await PixiVN.background.show(config.imagePath);
    this.currentBackground = { imagePath: config.imagePath }; // 仮実装
    
    if (this.currentBackground) {
      this.applyBackgroundConfig(this.currentBackground, config);
    }
  }

  /**
   * フェードトランジション
   */
  private async fadeTransition(config: BackgroundConfig, transition: BackgroundTransition): Promise<void> {
    const duration = transition.duration || 1000;

    // TODO: 新しい背景を非表示状態で作成
    // const newBackground = await PixiVN.background.show(config.imagePath);
    const newBackground = { imagePath: config.imagePath, alpha: 0 }; // 仮実装
    if (!newBackground) return;

    newBackground.alpha = 0;
    this.applyBackgroundConfig(newBackground, config);

    // フェードイン
    await this.animateAlpha(newBackground, 0, config.alpha || 1, duration);

    // 古い背景をフェードアウトして削除
    if (this.currentBackground) {
      await this.animateAlpha(this.currentBackground, this.currentBackground.alpha, 0, duration / 2);
      PixiVN.background.hide();
    }

    this.currentBackground = newBackground;
  }

  /**
   * スライドトランジション
   */
  private async slideTransition(config: BackgroundConfig, transition: BackgroundTransition): Promise<void> {
    const duration = transition.duration || 800;
    const direction = transition.slideDirection || "left";
    const screenWidth = this.config.screenWidth || 1280;
    const screenHeight = this.config.screenHeight || 720;

    // 新しい背景の初期位置を設定
    const newBackground = await PixiVN.background.show(config.imagePath);
    if (!newBackground) return;

    let startX = 0;
    let startY = 0;
    let targetX = 0;
    let targetY = 0;

    switch (direction) {
      case "left":
        startX = screenWidth;
        break;
      case "right":
        startX = -screenWidth;
        break;
      case "up":
        startY = screenHeight;
        break;
      case "down":
        startY = -screenHeight;
        break;
    }

    newBackground.x = startX;
    newBackground.y = startY;
    this.applyBackgroundConfig(newBackground, config);

    // スライドアニメーション
    await this.animatePosition(newBackground, startX, startY, targetX, targetY, duration);

    // 古い背景を削除
    if (this.currentBackground && this.currentBackground !== newBackground) {
      PixiVN.background.hide();
    }

    this.currentBackground = newBackground;
  }

  /**
   * ズームトランジション
   */
  private async zoomTransition(config: BackgroundConfig, transition: BackgroundTransition): Promise<void> {
    const duration = transition.duration || 600;

    // 新しい背景を小さくして表示
    const newBackground = await PixiVN.background.show(config.imagePath);
    if (!newBackground) return;

    const targetScale = config.scale || 1;
    newBackground.scale.set(0.5);
    newBackground.alpha = 0;
    this.applyBackgroundConfig(newBackground, { ...config, scale: 0.5, alpha: 0 });

    // ズームイン＆フェードイン
    await Promise.all([
      this.animateScale(newBackground, 0.5, targetScale, duration),
      this.animateAlpha(newBackground, 0, config.alpha || 1, duration)
    ]);

    // 古い背景を削除
    if (this.currentBackground && this.currentBackground !== newBackground) {
      PixiVN.background.hide();
    }

    this.currentBackground = newBackground;
  }

  /**
   * 背景設定の適用
   */
  private applyBackgroundConfig(background: any, config: BackgroundConfig): void {
    if (config.position) {
      background.x = config.position.x;
      background.y = config.position.y;
    }

    if (config.scale !== undefined) {
      background.scale.set(config.scale);
    }

    if (config.alpha !== undefined) {
      background.alpha = config.alpha;
    }

    // フィット方式の適用
    if (config.fitMode) {
      this.applyFitMode(background, config.fitMode);
    }

    // フィルター効果の適用
    if (config.filters && config.filters.length > 0) {
      this.applyFilters(background, config.filters);
    }
  }

  /**
   * フィット方式の適用
   */
  private applyFitMode(background: any, fitMode: string): void {
    const screenWidth = this.config.screenWidth || 1280;
    const screenHeight = this.config.screenHeight || 720;

    switch (fitMode) {
      case "cover":
        // 画面を覆うようにスケール（アスペクト比維持）
        const scaleX = screenWidth / background.texture.width;
        const scaleY = screenHeight / background.texture.height;
        const scale = Math.max(scaleX, scaleY);
        background.scale.set(scale);
        break;
      case "contain":
        // 画面に収まるようにスケール（アスペクト比維持）
        const containScaleX = screenWidth / background.texture.width;
        const containScaleY = screenHeight / background.texture.height;
        const containScale = Math.min(containScaleX, containScaleY);
        background.scale.set(containScale);
        break;
      case "fill":
        // 画面全体に引き伸ばし
        background.width = screenWidth;
        background.height = screenHeight;
        break;
      case "stretch":
        // アスペクト比を無視して引き伸ばし
        background.scale.x = screenWidth / background.texture.width;
        background.scale.y = screenHeight / background.texture.height;
        break;
    }
  }

  /**
   * フィルター効果の適用
   */
  private applyFilters(background: any, filters: string[]): void {
    // TODO: フィルター効果の実装
    console.log("Applying filters:", filters);
  }

  /**
   * 背景の非表示
   */
  async hideBackground(transition: BackgroundTransition = {}): Promise<void> {
    if (!this.currentBackground) {
      console.warn("No background to hide");
      return;
    }

    try {
      const duration = transition.duration || 500;

      switch (transition.type) {
        case "fade":
          await this.animateAlpha(this.currentBackground, this.currentBackground.alpha, 0, duration);
          break;
        case "slide":
          const direction = transition.slideDirection || "left";
          const screenWidth = this.config.screenWidth || 1280;
          const screenHeight = this.config.screenHeight || 720;
          
          let targetX = 0;
          let targetY = 0;

          switch (direction) {
            case "left":
              targetX = -screenWidth;
              break;
            case "right":
              targetX = screenWidth;
              break;
            case "up":
              targetY = -screenHeight;
              break;
            case "down":
              targetY = screenHeight;
              break;
          }

          await this.animatePosition(
            this.currentBackground,
            this.currentBackground.x,
            this.currentBackground.y,
            targetX,
            targetY,
            duration
          );
          break;
        case "zoom":
          await Promise.all([
            this.animateScale(this.currentBackground, this.currentBackground.scale.x, 0, duration),
            this.animateAlpha(this.currentBackground, this.currentBackground.alpha, 0, duration)
          ]);
          break;
        case "instant":
        default:
          // 即座に非表示
          break;
      }

      PixiVN.background.hide();
      this.currentBackground = null;

      console.log("Background hidden");
    } catch (error) {
      console.error("Failed to hide background:", error);
    }
  }

  /**
   * 背景のプリロード
   */
  async preloadBackground(imagePath: string): Promise<void> {
    try {
      // TODO: 画像のプリロード実装
      console.log(`Background preloaded: ${imagePath}`);
    } catch (error) {
      console.error(`Failed to preload background: ${imagePath}`, error);
    }
  }

  /**
   * 前の背景に戻る
   */
  async goToPreviousBackground(transition: BackgroundTransition = {}): Promise<void> {
    if (this.backgroundHistory.length < 2) {
      console.warn("No previous background available");
      return;
    }

    // 現在の背景を履歴から削除
    this.backgroundHistory.pop();
    // 前の背景を取得
    const previousBackground = this.backgroundHistory.pop();

    if (previousBackground) {
      await this.showBackground(previousBackground, {}, transition);
    }
  }

  /**
   * アルファ値アニメーション
   */
  private async animateAlpha(sprite: any, fromAlpha: number, toAlpha: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sprite.alpha = fromAlpha + (toAlpha - fromAlpha) * progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 位置アニメーション
   */
  private async animatePosition(
    sprite: any,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        sprite.x = fromX + (toX - fromX) * progress;
        sprite.y = fromY + (toY - fromY) * progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * スケールアニメーション
   */
  private async animateScale(sprite: any, fromScale: number, toScale: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentScale = fromScale + (toScale - fromScale) * progress;
        sprite.scale.set(currentScale);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 現在の背景情報を取得
   */
  getCurrentBackground(): string | null {
    return this.backgroundHistory.length > 0 ? this.backgroundHistory[this.backgroundHistory.length - 1] : null;
  }

  /**
   * 背景履歴を取得
   */
  getBackgroundHistory(): string[] {
    return [...this.backgroundHistory];
  }

  /**
   * 背景が表示中かどうかを確認
   */
  isBackgroundDisplayed(): boolean {
    return this.currentBackground !== null;
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.hideBackground({ type: "instant" });
    this.backgroundHistory = [];
    this.preloadedBackgrounds.clear();
    console.log("BackgroundDisplaySystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.reset();
    console.log("BackgroundDisplaySystem disposed");
  }
}