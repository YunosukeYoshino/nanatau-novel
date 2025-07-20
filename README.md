# ななたう - 硝子の心、たう（届く）まで

🌸 TypeScript製ビジュアルノベルゲーム - Pixi'VNエンジン使用

## 📖 ストーリー

舞台は広島県宇品。港を見下ろす丘の上の廃教会にある一枚の「ステンドグラス」に宿った、主人公との果たされなかった約束の記憶そのもの、それがヒロイン「ななたう」。

二人の間には常に「ガラス」という絶対的な境界が存在し、決して触れ合うことはできない。主人公が失われた記憶を取り戻すほど、ステンドグラスにはヒビが入り、彼女の存在が壊れていく。

「君を想うほど、君という世界が壊れていく」

この切ないジレンマの中で、主人公の想いが彼女に「たう（届く）」のかを描く、ひと夏の恋と奇跡の物語。

## 🎮 ゲーム仕様

- **ジャンル**: ビジュアルノベル
- **テーマ**: 恋愛・奇跡・記憶
- **舞台**: 広島県宇品（港町）
- **プラットフォーム**: Web → Desktop → Mobile
- **エンジン**: Pixi'VN (TypeScript/JavaScript)

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストール・実行

```bash
# リポジトリをクローン
git clone https://github.com/YunosukeYoshino/nanatau-novel.git
cd nanatau-novel

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 を開く
```

## 🛠️ 開発コマンド

### 基本開発
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run preview      # ビルド確認
```

### テスト・品質チェック
```bash
npm run test         # テスト実行（watch mode）
npm run test:run     # テスト実行（一回のみ）
npm run typecheck    # TypeScript型チェック
npm run lint         # Biomeリンター
npm run format       # フォーマット適用
npm run validate     # 全品質チェック実行
```

### プラットフォーム別ビルド
```bash
# Web版
npm run build:web

# Desktop版（Electron）
npm run build:electron
npm run electron:dev

# Mobile版（Capacitor）
npm run cap:sync
npm run mobile:ios
npm run mobile:android
```

## 📦 技術スタック

### メインライブラリ
- **@drincs/pixi-vn** - ビジュアルノベル専用エンジン
- **pixi.js** - 高性能2Dレンダリング
- **TypeScript** - 型安全な開発

### 開発ツール
- **Vite** - 高速ビルドツール
- **Biome** - 高速リンター・フォーマッター
- **Vitest** - テストフレームワーク
- **Husky** - Gitフック管理

### プラットフォーム対応
- **Electron** - デスクトップアプリ
- **Capacitor** - モバイルアプリ（iOS/Android）

## 🏗️ プロジェクト構成

```
/
├── src/                    # ソースコード
│   ├── core/              # コアシステム
│   │   ├── StoryEngine.ts     # ストーリー進行制御
│   │   ├── GameStateManager.ts # ゲーム状態管理
│   │   ├── ScenarioParser.ts   # シナリオ解析
│   │   └── ...
│   ├── ui/                # UIシステム
│   ├── types/             # TypeScript型定義
│   └── main.ts            # エントリーポイント
├── scenario/              # シナリオファイル
├── planning/              # 開発計画・タスク管理
├── electron/              # Electron設定
└── public/                # 静的ファイル
```

## 📋 開発ステータス

- **Phase 1-7**: ✅ 完了（基盤〜マルチプラットフォーム対応）
- **Phase 8**: 🔄 進行中（配布・リリース準備）
- **全体進捗**: 78% (8フェーズ中7.8フェーズ完了)

### 実装済み機能
- ✅ シナリオパーサー（.txtファイル対応）
- ✅ ストーリーエンジン・状態管理
- ✅ テキスト表示・選択肢システム
- ✅ セーブ・ロードシステム
- ✅ 音声・BGMシステム
- ✅ UI/UXシステム（メニュー、設定等）
- ✅ マルチプラットフォーム対応
- ✅ 包括的テストスイート（104テスト成功）

## 🔧 開発ルール

### 品質保証
- TypeScript厳密設定（`strict: true`）
- `any`型使用禁止
- 必須：`npm run validate`通過
- pre-commitフックによる自動チェック

### Git ワークフロー
- ブランチ必須（`feature/`, `fix/`, `docs/`等）
- 作業完了後は必ずコミット・プッシュ
- プルリクエスト作成必須

### セキュリティ
- ハードコード完全禁止
- 環境変数による設定管理
- 入力値検証・データ検証実装済み

## 📄 ライセンス

ISC License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 🔗 関連リンク

- [開発計画書](./planning/development-plan.md)
- [現在のタスク](./planning/current-tasks.md)
- [シナリオ詳細](./plan.md)
- [Claude Code開発ルール](./CLAUDE.md)

---

*「君を想うほど、君という世界が壊れていく」*  
*- ななたう - 硝子の心、たう（届く）まで -*