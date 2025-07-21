import { AssetMappingStrategy } from "./AssetMappingStrategy";

// 画像生成ガイド - 開発者向けアセット生成支援
export class AssetGenerationGuide {
  
  // 完全なアセット生成レポートを作成
  static generateCompleteReport(): {
    summary: {
      totalAssets: number;
      backgroundAssets: number;
      characterAssets: number;
      missingPrompts: number;
    };
    backgroundAssets: Array<{
      assetId: string;
      scenarioDirectives: string[];
      promptFile: string;
      promptSection: string;
      description: string;
      priority: "high" | "medium" | "low";
      generationInstructions: string;
    }>;
    characterAssets: Array<{
      assetId: string;
      character: string;
      expression: string;
      promptFile: string;
      promptSection: string;
      description: string;
      priority: "high" | "medium" | "low";
      generationInstructions: string;
    }>;
    generationOrder: string[];
    techSpecs: {
      backgroundSpecs: { width: number; height: number; format: string };
      characterSpecs: { width: number; height: number; format: string };
      qualityRequirements: string[];
    };
  } {
    const report = AssetMappingStrategy.generateAssetReport();
    
    // 背景アセット詳細
    const backgroundAssets = report.backgrounds
      .filter(bg => bg.promptInfo) // プロンプト情報があるもののみ
      .map(bg => {
        // このアセットIDが使用されるシナリオディレクティブを取得
        const scenarioDirectives = Object.entries(AssetMappingStrategy["scenarioBackgroundMapping"])
          .filter(([, assetId]) => assetId === bg.assetId)
          .map(([directive]) => directive);

        return {
          assetId: bg.assetId,
          scenarioDirectives,
          promptFile: bg.promptInfo.promptFile,
          promptSection: bg.promptInfo.promptSection,
          description: bg.promptInfo.description,
          priority: AssetGenerationGuide.calculateAssetPriority(bg.assetId, scenarioDirectives.length),
          generationInstructions: AssetGenerationGuide.generateBackgroundInstructions(bg.assetId, bg.promptInfo)
        };
      });

    // キャラクターアセット詳細
    const characterAssets = report.characters
      .filter(char => char.promptInfo) // プロンプト情報があるもののみ
      .map(char => ({
        assetId: char.assetId,
        character: char.character,
        expression: char.expression,
        promptFile: char.promptInfo.promptFile,
        promptSection: char.promptInfo.promptSection,
        description: char.promptInfo.description,
        priority: AssetGenerationGuide.calculateCharacterPriority(char.character, char.expression),
        generationInstructions: AssetGenerationGuide.generateCharacterInstructions(char.assetId, char.promptInfo)
      }));

    // 生成順序を決定
    const generationOrder = AssetGenerationGuide.calculateGenerationOrder(backgroundAssets, characterAssets);

    return {
      summary: {
        totalAssets: backgroundAssets.length + characterAssets.length,
        backgroundAssets: backgroundAssets.length,
        characterAssets: characterAssets.length,
        missingPrompts: report.missingAssets.length
      },
      backgroundAssets,
      characterAssets,
      generationOrder,
      techSpecs: {
        backgroundSpecs: { width: 1280, height: 720, format: "PNG/JPG" },
        characterSpecs: { width: 512, height: 768, format: "PNG" },
        qualityRequirements: [
          "解像度：高解像度（2K以上推奨）",
          "形式：PNG（透明背景が必要な場合）、JPG（背景画像）",
          "スタイル：アニメ・ビジュアルノベル風",
          "品質：商用ゲーム品質",
          "コンシスタンシー：キャラクターデザインの一貫性必須"
        ]
      }
    };
  }

  // アセット優先度を計算
  private static calculateAssetPriority(assetId: string, usageCount: number): "high" | "medium" | "low" {
    // 基本キャラクター・重要背景は高優先度
    if (assetId.includes("nanatau_normal") || assetId.includes("church") || assetId.includes("ujina_hill")) {
      return "high";
    }
    
    // 使用頻度が高い場合は高優先度
    if (usageCount >= 3) {
      return "high";
    }
    
    if (usageCount >= 1) {
      return "medium";
    }
    
    return "low";
  }

