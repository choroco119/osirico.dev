# LIVE ページ 500 エラー調査・修正計画

現在、`https://osirico.dev/live` で発生している 500 Internal Server Error の原因を特定し、修正します。

## ユーザーによる確認が必要な事項

> [!IMPORTANT]
> **Cloudflare Pages の設定確認**:
> Cloudflare ダッシュボードの [Settings] > [Functions] > [Compatibility flags] にて、`nodejs_compat` が有効になっているか確認が必要になる場合があります。

## 提案される変更点

### 1. 診断用 SSR ページの追加

#### [NEW] [test-ssr.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/test-ssr.astro)
- 最小限の SSR ページを作成し、Cloudflare アダプターが正常に動作しているかを確認します。

### 2. LIVE ページの防御的実装

#### [MODIFY] [live.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro)
- フロントマター全体を `try-catch` で囲み、エラーが発生しても 500 エラーにならずに画面上にエラー内容を表示するようにします。
- `Astro.locals.runtime` のアクセスをより安全にします。

## オープンな質問

- **Cloudflare の「Functions」ログを確認できますか？**
  - Cloudflare 管理画面の [Workers & Pages] -> [osirico-dev] -> [Deployments] -> [最新のデプロイ] -> [Functions] タブにて、リアルタイムのエラーログを確認できる場合があります。もし可能であれば、エラー内容（スタックトレース）を教えていただけると解決が早まります。

## 検証プラン

### 実機検証
1. `test-ssr.astro` を push し、`https://osirico.dev/test-ssr` が表示されるか確認。
2. 修正後の `live.astro` を push し、エラーメッセージが表示されるか確認。
