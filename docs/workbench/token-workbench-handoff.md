# Theme Token Workbench Handoff

## 目的

`docs/workbench/token-workbench.html` で確定した dark / light の semantic color を、実装へ渡すための handoff メモ。

## 成果物

- JSON snapshot: [token-workbench-current-data.json](./token-workbench-current-data.json)
- workbench: [token-workbench.html](./token-workbench.html)

## 使い方

- 色値の source of truth は [token-workbench-current-data.json](./token-workbench-current-data.json) とする。
- 実装側では色値を変えず、semantic name の反映先と責務分離を優先する。
- [token-workbench.html](./token-workbench.html) の `initialTokenRows` は、この JSON に同期された表示用データとして扱う。

## 実装順メモ

1. foundation として `surface.*` `text.*` `border.*` `accent.*` を app shell / panel / button に割り当てる。
2. `status.warning*` と `control.radioSelected` を conflict choice と warning 表示へ分けて入れる。
3. `preview.*Accent` を conflict group / new token group の左 sidebar に使う。
4. `code.*` を `JsonTokenEditor` の syntax / diagnostic underline に割り当てる。

## Token 一覧

| Semantic name | Dark | Light | 主な用途 |
|---|---|---|---|
| `surface.canvas` | `#262626` | `#E5E5E5` | App shell / footer background |
| `surface.panel` | `#404040` | `#F5F5F5` | StatsGrid / TokenCardList / editor panel |
| `surface.raised` | `#262626` | `#FAFAFA` | Tooltip / elevated surface |
| `surface.inset` | `#404040` | `#F5F5F5` | Editor inset / code area |
| `text.primary` | `#f5f5f5` | `#404040` | Main heading / primary body text |
| `text.secondary` | `#d4d4d4` | `#525252` | Helper text / gutter / caption |
| `text.muted` | `#a1a1a1` | `#737373` | Placeholder / inactive helper text |
| `border.default` | `#e5e5e5` | `#525252` | Secondary button / editor frame |
| `border.muted` | `#525252` | `#A1A1A1` | Modal border / inset separator |
| `accent.primary` | `#FFDF20` | `#FFDF20` | Primary CTA / active thumb |
| `accent.foreground` | `#262626` | `#262626` | Primary CTA label / active toggle text |
| `status.warning` | `#d4d4d4` | `#525252` | Warning text / diagnostic label |
| `status.warningSurface` | `#733E0A` | `#FEF9C2` | Diagnostic warning banner / editor warning surface |
| `status.warningGhost` | `#fff08533` | `#facc1533` | TokenCard checked highlight background |
| `control.radioSelected` | `#FFDF20` | `#F0B100` | Conflict choice radio checked dot |
| `preview.conflictAccent` | `#733e0a` | `#FDC700` | TokenCardList conflict group left accent bar |
| `preview.newTokenAccent` | `#0d542b` | `#5EA500` | TokenCardList new token group left accent bar |
| `code.key` | `#74D4FF` | `#0069A8` | JsonTokenEditor key token |
| `code.string` | `#7BF1A8` | `#008236` | JsonTokenEditor string token |
| `code.number` | `#74D4FF` | `#0069A8` | JsonTokenEditor number token |
| `code.boolean` | `#FFB86A` | `#733E0A` | JsonTokenEditor boolean token |
| `code.null` | `#FFA2A2` | `#A3004C` | JsonTokenEditor null token |
| `code.punctuation` | `#d4d4d4` | `#525252` | JsonTokenEditor punctuation token |
| `code.diagnosticUnderline` | `#FFDF20` | `#FFDF20` | JsonTokenEditor diagnostic underline color |

## UI surface 別メモ

### App shell / panel

- `surface.canvas`
- `surface.panel`
- `surface.raised`
- `surface.inset`
- `text.primary`
- `text.secondary`
- `text.muted`
- `border.default`
- `border.muted`
- `accent.primary`
- `accent.foreground`

### Conflict / new token list

- `status.warningGhost`
- `control.radioSelected`
- `preview.conflictAccent`
- `preview.newTokenAccent`

### JsonTokenEditor

- `code.key`
- `code.string`
- `code.number`
- `code.boolean`
- `code.null`
- `code.punctuation`
- `code.diagnosticUnderline`
