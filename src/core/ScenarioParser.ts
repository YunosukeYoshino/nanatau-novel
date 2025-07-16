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
  /**
   * テキストファイルの内容をパースしてScenarioDataに変換
   */
  parseScenarioFile(content: string): ScenarioData {
    const lines = content.split("\n").map((line) => line.trim());

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
      if (lines[i] === "---") {
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
      if (lines[i] === "---") {
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
        scenes.push({
          id: `scene_${sceneId++}`,
          type: "directive",
          content: line,
          ...this.directiveToSceneProperties(directive),
        });
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
          // モノローグテキストの場合はキャラクター情報をリセット
          characterForScene = "";
          currentCharacter = "";
        } else if (!dialogue.character && !dialogue.isMonologue) {
          // 通常の台詞（「...」形式）の場合もキャラクター情報をリセット
          characterForScene = "";
          currentCharacter = "";
        } else if (!dialogue.character) {
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
    // 【背景】パターン
    if (line.startsWith("【背景】")) {
      return {
        type: "background",
        value: line.replace("【背景】", "").trim(),
      };
    }

    // 【BGM】パターン
    if (line.startsWith("【BGM】")) {
      return {
        type: "bgm",
        value: line.replace("【BGM】", "").trim(),
      };
    }

    // 【SE】パターン
    if (line.startsWith("【SE】")) {
      return {
        type: "se",
        value: line.replace("【SE】", "").trim(),
      };
    }

    // 【立ち絵】パターン
    if (line.startsWith("【立ち絵】")) {
      return {
        type: "character",
        value: line.replace("【立ち絵】", "").trim(),
      };
    }

    // 【選択肢】パターン
    if (line.startsWith("【選択肢】")) {
      return {
        type: "choice",
        value: line.replace("【選択肢】", "").trim(),
      };
    }

    // 【表情】パターン（キャラクター感情表現）
    if (line.startsWith("【表情】")) {
      return {
        type: "emotion",
        value: line.replace("【表情】", "").trim(),
      };
    }

    // 【効果】パターン（画面効果）
    if (line.startsWith("【効果】")) {
      return {
        type: "effect",
        value: line.replace("【効果】", "").trim(),
      };
    }

    return null;
  }

  /**
   * キャラクター台詞の解析
   */
  parseDialogue(line: string): DialogueData | null {
    // モノローグパターン: キャラクター名（モノローグ）
    const monologueMatch = line.match(/^(.+?)（モノローグ）$/);
    if (monologueMatch && monologueMatch[1]) {
      return {
        character: monologueMatch[1].trim(),
        text: "",
        isMonologue: true,
      };
    }

    // 台詞テキストパターン: 「...」
    const dialogueMatch = line.match(/^「(.+)」$/);
    if (dialogueMatch && dialogueMatch[1]) {
      return {
        character: "",
        text: dialogueMatch[1].trim(),
        isMonologue: false,
      };
    }

    // キャラクター名のパターン（短い行で、特殊記号がない場合）
    if (
      line &&
      line.length <= 15 &&
      !line.includes("【") &&
      !line.includes("】") &&
      !line.startsWith("（") &&
      !line.endsWith("）") &&
      !line.includes("「") &&
      !line.includes("」") &&
      !line.includes("。") &&
      !line.includes("、") &&
      !line.includes("？") &&
      !line.includes("！")
    ) {
      return {
        character: line.trim(),
        text: "",
        isMonologue: false,
      };
    }

    // モノローグテキスト（長い行で、特殊記号がない場合）
    if (
      line &&
      line.length > 5 &&
      !line.includes("【") &&
      !line.includes("】") &&
      !line.startsWith("（") &&
      !line.endsWith("）") &&
      !line.includes("「") &&
      !line.includes("」")
    ) {
      return {
        character: "",
        text: line,
        isMonologue: true,
      };
    }

    return null;
  }

  /**
   * 選択肢の解析
   */
  parseChoices(lines: string[]): ChoiceData[] {
    const choices: ChoiceData[] = [];
    let choiceId = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      // 【選択肢】タグの検出
      if (line.includes("【選択肢】")) {
        // 次の行から選択肢テキストを探す
        for (let j = i + 1; j < lines.length; j++) {
          const choiceLine = lines[j]?.trim();
          if (!choiceLine) continue;

          // 選択肢終了の判定
          if (choiceLine.startsWith("【") || choiceLine === "---") {
            break;
          }

          // 選択肢テキストの解析
          const choiceMatch = choiceLine.match(/^(.+?)(?:→(.+))?$/);
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
