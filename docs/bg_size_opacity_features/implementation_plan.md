# 背景画像のサイズ・透過度変更機能の実装計画

ユーザーの要望に基づき、背景画像の表示サイズ変更と透過度変更機能を実装します。

## 要求仕様
1. **背景画像のサイズ変更**: 読み込んだ背景画像のスケール（縮尺）をユーザーが調整できるようにする。
2. **背景画像の透過度変更**: 背景画像の透明度（Opacity）をユーザーが調整できるようにする。

## Proposed Changes

---

### [MODIFY] [room-layout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/room-layout.astro)

**UI要素の追加**:
- 左側のサイドバー (`#sidebar-parts`) 内に、背景画像設定用の新セクション (`#panel-bg-settings`) を追加します。
- このセクションには以下のコントロールを配置します：
  - **サイズ (%)**: 数値入力 (`<input type="number">`)
  - **透過度**: スライダー (`<input type="range">`)
- ※このコントロールパネルは、背景画像が設定されている時のみ表示されるようにします。

---

### [MODIFY] [script.js](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/script.js)

**ロジックの追加**:
- **状態 (`STATE.config`)**: 
  - `bgImageScale` (デフォルト `1.0`), `bgImageOpacity` (デフォルト `0.4`) のパラメータを追加します。
- **イベントリスナー**:
  - 追加した「サイズ」と「透過度」への入力イベント (`oninput`) をリッスンし、`STATE.config` の値を更新して `render()` を呼び出す処理を実装します。
- **UI更新 (`importBgImage`, `render`)**:
  - `importBgImage` 時にパネルを表示・初期化します。
  - `render()` 関数内で、`els.bgImgLayer` の `opacity` と `transform` (`scale * bgImageScale`) を動的に適用します。

## User Review Required

> [!NOTE]
> **操作パネルの配置について**
> 背景画像の設定パネルは、画面左側の「パーツ（家具を追加などがある場所）」のサイドバーの下部に追加する予定です。背景画像を読み込んだ時だけ表示されるような仕様を想定しています。
> 
> **画像の位置移動について**
> 今回のリクエストには「移動」は含まれておりませんが、間取りの頂点レイヤー全体をドラッグして画像の位置に合わせる想定でよろしいでしょうか？（もし画像のＸ軸・Ｙ軸移動オフセット機能も必要であれば、追加実装いたします）

以上の実装計画で進めてよろしいでしょうか？
