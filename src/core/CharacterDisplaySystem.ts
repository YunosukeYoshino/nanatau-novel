/**
 * キャラクター表示システム - 立ち絵の表示と管理
 */

// TODO: Phase 5 - import PixiVN from "@drincs/pixi-vn";
import type { GameConfig } from "../types/core.js";
import type {
  ICharacterDisplaySystem,
  SpriteObject,
} from "../types/interfaces.js";

export interface CharacterData {
  /** キャラクターID */
  id: string;
  /** 表示名 */
  name: string;
  /** ベース画像のパス */
  basePath: string;
  /** 表情バリエーション */
  expressions: Record<string, string>;
  /** デフォルトの表情 */
  defaultExpression: string;
  /** 表示位置 */
  position?: {
    x: number;
    y: number;
  };
  /** 表示サイズ */
  scale?: number;
}

export interface CharacterPosition {
  /** 表示位置（left, center, right など） */
  position: "left" | "center" | "right" | "far-left" | "far-right";
  /** X座標のオフセット */
  offsetX?: number;
  /** Y座標のオフセット */
  offsetY?: number;
  /** スケール */
  scale?: number;
  /** 不透明度 */
  alpha?: number;
}

export interface CharacterTransition {
  /** トランジション時間（ミリ秒） */
  duration?: number;
  /** イージング関数 */
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  /** フェード効果 */
  fade?: boolean;
  /** スライド効果 */
  slide?: boolean;
}

export class CharacterDisplaySystem implements ICharacterDisplaySystem {
  private config: GameConfig;
  private characters: Map<string, CharacterData> = new Map();
  private displayedCharacters: Map<string, SpriteObject> = new Map(); // Pixi'VNのキャラクターオブジェクト
  private characterPositions: Map<string, CharacterPosition> = new Map();

  constructor(config: GameConfig) {
    this.config = config;
    this.initializePositions();
  }

  /**
   * キャラクター表示システムの初期化
   */
  async initialize(): Promise<void> {
    console.log("CharacterDisplaySystem initialized");
  }

  /**
   * 基本位置の初期化
   */
  private initializePositions(): void {
    const screenWidth = this.config.screenWidth || 1280;
    const positions: Record<string, CharacterPosition> = {
      "far-left": { position: "far-left", offsetX: screenWidth * 0.1 },
      left: { position: "left", offsetX: screenWidth * 0.25 },
      center: { position: "center", offsetX: screenWidth * 0.5 },
      right: { position: "right", offsetX: screenWidth * 0.75 },
      "far-right": { position: "far-right", offsetX: screenWidth * 0.9 },
    };

    for (const [key, pos] of Object.entries(positions)) {
      this.characterPositions.set(key, pos);
    }
  }

  /**
   * キャラクターデータの登録
   */
  registerCharacter(characterData: CharacterData): void {
    this.characters.set(characterData.id, characterData);
    console.log(`Character registered: ${characterData.id}`);
  }

  /**
   * キャラクターの表示
   */
  async showCharacter(
    characterId: string,
    expression: string = "default",
    position: string = "center",
    transition: CharacterTransition = {}
  ): Promise<void> {
    const character = this.characters.get(characterId);
    if (!character) {
      console.warn(`Character not found: ${characterId}`);
      return;
    }

    try {
      // 表情の取得
      const expressionPath =
        character.expressions[expression] ||
        character.expressions[character.defaultExpression];
      if (!expressionPath) {
        console.warn(
          `Expression not found: ${expression} for character ${characterId}`
        );
        return;
      }

      // 画像パスの構築
      const imagePath = `${character.basePath}/${expressionPath}`;
      console.log(
        `Loading character sprite: ${characterId} with image: ${imagePath}`
      );

      // TODO: Phase 5 - Pixi'VNでキャラクターを表示
      // const characterSprite = await PixiVN.character.show(characterId, imagePath);
      const characterSprite: SpriteObject = {
        x: 0,
        y: 0,
        scale: { set: () => {} },
        alpha: 1,
        imagePath,
      }; // 仮実装

      // 位置の設定
      const charPosition = this.getCharacterPosition(position);
      if (charPosition && characterSprite) {
        const posX = charPosition.offsetX || 0;
        const posY = charPosition.offsetY || 0;
        const scale = charPosition.scale || character.scale || 1;
        const alpha = charPosition.alpha || 1;

        characterSprite.x = posX;
        characterSprite.y = posY;
        characterSprite.scale.set(scale);
        characterSprite.alpha = alpha;

        // トランジション効果の適用
        if (transition.fade) {
          characterSprite.alpha = 0;
          await this.fadeIn(characterSprite, transition.duration || 500);
        }

        if (transition.slide) {
          const originalX = characterSprite.x;
          characterSprite.x = originalX - 200; // スライド開始位置
          await this.slideIn(
            characterSprite,
            originalX,
            transition.duration || 500
          );
        }
      }

      // 表示中キャラクターリストに追加
      this.displayedCharacters.set(characterId, characterSprite);

      console.log(
        `Character displayed: ${characterId} with expression: ${expression} at position: ${position}`
      );
    } catch (error) {
      console.error(`Failed to show character: ${characterId}`, error);
    }
  }

