# Cloudflare Pages へのデプロイ準備（SSR対応）

Cloudflare Pages でサイトをリアルタイムに更新（SSR）し、環境変数を適切に扱うための設定を追加します。

## ユーザーによる確認が必要な事項

> [!IMPORTANT]
> **Cloudflare ダッシュボードでの環境変数設定**:
> `YOUTUBE_API_KEY` などの秘密情報を Cloudflare の管理画面から設定する必要があります。

## 提案される変更点

### [Component] [Astro 構成]

#### [MODIFY] [package.json](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/package.json)
- `@astrojs/cloudflare` パッケージを追加し、SSR (Server Side Rendering) を有効にする準備をします。

#### [MODIFY] [astro.config.mjs](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/astro.config.mjs)
- `output: 'server'` を設定して SSR モードを有効にします。
- アダプターに `cloudflare()` を指定します。

---

### [Component] [LIVE ページ最適化]

#### [MODIFY] [live.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro)
- 環境変数の取得方法を Cloudflare の `Runtime` 環境に対応させます。

## オープンな質問

- **SSG と SSR のどちらが望ましいですか？**
  - **SSR**: アクセスのたびに最新の動画情報を取得します（おすすめ）。
  - **SSG**: ビルド時のみ情報を取得し、再デプロイされるまで更新されません。
  - 今回は SSR を前提として進めますが、よろしいでしょうか？

## 検証プラン

### 自動テスト
- `npm run preview` 等を通じ、ローカルで Cloudflare アダプターが動作しているかをエミュレーションして確認します。
- ブラウザツールを使用し、SSR モードで live ページがエラーなく描画されるか確認します。
