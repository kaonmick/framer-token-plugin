# Issue 28 Phase 0 Dark Baseline

Issue: [#28 dark and light mode対応](https://github.com/kaonmick/framer-token-plugin/issues/28)

## 目的

light / dark テーマ対応に入る前に、既存 dark 見た目を baseline として固定する。

- Framer を source of truth にする前段として、現状 UI の dark 見た目を記録する
- Phase 1 以降で見た目が崩れた時に、比較対象を明確にする
- アプリ実装コードは変更せず、artifact と検証メモだけを追加する

## 実行日

- 2026-05-03

## 取得方法

```bash
PATH=/opt/homebrew/bin:$PATH npm run screenshots
```

- 取得元: `docs/screenshots/*.png`
- 固定した baseline: `docs/screenshots/issue-28-phase0-dark-baseline/`

## Baseline 一覧

| File | 内容 |
|---|---|
| [01-default.png](../screenshots/issue-28-phase0-dark-baseline/01-default.png) | 初期表示。editor、stats、empty preview、footer CTA の基準。 |
| [02-preview-normal.png](../screenshots/issue-28-phase0-dark-baseline/02-preview-normal.png) | token preview の通常状態。 |
| [03-light-dark.png](../screenshots/issue-28-phase0-dark-baseline/03-light-dark.png) | light / dark pair を含む preview。 |
| [04-oklch.png](../screenshots/issue-28-phase0-dark-baseline/04-oklch.png) | OKLCH notice を含む状態。 |
| [05-warning.png](../screenshots/issue-28-phase0-dark-baseline/05-warning.png) | warning 表示状態。 |
| [06-invalid-json.png](../screenshots/issue-28-phase0-dark-baseline/06-invalid-json.png) | invalid JSON error state。 |
| [07-conflict-preview.png](../screenshots/issue-28-phase0-dark-baseline/07-conflict-preview.png) | conflict choice UI。warning accent と token selection tint の基準。 |
| [09-import-summary-success.png](../screenshots/issue-28-phase0-dark-baseline/09-import-summary-success.png) | import success summary dialog。 |
| [10-import-summary-failed.png](../screenshots/issue-28-phase0-dark-baseline/10-import-summary-failed.png) | import failed summary dialog。 |

## 守るべき見た目

Phase 1 と Phase 2 では、以下の dark 見た目を変えない。

- app shell は `bg-neutral-800` / `text-neutral-100` を維持する。footer bar も `bg-neutral-800` + `border-neutral-700` を基準にする。
- button / file button / select は neutral 系の dark surface と、primary CTA の `yellow-300` / hover `yellow-500` を維持する。
- editor は `bg-neutral-700`、gutter は `bg-neutral-600/40`、frame border は `border-neutral-200` を維持する。
- preview / stats / summary panel は neutral 系 surface を維持する。主要テキストは `neutral-100`、補助テキストは `neutral-200` / `neutral-300` の階層を崩さない。
- conflict section の左 accent は `#733e0a`、new token section の左 accent は `#0d542b` を維持する。
- conflict candidate の選択ハイライトは `#fff08533` を維持する。
- dialog は backdrop `bg-neutral-950/60`、panel `bg-neutral-800` + `border-neutral-600` を維持する。
- `JsonTokenEditor` の syntax color と caret 配色はこの親 issue の対象外とし、theme 対応の途中で同時変更しない。

## 関連成果物

- [Theme Token Workbench](../workbench/token-workbench.html)
- [Theme Token Workbench Handoff](../workbench/token-workbench-handoff.md)
- [Theme Token JSON Snapshot](../workbench/token-workbench-current-data.json)

## 主な参照元

- `src/app/App.tsx`
- `src/components/ui.tsx`
- `src/components/LanguageToggle.tsx`
- `src/components/StatsGrid.tsx`
- `src/components/TokenCard.tsx`
- `src/components/TokenCardList.tsx`
- `src/components/ImportSummary.tsx`
- `src/components/JsonTokenEditor.tsx`

## Issue comment draft

```md
## Codex 作業報告

### 作業内容

- capture mode の current UI を再取得し、dark baseline を `docs/screenshots/issue-28-phase0-dark-baseline/` に固定
- Phase 1 以降で崩してはいけない dark 見た目を `docs/issues/28-phase0-dark-baseline.md` に整理

### 根拠 / 成果物

- `docs/issues/28-phase0-dark-baseline.md`
- `docs/screenshots/issue-28-phase0-dark-baseline/01-default.png`
- `docs/screenshots/issue-28-phase0-dark-baseline/07-conflict-preview.png`

### Kaon 確認事項

- [ ] Phase 0 の baseline として、この dark 見た目を固定してよいか
- [ ] Phase 1 では `data-theme` 反映だけに絞り、見た目変更を入れない前提で進めてよいか

### 次の推奨アクション

- Phase 1 で Framer Plugin API の theme 取得方法を確認し、`<html data-theme=\"...\">` 反映だけを入れる
```
