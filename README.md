# ななたう（硝子の心、たう（届く）まで）

🎮 **ビジュアルノベルゲーム** - 美しい物語と感動的な体験

## 🌐 ライブデモ

**▶️ [今すぐプレイ（Web版）](https://yunosukeyoshino.github.io/nanatau-novel/)**

ブラウザで直接プレイできます！インストール不要です。

## 📖 ゲーム概要

### 🎭 ストーリー
- **ジャンル**: 恋愛・奇跡・記憶
- **舞台**: 広島県宇品
- **テーマ**: 硝子の心、届く想い
- **特徴**: 複数エンディング、選択肢による分岐

### 🎨 アートディレクション
- **色調**: 温かみのある色彩、ステンドグラス風
- **雰囲気**: 切ない、美しい、幻想的
- **キーアイテム**: ステンドグラス、ガラス細工、菜の花

## 💻 プラットフォーム

### 🌐 Web版（推奨）
- **対応ブラウザ**: Chrome, Firefox, Safari, Edge
- **アクセス**: [yunosukeyoshino.github.io/nanatau-novel](https://yunosukeyoshino.github.io/nanatau-novel/)
- **特徴**: インストール不要、自動アップデート

### 🖥️ Desktop版
- **対応OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **配布**: [GitHub Releases](https://github.com/YunosukeYoshino/nanatau-novel/releases)
- **特徴**: オフライン実行、ネイティブ体験

### 📱 Mobile版（開発中）
- **対応OS**: iOS, Android
- **配布**: App Store / Google Play Store（予定）
- **特徴**: タッチ操作最適化

## 🚀 技術仕様

### エンジン・フレームワーク
- **ゲームエンジン**: [Pixi'VN](https://pixivn.io/) (TypeScript/JavaScript)
- **レンダリング**: PIXI.js 2Dレンダリング
- **言語**: TypeScript + Strict Mode
- **ビルドツール**: Vite

### アーキテクチャ
- **Web**: Vite + TypeScript
- **Desktop**: Electron
- **Mobile**: Capacitor/Ionic
- **品質管理**: Biome (ESLint + Prettier)
- **テスト**: Vitest (104 テストケース)

### CI/CD
- **自動化**: GitHub Actions
- **デプロイ**: GitHub Pages
- **品質チェック**: TypeScript, Biome, Test
- **リリース**: Multi-platform自動ビルド

## 🎮 ゲーム機能

### ✨ 基本機能
- 📖 リッチテキスト表示・タイプライター効果
- 🎭 キャラクター立ち絵・表情変化
- 🖼️ 背景表示・トランジション効果
- 🎵 BGM・効果音・ボイス
- 💾 セーブ・ロード機能（20スロット）
- 🔀 選択肢システム・分岐ルート

### 🎛️ UI/UX
- 🏠 メインメニュー・タイトル画面
- ⚙️ 設定画面（音量、表示設定）
- 📊 ゲーム進行状況表示
- 📝 履歴・テキストログ
- 🎨 レスポンシブ対応

## 📥 ダウンロード・プレイ方法

### 🌐 Web版（推奨）
1. [ライブデモ](https://yunosukeyoshino.github.io/nanatau-novel/)にアクセス
2. ブラウザで直接プレイ開始

### 🖥️ Desktop版
1. [Releases](https://github.com/YunosukeYoshino/nanatau-novel/releases)から最新版をダウンロード
2. OS対応ファイルを選択（Windows, macOS, Linux）
3. インストール・実行

## 🛠️ 開発環境セットアップ

### 前提条件
- Node.js 18.x または 20.x
- npm または bun

### セットアップ
```bash
# リポジトリクローン
git clone https://github.com/YunosukeYoshino/nanatau-novel.git
cd nanatau-novel

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザでアクセス
open http://localhost:5173
```

### 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド（Web版）
npm run build:web

# ビルド（Desktop版）
npm run build:electron

# テスト実行
npm run test

# 品質チェック
npm run validate

# プレビュー
npm run preview
```

## 📋 開発フェーズ

### ✅ 完了フェーズ
- [x] **Phase 1**: 基盤構築・環境セットアップ
- [x] **Phase 2**: キャラクター・ストーリー設計
- [x] **Phase 3**: アセット準備
- [x] **Phase 4**: ゲーム機能実装
- [x] **Phase 5**: UI/UX実装
- [x] **Phase 6**: テスト・デバッグ
- [x] **Phase 7**: マルチプラットフォーム対応

### 🔄 現在フェーズ
- [x] **Phase 8.1**: CI/CD環境構築 ✅
- [ ] **Phase 8.2**: Web版デプロイ環境準備
- [ ] **Phase 8.3**: Desktop版パッケージ化
- [ ] **Phase 8.4**: Mobile版ストア申請準備

## 🤝 貢献・フィードバック

### バグ報告・機能要望
- [Issues](https://github.com/YunosukeYoshino/nanatau-novel/issues)
- [Pull Requests](https://github.com/YunosukeYoshino/nanatau-novel/pulls)

### ライセンス
ISC License

## 📊 プロジェクト統計

![GitHub release (latest by date)](https://img.shields.io/github/v/release/YunosukeYoshino/nanatau-novel)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/YunosukeYoshino/nanatau-novel/ci.yml)
![GitHub deployments](https://img.shields.io/github/deployments/YunosukeYoshino/nanatau-novel/github-pages)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/YunosukeYoshino/nanatau-novel)

---

💝 **「硝子の心、たう（届く）まで」** - 美しい物語をお楽しみください

🤖 *Powered by [Claude Code](https://claude.ai/code)*