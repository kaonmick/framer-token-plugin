# Project Retrospective

作成日: 2026-05-06

## 目的

この文書は、この repo で進めた Json Color Importer の実装・検証・運用から得た学びを、別リポジトリでの作り直しに持ち出すための振り返りメモです。

単なる反省ではなく、次の repo で何を再利用し、何を最初から切り分け、どの順で進めると手戻りが減るかをまとめます。

## 先に結論

- 再利用価値が高かったのは、`JSON color import` のコア実装、HTML workbench、technical validation の進め方、capture mode の 4 つ。
- 破綻しやすかったのは、theme sync、semantic color refactor、見た目調整、無関係な UI 修正を同時に進めた時。
- 次の repo では、`baseline 固定` → `import core` → `theme sync only` → `semantic token` → `release 整備` の順で進めた方が安全。

## この repo でうまく機能したもの

### 1. import 対象を color token に絞ったこと

- Phase 1 のスコープを color import に絞ったことで、README、fixtures、スクリーンショット、手動検証の説明が揃えやすかった。
- 「何ができるか」と「何はまだできないか」を明文化できたので、公開文言が実装を追い越しにくかった。

関連:

- [README](../../README.md)
- [Release Check](../issues/34-release-check.md)

### 2. UI 状態を HTML workbench で先に整理したこと

- JSON import の Ideal / Blank / Loading / Partial / Error を、実装より先に見える形で整理できた。
- warning / notice / error のコピーや、ユーザーが次に取るべき行動を会話だけでなく UI で詰められた。
- theme 検討でも、色決定用の workbench と handoff JSON があることで、議論と実装を切り分けやすかった。

関連:

- [UI State Workbench](../ui-state-workbench.html)
- Theme Token Workbench / Handoff はディレクトリ整理で削除済み

### 3. 技術検証を issue / spike として分離したこと

- Framer Plugin API の制約を、いきなり本実装に混ぜずに検証ログへ逃がせた。
- product promise と API reality の間にクッションが入ったので、判断の保留と前進を両立しやすかった。
- 「Codex が進められる作業」と「Kaon の手動確認が必要な作業」を分ける運用も機能した。

関連:

- [Technical Validation Plan](./08-technical-validation-plan.md)
- [Codex Issue Workflow](./10-codex-issue-workflow.md)
- [Spike README](../spikes/README.md)

### 4. capture mode と baseline screenshot の運用

- scrollable な plugin UI を full-height PNG で残せたのは大きかった。
- 特に theme 対応前に dark baseline を固定したことで、「見た目が良くなった気がする」ではなく「何が変わったか」で話せるようになった。

関連:

- [Issue 28 Phase 0 Dark Baseline](../issues/28-phase0-dark-baseline.md)
- [Light / Dark テーマ対応](./14-light-dark-theme.md)

## つまずいた点と解決策

### 1. スコープを一気に広げると、どこで壊れたかわからなくなる

起きたこと:

- theme を Framer に追従させるだけでよい段階で、semantic color 化、app 全体の visual 調整、editor 周辺の変更まで一気に触りやすかった。
- component 確認面の見た目調整と plugin 本体の見た目調整も混ざりやすく、どちらを正とするか曖昧になった。

解決:

- 一度 rollback し、Phase を切り直した。
- `theme sync only` と `見た目変更` を分離し、対象外も先に明文化した。

次 repo のルール:

- 1 issue で扱う変更軸は 1 つまでに寄せる。
- 「見た目を変えない plumbing」と「色や UI を変える refactor」を別フェーズに分ける。
- 無関係な不具合修正を同じ branch に混ぜない。

関連:

- [Light / Dark テーマ対応](./14-light-dark-theme.md)

### 2. baseline がないまま UI を触ると、修正か劣化か判断できない

起きたこと:

- dark UI を基準に theme 対応へ入ったが、変更前の比較対象が弱いと「何を守るか」が曖昧になる。

解決:

- theme 対応前に Phase 0 として baseline を固定した。
- スクリーンショットと「守るべき見た目」をセットで残した。

次 repo のルール:

- 大きい見た目変更の前に baseline を取得する。
- PNG だけでなく、「変えてよいもの / 変えてはいけないもの」を文章で書く。

関連:

- [Issue 28 Phase 0 Dark Baseline](../issues/28-phase0-dark-baseline.md)

### 3. source of truth を 1 つに決めないと、token 値と docs がずれる

起きたこと:

