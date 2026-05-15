# Issue 34 Release Check

Issue: [#34 Release Check: Framer pluginとしての公開要件と動作要件を最終確認する](https://github.com/kaonmick/framer-token-plugin/issues/34)

## 目的

Framer plugin として公開する前に、repo 内で確認できる証跡と、Framer 実機でしか確認できない項目を分けて整理する。

- Codex が揃えられる docs / screenshots / metadata の棚卸しを終える
- Framer 実機で確認すべき項目を Kaon 向けのチェックリストとして残す
- Marketplace 文言や support 導線で「言い過ぎ」にならない基準を先に固定する

## 実行日

- 2026-05-06

## 現時点の判定

- `Pending`
- Framer 実機での import / error / conflict / summary / UI state 確認は完了
- 残りは README / docs 案内の整合確認と、Marketplace 入稿項目の最終確定のみ

## 公開前チェック表

| 項目 | 現状 | 根拠 | 次アクション |
|---|---|---|---|
| Framer 上で plugin が正常起動するか | 確認済み | `framer.json`, `src/app/App.tsx` | 完了 |
| fixture / 実運用 JSON で import が最後まで通るか | 確認済み | `src/fixtures/technical-validation-colors.json`, `src/fixtures/light-dark-colors.json` | 完了 |
| invalid JSON / conflict / partial import / summary copy | 確認済み | `src/fixtures/error-invalid-json.json`, `src/fixtures/conflict-many-colors.json`, `docs/screenshots/06-invalid-json.png`, `docs/screenshots/07-conflict-preview.png`, `docs/screenshots/09-import-summary-success.png`, `docs/screenshots/10-import-summary-failed.png` | 完了 |
| UI stack 5状態 | 確認済み | 下記 UI stack 表 | 完了 |
| README / docs / screenshots / known limitations | 最終確認待ち | `README.md`, `docs/doc-hub.html`, `docs/index.html`, `docs/screenshots/` | README / docs の案内が実 UI と食い違っていないかを確認する |
| plugin id / name / icon | 確認済み | `framer.json`, `public/icon.svg` | 完了 |
| category / tag / description | repo 外で要確定 | Marketplace 入稿項目 | Framer Marketplace 登録画面で最終入力する |
| support contact / docs link | 要確定 | `README.md` の support 導線 | Marketplace の support URL と docs URL を決める |
| pricing / Free / Pro 文言 | 確認済み | `docs/specs/05-business-model.md`, `docs/specs/08-technical-validation-plan.md` | 完了 |
| UI / README / Marketplace の訴求が実装を超えていないか | 最終確認待ち | `README.md`, `docs/specs/08-technical-validation-plan.md` | Marketplace 文言を作る時も color import 中心の表現を維持する |

## UI stack 確認メモ

| UI stack | 現状の証跡 | 判定 | 補足 |
|---|---|---|---|
| Ideal State | `docs/screenshots/02-preview-normal.png`, `docs/screenshots/03-light-dark.png`, `docs/screenshots/09-import-summary-success.png` | OK | token preview と import 完了サマリーを確認済み |
| Blank / Empty State | `docs/screenshots/01-default.png` | OK | editor 初期表示と empty preview を確認済み |
| Loading State | `src/app/App.tsx` の `isAnalyzing` / `isImporting` と loading copy | OK | 実機で見え方を確認済み |
| Partial State | `docs/screenshots/05-warning.png`, `docs/screenshots/07-conflict-preview.png` | OK | warning と conflict を確認済み |
| Error State | `docs/screenshots/06-invalid-json.png`, `docs/screenshots/10-import-summary-failed.png` | OK | parse error と import failed summary を確認済み |

## 残りの確認項目

1. README / docs の案内内容と、現在の実 UI / 実装スコープが食い違っていないか
2. Marketplace 用の `category / tag / description / support URL / docs URL` が、実機確認結果と矛盾しないか

## 残り 2 項目の見方

- README / docs 側では、「color token import 専用」「alias は存在する color token のみ解決」「conflict は自動解決しない」「最終確認は Framer 実機が必要」の 4 点が UI 実態とズレていないかを見る
- Marketplace 側では、description や tag に variables manager / audit / sync のような未実装機能を混ぜず、Phase 1 の color import 中心の表現に留める
- docs URL は `docs/doc-hub.html` を公開導線の基準にし、support URL は GitHub Issues を使うなら `https://github.com/kaonmick/framer-token-plugin/issues` を候補にする

## Marketplace 前に固定しておく表現

- この plugin は color token import に特化した Phase 1 実装であり、spacing / typography / variables 全般は扱わない
- alias は参照先が存在する color token のみ解決する
- Framer 側の既存 style との conflict は自動解決せず、ユーザー選択を前提にする
- 大規模 JSON は 2,000 color tokens 程度を実用目安とし、それ以上は追加最適化の対象とする
- Framer 実機での最終見え方確認は必須であり、component catalog は補助確認に留める

## Kaon 手動チェック

1. `npm run dev` を起動し、Framer の Development Plugin で plugin を開く
2. `src/fixtures/technical-validation-colors.json` を貼り付けるか読み込み、happy path を確認する
3. `src/fixtures/error-invalid-json.json` と `src/fixtures/conflict-many-colors.json` で error / conflict / failed summary を確認する
4. light / dark token を含む JSON で theme 値の import 結果を確認する
5. README / docs の案内と実 UI がズレていないかを確認する
6. support URL、docs URL、category、tag、description を Marketplace 入稿画面で確定する

## 関連成果物

- [README](../../README.md)
- [Doc Hub](../doc-hub.html)
- [Plugin Registration Flow](../specs/07-plugin-registration-flow.md)
- [Technical Validation Plan](../specs/08-technical-validation-plan.md)
- [Technical Validation Issue Workflow](../specs/10-codex-issue-workflow.md)
- [Default Screenshot](../screenshots/01-default.png)
- [Conflict Screenshot](../screenshots/07-conflict-preview.png)
- [Import Failed Summary](../screenshots/10-import-summary-failed.png)

## Issue comment draft

```md
## Codex 作業報告

### 作業内容

- issue #34 向けに公開前チェックの進捗メモを `docs/issues/34-release-check.md` として追加
- `doc-hub` と Docsify sidebar から辿れるように入口を追加
- README に既知の制約と support 導線を追記し、公開文言が実装を超えないよう整理

### 根拠 / 成果物

- `docs/issues/34-release-check.md`
- `README.md`
- `docs/doc-hub.html`
- `docs/screenshots/01-default.png`
- `docs/screenshots/07-conflict-preview.png`
- `docs/screenshots/10-import-summary-failed.png`

### Kaon 確認事項

- [ ] README / docs の案内内容と実 UI が食い違っていないか
- [ ] Marketplace に設定する category / tag / description / support URL / docs URL をこれで確定してよいか

### 次の推奨アクション

- 上記 2 項目が固まったら issue #34 に追記し、blocker がなければ `codex-done` 候補にする
```
