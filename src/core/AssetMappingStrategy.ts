import { AdvancedAssetManager } from "./AdvancedAssetManager";

// 画像アセット戦略とマッピングシステム
export class AssetMappingStrategy {
  // シナリオディレクティブから実際のアセットIDへのマッピング
  private static scenarioBackgroundMapping: Record<string, string> = {
    // 宇品地区の背景
    "宇品の坂道": "ujina_hill_road",
    "坂道": "ujina_hill_road", 
    "宇品の丘": "ujina_hill_road",
    "宇品駅": "ujina_station",
    "広島港": "hiroshima_port",
    "港": "hiroshima_port",
    "海岸": "ujina_coast",
    "海": "ujina_coast",
    
    // 教会関連
    "教会": "church_exterior",
    "教会の外観": "church_exterior",
    "教会内部": "church_interior",
    "教会の中": "church_interior",
    
    // ステンドグラス関連
    "ステンドグラス": "stained_glass_window",
    "ステンドグラスの世界": "stained_glass_world",
    "ガラスの世界": "stained_glass_world",
    
    // 自然風景
    "夕焼けの丘": "sunset_hill",
    "夕暮れの坂": "sunset_hill",
    "菜の花畑": "canola_field",
    "花畑": "canola_field",
    
    // その他の場所
    "学校": "school_exterior",
    "教室": "school_classroom",
    "屋上": "school_rooftop",
    "住宅街": "residential_area",
    "商店街": "shopping_street"
  };

  // キャラクターアセットマッピング
  private static characterAssetMapping: Record<string, Record<string, string>> = {
    "ななたう": {
      "通常": "nanatau_normal",
      "微笑み": "nanatau_smile", 
      "悲しみ": "nanatau_sad",
      "困惑": "nanatau_confused",
      "驚き": "nanatau_surprised",
      "ヒビ": "nanatau_cracked",
      "透明": "nanatau_translucent"
    },
    "主人公": {
      "通常": "protagonist_normal",
      "影": "protagonist_silhouette"
    }
  };

