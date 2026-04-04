# Room Layout Designer スマートフォン対応の実装計画

この計画では、`RoomLayoutDesigner` をスマートフォンでの利用に最適化します。`Arcade Controller Layout Designer` で確立された UI パターンと操作感を継承し、レスポンシブなビュー切り替えとタッチ入力をサポートします。

## User Review Required

> [!IMPORTANT]
> **UI構成の変更**: デスクトップ版では常に表示されていたサイドバーが、モバイル版ではナビゲーションバーによる切り替え式になります。これにより、一度に表示できる情報が制限されますが、操作性は向上します。

## Proposed Changes

### UI (Astro / CSS)

#### [MODIFY] [room-layout.astro](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/src/pages/apps/web/room-layout.astro)
- モバイル用ナビゲーションバー (`mobile-nav`) を追加。
- 「パーツ」「キャンバス」「プロパティ」「操作」の4つの切り替えボタンを用意。
- モバイル専用の「操作ガイド」セクション（Info）を追加、または既存の `pc-instructions` を流用。

#### [MODIFY] [styles.css](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/styles.css)
- メディアクエリ (`@media (max-width: 768px)`) を強化。
- サイドバーとメインビューの表示制御ロジックを実装 (`active` クラスによる切り替え)。
- タッチターゲットの拡大（ボタン・入力フォームの `min-height` を 44px 以上に）。
- モバイルナビゲーションのスタイル定義。
- ヘッダーレイアウトの調整。

### Interaction (JavaScript)

#### [MODIFY] [script.js](file:///c:/Users/kohei/.gemini/antigravity/scratch/osiricoop-dev/public/apps/web/room-layout/script.js)
- **タッチイベント対応**:
    - `touchstart`, `touchmove`, `touchend` イベントリスナーの追加。
    - 座標取得処理を `getEvtCoords(e)` に統一し、マウスとタッチの両方に対応。
    - タッチ操作時の判定範囲（ヒットテスト）に許容誤差 (Tolerance) を導入。
- **ビュー切り替えロジック**:
    - `switchMobileView(view)` 関数の実装。
    - 起動時の画面サイズチェックと初期ビュー設定。
- **操作性の改善**:
    - ドラッグ操作時のスクロール防止 (`passive: false` と `preventDefault`)。
    - 家具追加時、モバイルでは自動的にキャンバス表示に切り替える処理。

## Open Questions

- **ズーム操作**: モバイルでのピンチズームの実装を優先しますか？それとも既存のズームボタンを使いやすく調整するだけで十分ですか？（まずはボタン調整から入り、必要に応じてピンチズームを検討します）

## Verification Plan

### Automated Tests
- コンパイルエラーがないことを確認。

### Manual Verification
1.  **ブラウザのデバッグツールによる検証**:
    - iPhone 12/13 等のモバイル挙動をシミュレート。
    - ナビゲーションバーによる「パーツ」「キャンバス」「プロパティ」「操作」の切り替えが正常か。
    - タッチドラッグで家具が移動できるか。
    - 辺をクリックして頂点を追加できるか。
2.  **実機検証**:
    - シミュレータでレスポンスを確認します。
