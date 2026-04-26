# 技術検証計画

## 目的

この検証の目的は、Pro 版の中核価値である **Variables-like Color Style Manager** と **カラー監査 / リント** が Framer Plugin API の制約内で成立するかを、実装前に短期間で判断することです。

検証する仮説:

> Framer の Color Styles を、プラグイン側のメタデータによって primitive / semantic の依存グラフとして管理し、差分検出、同期、監査、修正支援まで提供できる。

この仮説が成立すれば、無料版は JSON カラーインポート、Pro 版はカラー管理・監査・修正支援として設計できます。
成立しない場合は、Pro の軸を監査・レポート中心へ切り替えます。

## 前提

- Framer の Color Style は、ネイティブには別の Color Style を参照できない前提で扱う。
- `semantic -> primitive` の関係は Framer の本物の参照ではなく、プラグインが保存・復元する疑似リンクとして扱う。
- 検証は本体 UI に混ぜず、最小限の spike UI / utility / 手動検証メモとして進める。
- 検証結果は、実装可否だけでなく「どこまでなら安全に商品化できるか」まで記録する。

## 成果物

- `docs/spikes/` 配下の検証ログ
- 必要に応じた `src/spikes/` 配下の検証用コード
- API 制約と未対応範囲の一覧
- Free / Pro スコープの更新判断
- 次フェーズの実装タスク一覧

推奨ファイル:

- `docs/spikes/01-color-style-metadata.md`
- `docs/spikes/02-color-style-linking.md`
- `docs/spikes/03-drift-detection.md`
- `docs/spikes/04-color-usage-scan.md`
- `docs/spikes/05-replace-actions.md`
- `docs/spikes/06-scale-performance.md`

## 検証の進め方

各 spike は次の形式で記録します。

```md
# Spike: <検証名>

## 検証日

## 検証環境
- Framer Plugin SDK version:
- Framer project:
- Browser / OS:

## 仮説

## 手順

## 結果

## 成功条件との差分

## 制約 / 失敗ケース

## 判断
- Go / Conditional Go / No Go

## 次アクション
```

判断基準:

- `Go`: 商品機能として実装してよい。
- `Conditional Go`: 制約を UI / 文言 / 対象範囲で明示すれば実装してよい。
- `No Go`: 中核機能としては採用しない。代替案へ切り替える。

## フェーズ 0: 準備

目的:

- 技術検証を本体実装から切り離し、結果を記録できる状態にする。

タスク:

- `docs/spikes/` を作成する。
- 必要なら `src/spikes/` を作成する。
- 検証用 Framer プロジェクトを 1 つ用意する。
- 検証用カラーセットを作る。

検証用カラーセット例:

- `primitive/blue/500`
- `primitive/blue/600`
- `primitive/gray/0`
- `primitive/gray/900`
- `semantic/background/page`
- `semantic/text/body`
- `semantic/action/primary`
- light / dark のペアを持つ semantic token
- primitive を参照する semantic token
- 存在しない primitive を参照する broken semantic token

完了条件:

- spike ごとの記録ファイルが作れる。
- 手動検証に使う Framer プロジェクトが決まっている。
- 検証用 JSON / Color Styles の初期状態を再現できる。

## フェーズ 1: Color Style メタデータ保存

目的:

- Color Style に token id、source path、alias、kind などのプラグインメタデータを保存し、再取得できるか確認する。

検証すること:

- `ColorStyle.setPluginData` で metadata を保存できるか。
- `ColorStyle.getPluginData` で metadata を再取得できるか。
- plugin を閉じて開き直しても metadata が残るか。
- Color Style の rename 後も style id と metadata が維持されるか。
- Color Style の delete 後に missing style として扱えるか。
- Color Style の duplicate 後に metadata が複製されるか、欠落するか、別 id として見えるか。

保存する metadata 案:

```json
{
  "schemaVersion": 1,
  "tokenId": "semantic.action.primary",
  "sourcePath": "semantic.action.primary",
  "stylePath": "semantic/action/primary",
  "kind": "semantic",
  "aliasPath": "primitive.blue.500",
  "sourceValue": "{primitive.blue.500}",
  "resolvedLight": "rgba(0, 102, 255, 1)",
  "resolvedDark": "rgba(77, 148, 255, 1)",
  "importedAt": "2026-04-15T00:00:00.000Z"
}
```

