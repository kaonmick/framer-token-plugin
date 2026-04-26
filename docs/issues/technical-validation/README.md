# Technical Validation Issues

GitHub Issues に `Technical Validation` milestone を作り、以下の issue を登録するための body files です。

## Repository Scope

Issues はこの repo 全体で管理します。
検証用 Framer project は別 repo に分けず、Framer 側の手動検証環境として扱います。

理由:

- 検証コード、仕様、検証ログ、実装判断を同じ履歴で追える。
- Pro / Free のスコープ判断がこの plugin repo の設計に直結する。
- 別 repo にすると issue、docs、code、decision log が分散する。

検証用 Framer project は、まず `docs/spikes/00-validation-setup.md` に project 名 / URL / 状態を記録し、そのうえで各 spike の `Evidence` や `検証環境` に必要な差分を残します。

## Milestone

推奨 milestone:

```text
Technical Validation
```

## Labels

推奨 labels:

```text
spike
setup
decision
P0
P1
P2
blocked
```

## Issue List

| ID | Title | Labels | Body File |
| --- | --- | --- | --- |
| TV-00 | TV-00: 検証環境とログ置き場を準備する | setup, P0 | `TV-00.md` |
| TV-01 | TV-01: Color Style metadata の保存・復元を検証する | spike, P0 | `TV-01.md` |
| TV-02 | TV-02: duplicate / delete 後の metadata 挙動を確認する | spike, P0 | `TV-02.md` |
| TV-03 | TV-03: primitive / semantic 疑似リンク同期を検証する | spike, P0 | `TV-03.md` |
| TV-04 | TV-04: drift detection を検証する | spike, P0 | `TV-04.md` |
| TV-05 | TV-05: color usage scan の取得範囲を検証する | spike, P1 | `TV-05.md` |
| TV-06 | TV-06: raw color replacement を検証する | spike, P1 | `TV-06.md` |
| TV-07 | TV-07: 大規模 project の scan 性能を検証する | spike, P2 | `TV-07.md` |
| TV-08 | TV-08: 検証結果から Free / Pro スコープを更新する | decision, P0 | `TV-08.md` |

## CLI Example

`gh` が使える場合の作成例です。

```bash
gh issue create \
  --title "TV-01: Color Style metadata の保存・復元を検証する" \
  --body-file docs/issues/technical-validation/TV-01.md \
  --label spike,P0 \
  --milestone "Technical Validation"
```
