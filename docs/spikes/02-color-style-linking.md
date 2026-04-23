# Spike: Color Style Linking

## Issue

- GitHub Issue: https://github.com/kaonmick/framer-token-plugin/issues/4

## 検証日

- Date: TBD

## 検証環境

- Framer Plugin SDK version: TBD
- Framer project: TBD
- Browser / OS: TBD
- Plugin branch / commit: TBD

## 仮説

primitive Color Style の値を変更したとき、metadata から dependent semantic Color Styles を見つけ、semantic の実値を安全に更新できる。

## 手順

- [ ] primitive / semantic pair を作成する。
- [ ] semantic に alias metadata を保存する。
- [ ] primitive の `light` / `dark` を変更する。
- [ ] dependent semantic styles を逆引きする。
- [ ] semantic の `light` / `dark` を更新する。
- [ ] semantic を使用している layer の表示追従を確認する。
- [ ] partial failure の記録方法を確認する。

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
