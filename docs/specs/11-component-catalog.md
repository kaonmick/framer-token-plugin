# Component Catalog

## 目的

コンポーネント化した UI を、Figma / Tailwind / 実装ファイル / Ladle story / 状態の対応が追える形で管理する。

現在は Ladle を React/Vite ベースのコンポーネントカタログとして使う。Framer API 依存の挙動は Ladle に直接持ち込まず、表示コンポーネントと mock data / fixture で確認する。

Ladle は `.ladle/config.mjs` と `.ladle/vite.config.ts` を使い、Framer plugin 用の `vite.config.ts` とは分離する。これにより `vite-plugin-framer`、`mkcert`、Framer manifest copy は catalog server / build に混ざらない。

## 起動コマンド

```bash
npm run catalog:dev
```

起動後、`http://127.0.0.1:61000/` を開く。

静的ビルド確認は次を使う。

```bash
npm run catalog:build
```

| 用途 | コマンド | URL / 出力 | 役割 |
|---|---|---|---|
| Framer plugin 開発 | `npm run dev` | dev server起動時に表示される `https://framer.com/plugins/open` | Framer Development Plugin から実機確認する。 |
| Framer plugin HTTP確認 | `npm run dev:http` | `http://localhost:5173/` | ブラウザでPlugin UIだけを確認する。 |
| Docsify文書確認 | `npm run docs:dev` | `http://127.0.0.1:4173/` | Markdown docs を横断閲覧する。 |
| React component catalog | `npm run catalog:dev` | `http://127.0.0.1:61000/` | コンポーネントの見た目、props / state、focus-visible、a11y addon を確認する。 |

## 管理ルール

- コンポーネントを追加・変更したら、このカタログへ entry を追加する。
- Framer API 依存が薄い表示コンポーネントは `src/story/**/*.stories.tsx` に story を追加する。
- Figma node が参照できる場合は `Figma` に URL または node ID を記録する。
- 状態は `default` / `hover` / `active` / `disabled` / `focus-visible` を基本にする。
- UI stack は `Ideal State` / `Blank / Empty State` / `Loading State` / `Partial State` / `Error State` を基本にする。
- fixture を使う story は、story 名またはこの文書で前提 fixture を分かるようにする。
- Ladle 用の fixture と surface helper は `src/story/` に置き、`src/components/` は実装コンポーネントの master として保つ。
- サイズはコンポーネント API で管理し、画面側の個別 class 直書きを増やさない。
- 色は raw hex ではなく、Tailwind token または semantic token を優先する。

## Ladle で確認するもの / しないもの

| 項目 | Ladle | Framer 実機 |
|---|---:|---:|
| コンポーネントの見た目 | Yes | 最終確認のみ |
| props / state の組み合わせ | Yes | 必要に応じて |
| Ideal / Empty / Loading / Partial / Error | Yes | 必要に応じて |
| a11y / focus-visible / keyboard 確認 | Yes | 必要に応じて |
| `framer.showUI` | No | Yes |
| `useIsAllowedTo` | mock まで | Yes |
| `framer.createColorStyle` | No | Yes |
| `framer.notify` | No | Yes |
| iframe サイズや Framer 固有挙動 | No | Yes |

## Components

| Component | 実装 | Story | Figma | 状態 | メモ |
|---|---|---|---|---|---|
| `AppHeader` | `src/components/AppHeader.tsx` | `src/story/AppHeader.stories.tsx` | TBD | default / selected-ja | title と language toggle をまとめて確認する。 |
| `LanguageToggle` | `src/components/LanguageToggle.tsx` | `src/story/LanguageToggle.stories.tsx` | Framer `Gd3hmibM4` | default / selected-ja / focus-visible | `52x26px` track、`22px` thumb。selected-ja と focus-visible を個別 story で確認する。 |
| `ActionButton` | `src/components/ui.tsx` | `src/story/ui.stories.tsx` | button component | default / hover / active / disabled / focus-visible | CV button を base とする。`variant` と `size` で管理する。 |
| `FileButton` | `src/components/ui.tsx` | `src/story/ui.stories.tsx` | button component | default / hover / active / focus-within | file input を ActionButton と同じ size scale に揃える。 |
| `SelectControl` | `src/components/ui.tsx` | `src/story/ui.stories.tsx` | TBD | default / focus-visible | import strategy などの select を管理する。 |
| `SectionTitle` / `HelperText` | `src/components/ui.tsx` | `src/story/ui-primitives.stories.tsx` | TBD | default | 見出しと補助文の組み合わせを確認する。 |
| `MessageBox` | `src/components/ui.tsx` | `src/story/ui-primitives.stories.tsx` | TBD | warning / danger | notice と error の見え分けを固定 fixture で確認する。 |
| `DialogBackdrop` / `DialogPanel` / `DialogActions` | `src/components/ui.tsx` | `src/story/ui-primitives.stories.tsx` | TBD | modal shell | import result modal の土台を確認する。 |
| `JsonTokenEditor` | `src/components/JsonTokenEditor.tsx` | `src/story/JsonTokenEditor.stories.tsx` | editor component | default / focused / diagnostic / copied / tooltip | JSON editor、copy、resize、inline diagnostic を含む。focused 用に `focus-within` ring を持つ。 |
| `StatsGrid` | `src/components/StatsGrid.tsx` | `src/story/StatsGrid.stories.tsx` | TBD | default / long-label-large-number | token counts を表示する。長いラベルと大きい数値の折り返しも確認する。 |
| `TokenCard` | `src/components/TokenCard.tsx` | `src/story/TokenCardSingle.stories.tsx` | TBD | overview / default / selected / conflict / focus-visible | isolated card として選択状態、既存 style conflict、focus ring を確認する。overview story では 1 ページ比較を行う。 |
| `TokenCardList` | `src/components/TokenCardList.tsx` | `src/story/TokenCard.stories.tsx` | TBD | ideal / empty / loading / partial / error | import preview と conflict choice を表示する。 |
| `ImportSummary` | `src/components/ImportSummary.tsx` | `src/story/ImportSummary.stories.tsx` | TBD | success / failed | import result modal の内容を表示する。 |