- workbench 上の色、handoff メモ、実装コードの 3 箇所が並走すると、どれを信じるべきか迷いやすい。

解決:

- `token-workbench-current-data.json` を current data の source of truth とし、workbench は表示用、handoff は実装ルール用と役割を分けた。

次 repo のルール:

- 値そのものの source of truth を 1 ファイルに固定する。
- UI mock、handoff、実装メモは「値の保管場所」ではなく「説明面」として扱う。

関連:

- Theme Token Handoff / JSON Snapshot はディレクトリ整理で削除済み

### 4. API 制約の不確実さを放置すると、商品設計まで揺れる

起きたこと:

- Color Style metadata、疑似リンク、drift detection、usage scan のような Pro 想定機能は、Framer API 側の制約が強く、実装前に成立性を見ないと危ない。

解決:

- Technical Validation を親計画にし、spike ごとに Go / Conditional Go / No Go を記録する形に寄せた。
- 成立しなければ product scope を切り替える前提を先に置いた。

次 repo のルール:

- product の売り文句に関わる API 依存機能は、本実装前に必ず spike を挟む。
- 「できるか」だけでなく「安全に商品化できるか」まで記録する。

関連:

- [Technical Validation Plan](./08-technical-validation-plan.md)

### 5. 自動確認と Framer 実機確認の境界を曖昧にすると、done の定義がぶれる

起きたこと:

- catalog、docs、tests が揃っていても、permission や実 import 結果の最終確認は Framer 実機が必要だった。
- ここを混ぜると、Codex 側では完了したつもりでも release readiness が不明瞭になる。

解決:

- `needs-framer-manual-check` や release check 文書で、Codex で揃える証跡と Kaon の手動確認項目を分離した。

次 repo のルール:

- 機械確認、ローカル UI 確認、Framer 実機確認、Marketplace 入稿確認を最初から別物として扱う。
- issue を close できる条件に「誰の確認が残っているか」を含める。

関連:

- [Codex Issue Workflow](./10-codex-issue-workflow.md)
- [Release Check](../issues/34-release-check.md)

### 6. docs の入口が 1 つに揃っていないと、知見が散らかる

起きたこと:

- doc hub の名前や導線が揺れると、README、Docsify sidebar、issue 文書のどれが入口か迷いやすかった。

解決:

- `docs/index.html` の Docsify を入口に固定し、文書追加時に sidebar を同時更新するルールへ寄せた。

次 repo のルール:

- day 1 で docs entrypoint を 1 つ決める。
- 「文書を増やす」と「入口を更新する」を同じ完了条件にする。

関連:

- [Docsify Home](../README.md)
- [仕様パック README](./README.md)

### 7. repo / branch / runtime の前提ズレは、思った以上に時間を食う

起きたこと:

- repo の移設、worktree、Node / npm version 差分、権限付き path など、実装以外の前提差分で詰まりやすかった。

解決:

- path、branch、`main` 同期、cleanup、docs server と plugin server の分離を明文化した。

次 repo のルール:

- 最初に `cwd`、branch、Node / npm version、dev server の責務分離を確認する。
- Cloud Drive や特殊 path に依存するなら、branch 作成や lock file の挙動まで先に試す。

関連:

- [Git Workflow](./13-git-workflow.md)

### 8. ambition が実装を追い越すと、公開文言が危険になる

起きたこと:

- Manager、audit、sync まで見据えた議論は価値があった一方で、実装済み scope 以上を README や Marketplace に書くと期待値がずれる。

解決:

- release check で「color import 中心の表現に留める」基準を固定した。

次 repo のルール:

- README と Marketplace copy は、現在のリリース実装だけを基準に書く。
- 将来構想は roadmap や spec に逃がし、公開面には混ぜない。

関連:

- [README](../../README.md)
- [Release Check](../issues/34-release-check.md)

## 次の repo で最初に用意したい最小セット

1. `README.md`
   実装スコープ、既知の制約、起動コマンドだけを最初から短く明記する。
2. `docs/index.html`
   ドキュメントの入口を最初に固定する。
3. HTML workbench
   UI state、copy、theme、token 表の議論をコード本体から切り離す。
4. `fixtures/`
   happy path、warning、invalid JSON、conflict、light/dark を最初から分ける。
5. technical validation の親計画
   API 依存の強い機能は先に spike 化する。
6. screenshot capture
   baseline と regression 比較をできる状態にしておく。
