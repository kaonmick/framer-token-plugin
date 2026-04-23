# Codex Issue Workflow

## 目的

GitHub Issues を使って、Codex が自動で進められる作業と Kaon の確認が必要な作業を分離するための運用ルールです。

この運用では、Codex は issue を close しません。
close 可能な状態になった場合は、作業内容と確認ポイントを issue comment にまとめ、Kaon に確認依頼を出します。

## 基本方針

- Codex は `ready-for-codex` が付いた issue に着手できる。
- Codex は `needs-kaon` または `blocked` が付いた issue には着手しない。
- Codex は docs、spike code、検証ログ、実装補助コードを作成できる。
- Codex は Framer UI 上の手動確認が必要になったら止める。
- Codex は product scope、価格、Pro feature の最終判断が必要になったら止める。
- Codex は close 可能な issue に `codex-done` を付け、作業内容と確認依頼を comment する。
- issue の close は Kaon が行う。

## Labels

### ready-for-codex

Codex が着手してよい issue。

### in-progress

Codex または Kaon が作業中の issue。

### needs-kaon

Kaon の判断、手動確認、または承認が必要な issue。

### needs-framer-manual-check

Framer UI / Framer project 上での手動検証が必要な issue。

### codex-done

Codex 側の作業は完了しており、Kaon 確認後に close 可能な issue。

### blocked

外部要因、未決定事項、または前段 issue によって進められない issue。

## Codex が止まる条件

Codex は次の場合、作業を止めて `needs-kaon` を付けます。

- Framer UI 上での手動確認が必要。
- 実 project の表示結果や挙動確認が必要。
- Free / Pro のスコープ判断が必要。
- 価格、Marketplace 文言、課金導線の判断が必要。
- API 挙動が曖昧で、プロダクトの売り文句に影響する。
- destructive operation が必要。
- ユーザー作業中のファイルに触れる必要がある。

## Issue の状態遷移

```text
ready-for-codex
  -> in-progress
  -> needs-kaon
  -> ready-for-codex
  -> in-progress
  -> codex-done
  -> Kaon closes issue
```

例外:

```text
ready-for-codex
  -> in-progress
  -> blocked
```

## コメント形式

Codex が作業を止めるとき、または close 可能と判断したときは、次の形式で issue comment を残します。

```md
## Codex 作業報告

### 作業内容

- ...

### 根拠 / 成果物

- ...

### Kaon 確認事項

- [ ] ...

### 次の推奨アクション

- ...
```

## Technical Validation での運用

- `TV-00` は docs / fixtures / spike log scaffold を作成し、Kaon が検証用 Framer project を決めたら close 可能。
- `TV-01`〜`TV-04` は Codex が検証コードと記録テンプレートを作り、Framer UI の手動確認で `needs-framer-manual-check` を付ける。
- `TV-05`〜`TV-07` は API で取れる範囲の調査コードを作り、実 project での scan 結果確認は Kaon に依頼する。
- `TV-08` は Codex が判断材料を整理し、最終判断は Kaon が行う。