## UI stack

| UI stack | Story | Fixture | 確認観点 |
|---|---|---|---|
| Ideal State / 理想状態 | `TokenCardList / IdealState` | `catalogTokens` | 正常に import 対象が揃っている状態。 |
| Blank / Empty State / 空状態 | `TokenCardList / EmptyState` | empty arrays | 対象 token がない時の誘導文。 |
| Loading State / 読み込み中状態 | `TokenCardList / LoadingState` | `isCheckingConflicts` | 既存 style 確認中の表示。 |
| Partial State / 部分的状態 | `TokenCardList / PartialState` | `catalogTokens`, `catalogConflictGroups`, `catalogExistingConflicts` | 新規 token と conflict choice が混在する状態。 |
| Error State / エラー状態 | `TokenCardList / ErrorState` | `conflictError` | 既存 style 確認失敗時の表示。 |
| Partial State / 部分的状態 | `JsonTokenEditor / DiagnosticState` | `catalogEditorJson`, `catalogEditorDiagnostics` | 変換 notice と未対応値 error が inline diagnostic として混在する状態。 |

## Story fixture

`src/story/catalog.fixtures.ts` は Ladle 専用の軽量 fixture。実 Framer API の戻り値ではなく、表示状態を固定して確認するための mock data として扱う。

| Story | Fixture | 確認観点 |
|---|---|---|
| `AppHeader / Default`, `AppHeader / Japanese selected` | inline title string | title と language toggle の横並びバランスを確認する。 |
| `LanguageToggle / Default`, `Japanese selected`, `FocusVisible` | local state | 英日切替と focus ring を固定 view で確認する。 |
| `StatsGrid / Default` | `catalogStatsItems` | 基本の件数表示を確認する。 |
| `StatsGrid / Long label / large number` | `catalogStatsItemsLongLabel` | 長いラベルと3桁値の折り返しを確認する。 |
| `TokenCard / 0verview` | `catalogTokenCardRows`, `catalogTokenCardModeRows`, inline existing style row | Default / Selected / Conflict / FocusVisible を 1 ページで比較する。 |
| `TokenCard / Default`, `Selected`, `FocusVisible` | `catalogTokenCardRows`, `catalogTokenCardModeRows` | 単体 card の badge、mode、選択状態を確認する。 |
| `TokenCard / Conflict` | inline existing style row | 既存 style collision を isolated card で確認する。 |
| `JsonTokenEditor / Default`, `Focused state`, `Copied state`, `Tooltip state` | `catalogEditorJson` | text focus、copy feedback、hover tooltip を story ごとに確認する。 |
| `JsonTokenEditor / Diagnostic state` | `catalogEditorJson`, `catalogEditorDiagnostics` | 変換 notice と unsupported value error の混在を確認する。 |

`Overview` 系 story は Ladle の並び順を安定させるため、表示名を `0verview` に統一する。

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

## 今後の追加候補

- `JsonTokenEditor` の copied / tooltip story を `npm run screenshots` の capture 対象へ追加する。
- `AppHeader` と `LanguageToggle` に Figma node ID または比較画像を紐づける。
- Figma MCP の上限解除後、各 component に Figma node ID を紐づける。
- light / dark 対応時に、ここへ theme token の適用状況を追加する。
