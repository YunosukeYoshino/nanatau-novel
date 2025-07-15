# 設計文書

## 概要

「ななたうノベルゲーム」は、Pixi'VNエンジンを基盤とした、マルチプラットフォーム対応のビジュアルノベルゲームです。既存のシナリオファイル構造を活用し、TypeScriptで実装されたモダンなアーキテクチャを採用します。

## アーキテクチャ

### システム全体構成

```
┌─────────────────────────────────────────┐
│              UI Layer                   │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Game Screen │  │ Menu/Settings   │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           Game Logic Layer              │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Story Engine│  │ Save/Load System│   │
│  │             │  │                 │   │
│  │ Choice      │  │ Settings        │   │
│  │ System      │  │ Manager         │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│          Resource Layer                 │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Asset       │  │ Audio           │   │
│  │ Manager     │  │ Manager         │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           Platform Layer                │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Pixi'VN     │  │ Storage API     │   │
│  │ Engine      │  │ (LocalStorage)  │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

### 技術スタック

- **コアエンジン**: Pixi'VN (v1.2.21+)
- **言語**: TypeScript
- **ビルドツール**: Vite
- **Web**: 直接ブラウザ実行
- **Desktop**: Electron (将来実装)
- **Mobile**: Capacitor/Ionic (将来実装)

## コンポーネントと インターフェース

### 1. ストーリーエンジン (StoryEngine)

```typescript
interface StoryEngine {
  // シナリオファイルの読み込み
  loadScenario(filePath: string): Promise<ScenarioData>

  // 現在のストーリー状態
  getCurrentScene(): SceneData

  // 次のシーンへ進行
  advanceStory(): void

  // 選択肢の処理
  processChoice(choiceId: string): void

  // ルート分岐の管理
  switchRoute(routeId: string): void
}

interface ScenarioData {
  title: string
  chapter: string
  scenes: SceneData[]
}

interface SceneData {
  id: string
  type: 'dialogue' | 'choice' | 'background' | 'character'
  content: string
  character?: string
  background?: string
  bgm?: string
  se?: string
  choices?: ChoiceData[]
}

interface ChoiceData {
  id: string
  text: string
  nextScene: string
  routeChange?: string
}
```

### 2. シナリオパーサー (ScenarioParser)

```typescript
interface ScenarioParser {
  // テキストファイルをパース
  parseScenarioFile(content: string): ScenarioData

  // 特殊タグの解析
  parseDirectives(line: string): DirectiveData

  // キャラクター台詞の解析
  parseDialogue(line: string): DialogueData
}

interface DirectiveData {
  type: 'background' | 'bgm' | 'se' | 'character'
  value: string
  options?: Record<string, any>
}

interface DialogueData {
  character: string
  text: string
  isMonologue: boolean
}
```

### 3. アセット管理 (AssetManager)

```typescript
interface AssetManager {
  // 画像の読み込み
  loadImage(path: string): Promise<PIXI.Texture>

  // 音声の読み込み
  loadAudio(path: string): Promise<HTMLAudioElement>

  // アセットのプリロード
  preloadAssets(assetList: string[]): Promise<void>

  // キャッシュ管理
  clearCache(): void
}
```

### 4. セーブ・ロードシステム (SaveSystem)

```typescript
interface SaveSystem {
  // ゲーム状態の保存
  saveGame(slotId: string, gameState: GameState): Promise<void>

  // ゲーム状態の読み込み
  loadGame(slotId: string): Promise<GameState>

  // セーブスロット一覧
  getSaveSlots(): SaveSlotInfo[]

  // セーブデータの削除
  deleteSave(slotId: string): Promise<void>
}

interface GameState {
  currentScene: string
  currentRoute: string
  choiceHistory: string[]
  gameVariables: Record<string, any>
  timestamp: number
}

interface SaveSlotInfo {
  slotId: string
  timestamp: number
  sceneName: string
  previewImage?: string
}
```

### 5. UI管理 (UIManager)

```typescript
interface UIManager {
  // メニューの表示/非表示
  showMenu(menuType: MenuType): void
  hideMenu(): void

  // ダイアログボックスの管理
  showDialogue(character: string, text: string): void
  hideDialogue(): void

  // 選択肢の表示
  showChoices(choices: ChoiceData[]): void

  // 設定画面の管理
  showSettings(): void
}

enum MenuType {
  MAIN = 'main',
  SAVE = 'save',
  LOAD = 'load',
  SETTINGS = 'settings'
}
```

## データモデル

### ゲーム設定 (GameConfig)

```typescript
interface GameConfig {
  // 画面設定
  screen: {
    width: number
    height: number
    fullscreen: boolean
  }

