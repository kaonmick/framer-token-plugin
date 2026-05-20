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

- [ ] `framer.json` の `id` が申請対象の plugin と一致している
- [ ] `framer.json` の `name` が公開名として問題ない
- [ ] `framer.json` の `modes` が実装範囲と合っている
- [ ] `public/icon.svg` が Framer 上で小さく表示しても読める
- [ ] Marketplace の category / tags が「color token import」の実装範囲を超えていない

### 2. Core flow

- [ ] Framer の Development Plugin で起動できる
- [ ] 空状態から JSON を貼り付けて preview へ進める
- [ ] `fixtures/technical-validation-colors.json` で import が完了する
- [ ] `fixtures/light-dark-colors.json` で light / dark の値が意図どおり入る
- [ ] import 完了 summary が表示される
- [ ] import 後に Framer の Color Style 側で作成結果を確認できる

### 3. Error / partial flow

- [ ] `fixtures/error-invalid-json.json` で parse error が読める文言で出る
- [ ] `fixtures/conflict-many-colors.json` で conflict choice が表示される
- [ ] warning 付き input で preview / summary が破綻しない
- [ ] import 失敗時に failed summary が出る
- [ ] retry / back / close の操作で戻れなくならない

### 4. UI stack

- [ ] Ideal State: preview と import 完了状態が自然に読める
- [ ] Blank / Empty State: 初期表示で次に何をするか分かる
- [ ] Loading State: analysis / import 中の待機表示が出る
- [ ] Partial State: warning / conflict が混在しても判断できる
- [ ] Error State: 原因と次の操作が分かる

### 5. Theme / browser

- [ ] Framer の dark mode で見た目が崩れない
- [ ] Framer の light mode で見た目が崩れない
- [ ] macOS Chrome で主要フローを確認する
- [ ] 可能なら別 browser でも起動だけ確認する
- [ ] plugin window の横幅 / 高さが変わっても主要操作が隠れない

### 6. Copy / expectation

- [ ] README が「color token import」以上の機能を約束していない
- [ ] Marketplace description に未実装の audit / sync / variables manager を含めない
- [ ] alias は参照先が存在する color token のみ解決する、と説明できている
- [ ] conflict は自動解決しない、と説明できている
- [ ] OKLCH は Framer 互換のため rgba へ変換する、と説明できている
- [ ] support URL と docs URL が申請画面に入れられる状態になっている

### 7. Package / submission asset

- [ ] `npm run check` が通る
- [ ] `npm run test` が通る
- [ ] `npm run build` が通る
- [ ] `npm run screenshots` の主要 screenshot が最新 UI と大きくずれていない
- [ ] Framer 公式手順に合わせて `npm run pack` または同等の pack 手順を確認する
- [ ] 申請用の `plugin.zip` を作成できる
- [ ] `plugin.zip` に余計な作業ファイルや検証用メモが混ざっていない

## 完了条件

- 上記チェックがすべて完了している
- 残った注意点があれば Marketplace 申請前メモとしてこの issue に追記されている
- 申請画面に入力する category / tags / description / support URL / docs URL が確定している

## Kaon 確認

- [ ] 公開名を `Token Color Importer` のままで進めてよい
- [ ] 無料 plugin として申請してよい
- [ ] support URL は GitHub Issues を使ってよい
- [ ] docs URL は repo docs / README を案内先にしてよい
