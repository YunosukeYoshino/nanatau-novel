/**
 * 音声・音楽システム - BGM、効果音、ボイスの再生と管理
 */

// import PixiVN from "@drincs/pixi-vn"; // TODO: 音声実装時に使用
import type { GameConfig } from "../types/core.js";
import type { IAudioManager } from "../types/interfaces.js";

export interface AudioConfig {
  /** 音量（0.0 - 1.0） */
  volume?: number;
  /** ループ再生するかどうか */
  loop?: boolean;
  /** フェードイン時間（ミリ秒） */
  fadeInDuration?: number;
  /** フェードアウト時間（ミリ秒） */
  fadeOutDuration?: number;
  /** 再生開始位置（秒） */
  startTime?: number;
}

export interface AudioTrack {
  /** トラックID */
  id: string;
  /** ファイルパス */
  filePath: string;
  /** Audio要素 */
  audioElement: HTMLAudioElement;
  /** 音量 */
  volume: number;
  /** ループ設定 */
  loop: boolean;
  /** 再生中かどうか */
  isPlaying: boolean;
  /** 一時停止中かどうか */
  isPaused: boolean;
  /** フェード中かどうか */
  isFading: boolean;
}

export class AudioSystem implements IAudioManager {
  private config: GameConfig;
  private bgmTracks: Map<string, AudioTrack> = new Map();
  private seTracks: Map<string, AudioTrack> = new Map();
  private voiceTracks: Map<string, AudioTrack> = new Map();
  private currentBGM: AudioTrack | null = null;
  private masterVolume: number = 1.0;
  private bgmVolume: number = 0.7;
  private seVolume: number = 0.8;
  private voiceVolume: number = 0.9;
  private audioContext: AudioContext | null = null;

  constructor(config: GameConfig) {
    this.config = config; // TODO: 設定値を使用した初期化処理を追加
    this.initializeAudioContext();
  }

  /**
   * 音声システムの初期化
   */
  async initialize(): Promise<void> {
    try {
      // Web Audio APIの初期化
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // ユーザージェスチャーによるオーディオコンテキストの開始
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log("AudioSystem initialized");
    } catch (error) {
      console.error("Failed to initialize AudioSystem:", error);
    }
  }

  /**
   * AudioContextの初期化
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  /**
   * BGMの再生
   */
  async playBGM(filePath: string, loop: boolean = true, config: AudioConfig = {}): Promise<void> {
    try {
      // 現在のBGMを停止
      if (this.currentBGM) {
        await this.stopBGM();
      }

      // 新しいBGMを作成
      const track = await this.createAudioTrack(filePath, {
        volume: this.bgmVolume * this.masterVolume,
        loop,
        ...config,
      });

      if (!track) {
        console.error(`Failed to create BGM track: ${filePath}`);
        return;
      }

      this.bgmTracks.set(track.id, track);
      this.currentBGM = track;

      // フェードイン再生
      if (config.fadeInDuration && config.fadeInDuration > 0) {
        await this.fadeIn(track, config.fadeInDuration);
      } else {
        track.audioElement.play();
        track.isPlaying = true;
      }

      console.log(`BGM started: ${filePath}`);
    } catch (error) {
      console.error(`Failed to play BGM: ${filePath}`, error);
    }
  }

  /**
   * 効果音の再生
   */
  async playSE(filePath: string, config: AudioConfig = {}): Promise<void> {
    try {
      const track = await this.createAudioTrack(filePath, {
        volume: this.seVolume * this.masterVolume,
        loop: false,
        ...config,
      });

      if (!track) {
        console.error(`Failed to create SE track: ${filePath}`);
        return;
      }

      this.seTracks.set(track.id, track);

      // 再生終了時の自動削除
      track.audioElement.addEventListener('ended', () => {
        this.seTracks.delete(track.id);
      });

      track.audioElement.play();
      track.isPlaying = true;

      console.log(`SE played: ${filePath}`);
    } catch (error) {
      console.error(`Failed to play SE: ${filePath}`, error);
    }
  }

