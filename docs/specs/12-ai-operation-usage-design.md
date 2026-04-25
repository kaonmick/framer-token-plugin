# AI利用ログ / トークン集計の運用設計

作成日: 2026-04-24

## 目的

AIへの依頼内容、使用モデル、トークン消費、成果、手戻りを記録し、モデル選択とチャット運用を感覚ではなくデータで改善する。

この設計では、次の2種類のデータを分けて扱う。

| 種類 | 取れるもの | 取れないもの | 主な用途 |
|---|---|---|---|
| API利用データ | model別 / project別 / 日別のtoken、費用、response単位のusage | 依頼意図、成功度、手戻り理由 | 費用・トークン量の定量把握 |
| 作業ログ | 指示の種類、作業難易度、成果、手戻り、運用メモ | 正確な課金額は別計算が必要 | モデル選択・依頼方法の改善 |

結論として、**Usage / Costs APIで数値を取り、手元の作業ログで文脈を補う**。

## 収集方針

### 1. 全文保存を標準にしない

プロンプト全文や会話全文は、検索性よりもノイズ、漏洩リスク、レビュー負荷が大きい。

標準ログでは次だけ残す。

- 指示の短い要約
- 作業種別
- 使用モデル
- token / cost
- 成果
- 手戻り回数
- 判断メモ

全文が必要な場合だけ、`sampled_prompt_ref` に別ファイルや会話IDを残す。

### 2. 1リクエスト単位と1作業単位を分ける

APIでは1回のresponseごとにusageが出る。一方、実際の運用判断では「1つの作業が何往復で終わったか」が重要になる。

| 粒度 | 例 | 使い道 |
|---|---|---|
| request | Responses API 1回 | token、cost、latency、model比較 |
| task | 仕様整理1件、UI修正1件、Issue対応1件 | 成功度、手戻り、モデル運用ルール |

`task_id` を共通キーにして、request logとtask logをあとで結合できるようにする。

## API利用方法

OpenAI APIを使う場合は、次の3箇所からデータを取る。

### 1. Responses APIのresponse usage

アプリや自作scriptからAPIを呼ぶ場合は、responseごとの `usage` を保存する。

記録対象:

- `response.id`
- `model`
- `usage.input_tokens`
- `usage.output_tokens`
- `usage.total_tokens`
- `usage.input_tokens_details.cached_tokens`
- `usage.output_tokens_details.reasoning_tokens`
- `created_at`
- `metadata.task_id`
- `metadata.task_type`
- `metadata.project`

JavaScript例:

```js
import OpenAI from "openai";

const client = new OpenAI();

const taskId = "task_20260424_001";

const response = await client.responses.create({
  model: "gpt-5.4",
  input: "docs/specs/05-business-model.md を要約して、未決定事項を出して",
  metadata: {
    task_id: taskId,
    task_type: "docs_review",
    project: "framer-token-plugin",
  },
});

const usageLog = {
  task_id: taskId,
  response_id: response.id,
  model: response.model,
  input_tokens: response.usage?.input_tokens ?? null,
  cached_input_tokens: response.usage?.input_tokens_details?.cached_tokens ?? null,
  output_tokens: response.usage?.output_tokens ?? null,
  reasoning_tokens: response.usage?.output_tokens_details?.reasoning_tokens ?? null,
  total_tokens: response.usage?.total_tokens ?? null,
};
```

### 2. Organization Usage API

日別、model別、project別などの集計には、Organization Usage APIを使う。

例:

```sh
curl "https://api.openai.com/v1/organization/usage/completions?start_time=1776985200&bucket_width=1d&group_by[]=model&group_by[]=project_id" \
  -H "Authorization: Bearer $OPENAI_ADMIN_KEY"
```

使いどころ:

- model別のinput / output token量
- 日別の使用量推移
- project別の消費
- API key / user / model単位の偏り確認

注意:

