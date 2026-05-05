# Design System Draft

## 目的

Framer Token Importer の UI を、画面追加後も破綻しにくい semantic token ベースで管理する。

このドキュメントは叩き台とし、実装が進んだら Figma / Tailwind / CSS custom properties の実値に合わせて更新する。

## 方針

- Framer 側の light / dark theme 検知に必ず追従する。
- プラグイン内の独自 theme toggle は持たず、Framer theme を source of truth にする。
- コンポーネント内では raw color を直接増やさず、semantic token を優先する。
- 既存の brand yellow は Tailwind `yellow-300` を基準色にする。
- CTA hover は、旧 `#C8C800` に近い Tailwind 色として `yellow-500` を使う。
- warning / diagnostic marker は accent と同じ yellow 系を使うが、必要になれば `status.warning` として分離する。

## Theme Token

### Typography

日本語 UI は英字 UI の同階層 token から font-size を 1px 下げる。line-height は英字側と同じ semantic 行高を使い、言語切替時の縦方向レイアウト変化を抑える。

実装は `src/tokens.css` の Tailwind v4 `@theme` で管理する。

| Token | EN size / line-height | JA size / line-height | Semantic utility |
|---|---:|---:|---|
| `text.xs` / `text.xs.ja` | 12px / 19.2px | 11px / 19.2px | `text-xs` 系 utility を直接利用 |
| `text.sm` / `text.sm.ja` | 14px / 21.7px | 13px / 21.7px | `text-ui-control` |
| `text.base` / `text.base.ja` | 16px / 24px | 15px / 24px | `text-base` 系 utility を直接利用 |
| `text.lg` / `text.lg.ja` | 18px / 26.1px | 17px / 26.1px | TBD |
| `text.xl` / `text.xl.ja` | 20px / 28px | 19px / 28px | `text-ui-title` |

`NaNpx` は CSS として無効なため使わない。Figma から行高が取得できない場合も、semantic token 側で必ず有効な line-height を定義する。

### Surface

| Token | 用途 |
|---|---|
| `color.surface.canvas` | app 全体の背景 |
| `color.surface.panel` | editor / preview / summary など主要な面 |
| `color.surface.raised` | tooltip / popover / modal |
| `color.surface.muted` | gutter / disabled area / secondary surface |
| `color.surface.inset` | editor body など沈んだ面 |

### Text

| Token | 用途 |
|---|---|
| `color.text.primary` | 主要テキスト |
| `color.text.secondary` | 説明文 / 補助テキスト |
| `color.text.muted` | placeholder / inactive text |
| `color.text.accent` | copied / emphasis など accent text |

### Border

| Token | 用途 |
|---|---|
| `color.border.default` | 通常 border |
| `color.border.muted` | 控えめな区切り |
| `color.border.strong` | editor frame / modal frame |
| `color.border.focus` | focus ring |

### Accent

| Token | Tailwind 初期値 | 用途 |
|---|---|---|
| `color.accent.primary` | `yellow-300` | CTA / focus / active indicator |
| `color.accent.primaryHover` | `yellow-500` | CTA hover / active |
| `color.accent.primaryDisabled` | `yellow-300/35` | disabled CTA background |
| `color.accent.foreground` | `neutral-800` | accent surface 上の文字 |
| `color.accent.foregroundDisabled` | `rgba(26,26,26,0.5)` | disabled CTA text |

### Status

| Token | 用途 |
|---|---|
| `color.status.warning` | warning / diagnostic dot / wavy underline |
| `color.status.warningSurface` | warning line highlight |
| `color.status.warningGhost` | editor ghost text |
| `color.status.error` | JSON parse error / blocking error |
| `color.status.errorSurface` | error state background |

### Code

| Token | 用途 |
|---|---|
| `color.code.key` | JSON key |
| `color.code.string` | JSON string |
| `color.code.number` | JSON number |
| `color.code.boolean` | JSON boolean |
| `color.code.null` | JSON null |
| `color.code.punctuation` | braces / comma / colon |
| `color.code.diagnosticUnderline` | warning / error underline |

## 実装メモ

初期実装では Tailwind class を直接使っている箇所がある。light / dark 対応時に、以下のような CSS custom properties へ寄せる。

```css
:root,
[data-theme="dark"] {
  --color-surface-canvas: var(--color-neutral-900);
  --color-surface-panel: var(--color-neutral-800);
  --color-surface-raised: var(--color-neutral-950);
  --color-text-primary: var(--color-neutral-100);
  --color-text-secondary: var(--color-neutral-300);
  --color-border-default: var(--color-neutral-200);
  --color-accent-primary: var(--color-yellow-300);
  --color-accent-primary-hover: var(--color-yellow-500);
}

[data-theme="light"] {
  --color-surface-canvas: var(--color-neutral-50);
  --color-surface-panel: var(--color-white);
  --color-surface-raised: var(--color-white);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-border-default: var(--color-neutral-300);
  --color-accent-primary: var(--color-yellow-300);
  --color-accent-primary-hover: var(--color-yellow-500);
}
```

Tailwind class 化する場合は、まず `bg-[var(--color-surface-panel)]` のような任意値で始め、利用箇所が増えた段階で共通 class / component API にまとめる。

## 優先移行順

1. app shell / header
2. button / form controls
3. editor frame / gutter / tooltip / diagnostics
4. preview list / summary / conflict UI
5. modal / empty / loading / error states
6. screenshot検証の light / dark 追加
