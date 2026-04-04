# Room Layout Designer: 「使い方」機能の実装計画

ユーザーがアプリケーション内で直接操作方法を確認できるよう、Arcade Controller Layout Designer と同様の README モーダル機能を実装します。

## 提案される変更

### 1. [NEW] README.md の作成
`public/apps/web/room-layout/README.md` を作成し、ルームレイアウトデザイナーに特化した操作ガイドを記述します。

### 2. [MODIFY] room-layout.astro
- ヘッダー (`top-bar`) に「使い方」ボタンを追加します。
- `README.md` を表示するためのモーダル HTML 構造 (`modal-overlay`, `modal-content` 等) を追加します。

### 3. [MODIFY] styles.css
- モーダル表示に必要なスタイル（背景のオーバーレイ、コンテンツの配置、アニメーション、Markdown 表示用の装飾）を追加します。

### 4. [MODIFY] script.js
- モーダルの開閉制御ロジックを追加します。
- `README.md` を fetch し、簡易的な Markdown パーサー (`parseSimpleMarkdown`) を通してモーダル内に表示する機能を実装します。

## 具体的な作業内容

### public/apps/web/room-layout/README.md [NEW]
- 壁の作成（頂点移動、辺のタップで頂点追加）
- オブジェクトの配置と操作（ドラッグ、プロパティパネルでの編集、複製、削除）
- モバイル環境での特有の操作（2本指パン、ズームボタン）
- データの管理（クリア、JSON/CSV連携の予定など）

### src/pages/apps/web/room-layout.astro [MODIFY]
```html
<button id="btn-readme" class="btn btn-secondary" style="width: auto;">使い方</button>
...
<!-- README Manual Modal -->
<div id="modal-readme" class="modal-overlay" style="display: none;">
    ...
</div>
```

### public/apps/web/room-layout/styles.css [MODIFY]
- `arcade-layout` からモーダル関連のスタイルを移植し、ルームレイアウトのデザインに合わせます。

### public/apps/web/room-layout/script.js [MODIFY]
- `btn-readme` のクリックイベントで `README.md` を fetch して表示。
- `parseSimpleMarkdown` 関数の追加。

## 検証計画
- PC 版およびモバイル版で「使い方」ボタンが正しく表示されること。
- ボタンクリックでモーダルが表示され、README の内容がレンダリングされること。
- 閉じるボタンおよび背景クリックでモーダルが閉じられること。
