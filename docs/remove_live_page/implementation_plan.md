# ライブ配信ページの削除

「live streaming」のページが不要になったため、該当するページ、ナビゲーション、および関連するユーティリティを削除・整理します。

## ユーザーレビューが必要な事項

特になし。

## 変更内容

### [Portal] 

#### [DELETE] [live.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro)
- ライブ配信ページ本体を削除します。

#### [MODIFY] [index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/index.astro)
- `apps` 配列から `LIVE STREAMING` の項目を削除します。

#### [MODIFY] [BaseLayout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/layouts/BaseLayout.astro)
- `getLiveStatus` のインポートおよび呼び出しを削除します。
- ヘッダーのナビゲーションから `LIVE` リンクを削除します。
- ライブ配信状態を示すインジケーターやアニメーションに関連する CSS を削除します。
- YouTube チャンネルへのリンク（ソーシャルリンク）は維持するため、`CHANNEL_ID` の定義は残します。
- ライブ状況確認のために設定されていた `Cache-Control` ヘッダーの設定を削除します。

### [Library]

#### [DELETE] [youtube.ts](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/lib/youtube.ts)
- 配信ステータス取得用のユーティリティを削除します。

## 検証プラン

### 手動確認
- ブラウザでトップページ（/）にアクセスし、「LIVE STREAMING」のカードが表示されていないことを確認します。
- ヘッダーから「LIVE」のリンクが消えていることを確認します。
- 直接 `/live` にアクセスした際に 404 になることを確認します。
- YouTube のソーシャルリンクが引き続き正しく機能することを確認します。