  // キャラクター優先度を計算
  private static calculateCharacterPriority(character: string, expression: string): "high" | "medium" | "low" {
    if (character === "ななたう" && (expression === "通常" || expression === "微笑み")) {
      return "high";
    }
    
    if (character === "ななたう") {
      return "medium";
    }
    
    return "low";
  }

  // 背景生成指示を作成
  private static generateBackgroundInstructions(assetId: string, promptInfo: any): string {
    return `
1. プロンプトファイルを参照: image-asset-management/generation-prompts/background-prompts/${promptInfo.promptFile}
2. セクション「${promptInfo.promptSection}」のプロンプトを使用
3. 出力仕様: 1280x720px, PNG/JPG形式
4. ファイル名: ${assetId}.png/.jpg
5. 保存先: public/assets/backgrounds/${assetId}.png/.jpg
6. 注意事項: ビジュアルノベル背景として使用、UI要素と重ならないよう構図に注意
    `.trim();
  }

  // キャラクター生成指示を作成
  private static generateCharacterInstructions(assetId: string, promptInfo: any): string {
    return `
1. プロンプトファイルを参照: image-asset-management/generation-prompts/character-prompts/${promptInfo.promptFile}
2. セクション「${promptInfo.promptSection}」のプロンプトを使用
3. 出力仕様: 512x768px以上, PNG形式（透明背景）
4. ファイル名: ${assetId}.png
5. 保存先: public/assets/characters/${assetId}.png
6. 注意事項: 立ち絵として使用、透明背景必須、キャラクターデザイン一貫性重要
    `.trim();
  }

