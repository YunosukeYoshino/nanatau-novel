/**
 * 設定システム - ゲーム設定の管理と永続化
 * Phase 5: UI/UX実装システム
 */

import type { GameConfig } from "../types/core.js";
import type {
  ISettingsSystem,
  VolumeSettings,
  DisplaySettings,
  ControlSettings,
  UserSettings,
  UISlider,
} from "./interfaces.js";

export interface SettingsConfig {
  /** 設定画面の配置 */
  layout: {
    width: number;
    height: number;
    padding: number;
    sections: {
      volume: { x: number; y: number; width: number; height: number };
      display: { x: number; y: number; width: number; height: number };
      controls: { x: number; y: number; width: number; height: number };
    };
  };
  /** アニメーション設定 */
  animation: {
    fadeInDuration: number;
    fadeOutDuration: number;
    slideTransition: number;
  };
  /** ローカルストレージキー */
  storageKey: string;
}

export class SettingsSystem implements ISettingsSystem {
  private config: GameConfig;
  private settingsConfig: SettingsConfig;
  private isVisible: boolean = false;
  private isInitialized: boolean = false;

  // 現在の設定
  private currentSettings: UserSettings;

  // UI要素
  private containerElement: HTMLElement | null = null;
  private sections: {
    volume: HTMLElement | null;
    display: HTMLElement | null;
    controls: HTMLElement | null;
  } = {
    volume: null,
    display: null,
    controls: null,
  };

  // 音量スライダー
  private volumeSliders: {
    master: UISlider | null;
    bgm: UISlider | null;
    se: UISlider | null;
    voice: UISlider | null;
  } = {
    master: null,
    bgm: null,
    se: null,
    voice: null,
  };

  // 外部システムとの連携
  private onVolumeChangeCallback:
    | ((settings: VolumeSettings) => void)
    | undefined = undefined;
  private onDisplayChangeCallback:
    | ((settings: DisplaySettings) => void)
    | undefined = undefined;
  private onControlChangeCallback:
    | ((settings: ControlSettings) => void)
    | undefined = undefined;
  private onCloseCallback: (() => void) | undefined = undefined;

  constructor(config: GameConfig, settingsConfig?: Partial<SettingsConfig>) {
    this.config = config;
    this.settingsConfig = {
      layout: {
        width: Math.min(800, config.screenWidth || 1280),
        height: Math.min(600, config.screenHeight || 720),
        padding: 40,
        sections: {
          volume: { x: 20, y: 80, width: 360, height: 300 },
          display: { x: 400, y: 80, width: 360, height: 300 },
          controls: { x: 20, y: 400, width: 740, height: 160 },
        },
      },
      animation: {
        fadeInDuration: 300,
        fadeOutDuration: 200,
        slideTransition: 250,
      },
      storageKey: "nanatau_novel_settings",
      ...settingsConfig,
    };

    // デフォルト設定の初期化
    this.currentSettings = this.getDefaultSettings();
  }

  /**
   * システムの初期化
   */
  async initialize(): Promise<void> {
    try {
      // 保存済み設定の読み込み
      this.loadSettings();

      // UI要素の作成
      this.createContainerElement();
      await this.initializeUIElements();

      // イベントリスナーの設定
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("SettingsSystem initialized");
    } catch (error) {
      console.error("Failed to initialize SettingsSystem:", error);
      throw error;
    }
  }

  /**
   * 設定画面の表示
   */
  async showSettings(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("SettingsSystem not initialized");
    }

    if (this.isVisible) {
      console.warn("Settings are already visible");
      return;
    }

