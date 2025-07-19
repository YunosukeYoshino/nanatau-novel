/**
 * シナリオファイルパーサー
 * テキストファイルを読み込んでScenarioDataに変換する
 */

import type {
  ChoiceData,
  DialogueData,
  DirectiveData,
  ScenarioData,
  SceneData,
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
        metadata: {
          title,
          author: "Unknown",
          version: "1.0.0",
          description: chapter || "Game scenario",
          tags: [],
          estimatedPlayTime: scenes.length * 2,
          lastModified: new Date(),
        },
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

    // コンテンツ開始・終了位置を探す
    let contentStartIndex = 0;
    let contentEndIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === ScenarioParser.CONTENT_SEPARATOR) {
        contentStartIndex = i + 1;
        break;
      }
    }

    for (let i = contentStartIndex; i < lines.length; i++) {
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
            id: `scene_${sceneId}`,
            type: "choice",
            character: null,
            text: line,
            choices: choices,
            directives: [directive],
            metadata: {
              sceneNumber: sceneId,
              tags: ["choice"],
              estimatedReadTime: 3,
            },
          });
          sceneId++;
        } else {
          scenes.push({
            id: `scene_${sceneId}`,
            type: "directive",
            character: null,
            text: line,
            choices: null,
            directives: [directive],
            metadata: {
              sceneNumber: sceneId,
              tags: ["directive"],
              estimatedReadTime: 2,
            },
          });
          sceneId++;
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

        // キャラクター情報の処理
        let characterForScene = dialogue.character;
        if (dialogue.isMonologue && !dialogue.character) {
          // ナレーション（キャラクター名なしのモノローグ）は一般的なナレーションとして扱う
          characterForScene = "";
          currentCharacter = "";
        } else if (!dialogue.character && currentCharacter) {
          // キャラクター名がない場合は現在のキャラクターを使用
          characterForScene = currentCharacter;
        }

        scenes.push({
          id: `scene_${sceneId}`,
          type: "dialogue",
          character: characterForScene,
          text: dialogue.text,
          choices: null,
          directives: [],
          metadata: {
            sceneNumber: sceneId,
            tags: dialogue.isMonologue ? ["monologue"] : ["dialogue"],
            estimatedReadTime: Math.max(
              1,
              Math.ceil(dialogue.text.length / 30)
            ),
          },
        });
        sceneId++;
      }
    }

    return scenes;
  }

  /**
   * ディレクティブを解析
   */
  parseDirectives(line: string): DirectiveData | null {
    // 入力検証
    if (!line || typeof line !== "string") {
      return null;
    }

    const trimmedLine = line.trim();

    // 各ディレクティブパターンをチェック
    for (const [type, pattern] of Object.entries(
      ScenarioParser.DIRECTIVE_PATTERNS
    )) {
      if (trimmedLine.startsWith(pattern)) {
        const value = trimmedLine.replace(pattern, "").trim();
        return {
          type: type as DirectiveData["type"],
          value,
          options: {},
        };
      }
    }

    return null;
  }

  /**
   * 台詞を解析
   */
  parseDialogue(line: string): DialogueData | null {
    // 入力検証
    if (!line || typeof line !== "string") {
      return null;
    }

    const trimmedLine = line.trim();

    // モノローグパターンのチェック
    const monologueMatch = trimmedLine.match(
      ScenarioParser.REGEX_PATTERNS.monologue
    );
    if (monologueMatch?.[1]) {
      return {
        character: "",
        text: monologueMatch[1].trim(),
        isMonologue: true,
      };
    }

    // 台詞パターンのチェック
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

    // キャラクター名付き台詞の解析
    const colonIndex = trimmedLine.indexOf("：");
    if (
      colonIndex > 0 &&
      colonIndex < ScenarioParser.MAX_CHARACTER_NAME_LENGTH
    ) {
      const character = trimmedLine.substring(0, colonIndex).trim();
      const text = trimmedLine.substring(colonIndex + 1).trim();

      if (character && text) {
        return {
          character,
          text,
          isMonologue: false,
        };
      }
    }

    // 一般的なモノローグ（キャラクター名なし）
    if (
      trimmedLine.length >= ScenarioParser.MIN_MONOLOGUE_LENGTH &&
      !trimmedLine.startsWith("【") &&
      !trimmedLine.startsWith("選択肢")
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
   * 選択肢を解析
   */
  parseChoices(lines: string[]): ChoiceData[] {
    const choices: ChoiceData[] = [];
    let choiceId = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 選択肢行を識別
      if (trimmedLine.startsWith("選択肢")) {
        continue;
      }

      // 選択肢項目の解析（番号付きまたはハイフン）
      const choiceMatch =
        trimmedLine.match(/^[0-9]+\.\s*(.+)$/) ||
        trimmedLine.match(/^[-＊]\s*(.+)$/);

      if (choiceMatch?.[1]) {
        const choiceText = choiceMatch[1].trim();
        const routeMatch = choiceText.match(
          ScenarioParser.REGEX_PATTERNS.choiceRoute
        );

        if (routeMatch?.[1]) {
          const text = routeMatch[1].trim();
          const jumpTo = routeMatch[2]?.trim();

          if (jumpTo) {
            choices.push({
              id: `choice_${choiceId++}`,
              text,
              jumpTo,
            });
          } else {
            choices.push({
              id: `choice_${choiceId++}`,
              text,
            });
          }
        } else {
          choices.push({
            id: `choice_${choiceId++}`,
            text: choiceText,
          });
        }
      }

      // 選択肢セクションの終了条件
      if (trimmedLine === "" && choices.length > 0) {
        break;
      }
    }

    return choices;
  }
}
