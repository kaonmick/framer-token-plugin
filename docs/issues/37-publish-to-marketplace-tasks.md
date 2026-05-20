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

- [ ] 公開名を確定する
- [ ] 短い説明文を確定する
- [ ] 詳細説明文を確定する
- [ ] category を確定する
- [ ] tags を確定する
- [ ] pricing を確定する
- [ ] support URL を確定する
- [ ] docs URL を確定する
- [ ] screenshot / visual asset を確定する

### 2. 申請用 package を作る

- [ ] `npm run check` を実行する
- [ ] `npm run test` を実行する
- [ ] `npm run build` を実行する
- [ ] Framer 公式手順の `npm run pack` または同等の pack 手順を実行する
- [ ] `plugin.zip` が作成されていることを確認する
- [ ] `plugin.zip` の中身に申請不要なファイルが混ざっていないか確認する

### 3. Marketplace dashboard で申請する

- [ ] Marketplace dashboard で `New Plugin` を選ぶ
- [ ] `plugin.zip` をアップロードする
- [ ] 申請情報を入力する
- [ ] description が実装済み scope を超えていないか最後に読む
- [ ] support / docs のリンクが開けるか確認する
- [ ] submit する

### 4. レビュー待ち中に記録する

- [ ] 申請日をこの issue に追記する
- [ ] 申請時の plugin version を追記する
- [ ] 申請時の説明文を追記する
- [ ] Framer からの返信や status 変更を追記する

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

- 申請日:
- plugin version:
- plugin.zip 作成方法:
- Marketplace status:
- 公開 URL:
- レビュー指摘:
