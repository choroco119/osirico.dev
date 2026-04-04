# LIVE ページレイアウト修正のウォークスルー

LIVE STREAMING ページのレイアウトを改善し、動画プレイヤーが画面幅を最大限に活用しつつ、チャット欄が常に右側に表示されるようにしました。

## 変更内容

### [src/pages/live.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro)
- **コンテナ幅の拡張**: LIVE ページ固有のスタイルを追加し、標準の `1200px` 制限を解除して最大 `1800px`（画面幅の 95%）まで広がるようにしました。
- **動画プレイヤーの拡大**: 動画とチャットのグリッド比率を調整し、動画が優先的に画面を占有するようにしました。
- **右チャット欄の維持**: チャット欄を `380px` の固定幅で右側に配置し、動画プレイヤーが残りの全幅を埋める構成にしました。
- **レスポンシブ対応**: 画面幅が狭い場合（992px以下）は、動画の下にチャットが並ぶ従来のスタック形式を維持しています。

## 検証結果

### レイアウト確認（デスクトップ幅 1920px）
![LIVE ページ全幅レイアウト](file:///C:/Users/kohei/.gemini/antigravity/brain/27f3355b-1428-4f00-b6d7-cd409b498842/live_page_layout_wide_1775320618966.png)

- 動画プレイヤーが左側に大きく表示され、16:9 のアスペクト比を維持していることを確認しました。
- チャット欄が右側に適切に配置されています（※デバッグ表示のため YouTube 公式の「チャットは無効です」というメッセージが表示されていますが、実際のライブ中は同期されます）。

### [src/lib/youtube.ts](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/lib/youtube.ts) [NEW]
- **ロジックの共通化**: oEmbed 方式での配信状態取得ロジックを一元管理し、ヘッダーと LIVE ページの両方から利用可能にしました。

### [src/layouts/BaseLayout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/layouts/BaseLayout.astro)
- **グローバル告知機能**: 全ページのヘッダーにある「LIVE」メニューの横に、配信中のみ表示される点滅インジケーターを追加しました。
- **サイト全体のキャッシュ最適化**: 配信状態のチェックによる負荷を抑えるため、全ページに 3分間の `Cache-Control`（CDN キャッシュ）を設定しました。

## 検証結果

### ヘッダーの配信中インジケーター（シミュレーション時）
![ヘッダーの配信中インジケーター](file:///C:/Users/kohei/.gemini/antigravity/brain/27f3355b-1428-4f00-b6d7-cd409b498842/live_indicator_header_1775324840370.png)

- どのページからでも、配信が開始されるとリアルタイム（最大3分のラグ）で赤いドットが点滅し、ユーザーに通知されることを確認しました。

## GitHub への反映
最新の変更をリモートに反映しました。
- **コミットメッセージ**: `Global: Add live indicator to header with shared utility and cache`
