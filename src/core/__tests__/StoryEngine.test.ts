/**
 * StoryEngine のテスト
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState, ScenarioData } from "../../types/core.js";
import { StoryEngine } from "../StoryEngine.js";

// テスト用型定義
interface MockResponse {
  text: () => Promise<string>;
}

// テスト用のモックシナリオデータ
const mockScenarioData: ScenarioData = {
  metadata: {
    title: "テストシナリオ",
    author: "テスター",
    version: "1.0.0",
    description: "テスト用のシナリオです",
    tags: ["test"],
    estimatedPlayTime: 10,
    lastModified: new Date("2025-01-01"),
  },
  scenes: [
    {
      id: "scene_001",
      type: "dialogue",
      character: "ななたう",
      text: "こんにちは、テストです。",
      choices: null,
      directives: [],
      metadata: {
        sceneNumber: 1,
        tags: ["greeting"],
        estimatedReadTime: 5,
      },
    },
    {
      id: "scene_002",
      type: "choice",
      character: null,
      text: "どうしますか？",
      choices: [
        {
          id: "choice_001",
          text: "はい",
          flags: { answered_yes: true },
          variables: { response: "yes" },
          jumpTo: "scene_003",
        },
        {
          id: "choice_002",
          text: "いいえ",
          flags: { answered_no: true },
          variables: { response: "no" },
          jumpTo: "scene_004",
        },
      ],
      directives: [],
      metadata: {
        sceneNumber: 2,
        tags: ["choice"],
        estimatedReadTime: 3,
      },
    },
    {
      id: "scene_003",
      type: "dialogue",
      character: "ななたう",
      text: "ありがとうございます！",
      choices: null,
      directives: [],
      metadata: {
        sceneNumber: 3,
        tags: ["response", "positive"],
        estimatedReadTime: 3,
      },
    },
    {
      id: "scene_004",
      type: "dialogue",
      character: "ななたう",
      text: "そうですか...",
      choices: null,
      directives: [],
      metadata: {
        sceneNumber: 4,
        tags: ["response", "negative"],
        estimatedReadTime: 3,
      },
    },
  ],
};

// fetch APIのモック
global.fetch = vi.fn();

describe("StoryEngine", () => {
  let storyEngine: StoryEngine;

  beforeEach(() => {
    storyEngine = new StoryEngine();
    vi.clearAllMocks();
  });

  describe("初期化", () => {
    it("正常に初期化される", async () => {
      await expect(storyEngine.initialize()).resolves.not.toThrow();
    });

    it("初期状態では現在のシーンがnull", () => {
      expect(storyEngine.getCurrentScene()).toBeNull();
    });
  });

  describe("シナリオの読み込み", () => {
    it("シナリオファイルを正常に読み込める", async () => {
      const mockResponse = {
        text: vi.fn().mockResolvedValue(JSON.stringify(mockScenarioData)),
      };
      (
        global.fetch as unknown as {
          mockResolvedValue: (value: MockResponse) => void;
        }
      ).mockResolvedValue(mockResponse);

      // ScenarioParserのparseScenarioFileメソッドをモック
      const mockParser = {
        parseScenarioFile: vi.fn().mockReturnValue(mockScenarioData),
      };
      (
        storyEngine as unknown as {
          scenarioParser: { parseScenarioFile: ReturnType<typeof vi.fn> };
        }
      ).scenarioParser = mockParser;

      const result = await storyEngine.loadScenario("/test/scenario.json");

      expect(result).toEqual(mockScenarioData);
      expect(global.fetch).toHaveBeenCalledWith("/test/scenario.json");
    });

    it("シナリオファイルの読み込みに失敗した場合エラーを投げる", async () => {
      (
        global.fetch as unknown as { mockRejectedValue: (error: Error) => void }
      ).mockRejectedValue(new Error("Network error"));

      await expect(
        storyEngine.loadScenario("/invalid/path.json")
      ).rejects.toThrow("Failed to load scenario");
    });
  });

  describe("シーン管理", () => {
    beforeEach(async () => {
      // シナリオを読み込んでセットアップ
      const mockResponse = {
        text: vi.fn().mockResolvedValue("mock content"),
      };
      (
        global.fetch as unknown as {
          mockResolvedValue: (value: MockResponse) => void;
        }
      ).mockResolvedValue(mockResponse);

      const mockParser = {
        parseScenarioFile: vi.fn().mockReturnValue(mockScenarioData),
      };
      (
        storyEngine as unknown as {
          scenarioParser: { parseScenarioFile: ReturnType<typeof vi.fn> };
        }
      ).scenarioParser = mockParser;

      await storyEngine.loadScenario("/test/scenario.json");
    });

    it("現在のシーンを正常に取得できる", () => {
      const currentScene = storyEngine.getCurrentScene();

      expect(currentScene).not.toBeNull();
      expect(currentScene?.id).toBe("scene_001");
      expect(currentScene?.character).toBe("ななたう");
      expect(currentScene?.text).toBe("こんにちは、テストです。");
    });

    it("ストーリーを次のシーンに進められる", () => {
      storyEngine.advanceStory();

      const currentScene = storyEngine.getCurrentScene();
      expect(currentScene?.id).toBe("scene_002");
    });

    it("選択肢があるシーンでは自動進行しない", () => {
      storyEngine.advanceStory(); // scene_002 (選択肢シーン) に移動

      const beforeScene = storyEngine.getCurrentScene();
      storyEngine.advanceStory(); // 選択肢があるので進行しない
      const afterScene = storyEngine.getCurrentScene();

      expect(beforeScene?.id).toBe(afterScene?.id);
    });
  });

  describe("選択肢処理", () => {
    beforeEach(async () => {
      // シナリオを読み込んでセットアップ
      const mockResponse = {
        text: vi.fn().mockResolvedValue("mock content"),
      };
      (
        global.fetch as unknown as {
          mockResolvedValue: (value: MockResponse) => void;
        }
      ).mockResolvedValue(mockResponse);

      const mockParser = {
        parseScenarioFile: vi.fn().mockReturnValue(mockScenarioData),
      };
      (
        storyEngine as unknown as {
          scenarioParser: { parseScenarioFile: ReturnType<typeof vi.fn> };
        }
      ).scenarioParser = mockParser;

      await storyEngine.loadScenario("/test/scenario.json");
      storyEngine.advanceStory(); // scene_002 (選択肢シーン) に移動
    });

    it("選択肢を正常に処理できる", () => {
      storyEngine.processChoice("choice_001");

      const gameState = storyEngine.getGameState();
      expect(gameState.flags.get("answered_yes")).toBe(true);
      expect(gameState.variables.get("response")).toBe("yes");
      expect(gameState.choices).toHaveLength(1);
    });

    it("選択肢処理後に指定されたシーンにジャンプする", () => {
      storyEngine.processChoice("choice_001");

      const currentScene = storyEngine.getCurrentScene();
      expect(currentScene?.id).toBe("scene_003");
    });

    it("存在しない選択肢IDを指定した場合は何もしない", () => {
      const beforeGameState = storyEngine.getGameState();
      storyEngine.processChoice("invalid_choice");
      const afterGameState = storyEngine.getGameState();

      expect(beforeGameState.choices.length).toBe(
        afterGameState.choices.length
      );
    });
  });

  describe("ゲーム状態管理", () => {
    it("変数を設定・取得できる", () => {
      storyEngine.setVariable("test_var", "test_value");
      expect(storyEngine.getVariable("test_var")).toBe("test_value");
    });

    it("フラグを設定・取得できる", () => {
      storyEngine.setFlag("test_flag", true);
      expect(storyEngine.getFlag("test_flag")).toBe(true);
    });

    it("存在しないフラグはfalseを返す", () => {
      expect(storyEngine.getFlag("non_existent_flag")).toBe(false);
    });

    it("ゲーム状態を設定・取得できる", () => {
      const testGameState: GameState = {
        currentScenarioPath: "/test/path.json",
        currentSceneIndex: 5,
        currentRouteId: "test_route",
        variables: new Map([["test", "value"]]),
        flags: new Map([["test", true]]),
        visitedScenes: new Set(["scene_001"]),
        choices: [],
        inventory: [],
        playerName: "テストプレイヤー",
        lastSaveTimestamp: Date.now(),
      };

      storyEngine.setGameState(testGameState);
      const retrievedState = storyEngine.getGameState();

      expect(retrievedState.currentScenarioPath).toBe(
        testGameState.currentScenarioPath
      );
      expect(retrievedState.currentSceneIndex).toBe(
        testGameState.currentSceneIndex
      );
      expect(retrievedState.currentRouteId).toBe(testGameState.currentRouteId);
      expect(retrievedState.playerName).toBe(testGameState.playerName);
    });
  });

  describe("進行度計算", () => {
    beforeEach(async () => {
      // シナリオを読み込んでセットアップ
      const mockResponse = {
        text: vi.fn().mockResolvedValue("mock content"),
      };
      (
        global.fetch as unknown as {
          mockResolvedValue: (value: MockResponse) => void;
        }
      ).mockResolvedValue(mockResponse);

      const mockParser = {
        parseScenarioFile: vi.fn().mockReturnValue(mockScenarioData),
      };
      (
        storyEngine as unknown as {
          scenarioParser: { parseScenarioFile: ReturnType<typeof vi.fn> };
        }
      ).scenarioParser = mockParser;

      await storyEngine.loadScenario("/test/scenario.json");
    });

    it("進行度を正しく計算できる", () => {
      expect(storyEngine.getProgress()).toBe(0); // 0/4 = 0%

      storyEngine.advanceStory();
      expect(storyEngine.getProgress()).toBe(25); // 1/4 = 25%
    });
  });

  describe("デバッグ情報", () => {
    it("デバッグ情報を取得できる", () => {
      const debugInfo = storyEngine.getDebugInfo();

      expect(debugInfo).toHaveProperty("currentScenarioPath");
      expect(debugInfo).toHaveProperty("currentSceneIndex");
      expect(debugInfo).toHaveProperty("currentRouteId");
      expect(debugInfo).toHaveProperty("progress");
      expect(debugInfo).toHaveProperty("variablesCount");
      expect(debugInfo).toHaveProperty("flagsCount");
      expect(debugInfo).toHaveProperty("visitedScenesCount");
      expect(debugInfo).toHaveProperty("choicesCount");
    });
  });
});