  // 生成順序を計算
  private static calculateGenerationOrder(backgroundAssets: any[], characterAssets: any[]): string[] {
    const allAssets = [
      ...backgroundAssets.map(bg => ({ ...bg, type: "background" })),
      ...characterAssets.map(char => ({ ...char, type: "character" }))
    ];

    // 優先度順でソート
    allAssets.sort((a, b) => {
      const priorityOrder: Record<string, number> = { "high": 0, "medium": 1, "low": 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

    return allAssets.map(asset => asset.assetId);
  }

  // Markdown形式のレポートを生成
  static generateMarkdownReport(): string {
    const report = AssetGenerationGuide.generateCompleteReport();
    
    const markdown = `# 画像アセット生成ガイド

## 📊 概要
- **総アセット数**: ${report.summary.totalAssets}
- **背景画像**: ${report.summary.backgroundAssets}個
- **キャラクター画像**: ${report.summary.characterAssets}個

## 🎯 技術仕様
### 背景画像
- 解像度: ${report.techSpecs.backgroundSpecs.width}x${report.techSpecs.backgroundSpecs.height}px
- 形式: ${report.techSpecs.backgroundSpecs.format}

### キャラクター画像  
- 解像度: ${report.techSpecs.characterSpecs.width}x${report.techSpecs.characterSpecs.height}px以上
- 形式: ${report.techSpecs.characterSpecs.format}（透明背景）

### 品質要件
${report.techSpecs.qualityRequirements.map(req => `- ${req}`).join('\n')}

## 🔥 高優先度アセット（先に生成）

### 背景画像
${report.backgroundAssets
  .filter(bg => bg.priority === "high")
  .map(bg => `
#### ${bg.assetId}
- **説明**: ${bg.description}
- **シナリオ使用箇所**: ${bg.scenarioDirectives.join(', ')}
- **生成手順**:
${bg.generationInstructions}
`).join('\n')}

### キャラクター画像
${report.characterAssets
  .filter(char => char.priority === "high")
  .map(char => `
#### ${char.assetId}
- **キャラクター**: ${char.character}
- **表情**: ${char.expression}
- **説明**: ${char.description}
- **生成手順**:
${char.generationInstructions}
`).join('\n')}

## 📋 全アセット一覧

### 背景画像 (${report.backgroundAssets.length}個)
${report.backgroundAssets.map((bg, index) => `
${index + 1}. **${bg.assetId}** (${bg.priority}優先度)
   - 説明: ${bg.description}
   - 使用箇所: ${bg.scenarioDirectives.join(', ')}
   - プロンプト: ${bg.promptFile} > ${bg.promptSection}
`).join('')}

### キャラクター画像 (${report.characterAssets.length}個)
${report.characterAssets.map((char, index) => `
${index + 1}. **${char.assetId}** (${char.priority}優先度)
   - キャラクター: ${char.character} (${char.expression})
   - 説明: ${char.description}
   - プロンプト: ${char.promptFile} > ${char.promptSection}
`).join('')}

## ⚡ 推奨生成順序
${report.generationOrder.map((assetId, index) => `${index + 1}. ${assetId}`).join('\n')}

## 🎨 AI画像生成設定例

### Stable Diffusion設定
- Model: Anything V4.5 または NAI-based model
- Steps: 20-30
- CFG Scale: 7-12
- Sampler: DPM++ 2M Karras

### NovelAI設定  
- Model: NAI Diffusion Anime (Full)
- Steps: 28
- Scale: 11
- Sampler: k_euler_ancestral

## 📁 ファイル配置
\`\`\`
public/assets/
├── backgrounds/
│   ├── ujina_hill_road.jpg
│   ├── church_exterior.jpg
│   └── ...
├── characters/
│   ├── nanatau_normal.png
│   ├── nanatau_smile.png
│   └── ...
└── ui/
    └── ...
\`\`\`

---
*このレポートは AssetGenerationGuide により自動生成されました*
`;

    return markdown;
  }

  // JSONレポートを生成
  static generateJSONReport(): string {
    const report = AssetGenerationGuide.generateCompleteReport();
    return JSON.stringify(report, null, 2);
  }

  // コンソールに詳細レポートを出力
  static logDetailedReport(): void {
    const report = AssetGenerationGuide.generateCompleteReport();
    
    console.group("🎨 Asset Generation Guide - Detailed Report");
    
    console.log("📊 Summary:");
    console.log(`  Total Assets: ${report.summary.totalAssets}`);
    console.log(`  Backgrounds: ${report.summary.backgroundAssets}`);
    console.log(`  Characters: ${report.summary.characterAssets}`);
    
    console.log("\n🔥 High Priority Assets:");
    const highPriorityBg = report.backgroundAssets.filter(bg => bg.priority === "high");
    const highPriorityChar = report.characterAssets.filter(char => char.priority === "high");
    
    console.log(`  Backgrounds (${highPriorityBg.length}):`);
    highPriorityBg.forEach(bg => {
      console.log(`    - ${bg.assetId}: ${bg.description}`);
    });
    
    console.log(`  Characters (${highPriorityChar.length}):`);
    highPriorityChar.forEach(char => {
      console.log(`    - ${char.assetId}: ${char.character} (${char.expression})`);
    });
    
    console.log("\n⚡ Generation Order (First 10):");
    report.generationOrder.slice(0, 10).forEach((assetId, index) => {
      console.log(`  ${index + 1}. ${assetId}`);
    });
    
    console.groupEnd();
  }

  // ファイルシステムにレポートを出力
  static async saveReportsToFile(): Promise<void> {
    try {
      const markdownReport = AssetGenerationGuide.generateMarkdownReport();
      const jsonReport = AssetGenerationGuide.generateJSONReport();
      
      // Node.js環境の場合のみファイル出力（ブラウザでは無効）
      if (typeof window === "undefined" && typeof process !== "undefined") {
        const fs = await import("fs");
        const path = await import("path");
        
        const reportsDir = path.join(process.cwd(), "asset-generation-reports");
        
        // ディレクトリ作成
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        // ファイル出力
        fs.writeFileSync(
          path.join(reportsDir, "asset-generation-guide.md"),
          markdownReport
        );
        
        fs.writeFileSync(
          path.join(reportsDir, "asset-generation-guide.json"),
          jsonReport
        );
        
        console.log("✅ Asset generation reports saved to asset-generation-reports/");
      } else {
        console.log("📋 Reports generated (browser environment - file save not available)");
        console.log("Markdown Report:", markdownReport);
      }
    } catch (error) {
      console.error("Failed to save reports:", error);
    }
  }

  // 初期化とレポート生成
  static initialize(): void {
    console.log("Initializing Asset Generation Guide...");
    
    // 詳細レポートをログ出力
    AssetGenerationGuide.logDetailedReport();
    
    console.log("Asset Generation Guide initialized successfully");
  }
}