- Organization系endpointは、通常のproject API keyではなく、組織レベルの権限を持つkeyが必要になる場合がある。
- ChatGPTやCodexアプリ上の会話が、同じUsage APIで細かく取れるとは限らない。取れない場合は手元のtask logで補う。

### 3. Costs API

費用はCosts APIで取得する。

例:

```sh
curl "https://api.openai.com/v1/organization/costs?start_time=1776985200&bucket_width=1d&group_by[]=project_id" \
  -H "Authorization: Bearer $OPENAI_ADMIN_KEY"
```

使いどころ:

- 月次費用
- project別費用
- token量と実コストの突き合わせ
- 予算超過の早期発見

参考:

- OpenAI API Reference: Usage API  
  https://platform.openai.com/docs/api-reference/usage
- OpenAI API Reference: Costs API  
  https://platform.openai.com/docs/api-reference/usage/costs
- OpenAI API Reference: Responses API  
  https://platform.openai.com/docs/api-reference/responses

## ログ設計

### request log

API response 1回ごとのログ。

| 列 | 例 | 説明 |
|---|---|---|
| request_id | req_001 | ローカル側のID |
| task_id | task_20260424_001 | 作業単位ID |
| response_id | resp_xxx | OpenAI response ID |
| created_at | 2026-04-24T14:10:00+09:00 | 実行日時 |
| model | gpt-5.4 | 使用モデル |
| project | framer-token-plugin | 対象project |
| task_type | docs_review | 作業種別 |
| input_tokens | 12000 | 入力token |
| cached_input_tokens | 7000 | cache対象の入力token |
| output_tokens | 1800 | 出力token |
| reasoning_tokens | 600 | reasoning出力token |
| total_tokens | 13800 | 合計token |
| latency_sec | 34 | 応答時間 |
| tool_count | 3 | tool call数 |
| error_type | rate_limit | 失敗時のみ |

### task log

人間が運用判断に使う作業単位ログ。

| 列 | 例 | 説明 |
|---|---|---|
| task_id | task_20260424_001 | request logと結合するID |
| date | 2026-04-24 | 作業日 |
| channel | Codex | ChatGPT / Codex / API script |
| project | framer-token-plugin | 対象project |
| task_type | docs_design | 作業種別 |
| task_summary | AI利用ログの運用設計を作る | 指示の要約 |
| context_size | large | small / medium / large |
| difficulty | 3 | 1から5 |
| primary_model | gpt-5.4 | 主に使ったモデル |
| request_count | 4 | 何往復したか |
| total_input_tokens | 43000 | request logから集計 |
| total_output_tokens | 7200 | request logから集計 |
| estimated_cost_usd | 1.24 | Costs APIまたは価格表から算出 |
| elapsed_min | 28 | 作業時間 |
| outcome | completed | completed / partial / failed |
| rework_count | 1 | 追加修正回数 |
| quality_score | 4 | 1から5 |
| decision | keep_model | keep_model / downgrade / upgrade / prompt_fix |
| notes | contextを渡しすぎた | 次の改善メモ |

## 作業種別の初期taxonomy

最初から細かく分けすぎない。まずは次で始める。

| task_type | 内容 | 初期モデル方針 |
|---|---|---|
| quick_answer | 短い質問、コマンド確認、軽い説明 | 軽量モデル |
| docs_review | 既存docsの要約、矛盾確認、構成整理 | 標準モデル |
| docs_design | 新しい仕様、運用設計、判断基準作成 | 強めのモデル |
| ui_state_design | UI stack、状態表、文言、画面遷移 | 強めのモデル |
| code_edit | 小さな実装、テスト修正、docs反映 | Codex向けモデル |
| investigation | API仕様調査、外部情報確認、原因調査 | 標準以上 |
| github_ops | issue / PR / comment / handoff | 標準モデル |

20〜30件集めたら、粒度を見直す。

## 統計的に必要な件数

### 前提

AI作業ログはばらつきが大きい。最初から厳密な実験にしすぎると運用が止まるため、次の3段階で考える。