成功条件:

- metadata を Color Style 単位で保存・復元できる。
- rename ではリンク情報が壊れない。
- delete は missing として検出できる。
- duplicate の挙動を仕様として説明できる。

失敗時の代替案:

- Color Style 単位の metadata が不安定な場合、project-level `framer.setPluginData` に style id map を保存する。
- style id が不安定な場合、style path と token id の複合キーで復元する。
- duplicate の扱いが不明瞭な場合、duplicate は unmanaged copy として警告する。

## フェーズ 2: primitive / semantic 疑似リンク同期

目的:

- primitive の値を変更したとき、依存する semantic Color Style の実値をプラグインが更新できるか確認する。

検証すること:

- primitive style の `light` / `dark` を変更できるか。
- metadata から dependent semantic styles を逆引きできるか。
- semantic style の `light` / `dark` を `setAttributes` で更新できるか。
- semantic style を使用しているキャンバス上のレイヤー表示が更新されるか。
- 複数 semantic styles の batch update が安全に実行できるか。
- 途中失敗した場合に partial update を検出できるか。

成功条件:

- `primitive -> semantic` の一方向同期が成立する。
- semantic style を使っているレイヤーの見た目も追従する。
- 更新結果として created / updated / skipped / failed を記録できる。
- 失敗した style をユーザーに提示できる。

失敗時の代替案:

- 自動同期ではなく、差分検出と `Apply updates` ボタンにする。
- 複数更新が不安定なら、1 style ずつ確認しながら更新する。
- レイヤー表示更新が遅延する場合は、UI 上で refresh / reopen を案内する。

## フェーズ 3: drift detection

目的:

- Framer 側で手動編集された Color Style と、プラグインが期待する token state のズレを検出できるか確認する。

検証する状態:

- `Synced`: metadata の expected value と実値が一致している。
- `Primitive changed`: primitive の値が metadata と異なる。
- `Semantic outdated`: semantic の値が参照 primitive の現在値と異なる。
- `Semantic manually changed`: semantic が手動で別値に変更されている。
- `Missing primitive`: alias 先の primitive style が存在しない。
- `Missing semantic`: metadata 上は存在する semantic style が削除されている。
- `Metadata missing`: Color Style はあるが plugin metadata がない。
- `Unmanaged style`: plugin 管理外の Color Style。

検証すること:

- Framer UI で primitive を手動編集した場合に検出できるか。
- Framer UI で semantic を手動編集した場合に検出できるか。
- rename 後に token relation を復元できるか。
- delete 後に missing dependency を表示できるか。
- plugin metadata が欠落している style を安全に扱えるか。

成功条件:

- 最低でも `Synced` / `Outdated` / `Missing dependency` / `Unmanaged` を区別できる。
- Pro の Manager UI でユーザーが次に取るべき操作を判断できる。
- 自動修復できないケースを警告として明示できる。

失敗時の代替案:

- drift detection を簡略化し、`matches expected` / `does not match expected` の二値判定にする。
- 手動編集の原因推定は行わず、差分だけを表示する。
- metadata がない style は import source との path match のみで復元候補にする。

## フェーズ 4: color usage scan

目的:

- Framer プロジェクト内の color 使用箇所をどこまで検出できるか確認する。

検証対象:

- frame background color
- text color
- border color
- gradient color stops
- SVG fill / stroke
- component props の color control
- CMS color field
- raw HEX / RGB / HSL / OKLCH
- ColorStyle 参照
- ColorVariable 参照が存在する場合の扱い

検証すること:

- project-wide に nodes を取得できるか。
- selection scope で nodes を取得できるか。
- どの属性が API から読めるか。
- raw color と ColorStyle reference を区別できるか。
- ColorStyle id / path / name を usage に紐づけられるか。
- 取得できない color source を明確に分類できるか。

成功条件:

- MVP 監査として background / text / border の raw color と ColorStyle 使用を検出できる。
- 未対応領域を仕様として列挙できる。
- false positive / false negative の傾向を記録できる。

失敗時の代替案:

- project-wide 監査ではなく、selection-based audit から始める。
- text / component props が弱い場合、background / border 監査に限定する。
- 検出できない領域を `Not scannable by Framer API` として明示する。

## フェーズ 5: replace / fix actions

目的:

- 検出した raw color や primitive misuse を、semantic Color Style へ安全に置換できるか確認する。

検証すること:

- raw background color を ColorStyle 参照へ置換できるか。
- raw text color を ColorStyle 参照へ置換できるか。
- raw border color を ColorStyle 参照へ置換できるか。
- gradient color stop を置換できるか。
- 複数 node の bulk replace が安全に実行できるか。
- 置換前 preview と置換後 summary を作れるか。
- undo / failure / partial update の挙動を確認する。

成功条件:

- 少なくとも background / border / text の主要ケースで置換できる。
- 置換対象と置換後 style を事前確認できる。
- failed node を report できる。
- bulk 操作の安全性を説明できる。

失敗時の代替案:

- 初期 Pro は検出のみとし、fix actions は later に回す。
- bulk replace ではなく、1 件ずつの apply にする。
- 修正候補の提示だけ行い、Framer UI での手動修正を案内する。

## フェーズ 6: scale / performance

目的:

- 実案件サイズの Color Styles / nodes に対して、scan / sync / audit が実用速度で動くか確認する。

検証データ目安:

- 100 Color Styles
- 500 Color Styles
- 1,000 nodes
- 5,000 nodes
- 10,000 nodes
- 100 raw color usages
- 1,000 raw color usages

検証すること:

- 初回 scan 時間
- 差分 scan 時間
- sync 実行時間
- UI の固まりやすさ
- progress 表示の必要性
- キャンセル処理の必要性
- memory / large metadata の扱い

成功条件:

- 小規模 project では待ち時間が短い。
- 中規模 project では progress 表示があれば許容できる。
- 大規模 project で project-wide scan が重い場合、selection scan / incremental scan に切り替える判断ができる。

失敗時の代替案:

- 初期版は selection-based audit に限定する。
- project-wide scan は Pro beta / experimental として扱う。
- scan cache を project-level plugin data に保存する。

## フェーズ 7: product decision gate

目的:

- 技術検証結果をもとに、Free / Pro の実装スコープを確定する。

判断パターン:

### Full Go

条件:

- Color Style metadata が安定している。
- primitive / semantic 疑似リンク同期が成立する。
- drift detection が実用的に成立する。
- usage scan が主要属性で成立する。
- replace actions が主要属性で成立する。

進め方:

- Free: JSON color importer
- Pro: Color Manager + Audit + Fix Actions

### Manager-lite

条件:

- metadata と drift detection は成立する。
- 自動同期や replace actions に制約がある。

進め方:

- Free: JSON color importer
- Pro: Color Manager + 差分検出 + 手動 apply + Audit

### Audit-only Pro

条件:

- semantic / primitive の疑似リンク管理が不安定。
- usage scan は成立する。

進め方:

- Free: JSON color importer
- Pro: Audit + Report + naming / theme lint

### Importer-only MVP

条件:

- metadata / scan / replace の制約が強い。
- Pro 機能の品質保証が難しい。

進め方:

- まず Free importer として公開し、需要検証に集中する。
- Pro は再設計する。

## 優先順位

最優先:

1. Color Style metadata 保存 / 復元
2. primitive / semantic 疑似リンク同期
3. drift detection

次点:

4. color usage scan
5. replace / fix actions
6. scale / performance

理由:

- 1〜3 は Variables-like Color Manager の成立条件。
- 4〜5 は Audit / Lint / Fix Actions の成立条件。
- 6 は product scope と UX の調整条件。

## タスク管理方法

### 推奨: docs-first + GitHub Issues

現時点では、Notion よりも `docs-first + GitHub Issues` が扱いやすいです。

理由:

- 検証結果がリポジトリに残る。
- 実装コード、仕様、検証ログを同じ pull request で管理できる。
- 技術的な判断の履歴が Git に残る。
- 後で issue / milestone / project board に展開しやすい。

運用案:

- `docs/specs/08-technical-validation-plan.md` を親計画にする。
- 各 spike を GitHub Issue 1 件として作る。
- issue title は `Spike: Color Style metadata persistence` のようにする。
- issue の完了条件に、このドキュメントの成功条件を貼る。
- 検証結果は `docs/spikes/*.md` に書き、issue からリンクする。
- 実装が必要な spike は小さな branch / PR に分ける。

### Notion が向いているケース

Notion は次の状況なら有効です。