    try {
      // コンテナを表示
      if (this.containerElement) {
        this.containerElement.style.display = "flex";
      }

      // フェードインアニメーション
      await this.animateIn();

      this.isVisible = true;
      console.log("Settings shown");
    } catch (error) {
      console.error("Failed to show settings:", error);
      throw error;
    }
  }

  /**
   * 設定画面の非表示
   */
  async hideSettings(): Promise<void> {
    if (!this.isVisible) {
      console.warn("Settings are not visible");
      return;
    }

    try {
      // 設定を保存
      this.saveSettings();

      // フェードアウトアニメーション
      await this.animateOut();

      // コンテナを非表示
      if (this.containerElement) {
        this.containerElement.style.display = "none";
      }

      this.isVisible = false;
      console.log("Settings hidden");

      // 閉じるコールバックを呼び出し
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    } catch (error) {
      console.error("Failed to hide settings:", error);
      throw error;
    }
  }

  /**
   * 音量設定の変更
   */
  updateVolumeSettings(settings: VolumeSettings): void {
    this.currentSettings.volume = { ...settings };
    this.updateVolumeUI();

    if (this.onVolumeChangeCallback) {
      this.onVolumeChangeCallback(settings);
    }

    console.log("Volume settings updated:", settings);
  }

  /**
   * 表示設定の変更
   */
  updateDisplaySettings(settings: DisplaySettings): void {
    this.currentSettings.display = { ...settings };
    this.updateDisplayUI();

    if (this.onDisplayChangeCallback) {
      this.onDisplayChangeCallback(settings);
    }

    console.log("Display settings updated:", settings);
  }

  /**
   * 操作設定の変更
   */
  updateControlSettings(settings: ControlSettings): void {
    this.currentSettings.controls = { ...settings };
    this.updateControlsUI();

    if (this.onControlChangeCallback) {
      this.onControlChangeCallback(settings);
    }

    console.log("Control settings updated:", settings);
  }

  /**
   * 設定のリセット
   */
  resetToDefaults(): void {
    this.currentSettings = this.getDefaultSettings();
    this.updateAllUI();
    console.log("Settings reset to defaults");
  }

  /**
   * 設定の保存
   */
  saveSettings(): void {
    try {
      this.currentSettings.lastModified = Date.now();
      const settingsJson = JSON.stringify(this.currentSettings);
      localStorage.setItem(this.settingsConfig.storageKey, settingsJson);
      console.log("Settings saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  /**
   * 設定の読み込み
   */
  loadSettings(): void {
    try {
      const settingsJson = localStorage.getItem(this.settingsConfig.storageKey);
      if (settingsJson) {
        const loadedSettings = JSON.parse(settingsJson) as UserSettings;
        this.currentSettings = this.mergeWithDefaults(loadedSettings);
        console.log("Settings loaded");
      }
    } catch (error) {
      console.error("Failed to load settings, using defaults:", error);
      this.currentSettings = this.getDefaultSettings();
    }
  }

  /**
   * 現在の設定取得
   */
  getCurrentSettings(): UserSettings {
    return { ...this.currentSettings };
  }

  /**
   * 設定画面の状態確認
   */
  isSettingsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * コールバック関数の設定
   */
  setCallbacks(callbacks: {
    onVolumeChange?: (settings: VolumeSettings) => void;
    onDisplayChange?: (settings: DisplaySettings) => void;
    onControlChange?: (settings: ControlSettings) => void;
    onClose?: () => void;
  }): void {
    this.onVolumeChangeCallback = callbacks.onVolumeChange;
    this.onDisplayChangeCallback = callbacks.onDisplayChange;
    this.onControlChangeCallback = callbacks.onControlChange;
    this.onCloseCallback = callbacks.onClose;
  }

  /**
   * デフォルト設定の取得
   */
  private getDefaultSettings(): UserSettings {
    return {
      volume: {
        master: 1.0,
        bgm: 0.7,
        se: 0.8,
        voice: 0.9,
      },
      display: {
        textSpeed: 5,
        autoSpeed: 3,
        skipMode: "unread",
        fullscreen: false,
        resolution: {
          width: this.config.screenWidth || 1280,
          height: this.config.screenHeight || 720,
        },
        uiScale: 1.0,
      },
      controls: {
        keyBindings: {
          advance: ["Space", "Enter", "ArrowRight"],
          skip: ["Ctrl"],
          auto: ["KeyA"],
          quickSave: ["F5"],
          quickLoad: ["F9"],
          hideUI: ["KeyH"],
          menu: ["Escape", "RightClick"],
        },
        mouseControls: {
          leftClick: "advance",
          rightClick: "menu",
          middleClick: "auto",
          wheelUp: "backlog",
          wheelDown: "advance",
        },
      },
      version: "1.0.0",
      lastModified: Date.now(),
    };
  }

  /**
   * 設定の統合（デフォルト値でフォールバック）
   */
  private mergeWithDefaults(
    loadedSettings: Partial<UserSettings>
  ): UserSettings {
    const defaults = this.getDefaultSettings();
    return {
      volume: { ...defaults.volume, ...loadedSettings.volume },
      display: { ...defaults.display, ...loadedSettings.display },
      controls: { ...defaults.controls, ...loadedSettings.controls },
      version: defaults.version,
      lastModified: loadedSettings.lastModified || defaults.lastModified,
    };
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
    this.containerElement.id = "settings-container";
    this.containerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      font-family: Noto Sans JP, Arial, sans-serif;
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

    // メインパネルの作成
    const mainPanel = document.createElement("div");
    mainPanel.style.cssText = `
      background: #2a2a3e;
      border-radius: 12px;
      width: ${this.settingsConfig.layout.width}px;
      height: ${this.settingsConfig.layout.height}px;
      padding: ${this.settingsConfig.layout.padding}px;
      position: relative;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      opacity: 0;
      transform: scale(0.9);
      transition: all ${this.settingsConfig.animation.fadeInDuration}ms ease;
    `;

    this.containerElement.appendChild(mainPanel);

    // タイトルの作成
    this.createTitle(mainPanel);

    // 設定セクションの作成
    this.createVolumeSection(mainPanel);
    this.createDisplaySection(mainPanel);
    this.createControlsSection(mainPanel);

    // アクションボタンの作成
    this.createActionButtons(mainPanel);
  }

  /**
   * タイトルの作成
   */
  private createTitle(parent: HTMLElement): void {
    const title = document.createElement("h2");
    title.style.cssText = `
      margin: 0 0 30px 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      text-align: center;
    `;
    title.textContent = "設定";
    parent.appendChild(title);
  }

  /**
   * 音量設定セクションの作成
   */
  private createVolumeSection(parent: HTMLElement): void {
    const section = this.createSection(
      parent,
      "音量設定",
      this.settingsConfig.layout.sections.volume
    );
    this.sections.volume = section;

    const volumeTypes = [
      { key: "master", label: "マスター音量" },
      { key: "bgm", label: "BGM音量" },
      { key: "se", label: "効果音音量" },
      { key: "voice", label: "ボイス音量" },
    ];

    volumeTypes.forEach((type, index) => {
      const slider = this.createVolumeSlider(
        type.label,
        this.currentSettings.volume[type.key as keyof VolumeSettings],
        (value: number) => {
          this.currentSettings.volume[type.key as keyof VolumeSettings] = value;
          if (this.onVolumeChangeCallback) {
            this.onVolumeChangeCallback(this.currentSettings.volume);
          }
        }
      );

      slider.style.marginBottom = "20px";
      section.appendChild(slider);

      // スライダー参照を保存
      this.volumeSliders[type.key as keyof typeof this.volumeSliders] = {
        id: `volume-${type.key}`,
        visible: true,
        enabled: true,
        x: 0,
        y: index * 60,
        width: 300,
        height: 40,
        zIndex: 1,
        min: 0,
        max: 1,
        value: this.currentSettings.volume[type.key as keyof VolumeSettings],
        step: 0.01,
        onChange: (value: number) => {
          this.currentSettings.volume[type.key as keyof VolumeSettings] = value;
          if (this.onVolumeChangeCallback) {
            this.onVolumeChangeCallback(this.currentSettings.volume);
          }
        },
      };
    });
  }

  /**
   * 表示設定セクションの作成
   */
  private createDisplaySection(parent: HTMLElement): void {
    const section = this.createSection(
      parent,
      "表示設定",
      this.settingsConfig.layout.sections.display
    );
    this.sections.display = section;

    // テキスト速度
    const textSpeedSlider = this.createSlider(
      "テキスト速度",
      this.currentSettings.display.textSpeed,
      1,
      10,
      1,
      (value: number) => {
        this.currentSettings.display.textSpeed = value;
        if (this.onDisplayChangeCallback) {
          this.onDisplayChangeCallback(this.currentSettings.display);
        }
      }
    );
    section.appendChild(textSpeedSlider);

    // オート速度
    const autoSpeedSlider = this.createSlider(
      "オート速度",
      this.currentSettings.display.autoSpeed,
      1,
      10,
      1,
      (value: number) => {
        this.currentSettings.display.autoSpeed = value;
        if (this.onDisplayChangeCallback) {
          this.onDisplayChangeCallback(this.currentSettings.display);
        }
      }
    );
    section.appendChild(autoSpeedSlider);

    // スキップモード
    const skipModeSelect = this.createSelect(
      "スキップモード",
      this.currentSettings.display.skipMode,
      [
        { value: "unread", label: "未読のみ" },
        { value: "all", label: "すべて" },
      ],
      (value: string) => {
        this.currentSettings.display.skipMode = value as "all" | "unread";
        if (this.onDisplayChangeCallback) {
          this.onDisplayChangeCallback(this.currentSettings.display);
        }
      }
    );
    section.appendChild(skipModeSelect);
  }

  /**
   * 操作設定セクションの作成
   */
  private createControlsSection(parent: HTMLElement): void {
    const section = this.createSection(
      parent,
      "操作設定",
      this.settingsConfig.layout.sections.controls
    );
    this.sections.controls = section;

    const note = document.createElement("p");
    note.style.cssText = `
      color: #cccccc;
      font-size: 14px;
      margin: 10px 0;
      text-align: center;
    `;
    note.textContent = "キー設定の変更は今後のアップデートで対応予定です";
    section.appendChild(note);
  }

  /**
   * セクションの作成
   */
  private createSection(
    parent: HTMLElement,
    title: string,
    layout: { x: number; y: number; width: number; height: number }
  ): HTMLElement {
    const section = document.createElement("div");
    section.style.cssText = `
      position: absolute;
      left: ${layout.x}px;
      top: ${layout.y}px;
      width: ${layout.width}px;
      height: ${layout.height}px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    const sectionTitle = document.createElement("h3");
    sectionTitle.style.cssText = `
      margin: 0 0 20px 0;
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
    `;
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    parent.appendChild(section);
    return section;
  }

  /**
   * 音量スライダーの作成
   */
  private createVolumeSlider(
    label: string,
    value: number,
    onChange: (value: number) => void
  ): HTMLElement {
    return this.createSlider(label, value, 0, 1, 0.01, onChange);
  }

  /**
   * スライダーの作成
   */
  private createSlider(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void
  ): HTMLElement {
    const container = document.createElement("div");
    container.style.cssText = `
      margin-bottom: 15px;
    `;

    const labelEl = document.createElement("label");
    labelEl.style.cssText = `
      display: block;
      color: #ffffff;
      font-size: 14px;
      margin-bottom: 8px;
    `;
    labelEl.textContent = label;

    const sliderContainer = document.createElement("div");
    sliderContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = value.toString();
    slider.style.cssText = `
      flex: 1;
      height: 6px;
      background: #4a4a5e;
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    `;

    const valueDisplay = document.createElement("span");
    valueDisplay.style.cssText = `
      color: #ffffff;
      font-size: 12px;
      min-width: 40px;
      text-align: right;
    `;
    valueDisplay.textContent =
      Math.round(value * (max === 1 ? 100 : 1)).toString() +
      (max === 1 ? "%" : "");

    slider.addEventListener("input", () => {
      const newValue = parseFloat(slider.value);
      onChange(newValue);
      valueDisplay.textContent =
        Math.round(newValue * (max === 1 ? 100 : 1)).toString() +
        (max === 1 ? "%" : "");
    });

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    container.appendChild(labelEl);
    container.appendChild(sliderContainer);

    return container;
  }

  /**
   * セレクトボックスの作成
   */
  private createSelect(
    label: string,
    value: string,
    options: Array<{ value: string; label: string }>,
    onChange: (value: string) => void
  ): HTMLElement {
    const container = document.createElement("div");
    container.style.cssText = `
      margin-bottom: 15px;
    `;

    const labelEl = document.createElement("label");
    labelEl.style.cssText = `
      display: block;
      color: #ffffff;
      font-size: 14px;
      margin-bottom: 8px;
    `;
    labelEl.textContent = label;

    const select = document.createElement("select");
    select.style.cssText = `
      width: 100%;
      padding: 8px;
      background: #4a4a5e;
      color: #ffffff;
      border: 1px solid #666;
      border-radius: 4px;
      font-size: 14px;
    `;

    options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      optionEl.selected = option.value === value;
      select.appendChild(optionEl);
    });

    select.addEventListener("change", () => {
      onChange(select.value);
    });

    container.appendChild(labelEl);
    container.appendChild(select);

    return container;
  }

  /**
   * アクションボタンの作成
   */
  private createActionButtons(parent: HTMLElement): void {
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
    `;

    // リセットボタン
    const resetButton = this.createButton("リセット", () => {
      this.resetToDefaults();
    });
    resetButton.style.background = "#dc3545";
    buttonContainer.appendChild(resetButton);

    // 閉じるボタン
    const closeButton = this.createButton("閉じる", () => {
      this.hideSettings();
    });
    buttonContainer.appendChild(closeButton);

    parent.appendChild(buttonContainer);
  }

  /**
   * ボタンの作成
   */
  private createButton(text: string, onClick: () => void): HTMLElement {
    const button = document.createElement("button");
    button.style.cssText = `
      background: #007bff;
      border: none;
      border-radius: 6px;
      color: #ffffff;
      font-size: 14px;
      padding: 10px 20px;
      cursor: pointer;
      transition: background 0.2s ease;
    `;
    button.textContent = text;

    button.addEventListener("mouseenter", () => {
      button.style.background = "#0056b3";
    });

    button.addEventListener("mouseleave", () => {
      if (text === "リセット") {
        button.style.background = "#dc3545";
      } else {
        button.style.background = "#007bff";
      }
    });

    button.addEventListener("click", onClick);

    return button;
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (typeof window !== "undefined") {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (!this.isVisible) return;

        if (event.key === "Escape") {
          event.preventDefault();
          this.hideSettings();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
    }
  }

  /**
   * 音量UIの更新
   */
  private updateVolumeUI(): void {
    // 実装は簡略化（実際は各スライダーの値を更新）
    console.log("Volume UI updated");
  }

  /**
   * 表示UIの更新
   */
  private updateDisplayUI(): void {
    // 実装は簡略化（実際は各設定項目の値を更新）
    console.log("Display UI updated");
  }

  /**
   * 操作UIの更新
   */
  private updateControlsUI(): void {
    // 実装は簡略化（実際は各設定項目の値を更新）
    console.log("Controls UI updated");
  }

  /**
   * 全UIの更新
   */
  private updateAllUI(): void {
    this.updateVolumeUI();
    this.updateDisplayUI();
    this.updateControlsUI();
  }

  /**
   * フェードインアニメーション
   */
  private async animateIn(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      const panel = this.containerElement.querySelector("div") as HTMLElement;
      if (panel) {
        setTimeout(() => {
          panel.style.opacity = "1";
          panel.style.transform = "scale(1)";
        }, 50);

        setTimeout(() => {
          resolve();
        }, this.settingsConfig.animation.fadeInDuration);
      } else {
        resolve();
      }
    });
  }

  /**
   * フェードアウトアニメーション
   */
  private async animateOut(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.containerElement) {
        resolve();
        return;
      }

      const panel = this.containerElement.querySelector("div") as HTMLElement;
      if (panel) {
        panel.style.opacity = "0";
        panel.style.transform = "scale(0.9)";

        setTimeout(() => {
          resolve();
        }, this.settingsConfig.animation.fadeOutDuration);
      } else {
        resolve();
      }
    });
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.isVisible = false;

    if (this.containerElement) {
      this.containerElement.style.display = "none";
      const panel = this.containerElement.querySelector("div") as HTMLElement;
      if (panel) {
        panel.style.opacity = "0";
        panel.style.transform = "scale(0.9)";
      }
    }

    console.log("SettingsSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    // DOM要素の削除
    if (this.containerElement && this.containerElement.parentNode) {
      this.containerElement.parentNode.removeChild(this.containerElement);
    }

    // 参照の削除
    this.containerElement = null;
    this.sections = { volume: null, display: null, controls: null };
    this.volumeSliders = { master: null, bgm: null, se: null, voice: null };

    this.isInitialized = false;
    this.isVisible = false;

    console.log("SettingsSystem disposed");
  }
}
