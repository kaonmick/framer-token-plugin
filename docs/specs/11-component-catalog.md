# Component Catalog

## 目的

コンポーネント化した UI を、Figma / Tailwind / 実装ファイル / 状態の対応が追える形で管理する。

最初は Markdown で軽く管理し、コンポーネント数と状態数が増えたらローカル HTML 作業台または Storybook 相当のカタログへ移行する。

## 管理ルール

- コンポーネントを追加・変更したら、このカタログへ entry を追加する。
- Figma node が参照できる場合は `Figma` に URL または node ID を記録する。
- 状態は `default` / `hover` / `active` / `disabled` / `focus-visible` を基本にする。
- サイズはコンポーネント API で管理し、画面側の個別 class 直書きを増やさない。
- 色は raw hex ではなく、Tailwind token または semantic token を優先する。

## Components

| Component | 実装 | Figma | 状態 | メモ |
|---|---|---|---|---|
| `AppHeader` | `src/components/AppHeader.tsx` | TBD | default | title と language toggle を管理する。 |
| `LanguageToggle` | `src/components/LanguageToggle.tsx` | Framer `Gd3hmibM4` | default / selected-ja / focus-visible | `48x24px` track、`20px` thumb。Framer MCP の選択ノード値を基準にする。 |
| `ActionButton` | `src/components/ui.tsx` | button component | default / hover / active / disabled / focus-visible | CV button を base とする。`variant` と `size` で管理する。 |
| `FileButton` | `src/components/ui.tsx` | button component | default / hover / active / focus-within | file input を ActionButton と同じ size scale に揃える。 |
| `SelectControl` | `src/components/ui.tsx` | TBD | default / focus | import strategy などの select を管理する。 |
| `JsonTokenEditor` | `src/components/JsonTokenEditor.tsx` | editor component | default / focused / diagnostic / copied / tooltip | JSON editor、copy、resize、inline diagnostic を含む。 |
| `StatsGrid` | `src/components/StatsGrid.tsx` | TBD | default | token counts を表示する。 |
| `TokenPreviewList` | `src/components/TokenPreviewList.tsx` | TBD | default / empty | import preview を表示する。 |
| `ConflictPreview` | `src/components/ConflictPreview.tsx` | TBD | neutral / warning / conflict | 既存 style との競合を表示する。 |
| `ImportSummary` | `src/components/ImportSummary.tsx` | TBD | success / failed | import result modal の内容を表示する。 |

## Button API

### `ActionButton`

CV button を基準にし、以下の API で揃える。

| Prop | 値 | 用途 |
|---|---|---|
| `variant` | `solid` | Primary / CV。import など主要操作。 |
| `variant` | `outline` | Secondary。reload / cancel / show all など。 |
| `variant` | `danger` | 破壊的操作。 |
| `size` | `sm` | modal / compact action。 |
| `size` | `md` | main action / bottom fixed CTA。高さ 30px、typography は `text-ui-control`。 |

### State Token

| State | Tailwind |
|---|---|
| CV default | `bg-yellow-300 text-neutral-800` |
| CV hover / active | `bg-yellow-500` |
| CV disabled bg | `bg-yellow-300/35` |
| CV disabled text | `text-[rgba(26,26,26,0.5)]` |
| Focus | `outline-yellow-300` |

Typography は component 固有値ではなく `src/tokens.css` の semantic utility を使う。日本語 UI では `:lang(ja)` により同階層 token から font-size を 1px 下げる。

## 今後の移行候補

- `docs/mockups/component-catalog.html` を追加し、実際の状態をブラウザで一覧確認する。
- Figma MCP の上限解除後、各 component に Figma node ID を紐づける。
- light / dark 対応時に、ここへ theme token の適用状況を追加する。
