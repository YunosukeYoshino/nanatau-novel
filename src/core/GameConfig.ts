/**
 * ゲーム設定のデフォルト値と管理クラス
 */

import { GameConfig } from "../types/core.js";
import { IConfigManager } from "../types/interfaces.js";

export class ConfigManager implements IConfigManager {
  private static instance: ConfigManager;
  private currentConfig: GameConfig;
  private readonly STORAGE_KEY = "nanatau-game-config";

  private constructor() {
    this.currentConfig = this.getDefaultConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * デフォルト設定の取得
   */
  public getDefaultConfig(): GameConfig {
    return {
      screen: {
        width: 1280,
        height: 720,
        fullscreen: false,
      },
      audio: {
        masterVolume: 1.0,
        bgmVolume: 0.8,
        seVolume: 0.9,
        voiceVolume: 1.0,
      },
      text: {
        speed: 50, // 文字表示速度（ms）
        autoAdvance: false,
        autoAdvanceDelay: 3000, // 自動進行の待機時間（ms）
      },
      skipRead: false,
      language: "ja",
    };
  }

  /**
   * 設定の読み込み
   */
  public loadConfig(): GameConfig {
    try {
      const savedConfig = localStorage.getItem(this.STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // デフォルト設定とマージして不足項目を補完
        this.currentConfig = this.mergeConfigs(
          this.getDefaultConfig(),
          parsedConfig
        );
      } else {
        this.currentConfig = this.getDefaultConfig();
      }
    } catch (error) {
      console.warn("Failed to load config, using default:", error);
      this.currentConfig = this.getDefaultConfig();
    }

    return this.currentConfig;
  }

  /**
   * 設定の保存
   */
  public saveConfig(config: GameConfig): void {
    try {
      this.currentConfig = config;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save config:", error);
      throw new Error("設定の保存に失敗しました");
    }
  }

  /**
   * 設定の部分更新
   */
  public updateConfig(partialConfig: Partial<GameConfig>): void {
    this.currentConfig = this.mergeConfigs(this.currentConfig, partialConfig);
    this.saveConfig(this.currentConfig);
  }

  /**
   * 現在の設定を取得
   */
  public getCurrentConfig(): GameConfig {
    return { ...this.currentConfig };
  }

  /**
   * 設定のマージ（深いマージ）
   */
  private mergeConfigs(defaultConfig: GameConfig, userConfig: any): GameConfig {
    const merged = { ...defaultConfig };

    if (userConfig.screen) {
      merged.screen = { ...defaultConfig.screen, ...userConfig.screen };
    }

    if (userConfig.audio) {
      merged.audio = { ...defaultConfig.audio, ...userConfig.audio };
    }

    if (userConfig.text) {
      merged.text = { ...defaultConfig.text, ...userConfig.text };
    }

    if (typeof userConfig.skipRead === "boolean") {
      merged.skipRead = userConfig.skipRead;
    }

    if (typeof userConfig.language === "string") {
      merged.language = userConfig.language;
    }

    return merged;
  }

  /**
   * 設定のリセット
   */
  public resetToDefault(): void {
    this.currentConfig = this.getDefaultConfig();
    this.saveConfig(this.currentConfig);
  }

  /**
   * 設定の検証
   */
  public validateConfig(config: any): boolean {
    try {
      // 基本構造の確認
      if (!config || typeof config !== "object") return false;

      // 必須プロパティの確認
      const requiredProps = ["screen", "audio", "text"];
      for (const prop of requiredProps) {
        if (!config[prop] || typeof config[prop] !== "object") return false;
      }

      // 数値範囲の確認
      if (config.audio.masterVolume < 0 || config.audio.masterVolume > 1)
        return false;
      if (config.audio.bgmVolume < 0 || config.audio.bgmVolume > 1)
        return false;
      if (config.audio.seVolume < 0 || config.audio.seVolume > 1) return false;
      if (config.audio.voiceVolume < 0 || config.audio.voiceVolume > 1)
        return false;

      if (config.text.speed < 1 || config.text.speed > 1000) return false;
      if (
        config.text.autoAdvanceDelay < 100 ||
        config.text.autoAdvanceDelay > 10000
      )
        return false;

      return true;
    } catch (error) {
      return false;
    }
  }
}
