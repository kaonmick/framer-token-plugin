# Issue 35 Storybook 導入計画

## 目的

トークンエディタで決めた値が、実コンポーネントに当たった時の見た目と挙動を Storybook で確認できるようにする。

この issue では、トークンエディタと Storybook の役割を分けてから、Storybook の最小導入範囲を決める。

## 前提

| ツール | 役割 |
|---|---|
| トークンエディタ | 値を決める場所 |
| Storybook | 結果を確認する場所 |

基本の流れは次の通り。

```text
トークンエディタで値を決める
  ↓
npm run generate-tokens
  ↓
Storybookでコンポーネントに当たった結果を確認
  ↓
気になる値があればトークンエディタに戻る
```

エディタはコンポーネントを知らない。Storybook は JSON を編集しない。この分離を守ることで、両方のツールを小さく保つ。

## トークンエディタの担当

トークンエディタは、デザイントークンの値を管理する。

- `primitive.json` / `semantic.json` / `hardcoded-report.json` の読み込み
- Primitive color の編集
- カラースケールの自動生成
- ブランドカラーの追加、削除、リネーム
- radius / spacing / typography / shadow の編集
- Semantic token の light / dark 編集
- dark 未設定 token の検出と補填
- contrast ratio の確認
- hardcoded value の token 割り当て
- `primitive.json` / `semantic.json` / `replace-map.json` の書き出し
- light only mode の書き出し

トークンエディタでは扱わないこと。

- コンポーネントの見た目確認
- Storybook の story 管理
- 複合レイアウト確認
- Storybook addon による a11y 自動検査

## Storybook の担当

Storybook は、トークンの値がコンポーネントに反映された結果を確認する。

- Primitive color swatch の一覧
- Semantic token の light / dark 対応表
- 単体コンポーネントの preview
- Args panel による `variant` / `size` / `state` の切り替え
- CardList + Card + Button + Icon + Tag などの複合 preview
- plugin 画面に近い構成の preview
- toolbar からの light / dark 切り替え
- `@storybook/addon-a11y` による a11y 検査
- default / hover / focus / loading / disabled / error の状態比較
- error / warning 文言の差し替え確認

Storybook では扱わないこと。

- トークン値の編集
- JSON の生成、書き出し
- hardcoded value の検出
- replace-map による自動置換

## 最小導入範囲

最初の導入では、Storybook を「確認場所」として成立させることだけを目標にする。

1. Storybook を React + Vite 構成で起動できるようにする
2. Storybook 専用ファイルを app 実装から分離する
3. `src/tokens.css` を Storybook 側で読み込む
4. light / dark 切り替えを toolbar から確認できるようにする
5. Token catalog story を作る
6. 既存コンポーネントの最小 story を作る
7. `@storybook/addon-a11y` を入れる
8. `npm run storybook` / `npm run build-storybook` を追加する

## ファイル配置案

```text
.storybook/
  main.ts
  preview.ts
src/
  stories/
    tokens/
      TokenCatalog.stories.tsx
    components/
      TokenCard.stories.tsx
      TokenCardList.stories.tsx
    app/
      PluginPreview.stories.tsx
```

`src/components/` は実装の置き場として維持する。Storybook 用の fixture や story は `src/stories/` に分ける。

## 追加 script

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

トークンエディタ側とつなぐ script は、別 issue で追加する。

```bash
npm run generate-tokens
npm run find-hardcoded
npm run apply-tokens --map=replace-map.json
```

この repo に既に存在しない script 名を README へ先に書く場合は、実装 issue と同じ PR で追加する。

## UI stack の Storybook 対応

| UI stack | Storybook で確認すること |
|---|---|
| Ideal State | 正常に表示され、主要操作が見える |
| Blank / Empty State | 初期状態で次の行動が分かる |
| Loading State | 待機中の表示が崩れない |
| Partial State | warning や conflict が混在しても読める |
| Error State | 原因とリトライ導線が分かる |

`docs/ui-state-workbench.html` の文言確認は、Storybook の story へ段階的に移す。ただし workbench は仕様の壁打ち場所として残せる。

## 完了条件

- [x] `npm run storybook` で Storybook が起動する
- [x] `npm run build-storybook` が通る
- [x] `npm run check` が通る
- [x] Token catalog story で light / dark の違いが確認できる
- [x] 既存の主要コンポーネントを app 実装から分離した story で確認できる
- [x] a11y panel で最低限の自動検査ができる
- [x] README と Docsify sidebar から Storybook の位置づけが分かる

## 実装メモ

- Storybook は `@storybook/react-vite` で導入した
- story は `src/stories/` に集約し、`src/components/` は実装の置き場として維持した
- `@storybook/addon-a11y` を追加し、a11y panel から自動検査できるようにした
- toolbar の theme 切り替えで `data-theme="dark"` / `data-theme="light"` を切り替える
- `src/tokens.css` と bundled font を Storybook preview で読み込む
- build output の `storybook-static/` は `.gitignore` に追加した

## Kaon 確認事項

- [ ] Storybook は「値の編集をしない」方針でよいか
- [ ] `src/stories/` を Storybook 専用置き場にしてよいか
- [ ] 最初の対象コンポーネントを `TokenCard` / `TokenCardList` / plugin preview に絞ってよいか
- [ ] `docs/ui-state-workbench.html` は当面残して、Storybook 移行後に整理する方針でよいか

## Issue comment draft

```md
## Codex 作業報告

### 作業内容

- Storybook 導入前の役割分担を `docs/issues/35-storybook-introduction.md` に整理
- トークンエディタは値を決める場所、Storybook は結果を確認する場所として分離
- 最小導入範囲、配置案、追加 script、完了条件を明文化
- Docsify sidebar から辿れるように導線を追加

### 根拠 / 成果物

- `docs/issues/35-storybook-introduction.md`
- `docs/_sidebar.md`

### Kaon 確認事項

- [ ] Storybook は値の編集をしない方針でよいか
- [ ] `src/stories/` を Storybook 専用置き場にしてよいか
- [ ] 最初の対象を `TokenCard` / `TokenCardList` / plugin preview に絞ってよいか

### 次の推奨アクション

- 次 issue では `generate-tokens` / `find-hardcoded` / `apply-tokens` の連携を進める
```
