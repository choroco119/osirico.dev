# 操作ガイドの初期表示修正プラン

ページアクセス時に操作ガイド（PC版）が最初から開いている状態にします。

## 変更内容

### Room Layout Designer Page
- `src/pages/apps/web/room-layout.astro` の `pc-instructions` 要素から `collapsed` クラスを削除します。

## 検証プラン
- ブラウザでページを読み込み、右下の操作ガイドが展開された状態で表示されることを確認します。
