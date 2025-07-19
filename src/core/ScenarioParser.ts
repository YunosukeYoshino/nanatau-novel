/**
 * シナリオファイルパーサー
 * テキストファイルを読み込んでScenarioDataに変換する
 */

import type {
  ScenarioData,
  SceneData,
  ChoiceData,
  DirectiveData,
  DialogueData,
} from "../types/core.js";
import type { IScenarioParser } from "../types/interfaces.js";

export class ScenarioParser implements IScenarioParser {
  // 定数定義
  private static readonly MAX_CHARACTER_NAME_LENGTH = 15;
  private static readonly MIN_MONOLOGUE_LENGTH = 5;
  private static readonly CONTENT_SEPARATOR = "---";

  // 正規表現パターン（パフォーマンス向上のためキャッシュ）
  private static readonly REGEX_PATTERNS = {
    monologue: /^(.+?)（モノローグ）$/,
    dialogue: /^「(.+)」$/,
    choiceRoute: /^(.+?)(?:→(.+))?$/,
  };

  // ディレクティブパターン
  private static readonly DIRECTIVE_PATTERNS = {
    background: "【背景】",
    bgm: "【BGM】",
    se: "【SE】",
    character: "【立ち絵】",
    choice: "【選択肢】",
    emotion: "【表情】",
    effect: "【効果】",
  };
  /**
   * テキストファイルの内容をパースしてScenarioDataに変換
   */
  parseScenarioFile(content: string): ScenarioData {
    // 入力検証
    if (!content || typeof content !== "string") {
      throw new Error("Invalid content: content must be a non-empty string");
    }

    try {
      const lines = content.split("\n").map((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("Invalid content: content cannot be empty");
      }

      // タイトルと章の情報を抽出
      const title = this.extractTitle(lines);
      const chapter = this.extractChapter(lines);

      // シーンデータを解析
      const scenes = this.parseScenes(lines);

      return {
        title,
        chapter,
        scenes,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse scenario file: ${error.message}`);
      }
      throw new Error("Failed to parse scenario file: Unknown error");
    }
  }

  /**
   * タイトルを抽出
   */
  private extractTitle(lines: string[]): string {
    for (const line of lines) {
      if (line.startsWith("タイトル：")) {
        return line.replace("タイトル：", "").trim();
      }
    }
    return "";
  }

  /**
   * 章情報を抽出
   */
  private extractChapter(lines: string[]): string {
    for (const line of lines) {
      if (line.startsWith("章：")) {
        return line.replace("章：", "").trim();
      }
    }
    return "";
  }

  /**
   * シーンデータを解析
   */
  private parseScenes(lines: string[]): SceneData[] {
    const scenes: SceneData[] = [];
    let sceneId = 1;
    let currentCharacter = "";

    // コンテンツ開始位置を見つける（最初の --- の後）
    let contentStartIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === ScenarioParser.CONTENT_SEPARATOR) {
        contentStartIndex = i + 1;
        break;
      }
    }

    if (contentStartIndex === -1) {
      return scenes;
    }

    // コンテンツ終了位置を見つける（最後の --- の前）
    let contentEndIndex = lines.length;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i] === ScenarioParser.CONTENT_SEPARATOR) {
        contentEndIndex = i;
        break;
      }
    }

    // シーンを解析
    for (let i = contentStartIndex; i < contentEndIndex; i++) {
      const line = lines[i];

      // 空行はスキップ
      if (!line) continue;

      // ディレクティブの解析
      const directive = this.parseDirectives(line);
      if (directive) {
        // 選択肢ディレクティブの場合は選択肢を解析
        if (directive.type === "choice") {
          const choices = this.parseChoices(lines.slice(i));
          scenes.push({
            id: `scene_${sceneId++}`,
            type: "choice",
            content: line,
            choices: choices,
            ...this.directiveToSceneProperties(directive),
          });
        } else {
          scenes.push({
            id: `scene_${sceneId++}`,
            type: "directive",
            content: line,
            ...this.directiveToSceneProperties(directive),
          });
        }
        continue;
      }

      // 台詞の解析
      const dialogue = this.parseDialogue(line);
      if (dialogue) {
        // キャラクター名が設定されている場合は現在のキャラクターを更新
        if (dialogue.character) {
          currentCharacter = dialogue.character;
        }

        // キャラクター情報の処理（修正版：重要なバグ修正）
        let characterForScene = dialogue.character;
        if (dialogue.isMonologue && !dialogue.character) {
          // ナレーション（キャラクター名なしのモノローグ）は一般的なナレーションとして扱う
          characterForScene = "";
          currentCharacter = "";
        } else if (!dialogue.character) {
          // 台詞テキスト（例：「...」）でキャラクター名がない場合は、最後の話者に帰属
          characterForScene = currentCharacter;
        }

        scenes.push({
          id: `scene_${sceneId++}`,
          type: "dialogue",
          content: dialogue.text,
          character: characterForScene,
        });
        continue;
      }

      // その他のテキスト（説明文など）
      if (line && !line.startsWith("（") && !line.endsWith("）")) {
        scenes.push({
          id: `scene_${sceneId++}`,
          type: "dialogue",
          content: line,
          character: currentCharacter,
        });
      }
    }

    return scenes;
  }

  /**
   * 特殊タグ（ディレクティブ）の解析
   */
  parseDirectives(line: string): DirectiveData | null {
    // 入力検証
    if (!line || typeof line !== "string") {
      return null;
    }

    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return null;
    }

    // ディレクティブパターンのマッピング
    const directiveMap: Array<
      [string, keyof typeof ScenarioParser.DIRECTIVE_PATTERNS]
    > = [
      [ScenarioParser.DIRECTIVE_PATTERNS.background, "background"],
      [ScenarioParser.DIRECTIVE_PATTERNS.bgm, "bgm"],
      [ScenarioParser.DIRECTIVE_PATTERNS.se, "se"],
      [ScenarioParser.DIRECTIVE_PATTERNS.character, "character"],
      [ScenarioParser.DIRECTIVE_PATTERNS.choice, "choice"],
      [ScenarioParser.DIRECTIVE_PATTERNS.emotion, "emotion"],
      [ScenarioParser.DIRECTIVE_PATTERNS.effect, "effect"],
    ];

    for (const [pattern, type] of directiveMap) {
      if (trimmedLine.startsWith(pattern)) {
        return {
          type: type as DirectiveData["type"],
          value: trimmedLine.replace(pattern, "").trim(),
        };
      }
    }

    return null;
  }

  /**
   * キャラクター台詞の解析
   */
  parseDialogue(line: string): DialogueData | null {
    // 入力検証
    if (!line || typeof line !== "string") {
      return null;
    }

    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return null;
    }

    // モノローグパターン: キャラクター名（モノローグ）
    const monologueMatch = trimmedLine.match(
      ScenarioParser.REGEX_PATTERNS.monologue
    );
    if (monologueMatch?.[1]) {
      return {
        character: monologueMatch[1].trim(),
        text: "",
        isMonologue: true,
      };
    }

    // 台詞テキストパターン: 「...」
    const dialogueMatch = trimmedLine.match(
      ScenarioParser.REGEX_PATTERNS.dialogue
    );
    if (dialogueMatch?.[1]) {
      return {
        character: "",
        text: dialogueMatch[1].trim(),
        isMonologue: false,
      };
    }

    // キャラクター名のパターン（短い行で、特殊記号がない場合）
    if (
      trimmedLine.length <= ScenarioParser.MAX_CHARACTER_NAME_LENGTH &&
      !trimmedLine.includes("【") &&
      !trimmedLine.includes("】") &&
      !trimmedLine.startsWith("（") &&
      !trimmedLine.endsWith("）") &&
      !trimmedLine.includes("「") &&
      !trimmedLine.includes("」") &&
      !trimmedLine.includes("。") &&
      !trimmedLine.includes("、") &&
      !trimmedLine.includes("？") &&
      !trimmedLine.includes("！")
    ) {
      return {
        character: trimmedLine,
        text: "",
        isMonologue: false,
      };
    }

    // モノローグテキスト（長い行で、特殊記号がない場合）
    if (
      trimmedLine.length > ScenarioParser.MIN_MONOLOGUE_LENGTH &&
      !trimmedLine.includes("【") &&
      !trimmedLine.includes("】") &&
      !trimmedLine.startsWith("（") &&
      !trimmedLine.endsWith("）") &&
      !trimmedLine.includes("「") &&
      !trimmedLine.includes("」")
    ) {
      return {
        character: "",
        text: trimmedLine,
        isMonologue: true,
      };
    }

    return null;
  }

  /**
   * 選択肢の解析
   */
  parseChoices(lines: string[]): ChoiceData[] {
    // 入力検証
    if (!Array.isArray(lines) || lines.length === 0) {
      return [];
    }

    const choices: ChoiceData[] = [];
    let choiceId = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      // 【選択肢】タグの検出
      if (line.includes(ScenarioParser.DIRECTIVE_PATTERNS.choice)) {
        // 次の行から選択肢テキストを探す
        for (let j = i + 1; j < lines.length; j++) {
          const choiceLine = lines[j]?.trim();
          if (!choiceLine) continue;

          // 選択肢終了の判定
          if (
            choiceLine.startsWith("【") ||
            choiceLine === ScenarioParser.CONTENT_SEPARATOR
          ) {
            break;
          }

          // 選択肢テキストの解析
          const choiceMatch = choiceLine.match(
            ScenarioParser.REGEX_PATTERNS.choiceRoute
          );
          if (choiceMatch) {
            const text = choiceMatch[1]?.trim();
            const routeHint = choiceMatch[2]?.trim();

            if (text) {
              choices.push({
                id: `choice_${choiceId++}`,
                text,
                routeId: routeHint || `route_${choices.length + 1}`,
              });
            }
          }
        }
      }
    }

    return choices;
  }

  /**
   * ディレクティブをシーンプロパティに変換
   */
  private directiveToSceneProperties(
    directive: DirectiveData
  ): Partial<SceneData> {
    switch (directive.type) {
      case "background":
        return { background: directive.value };
      case "bgm":
        return { bgm: directive.value };
      case "se":
        return { se: directive.value };
      case "character":
        return { character: directive.value };
      default:
        return {};
    }
  }
}
