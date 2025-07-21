# Phase 10: コード品質向上・リファクタリング計画

## 🎯 概要

Phase 9完了後の技術債務解消とコード品質向上のためのリファクタリング計画です。現在のBiomeリンターエラー（63件の警告）とTypeScript型安全性の向上を目指します。

## 📋 リファクタリングタスク

### Task 10.1: TypeScript型安全性リファクタリング (優先度: 高)
**期間**: 2-3日  
**目標**: any型の完全排除と厳格な型安全性の確保

#### 対象ファイル
- `src/core/AdvancedAssetManager.ts` - 8箇所のany使用
- `src/core/AssetMappingStrategy.ts` - 4箇所のany使用  
- `src/core/AssetGenerationGuide.ts` - 4箇所のany使用

#### 修正内容
1. **型定義インターフェース作成**
   ```typescript
   interface AssetDefinition {
     id: string;
     path: string;
     type: 'background' | 'character' | 'audio' | 'ui';
     metadata?: Record<string, unknown>;
   }
   
   interface PromptInfo {
     promptFile: string;
     category: string;
     priority: number;
     dependencies?: string[];
   }
   
   interface AssetRegistryEntry {
     asset: HTMLImageElement | HTMLAudioElement;
     metadata: AssetDefinition;
     loadedAt: number;
   }
   ```

2. **Generic型の適切な使用**
   ```typescript
   class AdvancedAssetManager {
     private static assetRegistry = new Map<string, AssetRegistryEntry>();
     private static loadingPromises = new Map<string, Promise<AssetRegistryEntry>>();
     
     static async loadAsset<T extends AssetDefinition>(assetId: string): Promise<T | null> {
       // 型安全な実装
     }
   }
   ```

3. **Union型による厳密な型制御**
   ```typescript
   type AssetType = 'background' | 'character' | 'audio' | 'ui';
   type ExpressionType = 'normal' | 'smile' | 'sad' | 'confused' | 'surprised' | 'cracked' | 'translucent';
   ```

### Task 10.2: アーキテクチャリファクタリング (優先度: 中)
**期間**: 3-4日  
**目標**: 静的クラスの関数化と責務分離

#### 対象システム
1. **AdvancedAssetManager** → **AssetManager + AssetLoader + AssetCache**
2. **AssetMappingStrategy** → **AssetMapper + DirectiveParser**  
3. **AssetGenerationGuide** → **GenerationGuide + ReportGenerator**

#### 新しいアーキテクチャ設計
```typescript
// 依存性注入可能な設計
interface IAssetLoader {
  loadAsset(id: string): Promise<AssetRegistryEntry>;
}

interface IAssetCache {
  get(id: string): AssetRegistryEntry | null;
  set(id: string, entry: AssetRegistryEntry): void;
  clear(): void;
}

interface IAssetMapper {
  mapDirectiveToAssetId(directive: string): string | null;
  mapCharacterExpression(character: string, expression: string): string | null;
}

class AssetManager {
  constructor(
    private loader: IAssetLoader,
    private cache: IAssetCache,
    private mapper: IAssetMapper
  ) {}
  
  async loadByDirective(directive: string): Promise<AssetRegistryEntry | null> {
    const assetId = this.mapper.mapDirectiveToAssetId(directive);
    if (!assetId) return null;
    
    const cached = this.cache.get(assetId);
    if (cached) return cached;
    
    const loaded = await this.loader.loadAsset(assetId);
    this.cache.set(assetId, loaded);
    return loaded;
  }
}
```

#### Factory Pattern導入
```typescript
class AssetSystemFactory {
  static create(): AssetManager {
    const loader = new DefaultAssetLoader();
    const cache = new MemoryAssetCache();
    const mapper = new ScenarioAssetMapper();
    
    return new AssetManager(loader, cache, mapper);
  }
}
```

### Task 10.3: Biomeリンター対応 (優先度: 中)
**期間**: 1-2日  
**目標**: 全警告の解消とコード品質向上

#### 主要修正項目
1. **Node.js Import Protocol**
   ```typescript
   // 修正前
   const fs = await import("fs");
   const path = await import("path");
   
   // 修正後  
   const fs = await import("node:fs");
   const path = await import("node:path");
   ```

2. **Unused Variables**
   ```typescript
   // 修正前
   } catch (error) {
     return false;
   }
   
   // 修正後
   } catch (_error) {
     return false;
   }
   ```

3. **Static-Only Classes**
   - 名前空間または関数群への変換
   - インスタンス化可能な設計への変更
   - Factory Patternの導入

## 🔧 実装ステップ

### Step 1: 型定義の整備 (1日目)
1. `src/types/assets.ts` 作成 - 全アセット関連型定義
2. `src/types/mapping.ts` 作成 - マッピング関連型定義
3. `src/types/generation.ts` 作成 - 生成関連型定義

### Step 2: AdvancedAssetManager リファクタリング (2-3日目)
1. 型定義適用とany削除
2. クラス分割 (AssetLoader, AssetCache, AssetManager)
3. インターフェース定義と依存性注入

### Step 3: AssetMappingStrategy リファクタリング (4日目)  
1. 関数ベースへの変換
2. 型安全なマッピングロジック
3. テスタブルな設計への変更

### Step 4: AssetGenerationGuide リファクタリング (5日目)
1. レポート生成機能の分離
2. ファイル出力機能の抽象化
3. 設定駆動型への変更

### Step 5: 統合テストと品質確認 (6日目)
1. 全リファクタリング箇所のテスト
2. Biomeリンターエラー0達成
3. TypeScript strict mode有効化確認

## 📊 成果指標

### 品質メトリクス
- **Biome警告数**: 63 → 0
- **TypeScript any使用**: 16箇所 → 0
- **静的クラス数**: 3 → 0
- **Cyclomatic Complexity**: 改善
- **コードカバレッジ**: 向上

### パフォーマンス指標
- **アセット読み込み速度**: 維持または向上
- **メモリ使用量**: 最適化
- **バンドルサイズ**: 削減

### 保守性指標
- **依存関係の明確化**: ✅
- **テスタビリティ**: 大幅向上  
- **拡張性**: 向上
- **可読性**: 向上

## 🚨 リスク管理

### 技術リスク
1. **破壊的変更**: 段階的リファクタリングで最小化
2. **パフォーマンス低下**: ベンチマーク測定で監視
3. **機能回帰**: 既存テスト維持 + 新規テスト追加

### スケジュールリスク
1. **作業量過大**: タスクの優先度管理で対応
2. **依存関係**: 並行作業可能な部分の特定
3. **品質確保**: 段階的レビューとテスト

## 📝 次期フェーズ連携

### Phase 11準備
- リファクタリング済みアーキテクチャでの新機能開発
- パフォーマンス最適化の継続
- 本格的なテストスイート構築

### 技術債務管理
- 継続的なコード品質監視体制
- 自動化されたリファクタリング検知
- 開発速度向上の実現

---

**実施判断**: Phase 9完了後、Phase 10リファクタリングを実施してからPhase 11の新機能開発に進む。コード品質の向上により、将来の開発速度向上と保守性確保を実現する。