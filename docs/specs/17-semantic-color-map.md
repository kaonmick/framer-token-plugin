# Semantic Color 対応表

この表は、2026-05-19 時点の `src/tokens.css` を基準にした semantic color の対応表です。

`--color-*` は Tailwind class から参照するための公開名、`--*` は theme ごとに値を切り替える実体です。Storybook の 2 カラム preview は `src/stories/fixtures/storyLayout.tsx` に同じ値を持っているため、`src/tokens.css` を変えた場合はそちらも同期します。

## Surface

| Semantic token | Tailwind class | Public CSS var | 実体 CSS var | Dark | Light | 用途 |
|---|---|---|---|---|---|---|
| `color.surface.base` | `bg-surface-base` | `--color-surface-base` | `--surface-base` | `var(--color-neutral-800)` | `var(--color-neutral-50)` | app 全体の背景 |
| `color.surface.subtle` | `bg-surface-subtle` | `--color-surface-subtle` | `--surface-subtle` | `var(--color-neutral-700)` | `var(--color-neutral-100)` | editor / preview / summary など主要な面 |
| `color.surface.raised` | `bg-surface-raised` | `--color-surface-raised` | `--surface-raised` | `var(--color-neutral-800)` | `var(--color-neutral-50)` | tooltip / popover / modal |
| `color.surface.muted` | `bg-surface-muted` | `--color-surface-muted` | `--surface-muted` | `var(--color-neutral-600)` | `var(--color-neutral-200)` | gutter / disabled area / secondary surface |
| `color.surface.inset` | `bg-surface-inset` | `--color-surface-inset` | `--surface-inset` | `var(--color-neutral-700)` | `var(--color-neutral-100)` | editor body など沈んだ面 |
| `color.surface.diagnostic` | `bg-surface-diagnostic` | `--color-surface-diagnostic` | `--surface-diagnostic` | `var(--color-yellow-950)` | `var(--color-yellow-100)` | editor diagnostic の薄い背景 |
| `color.surface.gutter` | `bg-surface-gutter` | `--color-surface-gutter` | `--surface-gutter` | `var(--color-neutral-600)` | `var(--color-neutral-200)` | editor line number gutter |
| `color.surface.warning` | `bg-surface-warning` | `--color-surface-warning` | `--surface-warning` | `var(--color-yellow-800)` | `var(--color-yellow-100)` | warning line highlight |
| `color.surface.danger` | `bg-surface-danger` | `--color-surface-danger` | `--surface-danger` | `var(--color-red-600)` | `var(--color-red-400)` | danger CTA background |
| `color.overlay.default` | `bg-overlay-default` | `--color-overlay-default` | `--overlay-default` | `color-mix(in srgb, var(--color-neutral-800) 70%, transparent)` | `color-mix(in srgb, var(--color-neutral-50) 70%, transparent)` | dialog backdrop など背面 overlay |
| `color.elevated.default` | `bg-elevated-default` | `--color-elevated-default` | `--elevated-default` | `var(--color-neutral-600)` | `var(--color-neutral-200)` | warning / error message background |

## Text

