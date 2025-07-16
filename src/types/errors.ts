/**
 * エラーハンドリング用のクラス定義
 */

// 基本エラークラス
export abstract class GameError extends Error {
  public readonly timestamp: number;
  public readonly isCritical: boolean;

  constructor(message: string, isCritical: boolean = false) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = Date.now();
    this.isCritical = isCritical;
  }
}

// シナリオ関連エラー
export class ScenarioError extends GameError {
  public readonly filePath?: string;

  constructor(message: string, filePath?: string, isCritical: boolean = false) {
    super(message, isCritical);
    this.filePath = filePath;
  }
}

// アセット関連エラー
export class AssetError extends GameError {
  public readonly assetPath: string;
  public readonly assetType: "image" | "audio" | "other";

  constructor(
    message: string,
    assetPath: string,
    assetType: "image" | "audio" | "other",
    isCritical: boolean = false
  ) {
    super(message, isCritical);
    this.assetPath = assetPath;
    this.assetType = assetType;
  }
}

// セーブ・ロード関連エラー
export class SaveLoadError extends GameError {
  public readonly operation: "save" | "load";
  public readonly slotId?: string;

  constructor(
    message: string,
    operation: "save" | "load",
    slotId?: string,
    isCritical: boolean = false
  ) {
    super(message, isCritical);
    this.operation = operation;
    this.slotId = slotId;
  }
}

// システム関連エラー
export class SystemError extends GameError {
  public readonly errorCode?: string;

  constructor(message: string, errorCode?: string, isCritical: boolean = true) {
    super(message, isCritical);
    this.errorCode = errorCode;
  }
}
