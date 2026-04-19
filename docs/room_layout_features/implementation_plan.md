# Room Layout Designer 機能追加の実装計画

ユーザーの要望に基づき、間取りの背景画像読み込み機能と、各家具オブジェクトへのメモ機能を追加します。

## 要求仕様
1. **背景画像の読み込み**: 間取り図などの画像を背景に表示し、それに合わせて作業できるようにする。
2. **家具のメモ機能**: 個別の家具オブジェクトにユーザーが自由記述できるメモ用パラメータを追加する。

## Proposed Changes

---

### [MODIFY] [room-layout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/room-layout.astro)

**UI要素の追加**:
- トップバー（または操作パネル）に「背景画像」を読み込むためのファイル選択ボタンを追加。
- 画面のキャンバスコンテナ内に、背景表示用の `img` タグ (`#bg-img-layer`) を配置。
- 「プロパティパネル」内にメモ入力欄用の `textarea` (`#prop-memo`) を追加。

---

### [MODIFY] [styles.css](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/styles.css)

**スタイルの追加**:
- `textarea` のデザイン（リサイズ可能、標準UIにマッチするデザイン）。
- `#bg-img-layer` は他の要素（壁や家具）の下に表示し、クリック判定を通さない (`pointer-events: none`) ように設定し、半透明 (`opacity: 0.4` など) で配置。

---

### [MODIFY] [script.js](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/script.js)

**ロジックの追加**:
- **背景画像機能**:
  - `STATE.config.backgroundImage` を追加。
  - 画像読み込みイベント (`FileReader`でData URLとして読み込み) を実装。
  - `render()` 関数内で、キャンバスのスケール・オフセットに合わせて背景画像要素も追従して拡大縮小・移動するように `transform` を適用。
- **メモ機能**:
  - `addObject` 時に `memo: ""` をデフォルトパラメータとして追加。
  - `updatePropertyPanel()` 内で選択オブジェクトの `memo` を textarea に反映。
  - `updateSelectedObject()` 内で textarea の変更をオブジェクトの `memo` パラメータに保存。
  
 JSON保存・読み込み（既存の `exportJSON`, `importJSON`）については、`STATE`全体をエクスポートしているため、追加パラメータは自動的に保存・復元されます。

## User Review Required

> [!NOTE]
> **背景画像の調整について**
> 今回のベース実装では、読み込んだ画像は間取り編集キャンバスに表示され、拡縮やスクロールには間取りと一体になって追従します。「画像上の線の大きさに合うように、間取りの頂点（壁）をドラッグして合わせる」という使い勝手になります。もし「画像の透明度を変えたい」など追加の要望があればおしらせください。

以上の実装計画で進めてよろしいでしょうか？