| Semantic token | Tailwind class | Public CSS var | 実体 CSS var | Dark | Light | 用途 |
|---|---|---|---|---|---|---|
| `color.text.default` | `text-text-default` | `--color-text-default` | `--text-default` | `var(--color-neutral-100)` | `var(--color-neutral-900)` | 主要テキスト |
| `color.text.subtle` | `text-text-subtle` | `--color-text-subtle` | `--text-subtle` | `var(--color-neutral-300)` | `var(--color-neutral-600)` | 説明文 / 補助テキスト |
| `color.text.muted` | `text-text-muted` | `--color-text-muted` | `--text-muted` | `var(--color-neutral-400)` | `var(--color-neutral-500)` | placeholder / inactive text |
| `color.text.on-brand` | `text-text-on-brand` | `--color-text-on-brand` | `--text-on-brand` | `var(--color-neutral-800)` | `var(--color-neutral-800)` | brand surface 上の文字 |
| `color.text.danger` | `text-text-danger` | `--color-text-danger` | `--text-danger` | `var(--color-red-300)` | `var(--color-red-600)` | danger outline / error message text |
| `color.text.diagnosticGhost` | `text-[color:var(--color-text-diagnostic-ghost)]` | `--color-text-diagnostic-ghost` | `--text-diagnostic-ghost` | `color-mix(in srgb, var(--color-surface-brand) 40%, transparent)` | `color-mix(in srgb, var(--color-code-diagnostic-underline) 56%, var(--color-surface-inset))` | editor diagnostic の ghost text |
| `color.text.diagnosticGhostHover` | `text-[color:var(--color-text-diagnostic-ghost-hover)]` | `--color-text-diagnostic-ghost-hover` | `--text-diagnostic-ghost-hover` | `color-mix(in srgb, var(--color-code-diagnostic-underline) 32%, transparent)` | `color-mix(in srgb, var(--color-code-diagnostic-underline) 64%, var(--color-surface-inset))` | editor diagnostic hover の ghost text |

## Border

| Semantic token | Tailwind class | Public CSS var | 実体 CSS var | Dark | Light | 用途 |
|---|---|---|---|---|---|---|
| `color.border.default` | `border-border-default` | `--color-border-default` | `--border-default` | `var(--color-neutral-200)` | `var(--color-neutral-400)` | 通常 border |
| `color.border.muted` | `border-border-muted` | `--color-border-muted` | `--border-muted` | `var(--color-neutral-500)` | `var(--color-neutral-300)` | 控えめな区切り |
| `color.border.strong` | `border-border-strong` | `--color-border-strong` | `--border-strong` | `var(--color-neutral-200)` | `var(--color-neutral-400)` | editor frame / modal frame |
| `color.border.focus` | `[outline-color:var(--color-border-focus)]` | `--color-border-focus` | `--border-focus` | `var(--color-yellow-300)` | `var(--color-yellow-300)` | focus ring |
| `color.border.brand` | `border-border-brand` | `--color-border-brand` | `--border-brand` | `var(--color-yellow-300)` | `var(--color-yellow-300)` | brand outline / active border |
| `color.border.danger` | `border-border-danger` | `--color-border-danger` | `--border-danger` | `var(--color-red-600)` | `var(--color-red-600)` | danger outline border |

## Accent

| Semantic token | Tailwind class | Public CSS var | 実体 CSS var | Dark | Light | 用途 |
|---|---|---|---|---|---|---|
| `color.surface.brand` | `bg-surface-brand` | `--color-surface-brand` | `--surface-brand` | `var(--color-yellow-300)` | `var(--color-yellow-300)` | CTA / active indicator background |
| `color.surface.brand-hover` | `bg-surface-brand-hover` | `--color-surface-brand-hover` | `--surface-brand-hover` | `var(--color-yellow-500)` | `var(--color-yellow-500)` | CTA hover / active |

## Status / Control

| Semantic token | Tailwind class | Public CSS var | 実体 CSS var | Dark | Light | 用途 |
|---|---|---|---|---|---|---|
| `color.control.radioSelected` | `var(--color-control-radio-selected)` | `--color-control-radio-selected` | `--control-radio-selected` | `var(--color-yellow-300)` | `var(--color-yellow-500)` | radio selected border / dot |
| `color.preview.conflictAccent` | `bg-[var(--color-preview-conflict-accent)]` | `--color-preview-conflict-accent` | `--preview-conflict-accent` | `var(--color-yellow-700)` | `var(--color-yellow-400)` | conflict preview の accent bar |
| `color.preview.newTokenAccent` | `bg-[var(--color-preview-new-token-accent)]` | `--color-preview-new-token-accent` | `--preview-new-token-accent` | `var(--color-green-700)` | `var(--color-green-700)` | new token preview の accent bar |

## Code

