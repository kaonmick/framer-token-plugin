# Issue 37 公開までのタスクリスト

Issue: local only

## 目的

最終チェック後、Framer Marketplace へ申請し、公開されるまでの作業を順番に進める。

この issue は実装作業ではなく、公開申請とレビュー対応の進行表として使う。

参考:

- https://www.framer.com/developers/publishing
- [Issue 36 公開申請前の最終チェックリスト](./36-final-publish-checklist.md)

## 前提

- Issue 36 の最終チェックが完了している
- plugin の調整は完了済み
- リモート issue は作らず、local issue として管理する

## タスクリスト

### 1. 申請情報を確定する

- [x] 公開名を確定する
- [x] 短い説明文を確定する
- [x] 詳細説明文を確定する
- [x] README が「color token import」以上の機能を約束していないか確認する
- [x] Marketplace description に未実装の audit / sync / variables manager を含めない
- [x] alias は参照先が存在する color token のみ解決する、と説明できている
- [x] conflict は自動解決しない、と説明できている
- [x] OKLCH は Framer 互換のため rgba へ変換する、と説明できている
- [x] category を確定する
- [x] tags を確定する
- [x] pricing を確定する
- [x] support URL を確定する
- [x] docs URL を確定する
- [x] screenshot / visual asset を確定する

### 2. 申請用 package を作る

- [x] `npm run check` を実行する
- [x] `npm run test` を実行する
- [x] `npm run build` を実行する
- [x] Framer 公式手順の `npm run pack` または同等の pack 手順を実行する
- [x] `plugin.zip` が作成されていることを確認する
- [x] `plugin.zip` の中身に申請不要なファイルが混ざっていないか確認する

### 3. Marketplace dashboard で申請する

- [x] Marketplace dashboard で `New Plugin` を選ぶ
- [x] `plugin.zip` をアップロードする
- [x] 申請情報を入力する
- [x] description が実装済み scope を超えていないか最後に読む
- [x] support / docs のリンクが開けるか確認する
- [x] submit する

### 4. レビュー待ち中に記録する

- [x] 申請日をこの issue に追記する
- [x] 申請時の plugin version を追記する
- [x] 申請時の説明文を追記する
- [x] Framer からの返信や status 変更を追記する

### 5. 指摘が来た場合に対応する

- [ ] 指摘内容をそのままこの issue に転記する
- [ ] 実装修正が必要なら、別 issue に分ける
- [ ] 文言修正だけなら、この issue 内で修正案を管理する
- [ ] 修正後に再 pack する
- [ ] Marketplace UI へ再アップロードする
- [ ] 再申請日を追記する

### 6. 公開後に行う

- [ ] 公開 URL を README / docs に追記する
- [ ] support 導線が動くか確認する
- [ ] 初回ユーザー向けに既知の制約を見直す
- [ ] 公開後の改善 issue を必要な分だけ分ける
- [ ] Pro / audit / sync など未実装の構想は公開文言ではなく roadmap 側に置く

## 完了条件

- Framer Marketplace で plugin が公開されている
- 公開 URL が repo 内の案内に反映されている
- レビュー指摘が残っていない
- 公開後に必要な改善が別 issue として分けられている

## 申請ログ

- 申請日: 2026-05-24
- plugin version: `0.1.0`
- plugin.zip 作成方法: `npm run pack`
- Marketplace status: レビュー待ち
- 公開 URL:
- レビュー指摘:

## 申請情報

- 公開名 / 申請文面: [Marketplace Submission Copy](../marketplace-assets/description.md)
- pricing: Free
- category: 申請済み
- tags: 申請済み
- support / docs: 申請済み
- screenshot / visual asset: [cover-1.png](../marketplace-assets/cover-1.png), [cover-2.png](../marketplace-assets/cover-2.png)

## 作業ログ

### 2026-05-21

- branch: `codex/issue-37-publish-marketplace`
- Framer 公式の公開手順を再確認。申請時は Marketplace dashboard で `New Plugin` を選び、root で `npm run pack` を実行して作成した `plugin.zip` をアップロードする流れ。
- Creator Dashboard の plugin 申請情報を再確認。plugin 申請では code、details、category、visual が必要で、visual は 1600 x 1200 の画像を使う。
- `framer.json` の `name` が `Json Color Importer` であることを確認し、公開名として採用。
- README と release docs を確認し、公開文言は color token import に限定する方針にした。
- `docs/marketplace-assets/` を作成し、説明文と visual asset の置き場を分けた。
- `docs/marketplace-assets/description.md` に英語 / 日本語の説明文を記載した。
- pricing は `docs/specs/05-business-model.md` と `docs/specs/08-technical-validation-plan.md` の方針に合わせ、初回公開は Free とした。
- `npm run check` は成功。
- `npm run test` は成功。3 files / 23 tests passed。
- `npm run build` は成功。
- `npm run pack` は成功。root に `plugin.zip` を作成。
- `plugin.zip` は 174KB。`index.html`、`icon.svg`、`framer.json`、current bundle、font / css assets のみで、docs / fixtures / source files は含まれていない。
- 既存 screenshot は 420 x 620 または 420 x 833 の plugin UI 確認用だったため、Marketplace visual としては未確定のまま残す。

### 2026-05-24

- Marketplace dashboard で申請完了。
- 申請日は 2026-05-24。
- Marketplace status はレビュー待ち。
- 申請内容は `docs/marketplace-assets/description.md` に格納済み。
- Marketplace 用 visual は `docs/marketplace-assets/cover-1.png` と `docs/marketplace-assets/cover-2.png` に格納済み。どちらも 1600 x 1200。
