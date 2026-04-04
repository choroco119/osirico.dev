# クリアボタン機能の復旧計画

`RoomLayoutDesigner` において、ヘッダーの「クリア」ボタンがクリックに反応しない問題を修正します。

## 調査結果

- `src/pages/apps/web/room-layout.astro` には `id="btn-clear"` のボタンが存在します。
- `public/apps/web/room-layout/script.js` には初期化処理を行う `resetAll()` 関数が存在します。
- しかし、`script.js` の `setupEventListeners()` 内で、このボタンに `resetAll()` を割り当てる処理が漏れていました。

## 修正内容

### Room Layout Designer Logic

#### [MODIFY] [script.js](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/script.js)

- `setupEventListeners` 関数内に `document.getElementById('btn-clear').onclick = resetAll;` を追加します。
- 誤って設定されている `btn-import-json` の `onchange` イベント（ボタンに対して設定されているもの）を削除します。

## 検証計画

### 手動確認
- ブラウザでページを開き、家具をいくつか追加する。
- 「クリア」ボタンをクリックし、確認ダイアログが表示されることを確認。
- 「OK」をクリックし、キャンバス上の家具がすべて削除され、間取りとズームが初期状態に戻ることを確認。
