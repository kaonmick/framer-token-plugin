# Light / Dark テーマ対応

## 目的

Framer プラグイン UI を Framer 本体の light / dark テーマに追従させる。
Framer が source of truth であり、プラグイン独自のテーマ切り替えは持たない。

## 背景

現在の UI は dark 固定で実装されており、すべてのコンポーネントが `neutral-800` / `neutral-700` などを Tailwind class としてハードコードしている。Framer が light モードになっても UI が dark のままになるため、テーマ追従対応が必要になる。

以前に一度対応を試みたが、以下の問題が重なり大きく破綻した。

- Framer テーマの受け取り方を固める前に、アプリ側の `data-theme` と fallback を触り始めた
- テーマ追従だけでよいのに、semantic token 置換やカラーリファクタまで一気に広げた
- Ladle の見た目を直しながら本体の色も変えたため、どちらが正なのかわからなくなった
- 変更前の baseline を記録せずに進めた
- コンポーネント単位でなくアプリ全体を先に動かし、副作用が連鎖した
- editor の scroll sync 実装にも手を入れてしまい、テーマと無関係な不具合を持ち込んだ

この反省を踏まえ、今回は **4 フェーズに分けて独立した PR として進める**。

## 対象外

- プラグイン独自のテーマ切り替え UI
- editor の scroll sync ロジックの変更
- conflict / new token の accent bar の色変更（固定意味色のため変更不要）
- semantic token 置換やカラーリファクタ（テーマ対応に直接不要な変更）
- editor のコード配色の変更（別 issue で扱う）

---

## フェーズ計画

### Phase 0 — ベースライン記録（変更なし）

**目的**: 変更前の正しい見た目を固め、「変えてはいけない箇所」を明文化する。

**作業内容**:

- `npm run dev` で capture mode を全パターン実行し、スクリーンショットを記録する
  - `?capture=default`
  - `?capture=preview-normal`
  - `?capture=light-dark`
  - `?capture=oklch`
  - `?capture=warning`
  - `?capture=invalid-json`
  - `?capture=conflict`
  - `?capture=summary-success`
  - `?capture=summary-failed`
- Ladle でも全 story のスクリーンショットを記録する
- 「変更しない色」の一覧を本 issue にコメントとして記録する

**完了条件**:

- baseline 画像が保存されている
- コードに一切変更なし

---

### Phase 1 — Framer テーマの受け取りのみ

**目的**: Framer の現在テーマを `data-theme` 属性として DOM に反映する。**見た目は変えない。**

**作業内容**:

- Framer Plugin API でテーマを取得する方法を確認する（`framer.useTheme()` または相当する API）
- `App.tsx` で取得したテーマを `document.documentElement.dataset.theme` にセットする
- Framer から theme が来ない場合（Ladle / キャプチャモードなど）は `"dark"` を fallback にする
- Ladle の `.ladle/components.tsx` に `data-theme` を切り替えられるデコレーターを追加する（Ladle 上での light / dark 確認用）

**変更ファイル**: `src/app/App.tsx`、`.ladle/components.tsx`

**完了条件**:

- Framer 上で light / dark を切り替えると `<html data-theme="light">` / `<html data-theme="dark">` が切り替わる
- **見た目は Phase 0 の baseline と変わらない**
- Ladle でも手動でテーマを切り替えられる

---

### Phase 2 — `tokens.css` にセマンティックカラー変数を追加

**目的**: テーマで切り替わる CSS カスタムプロパティ層を定義する。**コンポーネントには触れない。**

**作業内容**:

`src/tokens.css` に以下を追加する。定義する変数は `09-design-system.md` のトークン体系に準拠する。

```css
:root,
[data-theme="dark"] {
  --color-surface-canvas: var(--color-neutral-900);
  --color-surface-panel: var(--color-neutral-800);
  --color-surface-raised: var(--color-neutral-950);
  --color-surface-muted: var(--color-neutral-700);
  --color-surface-inset: var(--color-neutral-900);

  --color-text-primary: var(--color-neutral-100);
  --color-text-secondary: var(--color-neutral-300);
  --color-text-muted: var(--color-neutral-500);

  --color-border-default: var(--color-neutral-700);
  --color-border-strong: var(--color-neutral-600);
  --color-border-focus: var(--color-neutral-200);
}

[data-theme="light"] {
  --color-surface-canvas: var(--color-neutral-50);
  --color-surface-panel: var(--color-white);
  --color-surface-raised: var(--color-white);
  --color-surface-muted: var(--color-neutral-100);
  --color-surface-inset: var(--color-neutral-100);

  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-muted: var(--color-neutral-400);

  --color-border-default: var(--color-neutral-200);
  --color-border-strong: var(--color-neutral-300);
  --color-border-focus: var(--color-neutral-500);
}
```

