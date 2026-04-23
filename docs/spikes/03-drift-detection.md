# Spike: Drift Detection

## Issue

- GitHub Issue: https://github.com/kaonmick/framer-token-plugin/issues/5

## 検証日

- Date: TBD

## 検証環境

- Framer Plugin SDK version: TBD
- Framer project: TBD
- Browser / OS: TBD
- Plugin branch / commit: TBD

## 仮説

Framer 側で手動編集された Color Style と、plugin metadata から復元した expected token state の差分を分類できる。

## 手順

- [ ] `Synced` な primitive / semantic pair を作る。
- [ ] primitive を手動編集して `Primitive changed` を確認する。
- [ ] semantic を手動編集して `Semantic manually changed` を確認する。
- [ ] primitive を削除して `Missing primitive` を確認する。
- [ ] semantic を削除して `Missing semantic` を確認する。
- [ ] metadata なし style を `Unmanaged style` として分類する。

## 結果

TBD

## 成功条件との差分

TBD

## 制約 / 失敗ケース

TBD

## 判断

- [ ] Go
- [ ] Conditional Go
- [ ] No Go

## 次アクション

TBD
