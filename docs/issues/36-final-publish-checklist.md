# Issue 36 公開申請前の最終チェックリスト

Issue: local only

## 目的

公開申請前に、Framer 実機でしか判断できない項目と、repo 内で確認できる項目を分けて最後に確認する。

Framer 公式の公開手順では、申請前に plugin 名 / icon、主要フロー、複数の project state / browser、dark / light mode を確認し、申請時に `plugin.zip` をアップロードする流れになっている。

参考:

- https://www.framer.com/developers/publishing
- [Issue 34 Release Check](./34-release-check.md)

## 現状

- 調整は完了済み
- 残りは公開申請前の最終チェック
- リモート issue は作らず、この local issue をチェックリストとして使う

## チェックリスト

### 1. Plugin metadata

- [x] `framer.json` の `id` が申請対象の plugin と一致している
- [x] `framer.json` の `name` が公開名として問題ない
- [x] `framer.json` の `modes` が実装範囲と合っている
- [x] `public/icon.svg` が Framer 上で小さく表示しても読める
- [x] Marketplace の category / tags が「color token import」の実装範囲を超えていない

### 2. Core flow

- [x] Framer の Development Plugin で起動できる
- [x] 空状態から JSON を貼り付けて preview へ進める
- [x] `fixtures/technical-validation-colors.json` で import が完了する
- [x] `fixtures/light-dark-colors.json` で light / dark の値が意図どおり入る
- [x] import 完了 summary が表示される
- [x] import 後に Framer の Color Style 側で作成結果を確認できる

### 3. Error / partial flow

- [x] `fixtures/error-invalid-json.json` で parse error が読める文言で出る
- [x] `fixtures/conflict-many-colors.json` で conflict choice が表示される
- [x] warning 付き input で preview / summary が破綻しない
- [x] import 失敗時に failed summary が出る
- [x] retry / back / close の操作で戻れなくならない

### 4. UI stack

- [x] Ideal State: preview と import 完了状態が自然に読める
- [x] Blank / Empty State: 初期表示で次に何をするか分かる
- [x] Loading State: analysis / import 中の待機表示が出る
- [x] Partial State: warning / conflict が混在しても判断できる
- [x] Error State: 原因と次の操作が分かる

### 5. Theme / browser

- [x] Framer の dark mode で見た目が崩れない
- [x] Framer の light mode で見た目が崩れない
- [x] macOS Chrome で主要フローを確認する
- [x] 可能なら別 browser でも起動だけ確認する
- [x] plugin window の横幅 / 高さが変わっても主要操作が隠れない
  - `resizable: true` 追加後、Framer 実機で幅 / 高さを変更できることを確認済み。

### 6. Copy / expectation

- [ ] Issue 37 で対応するため、この issue ではスコープ外

### 7. Package / submission asset

- [x] `npm run check` が通る
- [x] `npm run test` が通る
- [x] `npm run build` が通る
- [x] `npm run screenshots` の主要 screenshot が最新 UI と大きくずれていない
- [x] Framer 公式手順に合わせて `npm run pack` または同等の pack 手順を確認する
- [x] 申請用の `plugin.zip` を作成できる
- [x] `plugin.zip` に余計な作業ファイルや検証用メモが混ざっていない

## 作業ログ

### 2026-05-20

- branch: `codex/issue-36-final-publish-checklist`
- `framer.json` を確認し、`id: 3f71c0`、`name: Json Color Importer`、`modes: ["canvas"]` を確認した
- `npm run check` は成功
- `npm run test` は成功。3 files / 23 tests passed
- `npm run build` は成功
- `npm run screenshots` は成功。`docs/screenshots/01-default.png` から `10-import-summary-failed.png` まで再取得した
- summary screenshot が import 前 preview を撮っていたため、`summary-success` / `summary-failed` では import button を押して dialog を撮るように capture script を修正した
- `summary-failed` では failed summary を返すように capture mode を修正した
- Framer 公式手順に合わせて `npm run pack` を追加した
- `npm run pack` は成功。root に `plugin.zip` を作成できる
- `npm run pack` は既存 zip 内の古い bundle が残らないよう、`zip -FS` で `dist/` と同期する
- `unzip -l plugin.zip` で中身を確認。`index.html`、current bundle、`icon.svg`、`framer.json`、font / css assets のみで、docs や fixture は含まれていない
- `plugin.zip` は申請用の生成物なので `.gitignore` に追加した

### 2026-05-21

- Kaon 実機確認により、チェックリスト 1 から 4 まで完了
- import 失敗時の failed summary は、Framer 実機で自然な失敗は未再現
- failed summary の表示自体は `docs/screenshots/10-import-summary-failed.png` で確認済みとして扱う
- Kaon 実機確認により、チェックリスト 5 も完了
- plugin window の幅 / 高さは Framer 公式ガイド上、`framer.showUI` の `resizable` で変更可否を指定できる。未指定時は default `false`
- この plugin は `resizable` 未指定だったため、`resizable: true` と min / max size を追加し、リサイズ時の主要操作確認を再実施する
- Kaon 実機確認により、plugin window の幅 / 高さが変更できることを確認済み
- Copy / expectation は Issue 37 の申請情報確定で扱うため、Issue 36 ではスコープ外にする

## 完了条件

- 上記チェックがすべて完了している
- 残った注意点があれば Marketplace 申請前メモとしてこの issue に追記されている
- 申請画面に入力する category / tags / description / support URL / docs URL が確定している

## Kaon 確認

- [ ] 公開名を `Json Color Importer` で進めてよい
- [ ] 無料 plugin として申請してよい
- [ ] support URL は GitHub Issues を使ってよい
- [ ] docs URL は repo docs / README を案内先にしてよい
