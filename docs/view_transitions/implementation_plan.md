# [Implementation Plan] View Transitions の導入

Astro の View Transitions API を導入し、マルチページアプリケーション（MPA）でありながら、シングルページアプリケーション（SPA）のような滑らかな画面遷移を実現します。

## Proposed Changes

### [Component Name] Layouts / Global

#### [MODIFY] [BaseLayout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/layouts/BaseLayout.astro)
- `astro:transitions` から `ViewTransitions` をインポートします。
- `<head>` セクションに `<ViewTransitions />` コンポーネントを追加します。
- これにより、サイト全体の全ページ間でクロスフェード等の遷移アニメーションが有効になります。

## Verification Plan

### Automated Tests
- ブラウザツールを使用して、ホームページ ( `/` ) から配信ページ ( `/live` ) への遷移を行い、画面が瞬きせずに滑らかに切り替わるか確認します。
- 開発コンソールで、ページ遷移時に `astro:after-swap` 等のイベントが正しく発火しているか、JS エラーが出ていないかを確認します。

### Manual Verification
- ヘッダーの「LIVE」インジケーターが、遷移後も正しく表示・維持されるかを目視で確認します。
