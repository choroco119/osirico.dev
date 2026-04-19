# Room Layout Designer 機能追加タスクリスト

- `[x]` 1. `room-layout.astro` の UI 更新
    - `[x]` 背景画像読込ボタンの追加
    - `[x]` 背景画像用タグの追加 (`#bg-img-layer`)
    - `[x]` プロパティパネルへメモ入力欄 (`textarea`) の追加
- `[x]` 2. `styles.css` の更新
    - `[x]` メモ欄のデザイン
    - `[x]` `#bg-img-layer` のスタイル（最背面、透過、ポインターイベント無効化）
- `[x]` 3. `script.js` のロジック更新
    - `[x]` 状態 (`STATE`) への背景画像データとメモ項目の追加対応
    - `[x]` 画像ファイル読込ロジックの実装 (`FileReader`)
    - `[x]` `render()` 内での画像要素の `transform` 追従処理
    - `[x]` `updatePropertyPanel()` および `updateSelectedObject()` でのメモデータ反映
- `[/]` 4. 作業内容の `docs` ディレクトリ保存
