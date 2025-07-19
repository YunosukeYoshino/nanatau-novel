/**
 * 選択肢UI表示システム - 選択肢の表示と操作を管理
 */

import PixiVN from "@drincs/pixi-vn";
import type { ChoiceData, GameState } from "../types/core.js";
import type { IChoiceUISystem } from "../types/interfaces.js";
import { ChoiceSystem, type ChoiceSystemConfig } from "./ChoiceSystem.js";

export interface ChoiceUIConfig {
  /** 選択肢ボタンのスタイル */
  buttonStyle?: {
    backgroundColor?: string;
    hoverColor?: string;
    textColor?: string;
    fontSize?: number;
    padding?: number;
    borderRadius?: number;
  };
  /** 選択肢の配置 */
  layout?: {
    position?: "bottom" | "center" | "custom";
    spacing?: number;
    maxWidth?: number;
    alignment?: "left" | "center" | "right";
  };
  /** アニメーション設定 */
  animation?: {
    showDuration?: number;
    hideDuration?: number;
    fadeIn?: boolean;
    slideIn?: boolean;
    slideDirection?: "up" | "down" | "left" | "right";
  };
  /** タイマー設定（自動選択） */
  autoSelect?: {
    enabled?: boolean;
    duration?: number;
    defaultChoiceIndex?: number;
    showTimer?: boolean;
  };
}

export interface ChoiceButtonData {
  /** ボタンオブジェクト */
  button: any; // Pixi.jsのボタンオブジェクト
  /** 選択肢データ */
  choice: ChoiceData;
  /** インデックス */
  index: number;
  /** 有効かどうか */
  enabled: boolean;
}

export class ChoiceUISystem implements IChoiceUISystem {
  private choiceSystem: ChoiceSystem;
  private config: ChoiceUIConfig;
  private choiceButtons: ChoiceButtonData[] = [];
  private isChoicesVisible: boolean = false;
  private currentChoices: ChoiceData[] = [];
  private choiceContainer: any = null; // Pixi.jsコンテナ
  private autoSelectTimer: number | null = null;
  private onChoiceSelected?: (choice: ChoiceData) => void;

  constructor(
    choiceSystemConfig?: Partial<ChoiceSystemConfig>,
    uiConfig?: ChoiceUIConfig
  ) {
    this.choiceSystem = new ChoiceSystem(choiceSystemConfig);
    this.config = {
      buttonStyle: {
        backgroundColor: "#333333",
        hoverColor: "#555555",
        textColor: "#FFFFFF",
        fontSize: 16,
        padding: 10,
        borderRadius: 5,
      },
      layout: {
        position: "bottom",
        spacing: 10,
        maxWidth: 800,
        alignment: "center",
      },
      animation: {
        showDuration: 300,
        hideDuration: 200,
        fadeIn: true,
        slideIn: true,
        slideDirection: "up",
      },
      autoSelect: {
        enabled: false,
        duration: 10000,
        defaultChoiceIndex: 0,
        showTimer: true,
      },
      ...uiConfig,
    };
  }

  /**
   * システムの初期化
   */
  async initialize(): Promise<void> {
    this.createChoiceContainer();
    console.log("ChoiceUISystem initialized");
  }

  /**
   * 選択肢コンテナの作成
   */
  private createChoiceContainer(): void {
    // TODO: Pixi.jsコンテナの作成
    // this.choiceContainer = new PIXI.Container();
    console.log("Choice container created");
  }

  /**
   * 選択肢の表示
   */
  async showChoices(
    choices: ChoiceData[],
    gameState: GameState,
    onChoiceSelected: (choice: ChoiceData) => void
  ): Promise<void> {
    try {
      // 既存の選択肢を非表示
      await this.hideChoices();

      // 条件評価
      const availableChoices = this.choiceSystem.evaluateChoiceConditions(choices, gameState);
      
      if (availableChoices.length === 0) {
        console.warn("No available choices after condition evaluation");
        return;
      }

      this.currentChoices = availableChoices;
      this.onChoiceSelected = onChoiceSelected;

      // ボタンの作成
      await this.createChoiceButtons(availableChoices);

      // 選択肢の配置
      this.layoutChoices();

      // アニメーション付きで表示
      await this.showChoicesWithAnimation();

      // 自動選択タイマーの開始
      if (this.config.autoSelect?.enabled) {
        this.startAutoSelectTimer();
      }

      this.isChoicesVisible = true;
      console.log(`Choices displayed: ${availableChoices.length} options`);
    } catch (error) {
      console.error("Failed to show choices:", error);
    }
  }

