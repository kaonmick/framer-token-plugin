# Light / Dark テーマ対応

## 目的

Framer プラグイン UI を Framer 本体の light / dark テーマに追従させる。
Framer を source of truth とし、プラグイン独自のテーマ切り替え UI は持たない。

## 位置づけ

このドキュメントは、issue #28 の theme 対応を進めるための rollout メモ兼 status まとめ。
初期の計画メモとして始まり、2026-05-06 時点では `main` に取り込まれた実装・artifact も反映した更新版として扱う。

## 背景

以前の theme 対応では、以下が同時に起きて破綻しやすかった。

- Framer テーマの受け取り方を固める前に、アプリ側の `data-theme` と fallback を触り始めた
- テーマ追従だけでよいのに、semantic token 置換やカラーリファクタまで一気に広げた
- component 確認面の見た目を直しながら本体の色も変えたため、どちらが正なのかわからなくなった
- 変更前の baseline を記録せずに進めた
- コンポーネント単位でなくアプリ全体を先に動かし、副作用が連鎖した
- editor の scroll sync 実装にも手を入れてしまい、テーマと無関係な不具合を持ち込んだ

この反省を踏まえ、theme 対応はフェーズを分けて進め、dark baseline 固定、theme sync、semantic token 化、UI 置換、検証の順で扱う。

## 対象外

- プラグイン独自のテーマ切り替え UI
- editor の scroll sync ロジック変更
- conflict / new token の accent bar の意味変更
- テーマ対応と無関係な layout / interaction の改修
- editor の syntax color の再設計

## ステータス概要

| Phase | 状態 | 2026-05-06 時点の内容 |
|---|---|---|
| Phase 0 | 完了 | dark baseline を [Issue 28 Phase 0 Dark Baseline](../issues/28-phase0-dark-baseline.md) と `docs/screenshots/issue-28-phase0-dark-baseline/` に固定 |
| Phase 1 | 完了 | `src/app/theme.ts` で `data-framer-theme` を `html[data-theme]` に同期し、theme 未取得時は `dark` fallback |
| Phase 2 | 完了 | `src/tokens.css` に light / dark の semantic color layer を追加し、Tailwind utility へ接続 |
| Phase 3 | 進行中 | core UI は semantic color class へ移行済み。差分監査と parity 確認を継続 |
| Phase 4 | 未完 | light theme の capture 更新、plugin 実画面の整合確認、docs 最終同期が残り |

## 実装済みの要点

### Phase 0 — ベースライン記録

- dark baseline は [Issue 28 Phase 0 Dark Baseline](../issues/28-phase0-dark-baseline.md) に集約
- baseline PNG は `docs/screenshots/issue-28-phase0-dark-baseline/` を参照
- 変えてはいけない dark 見た目は同 issue doc の「守るべき見た目」を source of truth とする

### Phase 1 — Framer テーマ受け取り

- `src/app/theme.ts` で `data-framer-theme` を読み、`document.documentElement.dataset.theme` に反映
- 未知の値や theme 未設定時は `dark` に倒す
- `tests/themeSync.test.ts` で fallback と MutationObserver 経由の同期を確認

### Phase 2 — semantic color layer

- `src/tokens.css` の `@layer base` に dark / light の CSS custom properties を実装
- surface / text / border / accent / status / code の semantic token をここで切り替える
- Tailwind utility は `bg-surface-base`、`text-text-default`、`border-border-muted` などの名前で使う

### Phase 3 — core UI の置換

2026-05-06 時点で、少なくとも以下は semantic color class ベースに移っている。

- `src/app/App.tsx`
- `src/components/ui.tsx`
- `src/components/AppHeader.tsx`
- `src/components/JsonFileDropZone.tsx`
- `src/components/LanguageToggle.tsx`
- `src/components/TokenCard.tsx`
- `src/components/TokenCardList.tsx`
- `src/components/ImportSummary.tsx`
- `src/components/JsonTokenEditor.tsx`

semantic color の確認は、実装ファイルとスクリーンショットを基準に行う。

## 残タスク

### Phase 4 — parity と検証

- light theme の capture mode 画像を `docs/screenshots/` に追加する
- plugin 実画面で light / dark の表示差を確認する
- dark baseline と current dark UI を比較し、意図しない drift がないか確認する
- Docsify sidebar / issue メモを最終状態へ同期する

### 監査メモ

- conflict / new token の accent bar は fixed meaning color として扱い、theme で再設計しない
- `JsonTokenEditor` の scroll sync は theme 対応のスコープ外とする
- editor の code syntax color は semantic layer に接続済みでも、配色ルール自体の再設計は別 issue で扱う

## 次に確認すること

| 観点 | 見る場所 |
|---|---|
| dark baseline の基準 | [Issue 28 Phase 0 Dark Baseline](../issues/28-phase0-dark-baseline.md) |
| semantic token の定義 | [09 Design System](./09-design-system.md) |
| UI の実装 | `src/app/App.tsx`, `src/components/` |
| semantic token の定義 | [09 Design System](./09-design-system.md) |

## 関連ファイル

- `src/app/theme.ts`
- `src/tokens.css`
- `tests/themeSync.test.ts`
- `docs/issues/28-phase0-dark-baseline.md`