  /**
   * ボイスの再生
   */
  async playVoice(filePath: string, config: AudioConfig = {}): Promise<void> {
    try {
      // 他のボイスを停止
      this.stopAllVoices();

      const track = await this.createAudioTrack(filePath, {
        volume: this.voiceVolume * this.masterVolume,
        loop: false,
        ...config,
      });

      if (!track) {
        console.error(`Failed to create voice track: ${filePath}`);
        return;
      }

      this.voiceTracks.set(track.id, track);

      // 再生終了時の自動削除
      track.audioElement.addEventListener('ended', () => {
        this.voiceTracks.delete(track.id);
      });

      track.audioElement.play();
      track.isPlaying = true;

      console.log(`Voice played: ${filePath}`);
    } catch (error) {
      console.error(`Failed to play voice: ${filePath}`, error);
    }
  }

  /**
   * BGMの停止
   */
  async stopBGM(): Promise<void> {
    if (!this.currentBGM) {
      return;
    }

    try {
      this.currentBGM.audioElement.pause();
      this.currentBGM.audioElement.currentTime = 0;
      this.currentBGM.isPlaying = false;
      this.bgmTracks.delete(this.currentBGM.id);
      this.currentBGM = null;

      console.log("BGM stopped");
    } catch (error) {
      console.error("Failed to stop BGM:", error);
    }
  }

  /**
   * 効果音の停止
   */
  stopSE(): void {
    try {
      for (const track of this.seTracks.values()) {
        track.audioElement.pause();
        track.audioElement.currentTime = 0;
        track.isPlaying = false;
      }
      this.seTracks.clear();

      console.log("All SE stopped");
    } catch (error) {
      console.error("Failed to stop SE:", error);
    }
  }

  /**
   * 全ボイスの停止
   */
  stopAllVoices(): void {
    try {
      for (const track of this.voiceTracks.values()) {
        track.audioElement.pause();
        track.audioElement.currentTime = 0;
        track.isPlaying = false;
      }
      this.voiceTracks.clear();

      console.log("All voices stopped");
    } catch (error) {
      console.error("Failed to stop voices:", error);
    }
  }

  /**
   * マスター音量の設定
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    console.log(`Master volume set to: ${this.masterVolume}`);
  }

  /**
   * BGM音量の設定
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
    console.log(`BGM volume set to: ${this.bgmVolume}`);
  }

  /**
   * 効果音音量の設定
   */
  setSEVolume(volume: number): void {
    this.seVolume = Math.max(0, Math.min(1, volume));
    this.updateSEVolume();
    console.log(`SE volume set to: ${this.seVolume}`);
  }

  /**
   * ボイス音量の設定
   */
  setVoiceVolume(volume: number): void {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
    this.updateVoiceVolume();
    console.log(`Voice volume set to: ${this.voiceVolume}`);
  }

  /**
   * BGMのフェード効果
   */
  async fadeBGM(duration: number, targetVolume: number): Promise<void> {
    if (!this.currentBGM) {
      console.warn("No BGM to fade");
      return;
    }

    try {
      await this.fadeToVolume(this.currentBGM, targetVolume * this.masterVolume, duration);
      console.log(`BGM faded to volume: ${targetVolume}`);
    } catch (error) {
      console.error("Failed to fade BGM:", error);
    }
  }

