# 操作ガイドの初期表示修正 Walkthrough

ページアクセス時に、画面右下の「操作ガイド」パネルが最初から開いている状態になるよう修正しました。

## 変更内容

### [room-layout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/room-layout.astro)

- `pc-instructions` 要素から `collapsed` クラスを削除しました。これにより、CSSによる非表示（`max-height: 0`）が適用されなくなり、初期状態でコンテンツが展開されます。

## 検証結果

ブラウザでのテストにより、以下の動作を確認しました：
1. ページロード直後に操作ガイドの内容（基本操作、家具の編集など）が表示されている。
2. ヘッダーをクリックすることで、通常通り開閉（トグル）が可能である。

![操作ガイドの初期表示](file:///C:/Users/kohei/.gemini/antigravity/brain/27f3355b-1428-4f00-b6d7-cd409b498842/initial_load_view_1775315887115.png)
