import { canvas } from "@drincs/pixi-vn";
import { AdvancedAssetManager } from "./AdvancedAssetManager";

// シナリオ統合システム - 背景・キャラクター自動設定
export class ScenarioIntegrationSystem {
  private static currentBackground: string | null = null;
  private static currentCharacters = new Map<string, { name: string; expression: string; position?: { x: number; y: number } }>();
  private static directiveHistory: Array<{
    type: string;
    directive: string;
    timestamp: Date;
    success: boolean;
  }> = [];

  // シナリオテキストから背景ディレクティブを解析
  static parseBackgroundDirective(scenarioText: string): string | null {
    // 【背景】ディレクティブを検索
    const backgroundMatch = scenarioText.match(/【背景[：:]\s*([^】]+)】/);
    if (backgroundMatch && backgroundMatch[1]) {
      return backgroundMatch[1].trim();
    }

    // [背景]ディレクティブも検索
    const backgroundMatch2 = scenarioText.match(/\[背景[：:]\s*([^\]]+)\]/);
    if (backgroundMatch2 && backgroundMatch2[1]) {
      return backgroundMatch2[1].trim();
    }

    return null;
  }

  // シナリオテキストからキャラクターディレクティブを解析
  static parseCharacterDirectives(scenarioText: string): Array<{
    id: string;
    name: string;
    expression?: string;
    position?: { x: number; y: number };
  }> {
    const characters: Array<{
      id: string;
      name: string;
      expression?: string;
      position?: { x: number; y: number };
    }> = [];

    // 【立ち絵】ディレクティブを検索
    const characterMatches = scenarioText.matchAll(/【立ち絵[：:]\s*([^】]+)】/g);
    
    for (const match of characterMatches) {
      if (match[1]) {
        const directive = match[1].trim();
        const parsed = ScenarioIntegrationSystem.parseCharacterDirective(directive);
        if (parsed) {
          characters.push(parsed);
        }
      }
    }

    // [立ち絵]ディレクティブも検索
    const characterMatches2 = scenarioText.matchAll(/\[立ち絵[：:]\s*([^\]]+)\]/g);
    
    for (const match of characterMatches2) {
      if (match[1]) {
        const directive = match[1].trim();
        const parsed = ScenarioIntegrationSystem.parseCharacterDirective(directive);
        if (parsed) {
          characters.push(parsed);
        }
      }
    }

    return characters;
  }

  // 個別キャラクターディレクティブを解析
  private static parseCharacterDirective(directive: string): {
    id: string;
    name: string;
    expression?: string;
    position?: { x: number; y: number };
  } | null {
    try {
      // フォーマット例: "ななたう:微笑み:center" or "ななたう:悲しみ:left" or "ななたう:通常"
      const parts = directive.split(':').map(p => p.trim());
      
      if (parts.length < 1) {
        return null;
      }

      const name = parts[0];
      if (!name) {
        return null;
      }
      
      const expression = parts[1] || "通常";
      const positionStr = parts[2] || "center";

      // ポジションを座標に変換
      const position = ScenarioIntegrationSystem.parsePosition(positionStr);

      // キャラクターIDを生成（名前ベース）
      const id = `character_${name.replace(/\s+/g, '_')}`;

      return {
        id,
        name,
        expression,
        position
      };
    } catch (error) {
      console.warn(`Failed to parse character directive: "${directive}"`, error);
      return null;
    }
  }

  // ポジション文字列を座標に変換
  private static parsePosition(positionStr: string): { x: number; y: number } {
    const positions: Record<string, { x: number; y: number }> = {
      "left": { x: 320, y: 650 },
      "center": { x: 640, y: 650 },
      "right": { x: 960, y: 650 },
      "far_left": { x: 160, y: 650 },
      "far_right": { x: 1120, y: 650 }
    };

    return positions[positionStr] || positions["center"] || { x: 640, y: 650 };
  }

  // シナリオテキストからすべてのディレクティブを処理
  static async processScenarioDirectives(scenarioText: string): Promise<{
    backgroundApplied: boolean;
    charactersApplied: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let backgroundApplied = false;
    let charactersApplied = 0;

    try {
      // 背景ディレクティブを処理
      const backgroundDirective = ScenarioIntegrationSystem.parseBackgroundDirective(scenarioText);
      if (backgroundDirective) {
        console.log(`Processing background directive: "${backgroundDirective}"`);
        
        backgroundApplied = await AdvancedAssetManager.setBackgroundFromDirective(backgroundDirective);
        
        if (backgroundApplied) {
          ScenarioIntegrationSystem.currentBackground = backgroundDirective;
        }

        // 履歴に記録
        ScenarioIntegrationSystem.directiveHistory.push({
          type: "background",
          directive: backgroundDirective,
          timestamp: new Date(),
          success: backgroundApplied
        });
      }

      // キャラクターディレクティブを処理
      const characterDirectives = ScenarioIntegrationSystem.parseCharacterDirectives(scenarioText);
      
      for (const charDirective of characterDirectives) {
        try {
          console.log(`Processing character directive:`, charDirective);
          
          const success = await AdvancedAssetManager.setCharacterFromDirective(
            charDirective.id,
            charDirective.name,
            charDirective.expression,
            charDirective.position
          );

          if (success) {
            charactersApplied++;
            const characterData: { name: string; expression: string; position?: { x: number; y: number } } = {
              name: charDirective.name,
              expression: charDirective.expression || "通常"
            };
            
            if (charDirective.position) {
              characterData.position = charDirective.position;
            }
            
            ScenarioIntegrationSystem.currentCharacters.set(charDirective.id, characterData);
          }

          // 履歴に記録
          ScenarioIntegrationSystem.directiveHistory.push({
            type: "character",
            directive: `${charDirective.name}:${charDirective.expression}`,
            timestamp: new Date(),
            success
          });
        } catch (error) {
          const errorMsg = `Failed to apply character directive: ${charDirective.name}`;
          console.error(errorMsg, error);
          errors.push(errorMsg);
        }
      }

    } catch (error) {
      const errorMsg = `Failed to process scenario directives: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }

    return {
      backgroundApplied,
      charactersApplied,
      errors
    };
  }

  // シナリオファイルを自動解析してディレクティブを適用
  static async processScenarioFile(scenarioText: string): Promise<void> {
    console.log("Processing scenario file for asset directives...");
    
    try {
      const result = await ScenarioIntegrationSystem.processScenarioDirectives(scenarioText);
      
      console.log(`Scenario processing result:`, result);
      
      if (result.errors.length > 0) {
        console.warn("Errors during scenario processing:", result.errors);
      }
      
      // 成功メッセージ
      if (result.backgroundApplied || result.charactersApplied > 0) {
        console.log(`✅ Scenario directives applied: ${result.backgroundApplied ? '1 background' : ''} ${result.charactersApplied > 0 ? `${result.charactersApplied} characters` : ''}`);
      }
      
    } catch (error) {
      console.error("Failed to process scenario file:", error);
    }
  }

  // 現在の状態を取得
  static getCurrentState(): {
    background: string | null;
    characters: Array<{ id: string; name: string; expression: string; position?: { x: number; y: number } }>;
  } {
    const characters = Array.from(ScenarioIntegrationSystem.currentCharacters.entries()).map(
      ([id, char]) => ({ id, ...char })
    );

    return {
      background: ScenarioIntegrationSystem.currentBackground,
      characters
    };
  }

  // ディレクティブ履歴を取得
  static getDirectiveHistory(): Array<{
    type: string;
    directive: string;
    timestamp: Date;
    success: boolean;
  }> {
    return [...ScenarioIntegrationSystem.directiveHistory];
  }

  // キャラクターを削除
  static async removeCharacter(characterId: string): Promise<boolean> {
    try {
      // キャンバスから削除（@drincs/pixi-vnのcanvas.remove使用）
      await canvas.remove(characterId);
      
      // 内部状態から削除
      ScenarioIntegrationSystem.currentCharacters.delete(characterId);
      
      console.log(`Character removed: ${characterId}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove character ${characterId}:`, error);
      return false;
    }
  }

  // 全キャラクターを削除
  static async clearAllCharacters(): Promise<void> {
    const characterIds = Array.from(ScenarioIntegrationSystem.currentCharacters.keys());
    
    for (const id of characterIds) {
      await ScenarioIntegrationSystem.removeCharacter(id);
    }
    
    console.log("All characters cleared");
  }

  // シーン遷移時のクリーンアップ
  static async cleanupScene(): Promise<void> {
    try {
      // 背景以外のすべての要素をクリア
      await ScenarioIntegrationSystem.clearAllCharacters();
      
      console.log("Scene cleanup completed");
    } catch (error) {
      console.error("Failed to cleanup scene:", error);
    }
  }

  // デバッグ用：現在の状態をログ出力
  static logCurrentState(): void {
    const state = ScenarioIntegrationSystem.getCurrentState();
    
    console.group("🎭 Scenario Integration State");
    console.log(`🖼️ Background: ${state.background || 'None'}`);
    console.log(`👥 Characters: ${state.characters.length}`);
    
    for (const char of state.characters) {
      console.log(`  - ${char.name} (${char.expression}) at ${char.position ? `(${char.position.x}, ${char.position.y})` : 'default'}`);
    }
    
    console.log(`📜 Directive History: ${ScenarioIntegrationSystem.directiveHistory.length} entries`);
    console.groupEnd();
  }

  // テスト用：サンプルシナリオを処理
  static async testScenarioProcessing(): Promise<void> {
    console.log("Testing scenario directive processing...");
    
    const sampleScenario = `
      【背景：宇品の坂道】
      【立ち絵：ななたう:微笑み:center】
      
      ななたう「こんにちは！今日はいい天気ですね。」
      
      【立ち絵：ななたう:悲しみ:center】
      ななたう「でも、少し寂しい気持ちもあります…」
    `;

    await ScenarioIntegrationSystem.processScenarioFile(sampleScenario);
    ScenarioIntegrationSystem.logCurrentState();
  }

  // 初期化
  static initialize(): void {
    console.log("Initializing Scenario Integration System...");
    
    // 初期状態をクリア
    ScenarioIntegrationSystem.currentBackground = null;
    ScenarioIntegrationSystem.currentCharacters.clear();
    ScenarioIntegrationSystem.directiveHistory.length = 0;
    
    console.log("Scenario Integration System initialized successfully");
  }
}