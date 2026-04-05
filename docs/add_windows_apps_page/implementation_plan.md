# Windowsアプリケーション配布ページの追加

Windowsアプリケーションを配布するための専用ページを新規作成し、既存のポータルサイトからアクセスできるように構成を拡張します。

## 変更内容の概要

1. **ナビゲーションメニューの更新**: `BaseLayout.astro` に「WINDOWS APPS」へのリンクを追加します。
2. **ポータル画面の更新**: `index.astro` のグリッドに「WINDOWS APPS」のカードを追加します。
3. **配布ページの新規作成**: `src/pages/apps/windows/index.astro` を作成し、アプリケーションのリストとダウンロードボタンを表示します。

---

## 提案される変更

### [portal-ui] ポータル全体のUI更新

#### [MODIFY] [BaseLayout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/layouts/BaseLayout.astro)
- ナビゲーションメニューに `WINDOWS APPS` を追加し、ページ間移動を容易にします。

#### [MODIFY] [index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/index.astro)
- ホーム画面の `portal-grid` に「WINDOWS APPS」のタイルを追加します。
- アイコンには 💾 または 💻 を使用。

### [distribution-page] 配布ページの構築

#### [NEW] [index.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/windows/index.astro)
- `web/index.astro` と同様のプレミアムなデザインを継承。
- Windowsアプリ（例：Universal Input Display）のタイトル、説明、アイコン、およびダウンロードリンクを表示。
- 将来的なアプリ追加に対応可能なデータ駆動型の構造。

---

## 確認計画

### 手動確認
- [ ] ブラウザツールを使用して `/apps/windows` にナビゲートし、表示を確認。
- [ ] ホーム画面およびナビゲーションからのリンクが正しく機能するか確認。
- [ ] レスポンシブレイアウトが崩れていないか確認。
