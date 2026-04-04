# クリアボタン機能の復旧 Web Walkthrough

`RoomLayoutDesigner` のヘッダーにある「クリア」ボタンが機能するように修正しました。

## 変更内容

### Room Layout Designer Logic

#### [script.js](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/script.js)

- `setupEventListeners` 関数内で、`btn-clear` ボタンに対して `resetAll` 関数をイベントリスナーとして登録しました。
- 以前のコードで誤ってボタンに対して設定されていた `onchange` リスナーを削除し、コードをクリーンアップしました。

## 検証結果

ブラウザでのテストにより、以下の動作を確認しました：
1. 家具オブジェクトを追加。
2. 「クリア」ボタンをクリック。
3. 確認ダイアログが表示される。
4. 「OK」を選択すると、キャンバス内の全オブジェクトが削除され、UIが初期状態に戻る。

![クリアボタンの動作確認](file:///C:/Users/kohei/.gemini/antigravity/brain/27f3355b-1428-4f00-b6d7-cd409b498842/verify_clear_button_fix_1775315458962.webp)

## プロジェクトドキュメント

ユーザー定義のルールに従い、プロジェクト内の以下の場所にも記録を保存しました：
- [実装計画書](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/docs/room_layout_designer/clear_button_fix/implementation_plan.md)
- [変更履歴 (Walkthrough)](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/docs/room_layout_designer/clear_button_fix/walkthrough.md)
