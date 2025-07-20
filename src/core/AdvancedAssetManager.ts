import { sound, canvas, ImageSprite } from "@drincs/pixi-vn";

// 高度なアセット管理システム
export class AdvancedAssetManager {
  private static assetRegistry = new Map<string, any>();
  private static loadingPromises = new Map<string, Promise<any>>();
  private static preloadQueue: string[] = [];

  // アセット定義
  private static assetDefinitions = {
    backgrounds: {
      church_exterior: "assets/backgrounds/church_exterior.jpg",
      church_interior: "assets/backgrounds/church_interior.jpg",
      stained_glass: "assets/backgrounds/stained_glass.jpg",
      sunset_hill: "assets/backgrounds/sunset_hill.jpg",
    },
    characters: {
      nanatau_normal: "assets/characters/nanatau_normal.png",
      nanatau_smile: "assets/characters/nanatau_smile.png",
      nanatau_sad: "assets/characters/nanatau_sad.png",
      protagonist_normal: "assets/characters/protagonist_normal.png",
    },
    audio: {
      bgm_main: "assets/audio/main_theme.mp3",
      bgm_church: "assets/audio/church_theme.mp3",
      se_wind: "assets/audio/wind.wav",
      se_footsteps: "assets/audio/footsteps.wav",
      se_glass: "assets/audio/glass_touch.wav",
    },
    ui: {
      dialogue_bg: "assets/ui/dialogue_background.png",
      button_normal: "assets/ui/button_normal.png",
      button_hover: "assets/ui/button_hover.png",
    },
  };

  // アセットのプリロード
  static async preloadAssets(assetList?: string[]): Promise<void> {
    console.log("Starting asset preloading...");

    const assetsToLoad = assetList || AdvancedAssetManager.getDefaultPreloadList();

    try {
      const loadPromises = assetsToLoad.map((assetId) =>
        AdvancedAssetManager.loadAsset(assetId)
      );
      await Promise.allSettled(loadPromises);
      console.log("Asset preloading completed");
    } catch (error) {
      console.warn("Some assets failed to preload:", error);
    }
  }

  // デフォルトのプリロードリスト
  private static getDefaultPreloadList(): string[] {
    return [
      // 必須背景
      "church_exterior",
      "church_interior",

      // 主要キャラクター
      "nanatau_normal",
      "nanatau_smile",

      // 必須音楽
      "bgm_main",
      "se_wind",
    ];
  }

  // 個別アセットの読み込み
  static async loadAsset(assetId: string): Promise<any> {
    // 既に読み込み済みの場合はキャッシュから返す
    if (AdvancedAssetManager.assetRegistry.has(assetId)) {
      return AdvancedAssetManager.assetRegistry.get(assetId);
    }

    // 既に読み込み中の場合は既存のPromiseを返す
    if (AdvancedAssetManager.loadingPromises.has(assetId)) {
      return AdvancedAssetManager.loadingPromises.get(assetId);
    }

    // アセット定義を検索
    const assetPath = AdvancedAssetManager.findAssetPath(assetId);
    if (!assetPath) {
      console.warn(`Asset not found: ${assetId}`);
      return null;
    }

    // 読み込み開始
    const loadingPromise = AdvancedAssetManager.performAssetLoad(assetId, assetPath);
    AdvancedAssetManager.loadingPromises.set(assetId, loadingPromise);

    try {
      const asset = await loadingPromise;
      AdvancedAssetManager.assetRegistry.set(assetId, asset);
      AdvancedAssetManager.loadingPromises.delete(assetId);
      console.log(`Asset loaded successfully: ${assetId}`);
      return asset;
    } catch (error) {
      AdvancedAssetManager.loadingPromises.delete(assetId);
      console.error(`Failed to load asset ${assetId}:`, error);
      return null;
    }
  }

  // アセットパスを検索
  private static findAssetPath(assetId: string): string | null {
    for (const category of Object.values(AdvancedAssetManager.assetDefinitions)) {
      if ((category as any)[assetId]) {
        return (category as any)[assetId];
      }
    }
    return null;
  }

  // 実際のアセット読み込み処理
  private static async performAssetLoad(
    assetId: string,
    assetPath: string
  ): Promise<any> {
    const fileType = AdvancedAssetManager.getFileType(assetPath);

    switch (fileType) {
      case "image":
        return AdvancedAssetManager.loadImage(assetPath);

      case "audio":
        return AdvancedAssetManager.loadAudio(assetId, assetPath);

      default:
        throw new Error(`Unsupported file type for asset: ${assetId}`);
    }
  }

  // ファイルタイプの判定
  private static getFileType(path: string): string {
    const extension = path.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return "image";
    }

    if (["mp3", "wav", "ogg", "m4a"].includes(extension || "")) {
      return "audio";
    }

