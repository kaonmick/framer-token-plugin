# Spike: Scale Performance

## Issue

- GitHub Issue: https://github.com/kaonmick/framer-token-plugin/issues/8

## 検証日

- Date: 2026-04-22

## 検証環境

- Framer Plugin SDK version: TBD
- Framer project: TBD
- Browser / OS: TBD
- Plugin branch / commit: TBD
- Local Playwright stress check: Vite dev server + Chromium headless

## 仮説

実案件サイズでも scan / sync / audit を許容可能な速度で実行できる。重い場合は selection scan / incremental scan / progress 表示に切り替えられる。

## 手順

- [ ] 100 Color Styles で scan 時間を測る。
- [ ] 500 Color Styles で scan 時間を測る。
- [ ] 1,000 nodes で scan 時間を測る。
- [ ] 5,000 nodes で scan 時間を測る。
- [ ] 10,000 nodes で scan 時間を測る。
- [ ] progress / cancel / cache の必要性を判断する。

## 結果

- JSON editorの実用目安は2,000 color tokens程度とする。
- Playwrightでtextareaに直接JSONを注入した簡易検証では、2,000 tokens / 8,006 lines / 169,361 chars の描画待ちが約1秒だった。
- Playwrightの通常入力シミュレーションで5,000 tokensを扱うと120秒でタイムアウトした。入力手段の影響もあるが、5,000 tokens級は現状UIの正式サポート範囲外として扱う。

## 成功条件との差分

- 2,000 tokensまではMVPの想定範囲として許容する。
- 2,000 tokensを超えるJSONを正式対応する場合は、行仮想化、parse / syntax highlightのdebounce、またはハイライト制限が必要。

## 制約 / 失敗ケース

- 現在のeditorは全行をDOM描画するため、巨大JSONでは行数に比例して描画コストが増える。
- 5,000 tokens以上は「利用できる可能性はあるが、難しい / 重い」旨をドキュメントやUI文言で明示する。

## 判断

- [ ] Go
- [x] Conditional Go
- [ ] No Go

## 次アクション

- MVPでは2,000 tokens目安をREADMEへ明記する。
- 2,000 tokens超を正式対応する段階でeditor仮想化の実装判断を行う。