  /**
   * 選択肢の非表示
   */
  async hideChoices(): Promise<void> {
    if (!this.isChoicesVisible) {
      return;
    }

    try {
      // 自動選択タイマーの停止
      this.stopAutoSelectTimer();

      // アニメーション付きで非表示
      await this.hideChoicesWithAnimation();

      // ボタンの削除
      this.destroyChoiceButtons();

      this.isChoicesVisible = false;
      this.currentChoices = [];
      this.onChoiceSelected = undefined;

      console.log("Choices hidden");
    } catch (error) {
      console.error("Failed to hide choices:", error);
    }
  }

  /**
   * 選択肢ボタンの作成
   */
  private async createChoiceButtons(choices: ChoiceData[]): Promise<void> {
    this.choiceButtons = [];

    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const button = await this.createChoiceButton(choice, i);
      
      if (button) {
        this.choiceButtons.push({
          button,
          choice,
          index: i,
          enabled: true,
        });
      }
    }
  }

  /**
   * 個別の選択肢ボタンの作成
   */
  private async createChoiceButton(choice: ChoiceData, index: number): Promise<any> {
    try {
      // TODO: Pixi.jsボタンの作成
      // const button = new PIXI.Graphics();
      // ボタンスタイルの適用
      // クリックイベントの設定

      console.log(`Choice button created: ${choice.text}`);
      return {}; // 仮のオブジェクト
    } catch (error) {
      console.error(`Failed to create choice button: ${choice.text}`, error);
      return null;
    }
  }

  /**
   * 選択肢の配置
   */
  private layoutChoices(): void {
    if (this.choiceButtons.length === 0) {
      return;
    }

    const layout = this.config.layout!;
    const spacing = layout.spacing || 10;
    const maxWidth = layout.maxWidth || 800;

    // 配置位置の計算
    let startY = 0;
    switch (layout.position) {
      case "bottom":
        startY = (PixiVN.app?.screen.height || 720) - 150;
        break;
      case "center":
        startY = ((PixiVN.app?.screen.height || 720) / 2) - ((this.choiceButtons.length * 50 + (this.choiceButtons.length - 1) * spacing) / 2);
        break;
      case "custom":
        // カスタム位置は個別に設定
        break;
    }

    // ボタンの配置
    this.choiceButtons.forEach((buttonData, index) => {
      const y = startY + index * (50 + spacing);
      let x = 0;

      switch (layout.alignment) {
        case "left":
          x = 50;
          break;
        case "center":
          x = ((PixiVN.app?.screen.width || 1280) - maxWidth) / 2;
          break;
        case "right":
          x = (PixiVN.app?.screen.width || 1280) - maxWidth - 50;
          break;
      }

      // TODO: ボタンの位置設定
      // buttonData.button.x = x;
      // buttonData.button.y = y;
    });
  }

  /**
   * アニメーション付き表示
   */
  private async showChoicesWithAnimation(): Promise<void> {
    const animation = this.config.animation!;
    
    if (!animation.fadeIn && !animation.slideIn) {
      // アニメーションなしで即座に表示
      this.choiceButtons.forEach(buttonData => {
        // TODO: ボタンの表示
        // buttonData.button.visible = true;
      });
      return;
    }

    // フェードイン・スライドインアニメーション
    const duration = animation.showDuration || 300;
    
    for (let i = 0; i < this.choiceButtons.length; i++) {
      const buttonData = this.choiceButtons[i];
      const delay = i * 50; // 順次表示のための遅延

      setTimeout(async () => {
        await this.animateButtonShow(buttonData.button, duration);
      }, delay);
    }
  }

  /**
   * アニメーション付き非表示
   */
  private async hideChoicesWithAnimation(): Promise<void> {
    const animation = this.config.animation!;
    const duration = animation.hideDuration || 200;

    const hidePromises = this.choiceButtons.map(buttonData =>
      this.animateButtonHide(buttonData.button, duration)
    );

    await Promise.all(hidePromises);
  }

  /**
   * ボタン表示アニメーション
   */
  private async animateButtonShow(button: any, duration: number): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Pixi.jsアニメーションの実装
      // button.alpha = 0;
      // button.visible = true;
      
      // アニメーション実行
      setTimeout(() => {
        // button.alpha = 1;
        resolve();
      }, duration);
    });
  }

  /**
   * ボタン非表示アニメーション
   */
  private async animateButtonHide(button: any, duration: number): Promise<void> {
    return new Promise((resolve) => {
      // TODO: Pixi.jsアニメーションの実装
      setTimeout(() => {
        // button.visible = false;
        resolve();
      }, duration);
    });
  }

  /**
   * 選択肢ボタンの削除
   */
  private destroyChoiceButtons(): void {
    this.choiceButtons.forEach(buttonData => {
      // TODO: ボタンの削除処理
      // buttonData.button.destroy();
    });
    this.choiceButtons = [];
  }

  /**
   * 選択肢のクリック処理
   */
  private onChoiceButtonClick(choice: ChoiceData, buttonIndex: number): void {
    // 自動選択タイマーの停止
    this.stopAutoSelectTimer();

    // コールバック実行
    if (this.onChoiceSelected) {
      this.onChoiceSelected(choice);
    }

    // 選択肢を非表示
    this.hideChoices();

    console.log(`Choice selected: ${choice.text} (index: ${buttonIndex})`);
  }

  /**
   * 自動選択タイマーの開始
   */
  private startAutoSelectTimer(): void {
    if (!this.config.autoSelect?.enabled || this.currentChoices.length === 0) {
      return;
    }

    const duration = this.config.autoSelect.duration || 10000;
    const defaultIndex = Math.min(
      this.config.autoSelect.defaultChoiceIndex || 0,
      this.currentChoices.length - 1
    );

    this.autoSelectTimer = window.setTimeout(() => {
      const defaultChoice = this.currentChoices[defaultIndex];
      if (defaultChoice) {
        console.log(`Auto-selected choice: ${defaultChoice.text}`);
        this.onChoiceButtonClick(defaultChoice, defaultIndex);
      }
    }, duration);

    // タイマー表示（設定されている場合）
    if (this.config.autoSelect.showTimer) {
      this.showAutoSelectTimer(duration);
    }
  }

  /**
   * 自動選択タイマーの停止
   */
  private stopAutoSelectTimer(): void {
    if (this.autoSelectTimer) {
      clearTimeout(this.autoSelectTimer);
      this.autoSelectTimer = null;
    }
    this.hideAutoSelectTimer();
  }

  /**
   * 自動選択タイマーの表示
   */
  private showAutoSelectTimer(duration: number): void {
    // TODO: タイマーUIの表示実装
    console.log(`Auto-select timer started: ${duration}ms`);
  }

  /**
   * 自動選択タイマーの非表示
   */
  private hideAutoSelectTimer(): void {
    // TODO: タイマーUIの非表示実装
    console.log("Auto-select timer hidden");
  }

  /**
   * キーボード入力での選択肢操作
   */
  handleKeyboardInput(key: string): void {
    if (!this.isChoicesVisible) {
      return;
    }

    // 数字キーでの選択
    const numberKey = parseInt(key);
    if (!isNaN(numberKey) && numberKey >= 1 && numberKey <= this.currentChoices.length) {
      const choice = this.currentChoices[numberKey - 1];
      this.onChoiceButtonClick(choice, numberKey - 1);
      return;
    }

    // その他のキー操作
    switch (key) {
      case "Escape":
        // 選択肢をキャンセル（可能な場合）
        this.hideChoices();
        break;
      case "Enter":
        // デフォルト選択肢を選択
        if (this.currentChoices.length > 0) {
          const defaultChoice = this.currentChoices[0];
          this.onChoiceButtonClick(defaultChoice, 0);
        }
        break;
    }
  }

  /**
   * 選択肢の強制実行（デバッグ用）
   */
  executeChoice(choiceIndex: number, gameState: GameState): GameState | null {
    if (choiceIndex < 0 || choiceIndex >= this.currentChoices.length) {
      console.warn(`Invalid choice index: ${choiceIndex}`);
      return null;
    }

    const choice = this.currentChoices[choiceIndex];
    return this.choiceSystem.executeChoice(choice, gameState, "current_scene");
  }

  /**
   * 選択肢が表示中かどうかを確認
   */
  isChoicesDisplayed(): boolean {
    return this.isChoicesVisible;
  }

  /**
   * 現在の選択肢数を取得
   */
  getCurrentChoicesCount(): number {
    return this.currentChoices.length;
  }

  /**
   * 設定の更新
   */
  updateConfig(newConfig: Partial<ChoiceUIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("ChoiceUISystem config updated");
  }

  /**
   * 選択肢システムの取得
   */
  getChoiceSystem(): ChoiceSystem {
    return this.choiceSystem;
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.hideChoices();
    this.choiceSystem.clearUndoStack();
    console.log("ChoiceUISystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.reset();
    if (this.choiceContainer) {
      // TODO: コンテナの削除
      // this.choiceContainer.destroy();
      this.choiceContainer = null;
    }
    console.log("ChoiceUISystem disposed");
  }
}