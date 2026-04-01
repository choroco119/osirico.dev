# プリセットデータのJSON化と動的読み込みの実装計画

ハードコードされていたパーツ定義とレイアウトプリセットを外部JSONファイルから読み込むように変更し、ユーザーがJSONファイルを編集することで項目を追加できるようにします。

## ユーザーレビューが必要な項目
> [!IMPORTANT]
> **ローカルでの実行制限**: 
> ブラウザはセキュリティ上の理由で、`file://`（ファイルを直接ダブルクリック）で開いた場合に外部ファイルの読み込み (`fetch`) を制限することがあります。
> そのため、ファイルが読み込めなかった場合のフォールバック（以前のデフォルトデータ）を実装しますが、新しいJSONの内容を反映させるには簡易サーバー（VSCodeのLive Server等）経由での起動を推奨します。

## 提案される変更点

### 1. JSONファイルの作成 [NEW]
* **[parts.json](file:///C:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/parts.json)**: レバーとボタンの定義（作成済み）
* **[layouts.json](file:///C:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/layouts.json)**: 配置プリセット（作成済み）

### 2. HTMLの修正 [MODIFY] [index.html](file:///C:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/index.html)
* サイドバー内のハードコードされたパーツボタンとプリセットボタンを削除。
* 動的生成のためのコンテナ ID (`levers-grid`, `buttons-grid`, `layouts-list`) を追加。

### 3. スクリプトの刷新 [MODIFY] [script.js](file:///C:/Users/kohei/.gemini/antigravity/scratch/akecon-layout-tool/script.js)
* **データの非同期取得**: `fetch()` を用いた `loadPresets()` 関数の追加。
* **UI生成ロジック**: 取得したJSONデータに基づいてサイドバーのHTMLを構築する `generateSidebarUI()` の実装。
* **イベントリスナーの再設定**: 動的に生成されたボタンに対してもイベントが正しく割り当てられるように修正。

## オープンな質問
> [!NOTE]
> JSONファイルが読み込めなかった場合（`file://`起動時など）、これまでと同様の標準的なパーツ・レイアウトを自動で表示する仕組みにしてよろしいでしょうか？（これにより、サーバーを立てていない環境でも最低限動作するようにします）

## 検証プラン
1. 簡易サーバー等で `index.html` を開き、JSONファイルの内容がボタンとして反映されているか確認。
2. `parts.json` に新しいボタン定義を追加し、リロード後に反映されているか確認。
3. レイアウトプリセットをクリックし、JSONに記述された座標通りにパーツが配置されるか確認。
