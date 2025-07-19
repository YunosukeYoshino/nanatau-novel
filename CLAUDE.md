# ななたうノベルゲーム開発ルール

## 🎯 プロジェクト概要
- **プロジェクト名**: ななたう（硝子の心、たう（届く）まで）
- **エンジン**: Pixi'VN (TypeScript/JavaScript)
- **対象プラットフォーム**: Web → Desktop → Mobile

## 📋 作業前チェックリスト
1. `planning/current-tasks.md` でタスク確認
2. `planning/development-plan.md` で全体計画確認
3. `plan.md` でシナリオ・設定確認

## 📊 タスク管理ルール
### **🚨 重要**: フェーズ完了時は必ずタスクファイルを更新すること

1. **作業完了後のタスク更新**:
   - 完了したタスクを「✅ 完了 (Completed)」セクションに移動
   - 進行中タスクを次のフェーズに更新
   - 進捗状況パーセンテージを更新

2. **タスクファイル更新手順**:
   ```bash
   # planning/current-tasks.md を編集
   # - 完了タスクの詳細実装内容を記録
   # - 次フェーズのタスクを進行中に移動
   # - 進捗状況と最終更新日を更新
   ```

3. **更新タイミング**:
   - フェーズ完了時（必須）
   - 大きなマイルストーン達成時
   - 週次レビュー時

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

## 🚫 型安全性ルール
### **重要**: TypeScript型安全性の徹底
- **`any`型の使用禁止**: `any`型を使用して型チェックを回避することは絶対禁止
- **`unknown`型の濫用禁止**: `unknown`型を使用して型を無理やり通すことは禁止
- **適切な型定義**: 必ず具体的で適切な型を定義すること
- **型アサーション制限**: `as`キーワードによる型アサーションは最小限に留める
- **ユニオン型活用**: 複数の型が想定される場合はユニオン型（`Type1 | Type2`）を使用
- **ジェネリック活用**: 汎用的な型が必要な場合はジェネリック（`<T>`）を使用

### 推奨パターン
```typescript
// ❌ 禁止: any型の使用
function processData(data: any): any { }

// ❌ 禁止: unknown型の濫用
function processData(data: unknown): unknown { }

// ✅ 推奨: 具体的な型定義
interface UserData {
  id: string;
  name: string;
  age?: number;
}
function processData(data: UserData): ProcessedData { }

// ✅ 推奨: ユニオン型
function processData(data: string | number | UserData): ProcessedData { }

// ✅ 推奨: ジェネリック
function processData<T extends BaseData>(data: T): ProcessedData<T> { }
```

### 例外的な使用ケース
以下の場合のみ、十分な理由とコメントを付けて使用可能：
- 外部ライブラリとの互換性維持（明確なコメント必須）
- 段階的な型安全性導入の一時的措置（TODO コメント必須）
- JSONパース等の型が動的に決まる場合（適切な型ガードと組み合わせ）

## 🌿 Gitワークフロールール
### **🚨 重要**: 作業開始前は必ずブランチを作成すること

```bash
# 新しい作業を開始する場合
git checkout -b [種別]/[作業内容を表す名前]

# 既存のブランチで作業を継続する場合
git checkout [既存のブランチ名]
```

### ブランチ命名規則
- **feature/**: 新機能追加（例: `feature/add-story-engine`）
- **fix/**: バグ修正（例: `fix/story-engine-memory-leak`）
- **docs/**: ドキュメント更新（例: `docs/update-api-docs`）
- **refactor/**: リファクタリング（例: `refactor/story-engine-types`）
- **test/**: テスト追加・修正（例: `test/story-engine-unit-tests`）
- **chore/**: 設定・ビルド関連（例: `chore/update-dependencies`）

### ブランチ作成のタイミング
1. **新しい作業を開始する時**: 必ず新しいブランチを作成
2. **既存のブランチがある場合**: そのブランチをチェックアウトして継続
3. **mainブランチでの直接作業禁止**: mainブランチでは直接作業せず、必ず命名規則に沿った作業ブランチを使用

### プッシュ前必須チェック
**🚨 重要**: プッシュ前に必ず以下を実行し、全て通過させること

```bash
# 1. 全品質チェックを実行
npm run validate

# 2. 全チェックが通過したことを確認してからプッシュ
git push origin [ブランチ名]
```

**プッシュ禁止条件**:
- TypeScript型チェックエラーがある場合
- Biomeリンターエラーがある場合  
- フォーマットエラーがある場合
- テストが失敗している場合

## 🔄 ワークフロー
1. 計画ファイル確認 → 2. **新ブランチ作成・チェックアウト** → 3. 実装 → 4. 品質チェック → 5. コミット・プッシュ → 6. プルリクエスト作成 → 7. レビューコメント確認・対応 → 8. 進捗更新

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

## 📋 プルリクエストルール
### **🚨 重要**: プッシュ後は必ずプルリクエストを作成すること

```bash
# 1. プッシュ後、プルリクエストを作成
gh pr create --title "適切なタイトル" --body "$(cat <<'EOF'
## Summary
- 作業内容の概要を記述

## Changes
- 変更点を箇条書きで記述
- 実装した機能やバグ修正の詳細

## Test plan
- [ ] テストが全て通過することを確認
- [ ] ビルドが成功することを確認
- [ ] 機能が正常に動作することを確認

## Notes
- その他の注意事項があれば記述

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"

# 2. もしくは、GitHubのWebUI経由でプルリクエストを作成
# URL: https://github.com/[owner]/[repo]/pull/new/[branch-name]
```

### プルリクエストタイトル規則
- **feat**: 新機能追加
- **fix**: バグ修正
- **docs**: ドキュメント更新
- **style**: コードスタイル変更
- **refactor**: リファクタリング
- **test**: テスト追加・修正
- **chore**: 設定・ビルド関連

### プルリクエスト要件
- **Summary**: 変更内容の概要
- **Changes**: 変更点の詳細
- **Test plan**: テスト計画とチェックリスト
- **Notes**: その他の注意事項

### レビュー・マージプロセス
1. **プルリクエスト作成**
2. **自動チェック**: CI/CDパイプラインでの品質チェック
3. **レビューコメント確認**: 
   - プルリクエストのコメント欄を確認
   - レビュアーからのフィードバックを確認
   - 必要に応じてコメントへの返信や修正を実施
4. **レビュー**: コードレビュー（必要に応じて）
5. **マージ**: mainブランチへのマージ

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