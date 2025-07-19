/**
 * GameStateManager のテスト
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "../../types/core.js";
import { GameStateManager } from "../GameStateManager.js";

// LocalStorageのモック
const localStorageMock = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.data.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.data.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    localStorageMock.data.delete(key);
  }),
  clear: vi.fn(() => {
    localStorageMock.data.clear();
  }),
  key: vi.fn((index: number) => {
    const keys = Array.from(localStorageMock.data.keys());
    return keys[index] || null;
  }),
  get length() {
    return localStorageMock.data.size;
  },
};

// グローバルのlocalStorageとStorageをモック
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, "Storage", {
  value: function Storage() {},
  writable: true,
});

describe("GameStateManager", () => {
  let gameStateManager: GameStateManager;
  let initialGameState: GameState;

  beforeEach(() => {
    // モックをクリア
    localStorageMock.data.clear();
    vi.clearAllMocks();

    initialGameState = {
      currentScenarioPath: "/test/scenario.json",
      currentSceneIndex: 0,
      currentRouteId: "main",
      variables: new Map([
        ["affection", 50],
        ["money", 100],
      ]),
      flags: new Map([
        ["met_heroine", true],
        ["first_choice_made", false],
      ]),
      visitedScenes: new Set(["scene_001"]),
      choices: [],
      inventory: ["key"],
      playerName: "テストプレイヤー",
      lastSaveTimestamp: Date.now(),
    };

    gameStateManager = new GameStateManager(initialGameState, {
      autoSaveInterval: 1000, // テスト用に短く設定
      enablePersistence: true,
    });
  });

  afterEach(() => {
    gameStateManager.dispose();
  });

  describe("基本的なゲーム状態管理", () => {
    it("初期状態を正しく設定する", () => {
      const state = gameStateManager.getGameState();

      expect(state.currentScenarioPath).toBe("/test/scenario.json");
      expect(state.currentSceneIndex).toBe(0);
      expect(state.currentRouteId).toBe("main");
      expect(state.variables.get("affection")).toBe(50);
      expect(state.flags.get("met_heroine")).toBe(true);
      expect(state.visitedScenes.has("scene_001")).toBe(true);
      expect(state.inventory).toContain("key");
    });

    it("ゲーム状態を部分的に更新できる", () => {
      gameStateManager.updateGameState({
        currentSceneIndex: 5,
        currentRouteId: "route_a",
      });

      const state = gameStateManager.getGameState();
      expect(state.currentSceneIndex).toBe(5);
      expect(state.currentRouteId).toBe("route_a");
      expect(state.variables.get("affection")).toBe(50); // 他の値は保持
    });

    it("ゲーム状態を完全に置換できる", () => {
      const newGameState: GameState = {
        currentScenarioPath: "/new/scenario.json",
        currentSceneIndex: 10,
        currentRouteId: "route_b",
        variables: new Map([["new_var", 123]]),
        flags: new Map([["new_flag", true]]),
        visitedScenes: new Set(["new_scene"]),
        choices: [],
        inventory: ["new_item"],
        playerName: "新プレイヤー",
        lastSaveTimestamp: Date.now(),
      };

      gameStateManager.setGameState(newGameState);
      const state = gameStateManager.getGameState();

      expect(state.currentScenarioPath).toBe("/new/scenario.json");
      expect(state.variables.get("affection")).toBeUndefined();
      expect(state.variables.get("new_var")).toBe(123);
    });

    it("取得したゲーム状態は独立したコピーである", () => {
      const state1 = gameStateManager.getGameState();
      const state2 = gameStateManager.getGameState();

      // 異なるオブジェクトインスタンス
      expect(state1).not.toBe(state2);
      expect(state1.variables).not.toBe(state2.variables);
      expect(state1.flags).not.toBe(state2.flags);
      expect(state1.visitedScenes).not.toBe(state2.visitedScenes);
    });
  });

  describe("変数管理", () => {
    it("変数を設定・取得できる", () => {
      gameStateManager.setVariable("test_var", "test_value");
      expect(gameStateManager.getVariable("test_var")).toBe("test_value");
    });

    it("複数の変数を一括設定できる", () => {
      gameStateManager.setVariables({
        var1: "value1",
        var2: 42,
        var3: true,
      });

      expect(gameStateManager.getVariable("var1")).toBe("value1");
      expect(gameStateManager.getVariable("var2")).toBe(42);
      expect(gameStateManager.getVariable("var3")).toBe(true);
    });

    it("存在しない変数はundefinedを返す", () => {
      expect(gameStateManager.getVariable("non_existent")).toBeUndefined();
    });
  });

  describe("フラグ管理", () => {
    it("フラグを設定・取得できる", () => {
      gameStateManager.setFlag("test_flag", true);
      expect(gameStateManager.getFlag("test_flag")).toBe(true);
    });

    it("複数のフラグを一括設定できる", () => {
      gameStateManager.setFlags({
        flag1: true,
        flag2: false,
        flag3: true,
      });

      expect(gameStateManager.getFlag("flag1")).toBe(true);
      expect(gameStateManager.getFlag("flag2")).toBe(false);
      expect(gameStateManager.getFlag("flag3")).toBe(true);
    });

    it("存在しないフラグはfalseを返す", () => {
      expect(gameStateManager.getFlag("non_existent")).toBe(false);
    });
  });

  describe("シーン管理", () => {
    it("シーンを訪問済みとしてマークできる", () => {
      gameStateManager.markSceneVisited("scene_002");
      expect(gameStateManager.isSceneVisited("scene_002")).toBe(true);
    });

    it("訪問済みシーンの状態を正しく判定する", () => {
      expect(gameStateManager.isSceneVisited("scene_001")).toBe(true);
      expect(gameStateManager.isSceneVisited("scene_999")).toBe(false);
    });
  });

  describe("インベントリ管理", () => {
    it("アイテムを追加できる", () => {
      gameStateManager.addToInventory("new_item");
      expect(gameStateManager.hasInInventory("new_item")).toBe(true);
    });

    it("重複したアイテムは追加されない", () => {
      gameStateManager.addToInventory("key"); // 既に存在
      const state = gameStateManager.getGameState();
      const keyCount = state.inventory.filter((item) => item === "key").length;
      expect(keyCount).toBe(1);
    });

    it("アイテムを削除できる", () => {
      gameStateManager.removeFromInventory("key");
      expect(gameStateManager.hasInInventory("key")).toBe(false);
    });

    it("存在しないアイテムの削除は無視される", () => {
      const originalState = gameStateManager.getGameState();
      gameStateManager.removeFromInventory("non_existent");
      const newState = gameStateManager.getGameState();

      expect(newState.inventory).toEqual(originalState.inventory);
    });
  });

  describe("進行状況", () => {
    it("進行状況を正しく取得する", () => {
      gameStateManager.markSceneVisited("scene_002");
      gameStateManager.markSceneVisited("scene_003");

      const progress = gameStateManager.getProgress();

      expect(progress.currentSceneIndex).toBe(0);
      expect(progress.totalVisitedScenes).toBe(3); // scene_001 + 2つ追加
      expect(progress.totalChoices).toBe(0);
      expect(progress.playTime).toBeGreaterThanOrEqual(0);
    });

    it("プレイ時間が正しく計算される", () => {
      const playTime1 = gameStateManager.getTotalPlayTime();

      // 少し待機
      return new Promise((resolve) => {
        setTimeout(() => {
          const playTime2 = gameStateManager.getTotalPlayTime();
          expect(playTime2).toBeGreaterThan(playTime1);
          resolve(undefined);
        }, 10);
      });
    });
  });

  describe("セーブ・ロード機能", () => {
    it("ローカルストレージにセーブできる", async () => {
      await gameStateManager.saveToLocalStorage("test_slot");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "nanatau_save_test_slot",
        expect.any(String)
      );
    });

    it("ローカルストレージからロードできる", async () => {
      // 先にセーブ
      await gameStateManager.saveToLocalStorage("test_slot");

      // 状態を変更
      gameStateManager.setVariable("test", "changed");

      // ロード
      const loadedState =
        await gameStateManager.loadFromLocalStorage("test_slot");

      expect(loadedState.variables.get("test")).toBeUndefined();
      expect(loadedState.variables.get("affection")).toBe(50);
    });

    it("存在しないセーブスロットのロードはエラーになる", async () => {
      await expect(
        gameStateManager.loadFromLocalStorage("non_existent")
      ).rejects.toThrow("Save slot not found");
    });

    it("永続化が無効の場合はセーブ・ロードでエラーになる", async () => {
      const manager = new GameStateManager(initialGameState, {
        enablePersistence: false,
      });

      await expect(manager.saveToLocalStorage("test")).rejects.toThrow(
        "Persistence is disabled"
      );
      await expect(manager.loadFromLocalStorage("test")).rejects.toThrow(
        "Persistence is disabled"
      );

      manager.dispose();
    });
  });

  describe("バリデーション", () => {
    it("無効なシーンインデックスでエラーになる", () => {
      expect(() => {
        gameStateManager.updateGameState({ currentSceneIndex: -1 });
      }).toThrow("Invalid scene index");
    });

    it("空のルートIDでエラーになる", () => {
      expect(() => {
        gameStateManager.updateGameState({ currentRouteId: "" });
      }).toThrow("Invalid route ID");
    });

    it("空のシナリオパスでエラーになる", () => {
      expect(() => {
        gameStateManager.updateGameState({ currentScenarioPath: "" });
      }).toThrow("Invalid scenario path");
    });
  });

  describe("設定管理", () => {
    it("設定を更新できる", () => {
      gameStateManager.updateConfig({
        autoSaveInterval: 2000,
        maxAutoSaves: 10,
      });

      const debugInfo = gameStateManager.getDebugInfo();
      expect(
        (debugInfo["config"] as Record<string, unknown>)["autoSaveInterval"]
      ).toBe(2000);
      expect(
        (debugInfo["config"] as Record<string, unknown>)["maxAutoSaves"]
      ).toBe(10);
    });
  });

  describe("デバッグ情報", () => {
    it("デバッグ情報を取得できる", () => {
      const debugInfo = gameStateManager.getDebugInfo();

      expect(debugInfo).toHaveProperty("currentSceneIndex");
      expect(debugInfo).toHaveProperty("currentRouteId");
      expect(debugInfo).toHaveProperty("variablesCount");
      expect(debugInfo).toHaveProperty("flagsCount");
      expect(debugInfo).toHaveProperty("visitedScenesCount");
      expect(debugInfo).toHaveProperty("choicesCount");
      expect(debugInfo).toHaveProperty("inventoryCount");
      expect(debugInfo).toHaveProperty("playTime");
      expect(debugInfo).toHaveProperty("config");
    });
  });
});