  // 画像生成プロンプトとアセットIDの関連付け
  private static assetPromptMapping: Record<string, {
    category: string;
    promptFile: string;
    promptSection: string;
    description: string;
  }> = {
    // 背景アセット
    "ujina_hill_road": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md",
      promptSection: "宇品の坂道 (Ujina Hill Road)",
      description: "宇品地区の住宅街の坂道、瀬戸内海を見下ろす風景"
    },
    "ujina_station": {
      category: "backgrounds", 
      promptFile: "ujina_prompts.md",
      promptSection: "宇品駅 (Ujina Station)",
      description: "広島電鉄宇品線の終点駅"
    },
    "hiroshima_port": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md", 
      promptSection: "広島港 (Hiroshima Port)",
      description: "宇品の港、船や海鳥が見える風景"
    },
    "ujina_coast": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md",
      promptSection: "宇品海岸 (Ujina Coast)", 
      description: "瀬戸内海に面した海岸線"
    },
    "church_exterior": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md",
      promptSection: "教会外観 (Church Exterior)",
      description: "古い石造りの教会の外観"
    },
    "church_interior": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md", 
      promptSection: "教会内部 (Church Interior)",
      description: "ステンドグラスのある教会内部"
    },
    "stained_glass_window": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md",
      promptSection: "ステンドグラス窓 (Stained Glass Window)", 
      description: "美しいステンドグラス窓のクローズアップ"
    },
    "stained_glass_world": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md",
      promptSection: "ステンドグラス世界 (Stained Glass World)",
      description: "ステンドグラスの中の幻想的な菜の花畑"
    },
    "sunset_hill": {
      category: "backgrounds",
      promptFile: "ujina_prompts.md",
      promptSection: "夕焼けの丘 (Sunset Hill)",
      description: "夕暮れ時の宇品の丘、金色に染まる風景"
    },
    "canola_field": {
      category: "backgrounds", 
      promptFile: "ujina_prompts.md",
      promptSection: "菜の花畑 (Canola Field)",
      description: "一面の菜の花畑、春の風景"
    },

    // キャラクターアセット
    "nanatau_normal": {
      category: "characters",
      promptFile: "nanatau_prompts.md",
      promptSection: "基本立ち絵プロンプト - パターン1",
      description: "ななたうの基本立ち絵、白いワンピース"
    },
    "nanatau_smile": {
      category: "characters",
      promptFile: "nanatau_prompts.md", 
      promptSection: "表情バリエーション - 微笑み",
      description: "ななたうの微笑み表情"
    },
    "nanatau_sad": {
      category: "characters",
      promptFile: "nanatau_prompts.md",
      promptSection: "表情バリエーション - 悲しみ", 
      description: "ななたうの悲しい表情"
    },
    "nanatau_cracked": {
      category: "characters",
      promptFile: "nanatau_prompts.md",
      promptSection: "特殊状態 - ヒビ割れ",
      description: "ななたうの体にヒビが入った状態"
    },
    "nanatau_translucent": {
      category: "characters",
      promptFile: "nanatau_prompts.md",
      promptSection: "特殊状態 - 透明化", 
      description: "ななたうの透明化状態"
    }
  };

  // プレースホルダー画像の定義
  private static placeholderImages: Record<string, string> = {
    backgrounds: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMUExQTJFIi8+Cjx0ZXh0IHg9IjY0MCIgeT0iMzYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1zaXplPSIyNCI+QmFja2dyb3VuZCBQbGFjZWhvbGRlcjwvdGV4dD4KPHN2Zz4K",
    characters: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNjY3RUVBII8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1zaXplPSIxOCI+Q2hhcmFjdGVyPC90ZXh0Pgo8L3N2Zz4K",
    ui: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMkE1Mjk4Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LXNpemU9IjE0Ij5VSSBQbGFjZWhvbGRlcjwvdGV4dD4KPHN2Zz4K"
  };

  // シナリオディレクティブから背景アセットIDを取得
  static resolveBackgroundAsset(backgroundDirective: string): string | null {
    const normalized = backgroundDirective.trim();
    
    // 完全一致を最初に試行
    if (AssetMappingStrategy.scenarioBackgroundMapping[normalized]) {
      return AssetMappingStrategy.scenarioBackgroundMapping[normalized];
    }

    // 部分一致を試行
    for (const [key, value] of Object.entries(AssetMappingStrategy.scenarioBackgroundMapping)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }

    console.warn(`Background directive not mapped: "${backgroundDirective}"`);
    return null;
  }

  // キャラクターアセットIDを取得
  static resolveCharacterAsset(characterName: string, expression?: string): string | null {
    const character = AssetMappingStrategy.characterAssetMapping[characterName];
    if (!character) {
      console.warn(`Character not found: "${characterName}"`);
      return null;
    }

    const assetId = character[expression || "通常"];
    if (!assetId) {
      console.warn(`Expression not found for ${characterName}: "${expression}"`);
      // フォールバックとして通常表情を返す
      return character["通常"] || null;
    }

    return assetId;
  }

  // アセットの生成プロンプト情報を取得
  static getAssetPromptInfo(assetId: string): any {
    return AssetMappingStrategy.assetPromptMapping[assetId] || null;
  }

  // プレースホルダー画像を取得
  static getPlaceholderImage(category: string): string {
    const image = AssetMappingStrategy.placeholderImages[category];
    if (image) {
      return image;
    }
    
    const backgroundImage = AssetMappingStrategy.placeholderImages['backgrounds'];
    return backgroundImage || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMUExQTJFIi8+Cjx0ZXh0IHg9IjY0MCIgeT0iMzYwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1zaXplPSIyNCI+UGxhY2Vob2xkZXI8L3RleHQ+Cjwvc3ZnPgo=";
  }

  // アセットが実際に存在するかチェック
  static async checkAssetExists(assetId: string): Promise<boolean> {
    try {
      const asset = await AdvancedAssetManager.loadAsset(assetId);
      return asset !== null;
    } catch (error) {
      return false;
    }
  }

  // シナリオで使用される全背景ディレクティブを取得
  static getAllScenarioBackgrounds(): string[] {
    return Object.keys(AssetMappingStrategy.scenarioBackgroundMapping);
  }

  // 全キャラクター・表情組み合わせを取得
  static getAllCharacterAssets(): Array<{character: string, expression: string, assetId: string}> {
    const assets: Array<{character: string, expression: string, assetId: string}> = [];
    
    for (const [character, expressions] of Object.entries(AssetMappingStrategy.characterAssetMapping)) {
      for (const [expression, assetId] of Object.entries(expressions)) {
        assets.push({ character, expression, assetId });
      }
    }
    
    return assets;
  }

  // アセット生成レポートを作成
  static generateAssetReport(): {
    backgrounds: Array<{directive: string, assetId: string, promptInfo: any}>,
    characters: Array<{character: string, expression: string, assetId: string, promptInfo: any}>,
    missingAssets: string[]
  } {
    const backgrounds = [];
    const characters = [];
    const missingAssets = [];

    // 背景アセット情報
    for (const [directive, assetId] of Object.entries(AssetMappingStrategy.scenarioBackgroundMapping)) {
      const promptInfo = AssetMappingStrategy.getAssetPromptInfo(assetId);
      backgrounds.push({ directive, assetId, promptInfo });
      
      if (!promptInfo) {
        missingAssets.push(assetId);
      }
    }

    // キャラクターアセット情報
    for (const asset of AssetMappingStrategy.getAllCharacterAssets()) {
      const promptInfo = AssetMappingStrategy.getAssetPromptInfo(asset.assetId);
      characters.push({ ...asset, promptInfo });
      
      if (!promptInfo) {
        missingAssets.push(asset.assetId);
      }
    }

    return { backgrounds, characters, missingAssets };
  }

  // 初期化とバリデーション
  static initialize(): void {
    console.log("Initializing Asset Mapping Strategy...");
    
    const report = AssetMappingStrategy.generateAssetReport();
    console.log(`Background mappings: ${report.backgrounds.length}`);
    console.log(`Character mappings: ${report.characters.length}`);
    
    if (report.missingAssets.length > 0) {
      console.warn(`Missing asset prompt mappings: ${report.missingAssets.length}`, report.missingAssets);
    }
    
    console.log("Asset Mapping Strategy initialized successfully");
  }
}