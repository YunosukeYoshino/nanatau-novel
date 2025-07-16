# ななたうノベルゲーム開発ルール

## 🎯 プロジェクト概要
- **プロジェクト名**: ななたう（硝子の心、たう（届く）まで）
- **エンジン**: Pixi'VN (TypeScript/JavaScript)
- **対象プラットフォーム**: Web → Desktop → Mobile

## 📋 作業前チェックリスト
1. `planning/current-tasks.md` でタスク確認
2. `planning/development-plan.md` で全体計画確認
3. `plan.md` でシナリオ・設定確認

## 🔧 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test
npm run test:run

# 品質チェック
npm run typecheck      # TypeScript型チェック
npm run lint           # Biomeリンター
npm run lint:fix       # リンター自動修正
npm run format         # フォーマット適用
npm run format:check   # フォーマット確認
npm run validate       # 全チェック実行（TypeScript + Lint + Format + Test）

# 統合コマンド
npm run check          # Biome統合チェック
npm run check:fix      # Biome統合修正
```

## 📁 ディレクトリ構造
```
/
├── planning/          # 開発計画・タスク管理
├── src/              # ソースコード
├── assets/           # ゲームアセット
├── public/           # 公開ファイル
└── docs/             # ドキュメント
```

## 🎮 ゲーム仕様
- **ジャンル**: ビジュアルノベル
- **テーマ**: 恋愛・奇跡・記憶
- **舞台**: 広島県宇品
- **キャラクター**: ななたう（ヒロイン）、主人公

## 🚀 開発フェーズ
1. **Phase 1**: 基盤構築・環境セットアップ
2. **Phase 2**: キャラクター・ストーリー設計
3. **Phase 3**: アセット準備
4. **Phase 4**: ゲーム機能実装
5. **Phase 5**: UI/UX実装
6. **Phase 6**: テスト・デバッグ
7. **Phase 7**: マルチプラットフォーム対応
8. **Phase 8**: 配布・リリース

## 🎨 アートディレクション
- **色調**: 温かみのある色彩、ステンドグラス風
- **雰囲気**: 切ない、美しい、幻想的
- **キーアイテム**: ステンドグラス、ガラス細工、菜の花

## 📝 作業ルール
1. **作業前**: 必ず計画ファイルを確認
2. **作業中**: TodoWriteでタスク管理
3. **作業後**: 進捗を計画ファイルに反映
4. **品質チェック**: 実装後は必ず `npm run validate` を実行
5. **コミット**: 作業完了後は必ずコミット・プッシュを実行
6. **テスト**: 機能実装後は必ずテスト実行

## 🔄 ワークフロー
1. 計画ファイル確認 → 2. 実装 → 3. 品質チェック → 4. コミット・プッシュ → 5. 進捗更新

## 📋 コミット・プッシュルール
### **🚨 重要**: 作業完了後は必ずコミット・プッシュを実行すること

```bash
# 1. 品質チェック（必須）
npm run validate

# 2. ステージング
git add .

# 3. コミット（自動でpre-commitフックが実行される）
git commit -m "適切なコミットメッセージ"

# 4. プッシュ
git push origin [ブランチ名]
```

### コミットメッセージ規則
- **feat**: 新機能追加
- **fix**: バグ修正
- **docs**: ドキュメント更新
- **style**: コードスタイル変更
- **refactor**: リファクタリング
- **test**: テスト追加・修正
- **chore**: 設定・ビルド関連

### 自動チェック機能
- **pre-commit**: TypeScript型チェック + Biomeリンター + フォーマット確認 + テスト実行
- **品質保証**: コミット前に自動で品質チェックが実行される

## 📱 プラットフォーム展開順序
1. **Web版** (最優先) - ブラウザ直接実行
2. **Desktop版** - Electron
3. **Mobile版** - Capacitor/Ionic

## 🛠️ 開発環境ツール
- **TypeScript**: 厳密型チェック設定
- **Biome**: 高速リンター・フォーマッター
- **Vitest**: テストフレームワーク
- **Husky**: pre-commitフック
- **Bun**: 高速ランタイム設定

---
*最終更新: 2025-07-16*