7. issue / branch / PR の最小運用
   1 branch 1 purpose、`main` 直コミット禁止、manual check の明示。

## 次の repo での実装順メモ

### 全体像先行か、コンポーネント先行か

この手の plugin では、`全体像を薄く先に作る` 方が進めやすい。
ただし、完成版の画面を最初から全部作るのではなく、最初に必要なのは次の骨組みだけ。

- app shell
- 主要操作の流れ
- UI stack 5 状態
- Framer 実機確認が必要な境界
- baseline screenshot の取得ポイント

その上で、表示責務がはっきりしたコンポーネントを 1 つずつ切り出して詰める方が安全だった。

理由:

- Framer theme、permission、import 実行、summary 表示は画面全体の flow に依存しやすい
- コンポーネントだけを先に精密化しても、最後に app へ戻した時に責務や state の持ち方がズレやすい
- 逆に app 全体を先に重く作り込みすぎると、副作用が連鎖して壊れやすい

次 repo のおすすめ順:

1. HTML workbench で flow と 5 状態を先に固める
2. app shell と薄い runtime flow を先に通す
3. button、toggle、stats、card、dialog など Framer 非依存寄りの部品を個別に詰める
4. 早めに app へ戻して再結合する
5. Framer 依存部分だけを最後まで別枠で manual check する

### component catalog の位置づけ

- component catalog は、部品単位の見た目、props、focus、状態差分を見る面として使う
- plugin 全体の正しさを保証する場所にはしない
- `framer.showUI`、`createColorStyle`、`notify`、permission、iframe 固有挙動は引き続き Framer 実機で確認する

## Figma で作り込む範囲の目安

次の repo では、`コンポーネントの状態` と `semantic color` までしっかり作る方針はかなり良い。
この repo の反省とも相性がよい。

### Figma でしっかり決めてよいもの

- component anatomy
- size variation
- default / hover / active / disabled / focus-visible / selected
- TokenCard や list item の variant
- dialog / summary panel / header などの stable UI surface
- semantic color token の命名
- light / dark の token 対応
- spacing、radius、typography の基準

### Figma で決めすぎない方がよいもの

- JSON import の全分岐を含む細かい runtime flow
- notice / warning / error catalog の全文管理
- fixture ごとの差分を含む複雑な partial state
- Framer permission、API 制約、実 import 結果に依存する挙動
- 仕様が揺れている段階の細かい copy

これらは Figma より、HTML workbench、fixture、実装側の story、実機検証メモで持つ方が運用しやすかった。

### 次 repo 向けのおすすめ分担

- Figma:
  semantic color、component states、stable layout、design system rule を決める
- HTML workbench:
  flow、5 状態、warning/error の出し分け、文言、一覧比較を詰める
- runtime code:
  実際の state 遷移、Framer API 接続、manual check が必要な境界を実装する

### 一言でいうと

Figma は `見た目と部品の契約を固める場所` までは深く作り込んでよい。
ただし `実行時の振る舞いまで全部 Figma で持つ` のは重くなりやすい。

## 次 repo 向け issue 分解案

以下は、次の repo を始める時のおすすめ分解。
`Figma と HTML workbench と runtime code を別責務で進める` 前提にしている。

### Issue 1. repo bootstrap と docs entrypoint を作る

目的:

- repo の入口と運用ルールを day 1 で固定する

含めるもの:

- `README.md`
- `docs/index.html`
- docs の基本分類
- branch / issue / manual check の最小ルール

完了条件:

- 新しく入った人が `README` と Docsify sidebar を見れば迷わない
- docs の追加先と update rule が決まっている

### Issue 2. UI flow workbench と fixture を作る

目的:

- 実装前に flow と 5 状態を見える形で固める

含めるもの:

- HTML workbench
- Ideal / Blank / Loading / Partial / Error
- happy path / warning / invalid / conflict / light-dark fixture
- notice / warning / error の分類表

完了条件:

- JSON import の主要 flow が workbench で追える
- どの fixture でどの状態を再現するか決まっている

### Issue 3. Figma foundations を作る

目的:

- semantic color と基礎 token を先に固める

含めるもの:

- color semantic token
- light / dark token 対応
- typography
- spacing
- radius
- layer / surface の naming rule

完了条件:

- Figma 上で semantic token 名が決まっている
- light / dark の token 体系がぶれずに説明できる
- raw color を直接増やさない前提が共有されている

### Issue 4. Figma component states を作る

目的:

- stable UI surface の契約を Figma 上で固める