  /**
   * オーディオトラックの作成
   */
  private async createAudioTrack(filePath: string, config: AudioConfig): Promise<AudioTrack | null> {
    try {
      const audio = new Audio(filePath);
      const trackId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // プリロード
      audio.preload = 'auto';
      
      // 設定の適用
      audio.volume = config.volume || 1.0;
      audio.loop = config.loop || false;

      if (config.startTime) {
        audio.currentTime = config.startTime;
      }

      // ロード完了を待機
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };

        const onError = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error(`Failed to load audio: ${filePath}`));
        };

        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onError);

        // タイムアウト設定
        setTimeout(() => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error(`Audio loading timeout: ${filePath}`));
        }, 10000);
      });

      const track: AudioTrack = {
        id: trackId,
        filePath,
        audioElement: audio,
        volume: config.volume || 1.0,
        loop: config.loop || false,
        isPlaying: false,
        isPaused: false,
        isFading: false,
      };

      return track;
    } catch (error) {
      console.error(`Failed to create audio track: ${filePath}`, error);
      return null;
    }
  }

  /**
   * フェードイン効果
   */
  private async fadeIn(track: AudioTrack, duration: number): Promise<void> {
    track.isFading = true;
    const targetVolume = track.volume;
    track.audioElement.volume = 0;
    track.audioElement.play();
    track.isPlaying = true;

    await this.fadeToVolume(track, targetVolume, duration);
    track.isFading = false;
  }

  /**
   * フェードアウト効果
   */
  private async fadeOut(track: AudioTrack, duration: number): Promise<void> { // TODO: 実装予定
    track.isFading = true;
    await this.fadeToVolume(track, 0, duration);
    track.audioElement.pause();
    track.isPlaying = false;
    track.isFading = false;
  }

  /**
   * 指定音量へのフェード
   */
  private async fadeToVolume(track: AudioTrack, targetVolume: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const startVolume = track.audioElement.volume;
      const volumeDiff = targetVolume - startVolume;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        track.audioElement.volume = startVolume + volumeDiff * progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          track.volume = targetVolume;
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 全音量の更新
   */
  private updateAllVolumes(): void {
    this.updateBGMVolume();
    this.updateSEVolume();
    this.updateVoiceVolume();
  }

  /**
   * BGM音量の更新
   */
  private updateBGMVolume(): void {
    for (const track of this.bgmTracks.values()) {
      track.audioElement.volume = track.volume * this.bgmVolume * this.masterVolume;
    }
  }

  /**
   * 効果音音量の更新
   */
  private updateSEVolume(): void {
    for (const track of this.seTracks.values()) {
      track.audioElement.volume = track.volume * this.seVolume * this.masterVolume;
    }
  }

  /**
   * ボイス音量の更新
   */
  private updateVoiceVolume(): void {
    for (const track of this.voiceTracks.values()) {
      track.audioElement.volume = track.volume * this.voiceVolume * this.masterVolume;
    }
  }

  /**
   * 音量設定の取得
   */
  getVolumeSettings(): { master: number; bgm: number; se: number; voice: number } {
    return {
      master: this.masterVolume,
      bgm: this.bgmVolume,
      se: this.seVolume,
      voice: this.voiceVolume,
    };
  }

  /**
   * 現在のBGM情報を取得
   */
  getCurrentBGM(): string | null {
    return this.currentBGM ? this.currentBGM.filePath : null;
  }

  /**
   * BGMが再生中かどうかを確認
   */
  isBGMPlaying(): boolean {
    return this.currentBGM ? this.currentBGM.isPlaying : false;
  }

  /**
   * 全音声の一時停止
   */
  pauseAll(): void {
    // BGMの一時停止
    if (this.currentBGM && this.currentBGM.isPlaying) {
      this.currentBGM.audioElement.pause();
      this.currentBGM.isPaused = true;
    }

    // 効果音の一時停止
    for (const track of this.seTracks.values()) {
      if (track.isPlaying) {
        track.audioElement.pause();
        track.isPaused = true;
      }
    }

    // ボイスの一時停止
    for (const track of this.voiceTracks.values()) {
      if (track.isPlaying) {
        track.audioElement.pause();
        track.isPaused = true;
      }
    }

    console.log("All audio paused");
  }

  /**
   * 全音声の再開
   */
  resumeAll(): void {
    // BGMの再開
    if (this.currentBGM && this.currentBGM.isPaused) {
      this.currentBGM.audioElement.play();
      this.currentBGM.isPaused = false;
    }

    // 効果音の再開
    for (const track of this.seTracks.values()) {
      if (track.isPaused) {
        track.audioElement.play();
        track.isPaused = false;
      }
    }

    // ボイスの再開
    for (const track of this.voiceTracks.values()) {
      if (track.isPaused) {
        track.audioElement.play();
        track.isPaused = false;
      }
    }

    console.log("All audio resumed");
  }

  /**
   * システムのリセット
   */
  reset(): void {
    this.stopBGM();
    this.stopSE();
    this.stopAllVoices();
    console.log("AudioSystem reset");
  }

  /**
   * システムの終了処理
   */
  dispose(): void {
    this.reset();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    console.log("AudioSystem disposed");
  }
}