| 段階 | 件数目安 | 目的 |
|---|---:|---|
| Pilot | 20〜30件 | 列、task_type、記録負荷を確認 |
| Baseline | 30件 / 主要task_type | 平均、中央値、P90、失敗パターンを見る |
| Decision | 60〜100件 / 比較対象 | モデル変更や運用ルールを決める |

### 平均token / 平均costを見たい場合

平均値の信頼区間をざっくり見る式:

```text
n ≒ (1.96 * CV / r)^2
```

- `CV`: 変動係数。標準偏差 / 平均。
- `r`: 許容する相対誤差。20%なら `0.20`。

目安:

| ばらつき | CV | ±20%で見る | ±15%で見る | ±10%で見る |
|---|---:|---:|---:|---:|
| 中くらい | 0.6 | 35件 | 62件 | 139件 |
| 大きい | 1.0 | 96件 | 171件 | 384件 |

AI作業はCVが0.6〜1.0程度になりやすいので、**主要task_typeごとに30件で傾向、60件で運用判断、100件で比較**を目安にする。

### 成功率を見たい場合

成功率の誤差をざっくり見る式:

```text
n ≒ p * (1 - p) * (1.96 / E)^2
```

- `p`: 成功率。
- `E`: 許容誤差。10ポイントなら `0.10`。
- 成功率が不明な初期は、最も保守的な `p = 0.5` で見る。

目安:

| 見たい精度 | 必要件数 |
|---|---:|
| ±15ポイント | 43件 |
| ±10ポイント | 96件 |
| ±5ポイント | 385件 |

### モデルA/B比較をしたい場合

成功率の差を見るなら、1群あたりの目安は次。

| 見たい差 | 1モデルあたりの件数目安 |
|---|---:|
| 20ポイント差 | 約75件 |
| 15ポイント差 | 約130件 |
| 10ポイント差 | 約300件 |

小さな差を厳密に証明するには件数が多く必要になる。最初は「統計的有意差」よりも、**費用、手戻り、作業時間、失敗メモが同じ方向を向いているか**を重視する。

## 分析ビュー

最低限見る集計:

| ビュー | 見る指標 | 判断 |
|---|---|---|
| task_type x model | 成功率、rework、cost、P90 token | どの作業にどのモデルを使うか |
| context_size x input_tokens | 成功率、rework | contextを渡しすぎていないか |
| task_type x elapsed_min | 作業時間、手戻り | ChatGPT向きかCodex向きか |
| model x cost | 1完了作業あたり費用 | 高いモデルの価値があるか |
| failure notes | 失敗理由の頻度 | prompt / docs / workflowの改善点 |

平均だけでなく、中央値とP90を見る。

- 中央値: 普段の感覚に近い。
- P90: たまに重くなる作業のコストを把握できる。
- 最大値: 外れ値として別レビューする。

## 実運用へ落とし込むフロー

### Phase 1: 2週間のPilot

目的:

- ログ列が多すぎないか確認する。
- task_typeが実態に合うか確認する。
- API usageと手元task logを結合できるか確認する。

完了条件:

- 20〜30件のtask logがある。
- 主要task_typeが5〜7個に収まっている。
- 記録に1件あたり2分以上かかっていない。

### Phase 2: 4週間のBaseline

目的:

- 主要task_typeごとに30件を目指す。
- model別、task_type別のP50 / P90 costを出す。
- 失敗理由を分類する。

出すもの:

- `task_type -> 推奨モデル`
- `context_size -> 依頼前に削るべき情報`
- `失敗しやすい依頼 -> prompt template`
- `Codex向き / ChatGPT向き / API script向き`

### Phase 3: モデル運用ルールの仮決め

判断基準:

| 条件 | 運用 |
|---|---|
| 軽量モデルで成功率差が5ポイント以内、rework増加が0.3回以内、費用が30%以上安い | 軽量モデルを標準にする |
| 強いモデルでreworkが1回以上減る、または失敗率が10ポイント以上下がる | 強いモデルを標準にする |
| context_size largeで失敗が増える | 先に要約、関連ファイル限定、handoff作成を挟む |
| output_tokensが多いが成果が薄い | 出力形式を表、diff、箇条書きなどに固定する |
| tool_countが多く時間が伸びる | 作業を調査と実装に分ける |