含めるもの:

- button
- file button
- select / input
- language toggle
- token card / token row
- stats item
- dialog / summary panel
- default / hover / active / disabled / focus-visible / selected

完了条件:

- 主要コンポーネントの state が Figma 上で揃っている
- 実装時に variant と state の迷いが減る

### Issue 5. plugin shell と薄い runtime flow を通す

目的:

- 全体像を早く 1 回つなぎ、責務のズレを減らす

含めるもの:

- app shell
- header
- editor area
- preview area
- footer action
- 仮の state でよいので遷移の骨組みを通す

完了条件:

- 実データ未接続でも plugin 全体の骨格が見える
- state をどこで持つかが決まる

### Issue 6. UI primitives と component surface を実装する

目的:

- Figma で決めた部品をコードへ安全に移す

含めるもの:

- `ui.tsx` 系の primitive
- button / form control / dialog shell
- story または browser workbench などの component 確認面
- focus-visible / keyboard / a11y の基本確認

完了条件:

- Framer 非依存の部品が個別に確認できる
- app 側の直書き class が増えすぎない

### Issue 7. theme sync only を実装する

目的:

- 見た目変更と切り離して、Framer theme 受け取りだけ先に通す

含めるもの:

- `data-framer-theme` の受け取り
- `html[data-theme]` 反映
- fallback
- baseline screenshot の取得

完了条件:

- theme 未取得時の fallback を含めて安全に切り替わる
- dark baseline が比較対象として固定される

### Issue 8. semantic color layer を実装し、core UI へ適用する

目的:

- Figma で決めた semantic color を runtime code に接続する

含めるもの:

- `tokens.css` などの semantic token 定義
- surface / text / border / accent / status / code
- app shell、button、dialog、preview、editor への段階適用

完了条件:

- raw color 直書きが減り、semantic token 経由で説明できる
- light / dark の UI 差分が token で追える

### Issue 9. JSON import flow と preview states を実装する

目的:

- この plugin の中核 flow を完成に近づける

含めるもの:

- parse
- upload
- conflict check
- warning / error 表示
- summary
- import 実行前後の state 遷移

完了条件:

- happy path / invalid / conflict / partial が再現できる
- workbench と runtime UI の状態差が大きくない

### Issue 10. Framer runtime validation と release check を行う

目的:

- code / docs / Figma の整合を実機で確定する

含めるもの:

- Framer 実機での import
- permission / notify / summary / theme の確認
- screenshot 更新
- README / docs / Marketplace 文言の整合確認

完了条件:

- Codex で揃えられる証跡と Kaon manual check が分離されている
- 公開面の表現が実装を超えていない

### 進め方の目安

- 先に着手: Issue 1, Issue 2, Issue 3
- その次: Issue 4, Issue 5
- 実装の中核: Issue 6, Issue 7, Issue 8, Issue 9
- 仕上げ: Issue 10

### 分ける時の注意

- Figma issue に runtime copy の全文や warning catalog 全部を入れない
- theme sync issue に semantic refactor を混ぜない
- component issue に Framer API integration を混ぜない
- release issue に未実装機能の marketing 文言を混ぜない

## 引き継ぎたい考え方

- UI 状態は 5 状態で扱う: Ideal / Blank / Loading / Partial / Error
- docs は hub を入口にし、追加時に導線も同時更新する
- theme 対応は baseline 固定と phase 分割を前提にする
- source of truth と説明用 artifact を分ける
- Framer 実機確認が必要な点は Codex 完了条件に混ぜない
- 実装は `薄い全体像` を先に通し、その後でコンポーネントを詰める
- Figma は component states と semantic color までを厚めに作り、複雑な runtime state は workbench 側へ逃がす

## 持ち込まない方がよいもの

- 途中経過の visual tweak を積み上げた状態のままの theme 実装
- 「あとで整える前提」で広げた scope
- 実装済みと未実装が混ざった公開向け copy

## 参考文書

- [08 Technical Validation Plan](./08-technical-validation-plan.md)
- [10 Codex Issue Workflow](./10-codex-issue-workflow.md)
- [13 Git Workflow](./13-git-workflow.md)
- [14 Light / Dark テーマ対応](./14-light-dark-theme.md)
- [Issue 28 Phase 0 Dark Baseline](../issues/28-phase0-dark-baseline.md)
- [Issue 34 Release Check](../issues/34-release-check.md)
- Theme Token Workbench Handoff はディレクトリ整理で削除済み
