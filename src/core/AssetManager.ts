/**
 * アセット管理システム
 * 画像・音声ファイルの最適化、プリロード、キャッシュ管理を行う
 */

export interface AssetConfig {
  /** アセットのベースURL */
  baseUrl: string;
  /** プリロード優先度 */
  priority: "high" | "medium" | "low";
  /** キャッシュ戦略 */
  cacheStrategy: "cache-first" | "network-first" | "cache-only";
  /** リサイズ設定（画像用） */
  imageOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  };
  /** 音声設定 */
  audioOptions?: {
    preload?: "auto" | "metadata" | "none";
    volume?: number;
  };
}

export interface AssetItem {
  id: string;
  type: "image" | "audio" | "video" | "font";
  src: string;
  config?: AssetConfig;
  loaded?: boolean;
  error?: Error | undefined;
  element?: HTMLImageElement | HTMLAudioElement | HTMLVideoElement | undefined;
}

export class AssetManager {
  private assets: Map<string, AssetItem> = new Map();
  private loadingQueue: Map<string, Promise<AssetItem>> = new Map();
  private cache: Map<string, Blob> = new Map();
  private config: AssetConfig;

  constructor(config: Partial<AssetConfig> = {}) {
    this.config = {
      baseUrl: "",
      priority: "medium",
      cacheStrategy: "cache-first",
      ...config,
    };
  }

  /**
   * アセットを登録
   */
  register(asset: Omit<AssetItem, "loaded" | "error" | "element">): void {
    this.assets.set(asset.id, {
      ...asset,
      loaded: false,
    });
  }

  /**
   * 複数のアセットを一括登録
   */
  registerBatch(
    assets: Array<Omit<AssetItem, "loaded" | "error" | "element">>
  ): void {
    for (const asset of assets) {
      this.register(asset);
    }
  }

  /**
   * アセットをプリロード
   */
  async preload(assetId: string): Promise<AssetItem> {
    const existingLoad = this.loadingQueue.get(assetId);
    if (existingLoad) {
      return existingLoad;
    }

    const asset = this.assets.get(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    if (asset.loaded && asset.element) {
      return asset;
    }

    const loadPromise = this.loadAsset(asset);
    this.loadingQueue.set(assetId, loadPromise);

    try {
      const loadedAsset = await loadPromise;
      this.loadingQueue.delete(assetId);
      return loadedAsset;
    } catch (error) {
      this.loadingQueue.delete(assetId);
      throw error;
    }
  }

  /**
   * 複数のアセットを並行プリロード
   */
  async preloadBatch(assetIds: string[]): Promise<AssetItem[]> {
    const promises = assetIds.map((id) => this.preload(id));
    return Promise.all(promises);
  }

  /**
   * 優先度別プリロード
   */
  async preloadByPriority(
    priority: "high" | "medium" | "low"
  ): Promise<AssetItem[]> {
    const priorityAssets = Array.from(this.assets.values())
      .filter(
        (asset) => (asset.config?.priority || this.config.priority) === priority
      )
      .map((asset) => asset.id);

    return this.preloadBatch(priorityAssets);
  }

  /**
   * アセットを取得
   */
  get(assetId: string): AssetItem | undefined {
    return this.assets.get(assetId);
  }

  /**
   * アセットが読み込み済みかチェック
   */
  isLoaded(assetId: string): boolean {
    const asset = this.assets.get(assetId);
    return asset?.loaded === true;
  }

  /**
   * 読み込み進捗を取得
   */
  getLoadProgress(): { loaded: number; total: number; percentage: number } {
    const total = this.assets.size;
    const loaded = Array.from(this.assets.values()).filter(
      (asset) => asset.loaded
    ).length;
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;

    return { loaded, total, percentage };
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 特定のアセットをアンロード
   */
  unload(assetId: string): void {
    const asset = this.assets.get(assetId);
    if (asset?.element) {
      // メモリ解放
      if (asset.element instanceof HTMLImageElement) {
        asset.element.src = "";
      } else if (asset.element instanceof HTMLAudioElement) {
        asset.element.pause();
        asset.element.src = "";
        asset.element.load();
      }
      asset.element = undefined;
      asset.loaded = false;
    }
  }

  /**
   * アセットの実際の読み込み処理
   */
  private async loadAsset(asset: AssetItem): Promise<AssetItem> {
    const fullUrl = this.resolveUrl(asset.src);

    try {
      switch (asset.type) {
        case "image":
          asset.element = await this.loadImage(
            fullUrl,
            asset.config?.imageOptions
          );
          break;
        case "audio":
          asset.element = await this.loadAudio(
            fullUrl,
            asset.config?.audioOptions
          );
          break;
        case "video":
          asset.element = await this.loadVideo(fullUrl);
          break;
        case "font":
          await this.loadFont(fullUrl);
          break;
        default:
          throw new Error(`Unsupported asset type: ${asset.type}`);
      }

      asset.loaded = true;
      asset.error = undefined;
      this.assets.set(asset.id, asset);

      console.log(`Asset loaded: ${asset.id}`);
      return asset;
    } catch (error) {
      asset.error = error instanceof Error ? error : new Error(String(error));
      asset.loaded = false;
      this.assets.set(asset.id, asset);
      console.error(`Failed to load asset: ${asset.id}`, error);
      throw error;
    }
  }

  /**
   * 画像を読み込み
   */
  private async loadImage(
    url: string,
    options?: AssetConfig["imageOptions"]
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // 必要に応じて画像最適化を実行
        if (options?.maxWidth || options?.maxHeight || options?.format) {
          const optimizedImg = this.optimizeImage(img, options);
          resolve(optimizedImg);
        } else {
          resolve(img);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.crossOrigin = "anonymous";
      img.src = url;
    });
  }

  /**
   * 音声を読み込み
   */
  private async loadAudio(
    url: string,
    options?: AssetConfig["audioOptions"]
  ): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));

      if (options?.preload) {
        audio.preload = options.preload;
      }
      if (options?.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }

      audio.src = url;
      audio.load();
    });
  }

  /**
   * 動画を読み込み
   */
  private async loadVideo(url: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");

      video.oncanplaythrough = () => resolve(video);
      video.onerror = () => reject(new Error(`Failed to load video: ${url}`));

      video.preload = "metadata";
      video.src = url;
      video.load();
    });
  }

  /**
   * フォントを読み込み
   */
  private async loadFont(url: string): Promise<void> {
    const fontFace = new FontFace("CustomFont", `url(${url})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  }

  /**
   * 画像最適化
   */
  private optimizeImage(
    img: HTMLImageElement,
    options: AssetConfig["imageOptions"]
  ): HTMLImageElement {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return img;
    }

    // リサイズ計算
    const { width, height } = this.calculateOptimalSize(
      img.naturalWidth,
      img.naturalHeight,
      options?.maxWidth,
      options?.maxHeight
    );

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // 最適化された画像を作成
    const optimizedImg = new Image();
    const quality = options?.quality || 0.8;
    const format = options?.format || "jpeg";

    optimizedImg.src = canvas.toDataURL(`image/${format}`, quality);
    return optimizedImg;
  }

  /**
   * 最適なサイズを計算
   */
  private calculateOptimalSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * URLを解決
   */
  private resolveUrl(src: string): string {
    if (src.startsWith("http") || src.startsWith("data:")) {
      return src;
    }
    return `${this.config.baseUrl}${src}`;
  }
}

// シングルトンインスタンス
export const assetManager = new AssetManager({
  baseUrl: "/assets/",
  priority: "medium",
  cacheStrategy: "cache-first",
});
