# Storybook Component Catalog

Storybook は、実装済みコンポーネントの見た目と状態を確認する場所です。
トークン値や JSON を編集する場所ではありません。

## 役割

| 場所 | 役割 |
|---|---|
| Plugin UI | 実際の操作と Framer 連携を確認する |
| Docs / HTML workbench | 仕様や UI 状態を壁打ちする |
| Storybook | コンポーネント単体と状態差分を確認する |

Storybook では、実装に使う `src/components/` を直接変えず、`src/stories/` に story と fixture を置きます。

## Summary の基本ルール

各 component story の `Summary` は、一覧確認の入口として使います。

- 左カラムを `dark`、右カラムを `light` にする
- `Summary` では Storybook 上部の dark / light トグルを非表示にする
- 日本語 / English の切り替えは残す
- UI stack がある component は `Ideal / Blank or Empty / Loading / Partial / Error` を並べる
- 単体 story は、1つの状態や操作だけを狭く確認する

この形にすると、テーマ差分と状態差分を同じ目線で確認できます。

## 共通 helper

dark / light 2カラムは `src/stories/fixtures/storyLayout.tsx` の `ThemeSummaryColumns` を使います。

```tsx
export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => {
    const language = getStoryLanguage(context.globals)

    return (
      <ThemeSummaryColumns>
        {() => <ComponentStory language={language} />}
      </ThemeSummaryColumns>
    )
  },
}
```

`hideThemeToggle` は Storybook preview の共通 decorator が読み取り、`Summary` だけ dark / light トグルを隠します。

## CI で確認すること

PR と `main` への push では、GitHub Actions で次を確認します。

```bash
npm run check
npm run build-storybook
```

`npm run check` は TypeScript の破損を見ます。
`npm run build-storybook` は story の読み込み、Storybook 設定、addon 設定の破損を見ます。

## まだ入れないもの

今の段階では、Storybook の interaction test や visual regression test は必須にしません。

- 操作が重要な component が増えたら `play` 関数を追加する
- CI で story 操作まで確認したくなったら Vitest addon を検討する
- 見た目の差分を厳密に追う段階で Chromatic などの visual test を検討する

まずは Storybook が壊れず、Summary で dark / light と主要状態を確認できる状態を保ちます。
