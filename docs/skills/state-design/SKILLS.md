# State Design Workbench Skill Draft

## Purpose

UI状態設計、error / warningカタログ、状態遷移の壁打ちを、ローカルHTML作業台を見ながら進めるための汎用ワークフロー。

この下書きは、将来的にCodex Skillの `SKILL.md` として切り出す候補。

## When To Use

- UIの状態管理を整理したいとき
- error / warning / notice の分類を設計したいとき
- 仕様書を書く前に、テーブルを見ながら壁打ちしたいとき
- 状態、判定条件、CTA、復帰導線を同じ画面で確認したいとき
- FigmaやFigJamよりも、HTMLプレビューで軽く更新しながら進めたいとき

## Core Workflow

1. ローカルHTMLの作業台を作成する。
2. ブラウザまたはIABでHTMLを開く。
3. 会話で状態やカタログを壁打ちする。
4. 決まった内容をHTMLのテーブルへ反映する。
5. 汎用化できる判断軸や定義は、このSkill下書きへ移す。

## Workbench Requirements

- 1ファイルHTMLで開けること。
- サーバー起動を必須にしないこと。
- テーブルセルやメモ欄はブラウザ上で直接編集できること。
- 編集内容を一時保存する場合は `localStorage` を使うこと。
- ソースとして残すべき変更は、会話で確認してからHTMLへ反映すること。
- プロジェクト固有の仕様と、汎用ルールを混ぜすぎないこと。

## Standard UI Stack

状態設計では、まず以下の5パターンを基本形として使う。

| UI stack | 日本語名 | 状態の定義 | UIで必要な役割 |
|---|---|---|---|
| Ideal State | 理想状態 | 全てのデータが揃い、正常に動作する最終目標の状態。 | 正常に完了していること、次に実行できる主要操作を明確にする。 |
| Blank / Empty State | 空状態 | データが何も登録されていない初期状態。 | ユーザーを次の行動へ導く誘導UIを表示する。 |
| Loading State | 読み込み中状態 | データ取得中の待ち時間。 | スケルトンやスピナーを使って不安を軽減する。 |
| Partial State | 部分的状態 | データは一部あるが不完全で、エラーも混在している状態。 | 改善を促すメッセージを表示する。 |
| Error State | エラー状態 | 何らかの失敗が発生した状態。 | 原因説明とリトライ手段を提供する。 |

## Recommended Tables

### UI Stack Table

| Column | Purpose |
|---|---|
| `ui_stack` | 5パターンのどれに属するか |
| `japanese_name` | 日本語での状態名 |
| `definition` | 状態の定義 |
| `ui_role` | UIが担う役割 |

### State Table

| Column | Purpose |
|---|---|
| `state_id` | 状態の一意ID |
| `ui_stack` | Ideal / Blank / Loading / Partial / Error |
| `condition` | その状態になる判定条件 |
| `availability` | 実行可否、保存可否、Import可否など |
| `primary_message` | 主要メッセージ |
| `primary_cta` | 主要アクション |
| `secondary_actions` | 補助アクション |
| `catalog_refs` | 紐づく error / warning / notice ID |
| `recovery_path` | 復帰導線 |
| `notes` | 未決定メモ |

### Catalog Table

| Column | Purpose |
|---|---|
| `catalog_id` | `error.*` / `warning.*` / `notice.*` など |
| `severity` | error / warning / notice |
| `trigger_stage` | parse / validate / pre-submit / import など、どの段階で発生するか |
| `title` | 短い表示名 |
| `condition` | 発生条件 |
| `user_message` | ユーザーに出す文言 |
| `system_behavior` | システム側の扱い |
| `resolution_type` | 自動skip / 確認のみ / ユーザー選択 / retry必須 など、解決に必要な操作種別 |
| `blocking` | 処理を止めるか |
| `recovery_path` | ユーザーが解決する手段 |
| `related_states` | 紐づく状態ID |

### State Flow Map

| Column | Purpose |
|---|---|
| `from_state` | 起点になる状態ID |
| `trigger` | ユーザー操作、API応答、validate結果など |
| `to_state` | 遷移先の状態ID |
| `catalog_refs` | その遷移で発生しうる notice / warning / error ID |
| `notes` | 派生条件や例外 |

状態からcatalogへの派生が見えにくい場合は、テーブルだけでなく `from_state -> trigger -> to_state -> catalog_refs` の簡易フローをHTML作業台に追加する。

## Classification Rules

- 処理を続行できるなら、基本は `Partial State` と `warning.*` に寄せる。
- 処理を続行できないなら、`Error State` と `error.*` にする。
- まだユーザーが何もしていない状態は、失敗ではなく `Blank / Empty State` として扱う。
- 待ち時間が主問題なら、`Loading State` として扱う。
- 成功だけでなく、次に何ができるかまで明確なら `Ideal State` として扱う。
- noticeは「処理は正常に進むが、ユーザーに知らせる価値がある自動変換・補足情報」として扱う。
- warningは「無視してよい」ではなく、「処理は可能だが確認・改善の余地がある」と定義する。
- warningの中でも、ユーザー判断が必要なものは自動skip系と分けて表示する。例: どの候補を採用するか、既存データを保持するか置換するか。
- `warning.duplicate_style_name` と `warning.existing_style_conflict` は、通常のwarning一覧ではなく conflict としてユーザーに提示し、プレビュー上で択一してもらう形式にする。
- errorは原因説明と復帰導線を必ずセットで設計する。
- 対称に見える欠損でも、プロダクト側の基準値やfallback要件によって重大度が変わる。例: light-onlyは単色運用として成立しうるためcatalog化しないが、dark-onlyは基準となるlightがないためnotice / warning対象になりうる。
- 内部概念としてaliasを使う場合でも、ユーザー向け文言では「参照先のトークン」のように、機能を知らない人にも意味が通る表現へ置き換える。
- インポート対象を登録する順序は、入力JSONの記述順に依存させず、生成後のpathを自然順でソートする。例: `blue.100` / `blue.200` / `blue.500`。

## Wall-Discussion Prompts

状態設計で迷ったら、以下の問いから始める。

- これはユーザーが次の操作を実行できる状態か？
- できない場合、それは待ち時間か、初期状態か、失敗か？
- 一部だけ成功しているなら、何を成功扱いにして、何を警告扱いにするか？
- この状態で主CTAは何か？
- ユーザーに原因を説明する必要があるか？
- 復帰導線はリトライ、再選択、修正、スキップのどれか？
- カタログIDとして再利用できる粒度か？

## Output Style

- まずテーブルで整理する。
- 長い文章より、判定条件、CTA、復帰導線を優先する。
- 壁打ち中は未決定のまま残してよい。
- 決定済み、未決定、要検証が見分けられるようにする。
- プロダクト固有の表現は作業台HTML側に置き、汎用ルールはこのファイルへ集約する。

## Current Project Example

現在の作業台:

- `ui-state-workbench.html`

現在の対象:

- JSONインポートエリア
- UI stack 5パターン
- JSONインポート状態テーブル
- Warning / Error Catalog
- 未決定メモ
