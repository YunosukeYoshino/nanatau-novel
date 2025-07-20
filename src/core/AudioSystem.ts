/**
 * 音声・音楽システム - BGM、効果音、ボイスの再生と管理
 */

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
  private bgmTracks: Map<string, AudioTrack> = new Map();
  private seTracks: Map<string, AudioTrack> = new Map();
  private voiceTracks: Map<string, AudioTrack> = new Map();
  private currentBGM: AudioTrack | null = null;
  private currentVoice: AudioTrack | null = null;
  private masterVolume: number = 1.0;
  private bgmVolume: number = 0.7;
  private seVolume: number = 0.8;
  private voiceVolume: number = 0.9;
  private bgmMuted: boolean = false;
  private seMuted: boolean = false;
  private voiceMuted: boolean = false;
  private audioContext: AudioContext | null = null;
  private isInitialized: boolean = false;
  private fadeIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // AudioContextの作成
      this.audioContext = new AudioContext();
      await this.audioContext.resume();

      this.isInitialized = true;
      console.log("AudioSystem initialized");
    } catch (error) {
      console.error("Failed to initialize AudioSystem:", error);
      throw error;
    }
  }

  /**
   * 初期化状態の取得
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * BGMの読み込み
   */
  async loadBGM(
    id: string,
    filePath: string,
    config?: AudioConfig
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioSystem not initialized");
      return;
    }

    try {
      const audioElement = new Audio(filePath);
      const track: AudioTrack = {
        id,
        filePath,
        audioElement,
        volume: config?.volume || this.bgmVolume,
        loop: config?.loop || true,
        isPlaying: false,
        isPaused: false,
        isFading: false,
      };

      audioElement.loop = track.loop;
      audioElement.volume = track.volume * this.masterVolume;

      this.bgmTracks.set(id, track);
    } catch (error) {
      console.error(`Failed to load BGM: ${id}`, error);
    }
  }

  /**
   * BGMの再生
   */
  async playBGM(id: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioSystem not initialized");
      return;
    }

    const track = this.bgmTracks.get(id);
    if (!track) {
      console.warn(`BGM not found: ${id}`);
      return;
    }

    try {
      // 現在のBGMを停止
      if (this.currentBGM && this.currentBGM !== track) {
        await this.stopBGM();
      }

      track.audioElement.currentTime = 0;
      await track.audioElement.play();
      track.isPlaying = true;
      track.isPaused = false;
      this.currentBGM = track;
    } catch (error) {
      console.error(`Failed to play BGM: ${id}`, error);
    }
  }

  /**
   * BGMの停止
   */
  async stopBGM(): Promise<void> {
    if (this.currentBGM) {
      this.currentBGM.audioElement.pause();
      this.currentBGM.audioElement.currentTime = 0;
      this.currentBGM.isPlaying = false;
      this.currentBGM.isPaused = false;
      this.currentBGM = null;
    }
  }

  /**
   * BGM音量の設定
   */
  async setBGMVolume(volume: number): Promise<void> {
    this.bgmVolume = Math.max(0, Math.min(1, volume));

    // 全BGMトラックの音量を更新
    for (const track of this.bgmTracks.values()) {
      if (!this.bgmMuted) {
        track.audioElement.volume = this.bgmVolume * this.masterVolume;
        track.volume = this.bgmVolume;
      }
    }
  }

  /**
   * 効果音の読み込み
   */
  async loadSE(
    id: string,
    filePath: string,
    config?: AudioConfig
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioSystem not initialized");
      return;
    }

    try {
      const audioElement = new Audio(filePath);
      const track: AudioTrack = {
        id,
        filePath,
        audioElement,
        volume: config?.volume || this.seVolume,
        loop: config?.loop || false,
        isPlaying: false,
        isPaused: false,
        isFading: false,
      };

      audioElement.loop = track.loop;
      audioElement.volume = track.volume * this.masterVolume;

      this.seTracks.set(id, track);
    } catch (error) {
      console.error(`Failed to load SE: ${id}`, error);
    }
  }

  /**
   * 効果音の再生
   */
  async playSE(id: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioSystem not initialized");
      return;
    }

    const track = this.seTracks.get(id);
    if (!track) {
      console.warn(`SE not found: ${id}`);
      return;
    }

    try {
      track.audioElement.currentTime = 0;
      await track.audioElement.play();
      track.isPlaying = true;
      track.isPaused = false;
    } catch (error) {
      console.error(`Failed to play SE: ${id}`, error);
    }
  }

  /**
   * 効果音音量の設定
   */
  async setSEVolume(volume: number): Promise<void> {
    this.seVolume = Math.max(0, Math.min(1, volume));

    // 全SEトラックの音量を更新
    for (const track of this.seTracks.values()) {
      if (!this.seMuted) {
        track.audioElement.volume = this.seVolume * this.masterVolume;
        track.volume = this.seVolume;
      }
    }
  }

  /**
   * ボイスの読み込み
   */
  async loadVoice(
    id: string,
    filePath: string,
    config?: AudioConfig
  ): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioSystem not initialized");
      return;
    }

    try {
      const audioElement = new Audio(filePath);
      const track: AudioTrack = {
        id,
        filePath,
        audioElement,
        volume: config?.volume || this.voiceVolume,
        loop: config?.loop || false,
        isPlaying: false,
        isPaused: false,
        isFading: false,
      };

      audioElement.loop = track.loop;
      audioElement.volume = track.volume * this.masterVolume;

      this.voiceTracks.set(id, track);
    } catch (error) {
      console.error(`Failed to load Voice: ${id}`, error);
    }
  }

  /**
   * ボイスの再生
   */
  async playVoice(id: string): Promise<void> {
    if (!this.isInitialized) {
      console.warn("AudioSystem not initialized");
      return;
    }

    const track = this.voiceTracks.get(id);
    if (!track) {
      console.warn(`Voice not found: ${id}`);
      return;
    }

    try {
      // 現在のボイスを停止
      if (this.currentVoice && this.currentVoice !== track) {
        await this.stopVoice();
      }

      track.audioElement.currentTime = 0;
      await track.audioElement.play();
      track.isPlaying = true;
      track.isPaused = false;
      this.currentVoice = track;
    } catch (error) {
      console.error(`Failed to play Voice: ${id}`, error);
    }
  }

  /**
   * ボイスの停止
   */
  async stopVoice(): Promise<void> {
    if (this.currentVoice) {
      this.currentVoice.audioElement.pause();
      this.currentVoice.audioElement.currentTime = 0;
      this.currentVoice.isPlaying = false;
      this.currentVoice.isPaused = false;
      this.currentVoice = null;
    }
  }

  /**
   * ボイス音量の設定
   */
  async setVoiceVolume(volume: number): Promise<void> {
    this.voiceVolume = Math.max(0, Math.min(1, volume));

    // 全ボイストラックの音量を更新
    for (const track of this.voiceTracks.values()) {
      if (!this.voiceMuted) {
        track.audioElement.volume = this.voiceVolume * this.masterVolume;
        track.volume = this.voiceVolume;
      }
    }
  }

  /**
   * BGMフェードイン
   */
  fadeInBGM(duration: number): void {
    if (!this.currentBGM) return;

    const track = this.currentBGM;
    const startVolume = 0;
    const endVolume = this.bgmVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;

    track.audioElement.volume = startVolume;
    track.isFading = true;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.min(
        startVolume + volumeStep * currentStep,
        endVolume
      );
      track.audioElement.volume = newVolume * this.masterVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        track.isFading = false;
        this.fadeIntervals.delete(track.id);
      }
    }, stepDuration);

    this.fadeIntervals.set(track.id, fadeInterval);
  }

  /**
   * BGMフェードアウト
   */
  fadeOutBGM(duration: number): void {
    if (!this.currentBGM) return;

    const track = this.currentBGM;
    const startVolume = this.bgmVolume;
    const endVolume = 0;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = (startVolume - endVolume) / steps;

    track.isFading = true;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(
        startVolume - volumeStep * currentStep,
        endVolume
      );
      track.audioElement.volume = newVolume * this.masterVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        track.isFading = false;
        this.fadeIntervals.delete(track.id);
        this.stopBGM();
      }
    }, stepDuration);

    this.fadeIntervals.set(track.id, fadeInterval);
  }

  /**
   * BGMミュート
   */
  muteBGM(): void {
    this.bgmMuted = true;
    for (const track of this.bgmTracks.values()) {
      track.audioElement.volume = 0;
    }
  }

  /**
   * BGMミュート解除
   */
  unmuteBGM(): void {
    this.bgmMuted = false;
    for (const track of this.bgmTracks.values()) {
      track.audioElement.volume = track.volume * this.masterVolume;
    }
  }

  /**
   * 効果音ミュート
   */
  muteSE(): void {
    this.seMuted = true;
    for (const track of this.seTracks.values()) {
      track.audioElement.volume = 0;
    }
  }

  /**
   * 効果音ミュート解除
   */
  unmuteSE(): void {
    this.seMuted = false;
    for (const track of this.seTracks.values()) {
      track.audioElement.volume = track.volume * this.masterVolume;
    }
  }

  /**
   * ボイスミュート
   */
  muteVoice(): void {
    this.voiceMuted = true;
    for (const track of this.voiceTracks.values()) {
      track.audioElement.volume = 0;
    }
  }

  /**
   * ボイスミュート解除
   */
  unmuteVoice(): void {
    this.voiceMuted = false;
    for (const track of this.voiceTracks.values()) {
      track.audioElement.volume = track.volume * this.masterVolume;
    }
  }

  // 状態確認メソッド
  isBGMLoaded(id: string): boolean {
    return this.bgmTracks.has(id);
  }

  isSELoaded(id: string): boolean {
    return this.seTracks.has(id);
  }

  isVoiceLoaded(id: string): boolean {
    return this.voiceTracks.has(id);
  }

  isBGMPlaying(): boolean {
    return this.currentBGM ? !this.currentBGM.audioElement.paused : false;
  }

  isBGMMuted(): boolean {
    return this.bgmMuted;
  }

  isSEMuted(): boolean {
    return this.seMuted;
  }

  isVoiceMuted(): boolean {
    return this.voiceMuted;
  }

  getCurrentBGMVolume(): number {
    return this.bgmVolume;
  }

  getCurrentSEVolume(): number {
    return this.seVolume;
  }

  getCurrentVoiceVolume(): number {
    return this.voiceVolume;
  }

  /**
   * 効果音を停止
   */
  async stopSE(): Promise<void> {
    for (const track of this.seTracks.values()) {
      track.audioElement.pause();
      track.audioElement.currentTime = 0;
      track.isPlaying = false;
      track.isPaused = false;
    }
  }

  /**
   * マスター音量を設定
   */
  async setMasterVolume(volume: number): Promise<void> {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    // 全トラックの音量を更新
    for (const track of this.bgmTracks.values()) {
      if (!this.bgmMuted) {
        track.audioElement.volume = track.volume * this.masterVolume;
      }
    }
    for (const track of this.seTracks.values()) {
      if (!this.seMuted) {
        track.audioElement.volume = track.volume * this.masterVolume;
      }
    }
    for (const track of this.voiceTracks.values()) {
      if (!this.voiceMuted) {
        track.audioElement.volume = track.volume * this.masterVolume;
      }
    }
  }

  /**
   * BGMフェード（汎用）
   */
  async fadeBGM(duration: number, targetVolume: number): Promise<void> {
    if (targetVolume === 0) {
      this.fadeOutBGM(duration);
    } else {
      this.fadeInBGM(duration);
    }
  }

  /**
   * 破棄処理
   */
  async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // フェードインターバルをクリア
    for (const interval of this.fadeIntervals.values()) {
      clearInterval(interval);
    }
    this.fadeIntervals.clear();

    // 全音声を停止
    await this.stopBGM();
    await this.stopSE();
    await this.stopVoice();

    // トラックをクリア
    this.bgmTracks.clear();
    this.seTracks.clear();
    this.voiceTracks.clear();

    // AudioContextを閉じる
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch (_error) {
        // テスト環境などでclose()がない場合のエラーハンドリング
        console.warn("AudioContext.close() not available");
      }
    }
    this.audioContext = null;

    this.isInitialized = false;
    console.log("AudioSystem destroyed");
  }
}
