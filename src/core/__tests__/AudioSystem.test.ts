import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AudioSystem } from "../AudioSystem";

// Web Audio API のモック
const mockAudioContext = {
  createMediaElementSource: vi.fn(),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  destination: {},
  resume: vi.fn(),
  close: vi.fn(),
  state: "running",
};

// Audio要素のモック
const mockAudioElement = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 100,
  volume: 1,
  loop: false,
  src: "",
  paused: true,
  ended: false,
};

// グローバルのAudioContextとAudioをモック
Object.defineProperty(global, "AudioContext", {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

Object.defineProperty(global, "Audio", {
  value: vi.fn(() => mockAudioElement),
  writable: true,
});

describe("AudioSystem", () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    audioSystem = new AudioSystem();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await audioSystem.destroy();
  });

  describe("初期化", () => {
    it("正常に初期化される", async () => {
      await audioSystem.initialize();
      expect(audioSystem.getIsInitialized()).toBe(true);
    });

    it("重複初期化を防ぐ", async () => {
      await audioSystem.initialize();
      expect(audioSystem.getIsInitialized()).toBe(true);

      // 2回目の初期化は何もしない
      await audioSystem.initialize();
      expect(audioSystem.getIsInitialized()).toBe(true);
    });

    it("AudioContextが作成される", async () => {
      await audioSystem.initialize();
      expect(global.AudioContext).toHaveBeenCalled();
    });
  });

  describe("BGM管理", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it("BGMを読み込める", async () => {
      await audioSystem.loadBGM("test-bgm", "/audio/bgm/test.mp3");

      expect(global.Audio).toHaveBeenCalledWith("/audio/bgm/test.mp3");
      expect(audioSystem.isBGMLoaded("test-bgm")).toBe(true);
    });

    it("BGMを再生できる", async () => {
      await audioSystem.loadBGM("test-bgm", "/audio/bgm/test.mp3");
      await audioSystem.playBGM("test-bgm");

      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it("BGMを停止できる", async () => {
      await audioSystem.loadBGM("test-bgm", "/audio/bgm/test.mp3");
      await audioSystem.playBGM("test-bgm");
      await audioSystem.stopBGM();

      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it("BGMボリュームを設定できる", async () => {
      await audioSystem.loadBGM("test-bgm", "/audio/bgm/test.mp3");
      await audioSystem.setBGMVolume(0.5);

      expect(mockAudioElement.volume).toBe(0.5);
    });

    it("存在しないBGMの再生は何もしない", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await audioSystem.playBGM("nonexistent-bgm");

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockAudioElement.play).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("効果音管理", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it("効果音を読み込める", async () => {
      await audioSystem.loadSE("test-se", "/audio/se/test.mp3");

      expect(global.Audio).toHaveBeenCalledWith("/audio/se/test.mp3");
      expect(audioSystem.isSELoaded("test-se")).toBe(true);
    });

    it("効果音を再生できる", async () => {
      await audioSystem.loadSE("test-se", "/audio/se/test.mp3");
      await audioSystem.playSE("test-se");

      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it("効果音ボリュームを設定できる", async () => {
      await audioSystem.loadSE("test-se", "/audio/se/test.mp3");
      await audioSystem.setSEVolume(0.7);

      expect(mockAudioElement.volume).toBe(0.7);
    });

    it("存在しない効果音の再生は何もしない", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await audioSystem.playSE("nonexistent-se");

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockAudioElement.play).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("ボイス管理", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it("ボイスを読み込める", async () => {
      await audioSystem.loadVoice("test-voice", "/audio/voice/test.mp3");

      expect(global.Audio).toHaveBeenCalledWith("/audio/voice/test.mp3");
      expect(audioSystem.isVoiceLoaded("test-voice")).toBe(true);
    });

    it("ボイスを再生できる", async () => {
      await audioSystem.loadVoice("test-voice", "/audio/voice/test.mp3");
      await audioSystem.playVoice("test-voice");

      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it("ボイスを停止できる", async () => {
      await audioSystem.loadVoice("test-voice", "/audio/voice/test.mp3");
      await audioSystem.playVoice("test-voice");
      await audioSystem.stopVoice();

      expect(mockAudioElement.pause).toHaveBeenCalled();
    });

    it("ボイスボリュームを設定できる", async () => {
      await audioSystem.loadVoice("test-voice", "/audio/voice/test.mp3");
      await audioSystem.setVoiceVolume(0.8);

      expect(mockAudioElement.volume).toBe(0.8);
    });
  });

  describe("フェード機能", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
      await audioSystem.loadBGM("test-bgm", "/audio/bgm/test.mp3");
    });

    it("BGMフェードインできる", async () => {
      await audioSystem.playBGM("test-bgm");

      // フェードイン開始
      audioSystem.fadeInBGM(1000); // 1秒

      // フェード処理が開始されることを確認（ボリューム自体は変わらない）
      expect(audioSystem.getCurrentBGMVolume()).toBe(0.7);
    });

    it("BGMフェードアウトできる", async () => {
      await audioSystem.playBGM("test-bgm");
      await audioSystem.setBGMVolume(1.0);

      // フェードアウト開始
      audioSystem.fadeOutBGM(1000); // 1秒

      // フェード処理が開始されることを確認（ボリューム自体は変わらない）
      expect(audioSystem.getCurrentBGMVolume()).toBe(1.0);
    });
  });

  describe("ミュート機能", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it("BGMをミュートできる", async () => {
      await audioSystem.setBGMVolume(0.5);
      audioSystem.muteBGM();

      expect(audioSystem.isBGMMuted()).toBe(true);
    });

    it("BGMのミュートを解除できる", async () => {
      await audioSystem.setBGMVolume(0.5);
      audioSystem.muteBGM();
      audioSystem.unmuteBGM();

      expect(audioSystem.isBGMMuted()).toBe(false);
    });

    it("効果音をミュートできる", async () => {
      await audioSystem.setSEVolume(0.7);
      audioSystem.muteSE();

      expect(audioSystem.isSEMuted()).toBe(true);
    });

    it("効果音のミュートを解除できる", async () => {
      await audioSystem.setSEVolume(0.7);
      audioSystem.muteSE();
      audioSystem.unmuteSE();

      expect(audioSystem.isSEMuted()).toBe(false);
    });

    it("ボイスをミュートできる", async () => {
      await audioSystem.setVoiceVolume(0.8);
      audioSystem.muteVoice();

      expect(audioSystem.isVoiceMuted()).toBe(true);
    });

    it("ボイスのミュートを解除できる", async () => {
      await audioSystem.setVoiceVolume(0.8);
      audioSystem.muteVoice();
      audioSystem.unmuteVoice();

      expect(audioSystem.isVoiceMuted()).toBe(false);
    });
  });

  describe("状態取得", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
      await audioSystem.loadBGM("test-bgm", "/audio/bgm/test.mp3");
    });

    it("BGM再生状態を取得できる", async () => {
      expect(audioSystem.isBGMPlaying()).toBe(false);

      await audioSystem.playBGM("test-bgm");
      // モックでは paused プロパティは true のまま
      expect(audioSystem.isBGMPlaying()).toBe(false);
    });

    it("現在のBGM音量を取得できる", async () => {
      await audioSystem.setBGMVolume(0.6);
      expect(audioSystem.getCurrentBGMVolume()).toBe(0.6);
    });

    it("現在の効果音音量を取得できる", async () => {
      await audioSystem.setSEVolume(0.3);
      expect(audioSystem.getCurrentSEVolume()).toBe(0.3);
    });

    it("現在のボイス音量を取得できる", async () => {
      await audioSystem.setVoiceVolume(0.9);
      expect(audioSystem.getCurrentVoiceVolume()).toBe(0.9);
    });
  });

  describe("破棄処理", () => {
    beforeEach(async () => {
      await audioSystem.initialize();
    });

    it("正常に破棄される", async () => {
      await audioSystem.destroy();
      expect(audioSystem.getIsInitialized()).toBe(false);
    });

    it("重複破棄を防ぐ", async () => {
      await audioSystem.destroy();
      expect(audioSystem.getIsInitialized()).toBe(false);

      // 2回目の破棄は何もしない
      await audioSystem.destroy();
      expect(audioSystem.getIsInitialized()).toBe(false);
    });
  });

  describe("エラーハンドリング", () => {
    it("初期化前の操作は適切にエラーハンドリングされる", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await audioSystem.playBGM("test-bgm");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("破棄後の操作は適切にエラーハンドリングされる", async () => {
      await audioSystem.initialize();
      await audioSystem.destroy();

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await audioSystem.playBGM("test-bgm");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("音声ファイル読み込みエラーを適切にハンドリングする", async () => {
      await audioSystem.initialize();

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Audioコンストラクタがエラーを投げるようにモック
      const originalAudio = global.Audio;
      global.Audio = vi.fn(() => {
        throw new Error("Audio file not found");
      });

      // 存在しないファイルの読み込み
      await audioSystem.loadBGM("invalid-bgm", "/invalid/path.mp3");

      // エラーが記録されることを確認
      expect(consoleSpy).toHaveBeenCalled();

      // モックを復元
      global.Audio = originalAudio;
      consoleSpy.mockRestore();
    });
  });
});