    return "unknown";
  }

  // 画像の読み込み
  private static async loadImage(imagePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${imagePath}`));
      img.src = imagePath;
    });
  }

  // 音声の読み込み
  private static async loadAudio(
    assetId: string,
    audioPath: string
  ): Promise<any> {
    try {
      // @drincs/pixi-vnのsound システムに追加
      sound.add(assetId, audioPath);
      return { id: assetId, path: audioPath, loaded: true };
    } catch (error) {
      console.warn(`Audio loading failed for ${assetId}:`, error);
      return { id: assetId, path: audioPath, loaded: false };
    }
  }

  // 背景画像を設定
  static async setBackground(backgroundId: string): Promise<boolean> {
    try {
      console.log(`Setting background: ${backgroundId}`);

      // アセットを読み込み
      const backgroundImage = await AdvancedAssetManager.loadAsset(backgroundId);
      if (!backgroundImage) {
        console.warn(`Background asset not found: ${backgroundId}`);
        return false;
      }

      // 新しい背景スプライトを作成
      const backgroundSprite = new ImageSprite({
        anchor: { x: 0.5, y: 0.5 },
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        // 実際の画像を使用する場合はここでtextureを設定
        // texture: PIXI.Texture.from(backgroundImage)
      });

      // キャンバスに追加
      await canvas.add("background", backgroundSprite);
      console.log(`Background set successfully: ${backgroundId}`);
      return true;
    } catch (error) {
      console.error(`Failed to set background ${backgroundId}:`, error);
      return false;
    }
  }

  // キャラクター画像を設定
  static async setCharacter(
    characterId: string,
    assetId: string,
    position?: { x?: number; y?: number }
  ): Promise<boolean> {
    try {
      console.log(`Setting character: ${characterId} with asset: ${assetId}`);

      // アセットを読み込み
      const characterImage = await AdvancedAssetManager.loadAsset(assetId);
      if (!characterImage) {
        console.warn(`Character asset not found: ${assetId}`);
        return false;
      }

      // キャラクタースプライトを作成
      const characterSprite = new ImageSprite({
        anchor: { x: 0.5, y: 1 },
        x: position?.x || 640,
        y: position?.y || 650,
        width: 300,
        height: 400,
        // 実際の画像を使用する場合はここでtextureを設定
        // texture: PIXI.Texture.from(characterImage)
      });

      // キャンバスに追加
      await canvas.add(characterId, characterSprite);
      console.log(`Character set successfully: ${characterId}`);
      return true;
    } catch (error) {
      console.error(`Failed to set character ${characterId}:`, error);
      return false;
    }
  }

  // BGM再生
  static async playBGM(
    bgmId: string,
    options?: { volume?: number; loop?: boolean }
  ): Promise<boolean> {
    try {
      console.log(`Playing BGM: ${bgmId}`);

      // アセットを読み込み
      const bgmAsset = await AdvancedAssetManager.loadAsset(bgmId);
      if (!bgmAsset?.loaded) {
        console.warn(`BGM asset not found or failed to load: ${bgmId}`);
        return false;
      }

      // BGMを再生
      sound.play(bgmId, {
        volume: options?.volume || 0.6,
        loop: options?.loop !== false, // デフォルトでループ
      });

      console.log(`BGM playing: ${bgmId}`);
      return true;
    } catch (error) {
      console.error(`Failed to play BGM ${bgmId}:`, error);
      return false;
    }
  }

  // 効果音再生
  static async playSE(
    seId: string,
    options?: { volume?: number }
  ): Promise<boolean> {
    try {
      console.log(`Playing SE: ${seId}`);

      // アセットを読み込み
      const seAsset = await AdvancedAssetManager.loadAsset(seId);
      if (!seAsset?.loaded) {
        console.warn(`SE asset not found or failed to load: ${seId}`);
        return false;
      }

      // 効果音を再生
      sound.play(seId, {
        volume: options?.volume || 0.8,
        loop: false,
      });

      console.log(`SE played: ${seId}`);
      return true;
    } catch (error) {
      console.error(`Failed to play SE ${seId}:`, error);
      return false;
    }
  }

  // アセット統計情報
  static getAssetStats(): { total: number; loaded: number; failed: number } {
    const total = Object.values(AdvancedAssetManager.assetDefinitions).reduce(
      (count, category) => {
        return count + Object.keys(category).length;
      },
      0
    );

    const loaded = AdvancedAssetManager.assetRegistry.size;
    const failed = total - loaded; // 簡略化

    return { total, loaded, failed };
  }

  // メモリクリーンアップ
  static cleanup(): void {
    console.log("Cleaning up asset manager...");
    AdvancedAssetManager.assetRegistry.clear();
    AdvancedAssetManager.loadingPromises.clear();
    AdvancedAssetManager.preloadQueue.length = 0;
    console.log("Asset manager cleanup completed");
  }

  // 初期化
  static async initialize(): Promise<void> {
    console.log("Initializing Advanced Asset Manager...");

    try {
      // デフォルトアセットをプリロード
      await AdvancedAssetManager.preloadAssets();
      console.log("Advanced Asset Manager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Advanced Asset Manager:", error);
    }
  }
}