| Semantic token | Tailwind class | Public CSS var | 実体 CSS var | Dark | Light | 用途 |
|---|---|---|---|---|---|---|
| `color.code.key` | `text-code-key` | `--color-code-key` | `--code-key` | `var(--color-sky-300)` | `var(--color-sky-700)` | JSON key |
| `color.code.string` | `text-code-string` | `--color-code-string` | `--code-string` | `#8be9a1` | `#15803d` | JSON string |
| `color.code.number` | `text-code-number` | `--color-code-number` | `--code-number` | `#80c7ff` | `#1d4ed8` | JSON number |
| `color.code.boolean` | `text-code-boolean` | `--color-code-boolean` | `--code-boolean` | `#ffb86c` | `#b45309` | JSON boolean |
| `color.code.null` | `text-code-null` | `--color-code-null` | `--code-null` | `#ff8ba7` | `#be185d` | JSON null |
| `color.code.punctuation` | `text-code-punctuation` | `--color-code-punctuation` | `--code-punctuation` | `var(--color-neutral-300)` | `var(--color-neutral-600)` | braces / comma / colon |
| `color.code.placeholder` | `text-code-placeholder` | `--color-code-placeholder` | `--code-placeholder` | `var(--color-blue-300)` | `var(--color-blue-700)` | editor placeholder / sample code |
| `color.code.diagnosticUnderline` | `var(--color-code-diagnostic-underline)` | `--color-code-diagnostic-underline` | `--code-diagnostic-underline` | `var(--border-brand)` | `var(--border-brand)` | warning / error underline |

## 更新ルール

- 値を変える場所は `src/tokens.css` を正にする。
- Storybook の light / dark preview は `src/stories/fixtures/storyLayout.tsx` の `themePreviewStyles` も同じ値へ更新する。
- 新しい semantic color を増やしたら、この表と `docs/specs/09-design-system.md` の用途一覧も更新する。
- UI での使用箇所を確認したい場合は Storybook の `Tokens / Semantic Usage Map` を見る。

## Primitive 直接参照の現状

この表は実 UI で primitive color が残っているかを見るための棚卸しです。`src/tokens.css` は semantic color の定義層なので、この洗い出し対象から除外します。`transparent` や `opacity-*` は色値の参照ではなく状態表現として扱い、ここには入れていません。

| 場所 | 参照している値 | 現状の扱い | メモ |
|---|---|---|---|
| なし | なし | 解消済み | 2026-05-18 時点で、実 UI の primitive color 直接参照は見つかっていない。 |

## ハードコード色の現状

`#...`、`rgba(...)`、`color-mix(...)` のように、semantic token 名ではなく色値や色計算が直接出ている箇所です。`src/tokens.css` は semantic color の定義層なので、この洗い出し対象から除外します。

| 場所 | ハードコード値 | 現状の扱い | メモ |
|---|---|---|---|
| なし | なし | 解消済み | 2026-05-18 時点で、実 UI の移行候補は `color.surface.diagnostic` / `color.surface.gutter` / `color.overlay.default` / `color.code.placeholder` へ移した。 |
| `src/app/i18n.ts:27`, `src/app/i18n.ts:103` | `#2563eb` | サンプル JSON なので対象外 | UI 色ではなく、空状態で見せる token JSON 例。Tailwind blue-600 相当で `color.code.placeholder` の近似色として扱う。 |
| `src/stories/fixtures/storyLayout.tsx` | `var(--color-*)`, `#...`, `rgba(...)`, `color-mix(...)` | preview 同期用なので対象外 | Storybook の 2 カラム preview 用。`src/tokens.css` を変えたら同期が必要。 |
| `src/stories/fixtures/jsonTokenEditorFixtures.ts`, `src/stories/fixtures/tokenCardFixtures.ts`, `src/stories/components/TokenCard.stories.tsx` | `#fff085`, `#713f12`, `#dc2626`, `#fde047`, `#854d0e`, `#fafafa`, `#f5f5f5`, `rgba(255, 240, 133, 1)` | fixture なので対象外 | import 対象の token 値や Storybook サンプル値。UI theme の直書きとは分けて扱う。 |
