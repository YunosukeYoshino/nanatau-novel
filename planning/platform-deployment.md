# マルチプラットフォーム展開計画

## 対象プラットフォーム

### 1. Web版 (Primary)
- **技術**: 直接ブラウザ実行
- **配布**: GitHub Pages / Netlify / Vercel
- **メリット**: 簡単アクセス、アップデート容易
- **開発優先度**: 最高

### 2. Desktop版
- **技術**: Electron
- **対象OS**: Windows, macOS, Linux
- **配布**: GitHub Releases / Steam / itch.io
- **メリット**: オフライン実行、ネイティブ感
- **開発優先度**: 高

### 3. Mobile版
- **技術**: Capacitor/Ionic
- **対象OS**: iOS, Android
- **配布**: App Store / Google Play Store
- **メリット**: モバイル最適化、タッチ操作
- **開発優先度**: 中

## 開発・ビルド戦略

### Phase 1: Web版開発
1. Pixi'VNでの基本ゲーム開発
2. レスポンシブデザイン対応
3. Web最適化
4. ブラウザテスト

### Phase 2: Desktop版対応
1. Electronセットアップ
2. デスクトップ向けUI調整
3. パッケージ化設定
4. 各OS別テスト

### Phase 3: Mobile版対応
1. Capacitor/Ionicセットアップ
2. モバイル向けUI調整
3. タッチ操作対応
4. 各デバイステスト

## 必要な追加設定

### Electron (Desktop)
```bash
npm install --save-dev electron
npm install --save-dev electron-builder
```

### Capacitor (Mobile)
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npx cap init
```

## 配布計画

### Web版配布
- **GitHub Pages**: 無料、簡単
- **Netlify**: 高機能、CDN
- **Vercel**: 高速、Next.js最適化

### Desktop版配布
- **GitHub Releases**: 無料、オープンソース
- **Steam**: 有料、大規模ユーザー
- **itch.io**: インディー向け

### Mobile版配布
- **App Store**: iOS向け、審査あり
- **Google Play**: Android向け、審査あり
- **サイドローディング**: 直接配布

## 開発ワークフロー

1. **Web版で基本機能開発**
2. **Desktop版でパッケージ化**
3. **Mobile版でタッチ対応**
4. **各プラットフォームで最適化**
5. **統合テストと品質保証**

---
*最終更新: 2025-07-15*