  // 音声設定
  audio: {
    masterVolume: number
    bgmVolume: number
    seVolume: number
    voiceVolume: number
  }

  // テキスト設定
  text: {
    speed: number
    autoAdvance: boolean
    autoAdvanceDelay: number
  }

  // その他設定
  skipRead: boolean
  language: string
}
```

### シナリオファイル構造

既存のシナリオファイル形式を基準とした構造：

```
scenario/
├── 00_prologue.txt          # 序章
├── 01_chapter_one.txt       # 第1章
├── 02_chapter_two.txt       # 第2章
├── 03_chapter_three.txt     # 第3章
├── route_a/                 # ルートA分岐
│   ├── 04_route_a_ch1.txt
│   └── 05_route_a_ending.txt
└── route_b/                 # ルートB分岐
    ├── 04_route_b_ch1.txt
    └── 05_route_b_ending.txt
```

### シナリオファイル記法

```
タイトル：[章タイトル]
章：[章番号]『[章名]』

---

【背景】[背景画像の説明]
【BGM】[BGM名または説明]
【SE】[効果音の説明]

キャラクター名
「台詞内容」

キャラクター名（モノローグ）
内心の声や説明文

【立ち絵】キャラクター名（表情や状態）

【選択肢】
1. 選択肢1の内容 → [次のシーンID]
2. 選択肢2の内容 → [次のシーンID]

---
```

## エラーハンドリング

### エラー分類と対応

1. **シナリオファイルエラー**
   - ファイルが見つからない
   - パース失敗
   - 不正な形式

2. **アセット読み込みエラー**
   - 画像ファイルが見つからない
   - 音声ファイルが見つからない
   - ネットワークエラー

3. **セーブ・ロードエラー**
   - ストレージ容量不足
   - データ破損
   - 権限エラー

4. **システムエラー**
   - メモリ不足
   - レンダリングエラー
   - 予期しない例外

### エラー処理戦略

```typescript
class GameErrorHandler {
  handleScenarioError(error: ScenarioError): void {
    // ログ出力
    console.error('Scenario Error:', error)

    // ユーザーへの通知
    this.showErrorDialog('シナリオの読み込みに失敗しました')

    // フォールバック処理
    this.loadDefaultScenario()
  }

  handleAssetError(error: AssetError): void {
    // 代替アセットの使用
    this.useDefaultAsset(error.assetPath)

    // 継続可能な場合は処理を続行
    if (error.isCritical) {
      this.showCriticalError()
    }
  }
}
```

## テスト戦略

### テスト分類

1. **ユニットテスト**
   - シナリオパーサーのテスト
   - セーブ・ロードシステムのテスト
   - ゲーム状態管理のテスト

2. **統合テスト**
   - ストーリー進行のテスト
   - 選択肢システムのテスト
   - アセット読み込みのテスト

3. **E2Eテスト**
   - ゲーム全体の流れのテスト
   - マルチプラットフォーム動作テスト

### テスト環境

```typescript
// テスト用のモックデータ
const mockScenarioData: ScenarioData = {
  title: 'テストシナリオ',
  chapter: 'テスト章',
  scenes: [
    {
      id: 'test_scene_1',
      type: 'dialogue',
      content: 'テスト台詞',
      character: 'テストキャラ'
    }
  ]
}

// テスト用のゲーム状態
const mockGameState: GameState = {
  currentScene: 'test_scene_1',
  currentRoute: 'main',
  choiceHistory: [],
  gameVariables: {},
  timestamp: Date.now()
}
```

## パフォーマンス最適化

### 最適化戦略

1. **アセット管理**
   - 遅延読み込み (Lazy Loading)
   - アセットの圧縮
   - キャッシュ戦略

2. **メモリ管理**
   - 不要なアセットの解放
   - オブジェクトプールの活用
   - ガベージコレクション最適化

3. **レンダリング最適化**
   - スプライトバッチング
   - テクスチャアトラス
   - 描画コールの削減

### パフォーマンス監視

```typescript
class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()

  update(): void {
    this.frameCount++
    const currentTime = performance.now()

    if (currentTime - this.lastTime >= 1000) {
      const fps = this.frameCount
      console.log(`FPS: ${fps}`)

      this.frameCount = 0
      this.lastTime = currentTime
    }
  }

  measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      console.log(`Memory Usage: ${memory.usedJSHeapSize / 1024 / 1024} MB`)
    }
  }
}
```
