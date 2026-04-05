# Windowsアプリケーション詳細ページの追加（シンプル構成）

Windowsアプリケーションの個別ページを作成し、ダウンロードリンクとREADMEを表示します。

## 変更内容の概要

1. **ページ構成**: 
    - 上部に分かりやすいダウンロードリンクを配置。
    - その下にアプリケーションのREADME（説明文）を表示。
    - 複雑なGitHub風のUI（タブ等）は排除し、シンプルで実用的な構成にします。
2. **コンテンツ管理**: Astroのコンテンツコレクションを使用して、READMEの内容とメタデータを一括管理します。

---

## 提案される変更

### [architecture] コンテンツ管理

#### [NEW] [config.ts](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/content/config.ts)
- `windows-apps` コレクションのスキーマを定義（title, description, version, downloadUrl）。

#### [NEW] [universal-input-display.md](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/content/windows-apps/universal-input-display.md)
- 「Universal Input Display」のREADME内容をMarkdownで作成。

### [pages] ルーティングとデザイン

#### [NEW] [[id].astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/windows/[id].astro)
- 動的ルーティングによる個別詳細ページ。
- **レイアウト**:
    - ヘッダー（アプリ名）
    - ダウンロードセクション（最上部：大きなダウンロードボタン）
    - READMEセクション（Markdownレンダリング）

#### [MODIFY] [index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/windows/index.astro)
- アプリ一覧のカードをクリックすると、新設した詳細ページへ遷移するように変更。

---

## 確認計画

### 手動確認
- [ ] 詳細ページの最上部にダウンロードリンクが表示されているか。
- [ ] READMEの内容が正しく表示されているか。
- [ ] デザインがポータルサイト全体のトーンと合っているか。