Tailwind v4 の `@theme` に `color-surface-canvas` などを登録し、`bg-surface-canvas` / `text-text-primary` などの utility class として使えるようにする。

**変更ファイル**: `src/tokens.css`

**完了条件**:

- CSS 変数が定義され、`data-theme` 切り替えで値が変わる（DevTools で確認）
- コンポーネントには変更なし
- **見た目は Phase 0 の baseline と変わらない**

---

### Phase 3 — コンポーネントを 1 つずつ移行

**目的**: 各コンポーネントのハードコードされた color class を semantic token に置き換える。

**移行順序**:

副作用の小さい順に進める。**各コンポーネントを独立した commit として進め、Ladle で確認してから次に移る。**

| 順番 | 対象 | 注意点 |
|---:|---|---|
| 1 | `src/components/ui.tsx` | 最も多くのコンポーネントが依存。ここの型を確立してから他を進める |
| 2 | `src/components/AppHeader.tsx` | シンプルな構造 |
| 3 | `src/components/LanguageToggle.tsx` | 枠線が意図せず増えないよう注意 |
| 4 | `src/components/StatsGrid.tsx` | — |
| 5 | `src/components/TokenCard.tsx` / `TokenCardList.tsx` | conflict / new の accent bar（赤・黄）は**固定色のまま** |
| 6 | `src/components/ImportSummary.tsx` | — |
| 7 | `src/app/App.tsx`（shell・footer のみ） | scroll sync ロジックは一切触れない |
| 8 | `src/components/JsonTokenEditor.tsx` | **最後**。scroll sync・editor 背景・コード色は別 issue |

**各コンポーネントの完了条件**:

- Ladle で light / dark を切り替えて見た目が正しく変わる
- Phase 0 の baseline（dark）と比較して、dark 時の見た目が変わっていない
- copy tooltip・language toggle・editor frame に意図しない崩れがない

---

### Phase 4 — Ladle とプラグイン実画面の整合確認

**目的**: Ladle の表示がプラグイン実画面と一致することを最終確認する。

**作業内容**:

- `.ladle/components.tsx` の Provider にテーマ切り替えコントロールを追加する
- `capture-screenshots.mjs` に light テーマのキャプチャパターンを追加する
- `docs/screenshots/` に light テーマの baseline 画像を保存する
- Phase 0 で記録した dark baseline と dark 最終結果を差分比較する

**完了条件**:

- light / dark 両テーマで全 capture mode の画像が揃っている
- Ladle とプラグイン実画面の配色が一致している
- Phase 0 baseline と dark 最終結果の差分がない（または意図した変更のみ）

---

## 変更しないもの（保護一覧）

| 対象 | 理由 |
|---|---|
| `JsonTokenEditor` の scroll sync ロジック | テーマ作業と無関係。触ると別の不具合を持ち込む |
| conflict / new token の accent bar（赤・黄） | 意味を持つ固定色。テーマで変える必要がない |
| editor のコード配色（JSON key / string など） | 別 issue で扱う |
| Framer 外からの fallback デフォルト値 | `"dark"` 固定。ローカル判定ロジックを増やさない |
| 各コンポーネントのスクロール・レイアウト実装 | テーマ作業のスコープ外 |

---

## PR 戦略

| PR | 内容 | 期待されるレビューポイント |
|---|---|---|
| PR-1 | Phase 0: ベースライン記録のみ | 変更なしであることの確認 |
| PR-2 | Phase 1: Framer テーマ受け取り | 見た目が変わっていないこと |
| PR-3 | Phase 2: `tokens.css` へのセマンティック変数追加 | 見た目が変わっていないこと |
| PR-4〜n | Phase 3: コンポーネントごとに 1 PR | 各コンポーネントの light / dark 表示確認 |
| PR-final | Phase 4: 整合確認・スクリーンショット更新 | 全パターンの最終確認 |

各 PR は独立してマージ可能にし、前の PR が壊れた状態で次に進まない。

---

## 関連ドキュメント

- [09 Design System](./09-design-system.md) — セマンティックトークンの定義・CSS custom properties の実装例
- [11 Component Catalog](./11-component-catalog.md) — 対象コンポーネント一覧