### Phase 4: A/B比較

対象:

- 件数の多いtask_typeだけ。
- 重要度が高い作業だけ。
- 例: `docs_design`, `code_edit`, `ui_state_design`。

方法:

- 同じtask_typeをモデルA/Bへ交互に割り当てる。
- difficultyとcontext_sizeを記録する。
- 1モデルあたり最低30件、できれば60件以上を集める。
- 小さな差ではなく、費用30%以上、成功率10ポイント以上、rework 0.5回以上のような実運用上の差を見る。

### Phase 5: 月次レビュー

毎月見るもの:

- 月間cost
- task_type別cost
- model別成功率
- 1完了作業あたりcost
- P90 tokenが高い作業
- 失敗メモ上位5件
- 翌月の運用変更

レビュー結果は、次のような運用表に落とす。

| 作業 | 標準モデル | 例外 | 依頼テンプレ |
|---|---|---|---|
| 短い質問 | 軽量モデル | 外部調査が必要なら標準 | なし |
| 仕様設計 | 強めのモデル | 既存docs要約だけなら標準 | 背景 / 判断軸 / 出力形式 |
| UI状態設計 | 強めのモデル | 単純な文言修正は標準 | UI stack表 |
| 実装修正 | Codex向けモデル | 小変更は軽量でも可 | 対象ファイル / 完了条件 / 検証 |
| Issue comment | 標準モデル | close判断はKaon確認 | 作業内容 / 根拠 / 確認事項 |

## 最初の実装案

### ファイル構成

```text
logs/
  ai-usage-requests.csv
  ai-usage-tasks.csv
  monthly-summary.md
scripts/
  fetch_openai_usage.py
  summarize_ai_usage.py
docs/
  specs/
    12-ai-operation-usage-design.md
```

### 最初に作るCSV

`ai-usage-tasks.csv`:

```csv
task_id,date,channel,project,task_type,task_summary,context_size,difficulty,primary_model,request_count,total_input_tokens,total_output_tokens,estimated_cost_usd,elapsed_min,outcome,rework_count,quality_score,decision,notes
task_20260424_001,2026-04-24,Codex,framer-token-plugin,docs_design,AI利用ログの運用設計を作る,medium,3,gpt-5.4,1,,,,,completed,0,4,keep_model,
```

`ai-usage-requests.csv`:

```csv
request_id,task_id,response_id,created_at,model,project,task_type,input_tokens,cached_input_tokens,output_tokens,reasoning_tokens,total_tokens,latency_sec,tool_count,error_type
req_20260424_001,task_20260424_001,resp_xxx,2026-04-24T14:10:00+09:00,gpt-5.4,framer-token-plugin,docs_design,12000,7000,1800,600,13800,34,3,
```

## 初期運用ルール

- 1件の作業が終わったらtask logを1行追加する。
- API script経由の作業はrequest logを自動保存する。
- ChatGPT / Codex上の作業は、tokenが自動取得できない場合、task logだけでも残す。
- 週1回、task logの未入力列を埋める。
- 月1回、model / task_type / cost / reworkを集計して運用表を更新する。
- 生プロンプト全文は原則保存しない。必要な場合は、機密を削ったsampleだけ残す。

## 意思決定の形

最終的には、次の4つに落とし込む。

1. **モデルルーティング表**  
   作業種別ごとに標準モデル、例外、切り替え条件を定義する。

2. **依頼テンプレート**  
   失敗が多いtask_typeにだけ、入力テンプレを作る。

3. **context整理ルール**  
   どの情報を最初から渡すか、どれを別handoffにするかを決める。

4. **月次レビュー表**  
   cost、成功率、手戻り、P90 tokenを見て、翌月の運用を1つだけ変える。