  /**
   * キャラクターの非表示
   */
  async hideCharacter(
    characterId: string,
    transition: CharacterTransition = {}
  ): Promise<void> {
    const characterSprite = this.displayedCharacters.get(characterId);
    if (!characterSprite) {
      console.warn(`Character not displayed: ${characterId}`);
      return;
    }

    try {
      // トランジション効果の適用
      if (transition.fade) {
        await this.fadeOut(characterSprite, transition.duration || 500);
      }

      if (transition.slide) {
        await this.slideOut(characterSprite, transition.duration || 500);
      }

      // TODO: Phase 5 - Pixi'VNでキャラクターを非表示
      // await PixiVN.character.hide(characterId);
      console.log(`Character hidden: ${characterId}`);

      // 表示中キャラクターリストから削除
      this.displayedCharacters.delete(characterId);

      console.log(`Character hidden: ${characterId}`);
    } catch (error) {
      console.error(`Failed to hide character: ${characterId}`, error);
    }
  }

  /**
   * キャラクターの表情変更
   */
  async changeExpression(
    characterId: string,
    expression: string,
    transition: CharacterTransition = {}
  ): Promise<void> {
    const character = this.characters.get(characterId);
    const characterSprite = this.displayedCharacters.get(characterId);

    if (!character || !characterSprite) {
      console.warn(`Character not found or not displayed: ${characterId}`);
      return;
    }

    try {
      // 新しい表情の取得
      const expressionPath =
        character.expressions[expression] ||
        character.expressions[character.defaultExpression];
      if (!expressionPath) {
        console.warn(
          `Expression not found: ${expression} for character ${characterId}`
        );
        return;
      }

      // TODO: Phase 5 - トランジション効果付きで表情変更
      const imagePath = `${character.basePath}/${expressionPath}`;
      console.log(`Expression change to: ${imagePath}`);

      if (transition.fade) {
        await this.fadeOut(characterSprite, (transition.duration || 300) / 2);
        // TODO: Phase 5 - 画像の更新 PixiVN APIでimagePathを使用
        console.log(`Updated sprite with: ${imagePath}`);
        await this.fadeIn(characterSprite, (transition.duration || 300) / 2);
      } else {
        // TODO: Phase 5 - 即座に画像更新 PixiVN APIでimagePathを使用
        console.log(`Instantly updated sprite with: ${imagePath}`);
      }

      console.log(
        `Character expression changed: ${characterId} to ${expression}`
      );
    } catch (error) {
      console.error(`Failed to change expression: ${characterId}`, error);
    }
  }

  /**
   * キャラクターの移動
   */
  async moveCharacter(
    characterId: string,
    newPosition: string,
    transition: CharacterTransition = {}
  ): Promise<void> {
    const characterSprite = this.displayedCharacters.get(characterId);
    if (!characterSprite) {
      console.warn(`Character not displayed: ${characterId}`);
      return;
    }

    const charPosition = this.getCharacterPosition(newPosition);
    if (!charPosition) {
      console.warn(`Position not found: ${newPosition}`);
      return;
    }

    try {
      const targetX = charPosition.offsetX || 0;
      const targetY = charPosition.offsetY || 0;
      const duration = transition.duration || 800;

      await this.animatePosition(characterSprite, targetX, targetY, duration);

      console.log(`Character moved: ${characterId} to ${newPosition}`);
    } catch (error) {
      console.error(`Failed to move character: ${characterId}`, error);
    }
  }

  /**
   * 全キャラクターの非表示
   */
  async hideAllCharacters(transition: CharacterTransition = {}): Promise<void> {
    const hidePromises = Array.from(this.displayedCharacters.keys()).map(
      (characterId) => this.hideCharacter(characterId, transition)
    );

    await Promise.all(hidePromises);
    console.log("All characters hidden");
  }

  /**
   * フェードイン効果
   */
  private async fadeIn(sprite: SpriteObject, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startAlpha = sprite.alpha;
      const targetAlpha = 1;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.alpha = startAlpha + (targetAlpha - startAlpha) * progress;

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
   * フェードアウト効果
   */
  private async fadeOut(sprite: SpriteObject, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startAlpha = sprite.alpha;
      const targetAlpha = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.alpha = startAlpha + (targetAlpha - startAlpha) * progress;

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
   * スライドイン効果
   */
  private async slideIn(
    sprite: SpriteObject,
    targetX: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startX = sprite.x;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.x = startX + (targetX - startX) * progress;

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
   * スライドアウト効果
   */
  private async slideOut(
    sprite: SpriteObject,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startX = sprite.x;
      const targetX = startX + 200;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.x = startX + (targetX - startX) * progress;

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
    sprite: SpriteObject,
    targetX: number,
    targetY: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startX = sprite.x;
      const startY = sprite.y;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        sprite.x = startX + (targetX - startX) * progress;
        sprite.y = startY + (targetY - startY) * progress;

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
   * キャラクター位置の取得
   */
  private getCharacterPosition(
    positionName: string
  ): CharacterPosition | undefined {
    return this.characterPositions.get(positionName);
  }

  /**
   * 表示中のキャラクター一覧を取得
   */
  getDisplayedCharacters(): string[] {
    return Array.from(this.displayedCharacters.keys());
  }

  /**
   * キャラクターが表示中かどうかを確認
   */
  isCharacterDisplayed(characterId: string): boolean {
    return this.displayedCharacters.has(characterId);
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.hideAllCharacters();
    console.log("CharacterDisplaySystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.hideAllCharacters();
    this.characters.clear();
    this.displayedCharacters.clear();
    console.log("CharacterDisplaySystem disposed");
  }
}
