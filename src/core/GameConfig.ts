/**
 * ゲーム設定管理クラス
 */

import type { GameConfig } from "../types/core.js";

export class GameConfigManager {
  private config: GameConfig;

  constructor(initialConfig?: Partial<GameConfig>) {
    const defaultConfig = this.getDefaultConfig();
    this.config = this.mergeConfigs(defaultConfig, initialConfig || {});
  }

  /**
   * デフォルト設定を取得
   */
  public getDefaultConfig(): GameConfig {
    return {
      screen: {
        width: 1280,
        height: 720,
        fullscreen: false,
      },
      audio: {
        masterVolume: 0.8,
        bgmVolume: 0.7,
        seVolume: 0.8,
        voiceVolume: 0.9,
      },
      text: {
        speed: 50,
        autoAdvance: false,
        autoAdvanceDelay: 2000,
      },
      skipRead: false,
      language: "ja",
    };
  }

  /**
   * 現在の設定を取得
   */
  public getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * 設定を更新
   */
  public updateConfig(partialConfig: Partial<GameConfig>): void {
    const updatedConfig = this.mergeConfigs(this.config, partialConfig);

    if (this.validateConfig(updatedConfig)) {
      this.config = updatedConfig;
    } else {
      throw new Error("Invalid configuration values");
    }
  }

  /**
   * 設定をローカルストレージに保存
   */
  public saveConfig(): void {
    try {
      const configJson = JSON.stringify(this.config);
      localStorage.setItem("nanatau_game_config", configJson);
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  /**
   * ローカルストレージから設定を読み込み
   */
  public loadConfig(): GameConfig {
    try {
      const saved = localStorage.getItem("nanatau_game_config");
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        if (this.validateConfig(parsedConfig)) {
          this.config = this.mergeConfigs(
            this.getDefaultConfig(),
            parsedConfig
          );
        }
      }
    } catch (error) {
      console.error("Failed to load config:", error);
      this.config = this.getDefaultConfig();
    }

    return this.getConfig();
  }

  /**
   * 設定をリセット（デフォルトに戻す）
   */
  public resetConfig(): void {
    this.config = this.getDefaultConfig();
  }

  /**
   * 特定の設定値を取得
   */
  public get<K extends keyof GameConfig>(key: K): GameConfig[K] {
    return this.config[key];
  }

  /**
   * 特定の設定値を設定
   */
  public set<K extends keyof GameConfig>(key: K, value: GameConfig[K]): void {
    const partialUpdate = { [key]: value } as Partial<GameConfig>;
    this.updateConfig(partialUpdate);
  }

  /**
   * 設定のマージ（深いマージ）
   */
  private mergeConfigs(
    defaultConfig: GameConfig,
    userConfig: Partial<GameConfig>
  ): GameConfig {
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

    if (userConfig.skipRead !== undefined) {
      merged.skipRead = userConfig.skipRead;
    }

    if (userConfig.language !== undefined) {
      merged.language = userConfig.language;
    }

    return merged;
  }

  /**
   * 設定の検証
   */
  public validateConfig(config: unknown): config is GameConfig {
    try {
      if (!config || typeof config !== "object" || config === null) {
        return false;
      }

      const configObj = config as Record<string, unknown>;

      // 必須プロパティの確認
      if (
        !configObj["screen"] ||
        typeof configObj["screen"] !== "object" ||
        !configObj["audio"] ||
        typeof configObj["audio"] !== "object" ||
        !configObj["text"] ||
        typeof configObj["text"] !== "object"
      ) {
        return false;
      }

      const audio = configObj["audio"] as Record<string, unknown>;
      const text = configObj["text"] as Record<string, unknown>;

      // 数値範囲の確認
      if (
        typeof audio["masterVolume"] !== "number" ||
        audio["masterVolume"] < 0 ||
        audio["masterVolume"] > 1
      )
        return false;
      if (
        typeof audio["bgmVolume"] !== "number" ||
        audio["bgmVolume"] < 0 ||
        audio["bgmVolume"] > 1
      )
        return false;
      if (
        typeof audio["seVolume"] !== "number" ||
        audio["seVolume"] < 0 ||
        audio["seVolume"] > 1
      )
        return false;
      if (
        typeof audio["voiceVolume"] !== "number" ||
        audio["voiceVolume"] < 0 ||
        audio["voiceVolume"] > 1
      )
        return false;

      if (
        typeof text["speed"] !== "number" ||
        text["speed"] < 1 ||
        text["speed"] > 1000
      )
        return false;
      if (
        typeof text["autoAdvanceDelay"] !== "number" ||
        text["autoAdvanceDelay"] < 100 ||
        text["autoAdvanceDelay"] > 10000
      )
        return false;

      return true;
    } catch (_error) {
      return false;
    }
  }
}
