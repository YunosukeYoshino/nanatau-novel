/**
 * ScenarioParser のテスト
 */

import { describe, it, expect } from "vitest";
import { ScenarioParser } from "../ScenarioParser.js";

describe("ScenarioParser", () => {
  const parser = new ScenarioParser();

  describe("parseDirectives", () => {
    it("should parse background directive", () => {
      const result = parser.parseDirectives(
        "【背景】夕暮れの坂道。遠くに広島港と瀬戸内海が見える。"
      );
      expect(result).toEqual({
        type: "background",
        value: "夕暮れの坂道。遠くに広島港と瀬戸内海が見える。",
      });
    });

    it("should parse BGM directive", () => {
      const result = parser.parseDirectives(
        "【BGM】静かで、どこか懐かしいピアノ曲"
      );
      expect(result).toEqual({
        type: "bgm",
        value: "静かで、どこか懐かしいピアノ曲",
      });
    });

    it("should parse SE directive", () => {
      const result = parser.parseDirectives(
        "【SE】遠くで船の汽笛が鳴る音、ヒグラシの声"
      );
      expect(result).toEqual({
        type: "se",
        value: "遠くで船の汽笛が鳴る音、ヒグラシの声",
      });
    });

    it("should parse character directive", () => {
      const result = parser.parseDirectives(
        "【立ち絵】ななたう（ステンドグラスの中にいるように、少し光に透けている）"
      );
      expect(result).toEqual({
        type: "character",
        value: "ななたう（ステンドグラスの中にいるように、少し光に透けている）",
      });
    });

    it("should return null for non-directive lines", () => {
      const result = parser.parseDirectives("普通のテキスト");
      expect(result).toBeNull();
    });
  });

  describe("parseDialogue", () => {
    it("should parse character monologue", () => {
      const result = parser.parseDialogue("主人公（モノローグ）");
      expect(result).toEqual({
        character: "主人公",
        text: "",
        isMonologue: true,
      });
    });

    it("should parse character name", () => {
      const result = parser.parseDialogue("ななたう");
      expect(result).toEqual({
        character: "ななたう",
        text: "",
        isMonologue: false,
      });
    });

    it("should parse dialogue text", () => {
      const result = parser.parseDialogue("「……やっと会えたね」");
      expect(result).toEqual({
        character: "",
        text: "……やっと会えたね",
        isMonologue: false,
      });
    });

    it("should parse monologue text", () => {
      const result =
        parser.parseDialogue("夏の終わりの、生温い風が頬を撫でる。");
      expect(result).toEqual({
        character: "",
        text: "夏の終わりの、生温い風が頬を撫でる。",
        isMonologue: true,
      });
    });

    it("should return null for directive lines", () => {
      const result = parser.parseDialogue("【背景】夕暮れの坂道");
      expect(result).toBeNull();
    });
  });

  describe("parseScenarioFile", () => {
    it("should parse a simple scenario file", () => {
      const content = `タイトル：テストシナリオ
章：テスト章『テスト』

---

【背景】テスト背景
【BGM】テストBGM

主人公（モノローグ）
これはテストです。

主人公
「こんにちは」

---
テスト章『テスト』 / 了
---`;

      const result = parser.parseScenarioFile(content);

      expect(result.title).toBe("テストシナリオ");
      expect(result.chapter).toBe("テスト章『テスト』");

      // 背景ディレクティブ
      expect(result.scenes[0]).toEqual({
        id: "scene_1",
        type: "directive",
        content: "【背景】テスト背景",
        background: "テスト背景",
      });

      // BGMディレクティブ
      expect(result.scenes[1]).toEqual({
        id: "scene_2",
        type: "directive",
        content: "【BGM】テストBGM",
        bgm: "テストBGM",
      });

      // キャラクター（モノローグ）
      expect(result.scenes[2]).toEqual({
        id: "scene_3",
        type: "dialogue",
        content: "",
        character: "主人公",
      });

      // モノローグテキスト
      expect(result.scenes[3]).toEqual({
        id: "scene_4",
        type: "dialogue",
        content: "これはテストです。",
        character: "",
      });

      // キャラクター名
      expect(result.scenes[4]).toEqual({
        id: "scene_5",
        type: "dialogue",
        content: "",
        character: "主人公",
      });

      // 台詞
      expect(result.scenes[5]).toEqual({
        id: "scene_6",
        type: "dialogue",
        content: "こんにちは",
        character: "",
      });
    });
  });
});
