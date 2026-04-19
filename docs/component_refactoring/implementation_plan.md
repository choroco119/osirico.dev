# Windows Apps セクションのコンポーネント化計画

既存の `index.astro` と `[id].astro` に直書きされている UI 要素を、再利用可能な Astro コンポーネントとして切り出します。

## 概要

以下の手順で、コードの重複を減らし、保守性を高めるためのリファクタリングを行います。
新しいコンポーネントは `src/components/` ディレクトリに作成します。作業の履歴は `docs/component_refactoring` に保存します。

## Proposed Changes

---

### UI Components

以下の UI コンポーネントを新規作成します。

#### [NEW] [DownloadButton.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/components/DownloadButton.astro)
- ダウンロードリンク用のボタン。
- 引数: `url` (必須)

#### [NEW] [RepoButton.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/components/RepoButton.astro)
- GitHub リポジトリ等へのリンク用ボタン。
- 引数: `url` (必須)

#### [NEW] [AppCard.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/components/AppCard.astro)
- アプリ一覧ページ (`index.astro`) で使用する、アプリアイコン、タイトル、バージョン、説明を含むカードコンポーネント。
- 引数: `app` (アプリデータのオブジェクト) または個別の属性値。

---

### Pages

コンポーネント化に合わせて、既存のページファイルを更新します。

#### [MODIFY] [index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/windows/index.astro)
- アプリリストのループ内で、新規作成する `<AppCard />` コンポーネントを使用するように変更します。
- 不要になったカード内の CSS を削除します。

#### [MODIFY] [[id].astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/windows/[id].astro)
- ダウンロードボタン、リポジトリボタンの部分を新規作成する `<DownloadButton />` と `<RepoButton />` コンポーネントに置き換えます。
- 不要になったボタン関連の CSS を削除します。

## User Review Required

> [!NOTE]
> 今回変更するのはコードの構造のみであり、ユーザーが見た目のデザインや動作は現状と同じになるように調整します。

この計画で実装を進めてよろしいでしょうか？
