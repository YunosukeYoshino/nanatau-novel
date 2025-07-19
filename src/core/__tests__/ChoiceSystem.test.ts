/**
 * ChoiceSystem のテスト
 */

import { beforeEach, describe, expect, it } from "vitest";
import type {
  ChoiceData,
  GameState,
  RouteCondition,
} from "../../types/core.js";
import { ChoiceSystem } from "../ChoiceSystem.js";

describe("ChoiceSystem", () => {
  let choiceSystem: ChoiceSystem;
  let gameState: GameState;

  beforeEach(() => {
    choiceSystem = new ChoiceSystem();
    gameState = {
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
      visitedScenes: new Set(["scene_001", "scene_002"]),
      choices: [],
      inventory: ["key", "letter"],
      playerName: "テストプレイヤー",
      lastSaveTimestamp: Date.now(),
    };
  });

  describe("選択肢条件評価", () => {
    const testChoices: ChoiceData[] = [
      {
        id: "choice_001",
        text: "普通の選択肢",
      },
      {
        id: "choice_002",
        text: "フラグ条件付き選択肢",
        conditions: [
          {
            type: "flag",
            key: "met_heroine",
            operator: "equals",
            value: true,
          },
        ],
      },
      {
        id: "choice_003",
        text: "変数条件付き選択肢",
        conditions: [
          {
            type: "variable",
            key: "affection",
            operator: "greater_than",
            value: 30,
          },
        ],
      },
      {
        id: "choice_004",
        text: "複数条件付き選択肢",
        conditions: [
          {
            type: "flag",
            key: "met_heroine",
            operator: "equals",
            value: true,
          },
          {
            type: "variable",
            key: "money",
            operator: "greater_equal",
            value: 50,
          },
        ],
      },
      {
        id: "choice_005",
        text: "条件を満たさない選択肢",
        conditions: [
          {
            type: "flag",
            key: "first_choice_made",
            operator: "equals",
            value: true,
          },
        ],
      },
    ];

    it("条件なしの選択肢は常に表示される", () => {
      const result = choiceSystem.evaluateChoiceConditions(
        testChoices,
        gameState
      );

      expect(
        result.some((choice) => choice && choice.id === "choice_001")
      ).toBe(true);
    });

    it("フラグ条件を正しく評価する", () => {
      const result = choiceSystem.evaluateChoiceConditions(
        testChoices,
        gameState
      );
      const hasChoice002 = result.some(
        (choice) => choice && choice.id === "choice_002"
      );
      const hasChoice005 = result.some(
        (choice) => choice && choice.id === "choice_005"
      );

      expect(hasChoice002).toBe(true);
      expect(hasChoice005).toBe(false);
    });

    it("変数条件を正しく評価する", () => {
      const result = choiceSystem.evaluateChoiceConditions(
        testChoices,
        gameState
      );

      expect(
        result.some((choice) => choice && choice.id === "choice_003")
      ).toBe(true);
    });

    it("複数条件を正しく評価する", () => {
      const result = choiceSystem.evaluateChoiceConditions(
        testChoices,
        gameState
      );

      expect(
        result.some((choice) => choice && choice.id === "choice_004")
      ).toBe(true);
    });

    it("条件を満たさない選択肢は除外される", () => {
      const result = choiceSystem.evaluateChoiceConditions(
        testChoices,
        gameState
      );

      expect(
        result.some((choice) => choice && choice.id === "choice_005")
      ).toBe(false);
    });
  });

  describe("選択肢実行", () => {
    const testChoice: ChoiceData = {
      id: "test_choice",
      text: "テスト選択肢",
      flags: {
        first_choice_made: true,
        special_event: true,
      },
      variables: {
        affection: 60,
        money: 90,
      },
      routeId: "route_a",
    };

    it("選択肢実行でフラグが更新される", () => {
      const result = choiceSystem.executeChoice(
        testChoice,
        gameState,
        "scene_001"
      );

      expect(result.flags.get("first_choice_made")).toBe(true);
      expect(result.flags.get("special_event")).toBe(true);
    });

    it("選択肢実行で変数が更新される", () => {
      const result = choiceSystem.executeChoice(
        testChoice,
        gameState,
        "scene_001"
      );

      expect(result.variables.get("affection")).toBe(60);
      expect(result.variables.get("money")).toBe(90);
    });

    it("選択肢実行でルートが変更される", () => {
      const result = choiceSystem.executeChoice(
        testChoice,
        gameState,
        "scene_001"
      );

      expect(result.currentRouteId).toBe("route_a");
    });

    it("選択履歴に記録される", () => {
      const result = choiceSystem.executeChoice(
        testChoice,
        gameState,
        "scene_001"
      );

      expect(result.choices).toHaveLength(1);
      expect(result.choices[0]?.sceneId).toBe("scene_001");
      expect(result.choices[0]?.choiceId).toBe("test_choice");
      expect(result.choices[0]?.choiceText).toBe("テスト選択肢");
    });

    it("元のゲーム状態は変更されない（イミュータブル）", () => {
      const originalFlags = new Map(gameState.flags);
      const originalVariables = new Map(gameState.variables);

      choiceSystem.executeChoice(testChoice, gameState, "scene_001");

      expect(gameState.flags).toEqual(originalFlags);
      expect(gameState.variables).toEqual(originalVariables);
    });
  });

  describe("ルート分岐判定", () => {
    const availableRoutes = ["route_a", "route_b", "main"];
    const routeConditions = new Map<string, RouteCondition[]>([
      [
        "route_a",
        [
          {
            type: "variable",
            key: "affection",
            operator: "greater_than",
            value: 70,
          },
        ],
      ],
      [
        "route_b",
        [
          {
            type: "flag",
            key: "met_heroine",
            operator: "equals",
            value: true,
          },
        ],
      ],
    ]);

    it("条件を満たすルートが選択される", () => {
      const result = choiceSystem.determineRoute(
        availableRoutes,
        gameState,
        routeConditions
      );

      expect(result).toBe("route_b"); // met_heroine フラグが true
    });

    it("条件を満たすルートがない場合はデフォルトルートが選択される", () => {
      // affection を低く設定し、met_heroine を false に設定
      gameState.variables.set("affection", 30);
      gameState.flags.set("met_heroine", false);

      const result = choiceSystem.determineRoute(
        availableRoutes,
        gameState,
        routeConditions
      );

      expect(result).toBe("main"); // デフォルト（最後のルート）
    });
  });

  describe("Undo機能", () => {
    beforeEach(() => {
      choiceSystem = new ChoiceSystem({ enableUndo: true });
    });

    it("選択肢実行後にundoできる", () => {
      const testChoice: ChoiceData = {
        id: "test_choice",
        text: "テスト選択肢",
        flags: { test_flag: true },
      };

      choiceSystem.executeChoice(testChoice, gameState, "scene_001");
      const undoState = choiceSystem.undoLastChoice();

      expect(undoState).not.toBeNull();
      if (undoState) {
        expect(undoState.flags.get("test_flag")).toBe(undefined);
      }
    });

    it("Undo無効時はnullを返す", () => {
      choiceSystem = new ChoiceSystem({ enableUndo: false });

      const undoState = choiceSystem.undoLastChoice();

      expect(undoState).toBeNull();
    });
  });

  describe("統計情報", () => {
    it("選択肢統計を正しく計算する", () => {
      // 選択履歴を追加
      gameState.choices = [
        {
          sceneId: "scene_001",
          choiceId: "choice_001",
          choiceText: "選択肢1",
          timestamp: Date.now(),
        },
        {
          sceneId: "scene_001",
          choiceId: "choice_002",
          choiceText: "選択肢2",
          timestamp: Date.now(),
        },
        {
          sceneId: "scene_002",
          choiceId: "choice_001",
          choiceText: "選択肢1",
          timestamp: Date.now(),
        },
      ];

      const stats = choiceSystem.getChoiceStatistics(gameState);

      expect(stats["totalChoices"]).toBe(3);
      expect(stats["uniqueScenes"]).toBe(2);
      expect(stats["uniqueChoices"]).toBe(2);
    });
  });

  describe("設定管理", () => {
    it("設定を更新できる", () => {
      const newConfig = {
        maxHistorySize: 200,
        enableUndo: true,
      };

      choiceSystem.updateConfig(newConfig);
      const config = choiceSystem.getConfig();

      expect(config.maxHistorySize).toBe(200);
      expect(config.enableUndo).toBe(true);
    });

    it("部分的な設定更新が可能", () => {
      const originalConfig = choiceSystem.getConfig();

      choiceSystem.updateConfig({ enableUndo: true });
      const updatedConfig = choiceSystem.getConfig();

      expect(updatedConfig.enableUndo).toBe(true);
      expect(updatedConfig.maxHistorySize).toBe(originalConfig.maxHistorySize);
    });
  });
});
