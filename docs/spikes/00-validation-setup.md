# Spike: Validation Setup

## Issue

- GitHub Issue: https://github.com/kaonmick/framer-token-plugin/issues/1

## Goal

TV-01 以降の技術検証を、同じ Framer project / fixture / 記録ルールで継続できる状態にする。

## Codex で準備するもの

- `docs/spikes/` を技術検証ログの保存先として使う。
- `docs/spikes/TEMPLATE.md` を spike 記録テンプレートとして使う。
- `src/fixtures/technical-validation-colors.json` を検証用カラーセットの初期 fixture として使う。
- `docs/issues/technical-validation/*.md` を GitHub Issue body file として使う。

## Kaon が決めるもの

- 手動検証に使う Framer project 名
- 手動検証に使う Framer project URL
- 検証開始時点の project 状態メモ

## Framer Project Checklist

- [ ] Project name:
- [ ] Project URL:
- [ ] 初期状態メモ:

## Validation Fixture

- File: `src/fixtures/technical-validation-colors.json`
- Contains:
  - primitive colors
  - semantic alias colors
  - broken reference colors
  - light / dark mode pairs

この fixture を起点にして、TV-01 以降で duplicate / delete / drift / usage scan の派生ケースを追加する。

## Local Commands

```bash
npm install
npm run dev
npm run docs:dev
npm run check
npm test
```

## Success Criteria Mapping

- spike ごとの記録ファイルを作れる
  - `docs/spikes/TEMPLATE.md`
  - `docs/spikes/01-color-style-metadata.md` 〜 `06-scale-performance.md`
- 手動検証に使う Framer project が決まっている
  - このファイルの `Framer Project Checklist` を埋める
- 検証用 JSON / Color Styles の初期状態を再現できる
  - `src/fixtures/technical-validation-colors.json` を使う

## Remaining Manual Step

Codex 側の scaffolding は揃っているため、残作業は Kaon による Framer project の選定と URL 記録です。

## Next Action

- Kaon が Framer project 名 / URL を記入する
- TV-01 と TV-02 の検証ログをこの setup にぶら下げて記録する