- ユーザーインタビュー、価格仮説、競合調査も同じ場所で管理したい。
- 開発者以外のメンバーとロードマップを共有したい。
- カンバン、優先度、ステータス、メモを非エンジニアにも見やすくしたい。

ただし、技術検証の一次情報は Notion だけに置かない方がよいです。
API 制約、再現手順、検証コードとの対応は repository に残した方が後で強いです。

### 最小運用

個人開発なら、まずはこれで十分です。

```text
docs/specs/08-technical-validation-plan.md  親計画
docs/spikes/*.md                           検証ログ
GitHub Issues                              タスク / 状態管理
GitHub Milestone: Technical Validation      進捗管理
```

### タスクテンプレート

```md
## Goal

## Scope

## Steps

## Success Criteria

## Evidence
- docs/spikes/xx-xxx.md
- relevant code / branch / PR

## Decision
- Go / Conditional Go / No Go

## Follow-up Tasks
```

## 初回タスク一覧

| ID | タスク | 種別 | 優先度 | 成功条件 | 成果物 |
| --- | --- | --- | --- | --- | --- |
| TV-00 | 検証環境とログ置き場を準備する | setup | P0 | 検証 project と docs/spikes がある | `docs/spikes/00-validation-setup.md` |
| TV-01 | Color Style metadata の保存・復元を検証する | spike | P0 | rename / reopen 後も metadata を読める | `docs/spikes/01-color-style-metadata.md` |
| TV-02 | duplicate / delete 後の metadata 挙動を確認する | spike | P0 | duplicate / delete の仕様判断ができる | `docs/spikes/01-color-style-metadata.md` |
| TV-03 | primitive / semantic 疑似リンク同期を検証する | spike | P0 | primitive 変更を semantic に反映できる | `docs/spikes/02-color-style-linking.md` |
| TV-04 | drift detection を検証する | spike | P0 | synced / outdated / missing を区別できる | `docs/spikes/03-drift-detection.md` |
| TV-05 | color usage scan の取得範囲を検証する | spike | P1 | background / text / border の取得可否が分かる | `docs/spikes/04-color-usage-scan.md` |
| TV-06 | raw color replacement を検証する | spike | P1 | 主要属性を ColorStyle へ置換できるか分かる | `docs/spikes/05-replace-actions.md` |
| TV-07 | 大規模 project の scan 性能を検証する | spike | P2 | project-wide / selection scan の方針が決まる | `docs/spikes/06-scale-performance.md` |
| TV-08 | 検証結果から Free / Pro スコープを更新する | decision | P0 | Full Go / Manager-lite / Audit-only / Importer-only を選ぶ | specs update |

## 推奨スケジュール

### Day 1

- TV-00
- TV-01
- TV-02

判断:

- Color Style metadata を信頼できるか。

### Day 2

- TV-03
- TV-04

判断:

- Variables-like Color Manager を Pro の核にできるか。

### Day 3

- TV-05
- TV-06

判断:

- Audit / Lint / Fix Actions を Pro の核にできるか。

### Day 4

- TV-07
- TV-08

判断:

- Free / Pro の初期スコープを確定する。
- 実装ロードマップを更新する。

## 実装に入る条件

実装に入ってよい条件:

- TV-01〜TV-04 の結果が `Go` または `Conditional Go` である。
- `Conditional Go` の制約が UI 文言と仕様に反映されている。
- Pro の売り文句が API 実態を超えていない。
- 未対応範囲が README / docs / UI 上で説明できる。

実装を止める条件:

- metadata が安定保存できない。
- style id / path の復元が不安定で、ユーザーの既存 styles を壊す可能性がある。
- bulk update が失敗時に追跡できない。
- usage scan の false positive / false negative が多く、監査結果を信頼できない。

## 命名とポジショニング上の注意

避ける表現:

- `Framer Variables を追加する`
- `Color Styles が本当に参照関係を持つ`
- `Figma Variables と同じ`

使う表現:

- `Variables-like Color Style Manager`
- `Semantic color link layer for Framer`
- `Manage primitive / semantic color relationships in Framer`
- `Detect drift between imported tokens and Framer Color Styles`

理由:

- Framer のネイティブ参照ではなく、プラグイン管理の疑似リンクであるため。
- 実態を超えた表現にすると、購入後の期待値不一致が起きる。
