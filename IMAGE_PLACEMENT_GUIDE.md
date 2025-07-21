# 画像ファイル配置ガイド

## 📁 ディレクトリ構造

```
public/assets/
├── backgrounds/        # 背景画像
├── characters/         # キャラクター立ち絵
├── audio/             # BGM・効果音
└── ui/                # UI要素
```

## 🖼️ 背景画像ファイル (public/assets/backgrounds/)

### 宇品地区の背景
- `ujina_hill_road.jpg` - 宇品の坂道（住宅街の坂、瀬戸内海を見下ろす）
- `ujina_station.jpg` - 宇品駅（広島電鉄宇品線の終点駅）
- `hiroshima_port.jpg` - 広島港（船や海鳥が見える港の風景）
- `ujina_coast.jpg` - 宇品海岸（瀬戸内海に面した海岸線）
- `residential_area.jpg` - 住宅街（一般的な住宅地）
- `shopping_street.jpg` - 商店街（地元の商店街）

### 教会関連
- `church_exterior.jpg` - 教会外観（古い石造りの教会）
- `church_interior.jpg` - 教会内部（ステンドグラスのある内装）

### ステンドグラス関連
- `stained_glass_window.jpg` - ステンドグラス窓（美しいステンドグラス窓のクローズアップ）
- `stained_glass_world.jpg` - ステンドグラス世界（ステンドグラスの中の幻想的な菜の花畑）

### 自然風景
- `sunset_hill.jpg` - 夕焼けの丘（夕暮れ時の宇品の丘、金色に染まる風景）
- `canola_field.jpg` - 菜の花畑（一面の菜の花畑、春の風景）

### 学校関連
- `school_exterior.jpg` - 学校外観
- `school_classroom.jpg` - 教室
- `school_rooftop.jpg` - 学校屋上

**推奨仕様**: 1280x720px, JPG形式, 高解像度

## 👥 キャラクター画像ファイル (public/assets/characters/)

### ななたう
- `nanatau_normal.png` - 通常表情（基本立ち絵、白いワンピース）
- `nanatau_smile.png` - 微笑み表情
- `nanatau_sad.png` - 悲しい表情
- `nanatau_confused.png` - 困惑表情
- `nanatau_surprised.png` - 驚き表情
- `nanatau_cracked.png` - ヒビ割れ状態（体にヒビが入った特殊状態）
- `nanatau_translucent.png` - 透明化状態（半透明の特殊状態）

### 主人公
- `protagonist_normal.png` - 主人公通常立ち絵
- `protagonist_silhouette.png` - 主人公シルエット

**推奨仕様**: 512x768px以上, PNG形式（透明背景必須）

## 🎵 音声ファイル (public/assets/audio/)

### BGM
- `main_theme.mp3` - メインテーマ（タイトル画面・ゲーム中）
- `church_theme.mp3` - 教会テーマ（教会シーン用）

### 効果音
- `wind.wav` - 風の音
- `footsteps.wav` - 足音
- `glass_touch.wav` - ガラスに触れる音
- `se_hover.wav` - ホバー音効果（UI用）
- `se_select.wav` - 選択音効果（UI用）

## 🎨 UI要素 (public/assets/ui/)

- `dialogue_background.png` - ダイアログ背景
- `button_normal.png` - ボタン通常状態
- `button_hover.png` - ボタンホバー状態

## 📝 シナリオディレクティブとの対応

ゲーム中で以下のようにシナリオに記述すると、自動的に対応する画像が表示されます：

```
【背景：宇品の坂道】
【立ち絵：ななたう:微笑み:center】

ななたう「こんにちは！今日はいい天気ですね。」

【立ち絵：ななたう:悲しい:center】
ななたう「でも、少し寂しい気持ちもあります…」
```

## 🔄 プレースホルダーシステム

画像ファイルが存在しない場合、システムが自動的にSVGプレースホルダーを表示します。実際の画像を追加するまで、ゲームは正常に動作し続けます。

## 🎯 AI画像生成用プロンプト

詳細な生成プロンプトは以下に格納されています：
- `image-asset-management/generation-prompts/background-prompts/ujina_prompts.md`
- `image-asset-management/generation-prompts/character-prompts/nanatau_prompts.md`

これらのプロンプトを使用してAI画像生成ツール（Stable Diffusion、NovelAI等）で画像を作成し、上記の指定場所に配置してください。

## 🔧 システム統合詳細

### AssetMappingStrategy連携

システムは `src/core/AssetMappingStrategy.ts` で以下のマッピングを使用：

#### 背景マッピング
```typescript
"宇品の坂道" → "ujina_hill_road"
"教会" → "church_exterior"  
"ステンドグラス" → "stained_glass_window"
"夕焼けの丘" → "sunset_hill"
"菜の花畑" → "canola_field"
// 他10件の背景マッピング
```

#### キャラクターマッピング
```typescript
"ななたう:通常" → "nanatau_normal"
"ななたう:微笑み" → "nanatau_smile"
"ななたう:悲しい" → "nanatau_sad"
"ななたう:困惑" → "nanatau_confused"
"ななたう:驚き" → "nanatau_surprised"
```

### 自動読み込み機能

- シナリオの `【背景：xxx】` ディレクティブを検出すると自動的に対応背景を設定
- `【立ち絵：xxx】` ディレクティブでキャラクター表示を制御
- 画像が見つからない場合は美しいSVGプレースホルダーを表示

## 🚀 追加・更新手順

1. 指定されたディレクトリに画像ファイルを配置
2. ファイル名が上記マッピングと完全一致していることを確認
3. ゲームを再起動（開発サーバーの場合はホットリロード）
4. シナリオでディレクティブを使用して確認

## ⚠️ 注意事項

- **ファイル名は完全一致必須**：大文字小文字、アンダースコア等も正確に
- **推奨解像度を遵守**：背景は1280x720px、キャラクターは512x768px以上
- **透明背景**：キャラクター画像はPNG形式で透明背景必須
- **ファイルサイズ**：Web配布を考慮し、適度に圧縮（背景500KB未満、キャラクター300KB未満推奨）

このガイドに従って画像を配置することで、ゲーム内で適切に表示され、プレースホルダーシステムが実際の画像に自動的に切り替わります。