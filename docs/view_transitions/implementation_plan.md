# [Implementation Plan] ヒーロー遷移の解除とフェードへの復帰

個別の要素が移動する「ディープ・ヒーロー遷移」を削除し、シンプルで清潔感のあるフェード遷移に戻します。

## Proposed Changes

### 1. 個別要素からの `transition:name` 削除
以下のファイルの該当箇所から `transition:name` 属性を削除します。
- **[MODIFY] [index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/index.astro)**: カード内のアイコンとタイトルのタグ。
- **[MODIFY] [live.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/live.astro)**: ヘッダーのアイコンとタイトルのタグ。
- **[MODIFY] [apps/web/index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/index.astro)**: ヘッダーのアイコンとタイトルのタグ。

### 2. グローバル遷移スタイルの整理 (`src/layouts/BaseLayout.astro`)
- `::view-transition-group(live-hero-icon)` 等、個別に定義したスタイルをすべて削除します。
- 必要に応じて、標準のフェード効果を安定させるための最小限の設定のみ残します。

### 3. デザインの微調整
- アイコンを追加したことで変更したレイアウト（`grid` 等）は、デザインとして優れている場合はそのまま残し、アニメーション（移動）だけを無効化します。

## Verification Plan

### Manual Verification
- ホームから各ページへの遷移が、要素の「飛行」なしに、シンプルなフェードで行われることを確認。
- 遷移時に一瞬だけ要素が重複して表示される等の「ガタつき」がないかを確認。
