/**
 * ゲーム全体のエラーハンドリングクラス
 */

import {
  type AssetError,
  type GameError,
  type SaveLoadError,
  type ScenarioError,
  SystemError,
} from "../types/errors.js";

export class GameErrorHandler {
  private static instance: GameErrorHandler;
  private errorLog: GameError[] = [];

  private constructor() {}

  public static getInstance(): GameErrorHandler {
    if (!GameErrorHandler.instance) {
      GameErrorHandler.instance = new GameErrorHandler();
    }
    return GameErrorHandler.instance;
  }

  /**
   * シナリオエラーの処理
   */
  public handleScenarioError(error: ScenarioError): void {
    this.logError(error);

    console.error("Scenario Error:", {
      message: error.message,
      filePath: error.filePath,
      timestamp: error.timestamp,
    });

    if (error.isCritical) {
      this.showCriticalError("シナリオの読み込みに失敗しました", error.message);
    } else {
      this.showWarning("シナリオの一部が読み込めませんでした", error.message);
    }
  }

  /**
   * アセットエラーの処理
   */
  public handleAssetError(error: AssetError): void {
    this.logError(error);

    console.error("Asset Error:", {
      message: error.message,
      assetPath: error.assetPath,
      assetType: error.assetType,
      timestamp: error.timestamp,
    });

    if (error.isCritical) {
      this.showCriticalError(
        "必要なファイルの読み込みに失敗しました",
        error.message
      );
    } else {
      // 代替アセットの使用を試行
      this.useDefaultAsset(error.assetPath, error.assetType);
    }
  }

  /**
   * セーブ・ロードエラーの処理
   */
  public handleSaveLoadError(error: SaveLoadError): void {
    this.logError(error);

    console.error("Save/Load Error:", {
      message: error.message,
      operation: error.operation,
      slotId: error.slotId,
      timestamp: error.timestamp,
    });

    const operationText = error.operation === "save" ? "セーブ" : "ロード";
    this.showError(`${operationText}に失敗しました`, error.message);
  }

  /**
   * システムエラーの処理
   */
  public handleSystemError(error: SystemError): void {
    this.logError(error);

    console.error("System Error:", {
      message: error.message,
      errorCode: error.errorCode,
      timestamp: error.timestamp,
    });

    this.showCriticalError("システムエラーが発生しました", error.message);
  }

  /**
   * 一般的なエラーの処理
   */
  public handleGenericError(error: Error): void {
    const gameError = new SystemError(error.message, undefined, true);
    this.handleSystemError(gameError);
  }

  /**
   * エラーログの記録
   */
  private logError(error: GameError): void {
    this.errorLog.push(error);

    // ログが多くなりすぎないよう制限
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  /**
   * 重大なエラーの表示
   */
  private showCriticalError(title: string, message: string): void {
    // TODO: UI実装後に適切なエラーダイアログを表示
    alert(`${title}\n\n${message}`);
  }

  /**
   * 一般的なエラーの表示
   */
  private showError(title: string, message: string): void {
    // TODO: UI実装後に適切なエラーダイアログを表示
    console.warn(`${title}: ${message}`);
  }

  /**
   * 警告の表示
   */
  private showWarning(title: string, message: string): void {
    console.warn(`${title}: ${message}`);
  }

  /**
   * 代替アセットの使用
   */
  private useDefaultAsset(
    assetPath: string,
    assetType: "image" | "audio" | "other"
  ): void {
    console.warn(`Using default asset for: ${assetPath} (type: ${assetType})`);

    // TODO: 代替アセットの実装
    switch (assetType) {
      case "image":
        // デフォルト画像を使用
        break;
      case "audio":
        // 無音またはデフォルト音声を使用
        break;
      default:
        // その他の代替処理
        break;
    }
  }

  /**
   * エラーログの取得
   */
  public getErrorLog(): GameError[] {
    return [...this.errorLog];
  }

  /**
   * エラーログのクリア
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}
