import {
  newLabel,
  narration,
  canvas,
  ImageSprite,
  sound,
  RegisteredCharacters,
} from "@drincs/pixi-vn";

// シナリオ用の型定義
interface ScenarioDirective {
  type:
    | "background"
    | "bgm"
    | "se"
    | "character"
    | "dialogue"
    | "monologue"
    | "choice";
  content: string;
  character?: string | undefined;
  metadata?: Record<string, any>;
}

// シナリオパーサー（基本版）
export class ScenarioLabelSystem {
  private static parseScenarioLine(line: string): ScenarioDirective | null {
    const trimmedLine = line.trim();

    // 空行やコメント行をスキップ
    if (
      !trimmedLine ||
      trimmedLine.startsWith("---") ||
      trimmedLine.startsWith("タイトル：") ||
      trimmedLine.startsWith("章：")
    ) {
      return null;
    }

    // 【背景】ディレクティブ
    if (trimmedLine.startsWith("【背景】")) {
      return {
        type: "background",
        content: trimmedLine.replace("【背景】", "").trim(),
      };
    }

    // 【BGM】ディレクティブ
    if (trimmedLine.startsWith("【BGM】")) {
      return {
        type: "bgm",
        content: trimmedLine.replace("【BGM】", "").trim(),
      };
    }

    // 【SE】ディレクティブ
    if (trimmedLine.startsWith("【SE】")) {
      return {
        type: "se",
        content: trimmedLine.replace("【SE】", "").trim(),
      };
    }

    // 【立ち絵】ディレクティブ
    if (trimmedLine.startsWith("【立ち絵】")) {
      return {
        type: "character",
        content: trimmedLine.replace("【立ち絵】", "").trim(),
      };
    }

    // キャラクターセリフ（キャラクター名が先頭にある）
    const characterMatch = trimmedLine.match(/^([^（）\s]+)\s*$/);
    if (characterMatch && !trimmedLine.includes("（モノローグ）")) {
      return {
        type: "dialogue",
        character: characterMatch[1],
        content: "",
      };
    }

    // モノローグ
    if (trimmedLine.includes("（モノローグ）")) {
      return {
        type: "monologue",
        character: trimmedLine.replace("（モノローグ）", "").trim(),
        content: "",
      };
    }

    // 通常のテキスト（前のキャラクター発言の続き）
    if (trimmedLine.startsWith("「") && trimmedLine.endsWith("」")) {
      return {
        type: "dialogue",
        content: trimmedLine.slice(1, -1), // 「」を除去
      };
    }

    // 通常のテキスト（地の文・モノローグ）
    return {
      type: "dialogue",
      content: trimmedLine,
    };
  }

  // シナリオファイルからLabelsを生成
  static async createLabelFromScenario(labelId: string, scenarioText: string) {
    const lines = scenarioText.split("\n");
    const directives = lines
      .map((line) => ScenarioLabelSystem.parseScenarioLine(line))
      .filter((directive) => directive !== null) as ScenarioDirective[];

    const steps: Array<() => void | Promise<void>> = [];
    let currentCharacter = "";

    for (const directive of directives) {
      switch (directive.type) {
        case "background":
          steps.push(async () => {
            console.log(`Setting background: ${directive.content}`);
            try {
              // 背景に応じた画像の設定（将来的に画像ファイルを指定）
              const backgroundSprite = new ImageSprite({
                anchor: { x: 0.5, y: 0.5 },
                x: 640,
                y: 360,
                width: 1280,
                height: 720,
              });
              await canvas.add("background", backgroundSprite);
            } catch (error) {
              console.warn("Background setup failed:", error);
            }
          });
          break;

        case "bgm":
          steps.push(() => {
            console.log(`Playing BGM: ${directive.content}`);
            try {
              // BGMファイルがある場合の処理
              sound.play("bgm_main", { loop: true, volume: 0.6 });
            } catch (error) {
              console.warn("BGM play failed:", error);
            }
          });
          break;

        case "se":
          steps.push(() => {
            console.log(`Playing SE: ${directive.content}`);
            try {
              sound.play("se_click", { volume: 0.8 });
            } catch (error) {
              console.warn("SE play failed:", error);
            }
          });
          break;

        case "character":
          steps.push(async () => {
            console.log(`Adding character: ${directive.content}`);
            try {
              const characterSprite = new ImageSprite({
                anchor: { x: 0.5, y: 1 },
                x: 640,
                y: 650,
                width: 300,
                height: 400,
              });
              await canvas.add("character", characterSprite);
            } catch (error) {
              console.warn("Character sprite setup failed:", error);
            }
          });
          break;

        case "dialogue":
          if (directive.character) {
            currentCharacter = directive.character;
          }
          steps.push(() => {
            const character =
              currentCharacter === "主人公"
                ? RegisteredCharacters.get("protagonist") || "主人公"
                : currentCharacter === "ななたう"
                  ? RegisteredCharacters.get("nanatau") || "ななたう"
                  : currentCharacter;

            (narration as any).dialogue = {
              character: character,
              text: directive.content,
            };

            // カスタムダイアログUIの更新
            const updateEvent = new CustomEvent("updateDialogue");
            window.dispatchEvent(updateEvent);
          });
          break;

        case "monologue":
          steps.push(() => {
            (narration as any).dialogue = {
              character: "モノローグ",
              text: directive.content,
            };

            // カスタムダイアログUIの更新
            const updateEvent = new CustomEvent("updateDialogue");
            window.dispatchEvent(updateEvent);
          });
          break;
      }
    }

    return newLabel(labelId, steps as any);
  }

  // プロローグのラベルを作成
  static async createPrologueLabel(scenarioText: string) {
    return ScenarioLabelSystem.createLabelFromScenario(
      "prologue",
      scenarioText
    );
  }

  // 全てのシナリオファイルを読み込んでラベルを作成
  static async loadAllScenarios(): Promise<Map<string, any>> {
    const scenarioLabels = new Map();

    try {
      // 実際のファイル読み込みは本実装で対応
      // ここではプレースホルダーラベルを作成
      const demoLabel = newLabel("demo_scenario", [
        () => {
          (narration as any).dialogue = {
            character: RegisteredCharacters.get("system"),
            text: "シナリオシステムが統合されました。本格的なストーリー進行に対応しています。",
          };
          const updateEvent = new CustomEvent("updateDialogue");
          window.dispatchEvent(updateEvent);
        },
      ] as any);

      scenarioLabels.set("demo", demoLabel);
      return scenarioLabels;
    } catch (error) {
      console.error("Failed to load scenarios:", error);
      return scenarioLabels;
    }
  }
}
