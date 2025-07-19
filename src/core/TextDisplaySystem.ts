/**
 * テキスト表示システム - ゲーム内のテキスト表示を管理
 */

import PixiVN from "@drincs/pixi-vn";
import type { SceneData, DialogueData, GameConfig } from "../types/core.js";
import type { ITextDisplaySystem } from "../types/interfaces.js";

export interface TextDisplayOptions {
  /** テキスト表示速度（文字/秒） */
  textSpeed?: number;
  /** 自動進行の待機時間（ミリ秒） */
  autoAdvanceDelay?: number;
  /** 自動進行が有効かどうか */
  autoAdvanceEnabled?: boolean;
  /** テキストエフェクトが有効かどうか */
  textEffectsEnabled?: boolean;
}

export class TextDisplaySystem implements ITextDisplaySystem {
  private config: GameConfig;
  private options: TextDisplayOptions;
  private isDisplaying: boolean = false;
  private currentText: string = "";
  private currentCharacterIndex: number = 0;
  private textTimer: number | null = null;
  private autoAdvanceTimer: number | null = null;

  constructor(config: GameConfig, options: TextDisplayOptions = {}) {
    this.config = config;
    this.options = {
      textSpeed: 30,
      autoAdvanceDelay: 3000,
      autoAdvanceEnabled: false,
      textEffectsEnabled: true,
      ...options,
    };
  }

  /**
   * テキスト表示システムの初期化
   */
  async initialize(): Promise<void> {
    console.log("TextDisplaySystem initialized");
  }

  /**
   * シーンのダイアログを表示
   */
  async displayScene(scene: SceneData): Promise<void> {
    if (!scene.dialogue) {
      console.warn("No dialogue in scene:", scene.id);
      return;
    }

    await this.displayDialogue(scene.dialogue);
  }

  /**
   * ダイアログの表示
   */
  async displayDialogue(dialogue: DialogueData): Promise<void> {
    // キャラクター名の設定
    if (dialogue.character) {
      PixiVN.dialogue.character = dialogue.character;
    }

    // 立ち絵の設定
    if (dialogue.characterExpression) {
      // TODO: 立ち絵システムと連携
      console.log(`Character expression: ${dialogue.characterExpression}`);
    }

    // テキストの表示
    await this.displayText(dialogue.text);

    // 音声の再生
    if (dialogue.voice) {
      await this.playVoice(dialogue.voice);
    }
  }

  /**
   * テキストの段階的表示
   */
  async displayText(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.currentText = text;
      this.currentCharacterIndex = 0;
      this.isDisplaying = true;

      // 即座に表示するか段階的に表示するか
      if (!this.options.textEffectsEnabled || this.options.textSpeed === 0) {
        // 即座に表示
        PixiVN.dialogue.text = text;
        this.isDisplaying = false;
        this.startAutoAdvance();
        resolve();
        return;
      }

      // 段階的表示の開始
      this.startTextAnimation(resolve);
    });
  }

  /**
   * テキストアニメーションの開始
   */
  private startTextAnimation(onComplete: () => void): void {
    const interval = 1000 / (this.options.textSpeed || 30);

    const updateText = () => {
      if (this.currentCharacterIndex < this.currentText.length) {
        this.currentCharacterIndex++;
        const displayText = this.currentText.substring(0, this.currentCharacterIndex);
        PixiVN.dialogue.text = displayText;

        this.textTimer = window.setTimeout(updateText, interval);
      } else {
        // アニメーション完了
        this.isDisplaying = false;
        this.startAutoAdvance();
        onComplete();
      }
    };

    updateText();
  }

  /**
   * 自動進行の開始
   */
  private startAutoAdvance(): void {
    if (!this.options.autoAdvanceEnabled || this.options.autoAdvanceDelay === 0) {
      return;
    }

    this.autoAdvanceTimer = window.setTimeout(() => {
      this.skipToEnd();
      // TODO: 次のシーンへの自動進行処理
      console.log("Auto advance triggered");
    }, this.options.autoAdvanceDelay);
  }

  /**
   * テキスト表示を最後まで進める
   */
  skipToEnd(): void {
    if (this.textTimer) {
      clearTimeout(this.textTimer);
      this.textTimer = null;
    }

    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }

    if (this.isDisplaying) {
      // 表示中の場合は即座に全文表示
      PixiVN.dialogue.text = this.currentText;
      this.currentCharacterIndex = this.currentText.length;
      this.isDisplaying = false;
      this.startAutoAdvance();
    }
  }

  /**
   * 音声の再生
   */
  private async playVoice(voiceFile: string): Promise<void> {
    try {
      // TODO: 音声システムと連携
      console.log(`Playing voice: ${voiceFile}`);
    } catch (error) {
      console.warn(`Failed to play voice: ${voiceFile}`, error);
    }
  }

  /**
   * テキスト表示設定の更新
   */
  updateOptions(newOptions: Partial<TextDisplayOptions>): void {
    this.options = { ...this.options, ...newOptions };
    console.log("Text display options updated:", this.options);
  }

  /**
   * テキストの消去
   */
  clearText(): void {
    PixiVN.dialogue.text = "";
    PixiVN.dialogue.character = "";
    
    if (this.textTimer) {
      clearTimeout(this.textTimer);
      this.textTimer = null;
    }

    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }

    this.isDisplaying = false;
    this.currentText = "";
    this.currentCharacterIndex = 0;
  }

  /**
   * 表示中かどうかを取得
   */
  isTextDisplaying(): boolean {
    return this.isDisplaying;
  }

  /**
   * 現在の表示設定を取得
   */
  getOptions(): TextDisplayOptions {
    return { ...this.options };
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.clearText();
    console.log("TextDisplaySystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.clearText();
    console.log("TextDisplaySystem disposed");
  }
}