# Framer Token Importer

JSON color tokensをFramerのColor Styleへインポートするプラグインです。

現在の実装はフェーズ1の基本インポート版です。primitive color tokenに加えて、semantic alias tokenを解決してインポートできます。

## 現在できること

- JSONテキストの貼り付け
- ローカルJSONファイルの読み込み
- `$type: "color"` と `$value` を持つprimitive color tokenの解析
- semantic alias tokenの解決
- light / dark mode tokenのFramer Color Style theme値へのマッピング
- group levelの `$type: "color"` 継承
- hex、rgb(a)、hsl(a)、oklch() のプレビュー
- Framer Color Styleへの作成
- 既存Color Styleのskip / replace
- import summaryの表示
- English / 日本語のUI切り替え

## 開発

```bash
npm install
npm run dev
```

Framer側ではPluginメニューからDeveloper Toolsを有効化し、Open Development Pluginでローカルプラグインを開きます。dev server起動時に表示される `https://framer.com/plugins/open` を開いてください。

`npm run dev` は公式scaffoldと同じくHTTPS付きで起動します。初回はmacOSが証明書の信頼登録を求めるため、ターミナルでパスワード入力が必要です。

```bash
npm run dev
```

HTTPだけで確認したい場合は次を使います。ただしFramerのDevelopment Pluginからは接続できないことがあります。

```bash
npm run dev:http
```

## 検証

```bash
npm run check
npm test
npm run build
```

## ディレクトリ

```text
src/
  app/              Plugin UI
  features/         Follow-up feature slices
  lib/
    framer/         Framer API integration
    mapping/        Token path to Framer style name mapping
    parser/         JSON token parser
    types/          Shared TypeScript types
  fixtures/         Sample token JSON
tests/              Parser tests
docs/
  specs/            Original specification pack
  diagrams/         Diagrams
```

## 仕様メモ

- ソースパスはFramerのColor Style名として `/` 区切りに変換します。
- Framer側にColor Style階層があるため、先頭の `color` / `colors` は作成パスから外します。
- 不足tokenは生成しません。
- `{color.primitive.blue.500}` のようなaliasは、参照先が存在する場合のみ解決します。
- `light` / `dark` 階層または `$value` 内の `light` / `dark` キーは、同じColor Styleの `light` / `dark` 値としてまとめます。
- mode階層内のaliasは、必要に応じて同じmode内の参照先へ解決します。
- `dark` のみで対応する `light` がない場合は、dark階層を残した通常styleとして扱い、警告を表示します。
- `oklch()` はFramer互換性のため `rgba(...)` に変換して登録します。
- Color Style作成にはFramer Plugin APIの `createColorStyle({ path, light, dark })` を使います。
- light/dark確認用JSONは `src/fixtures/light-dark-colors.json` にあります。
- OKLCH変換の確認用JSONは `src/fixtures/oklch-colors.json` にあります。
- warning表示の確認用JSONは `src/fixtures/warning-cases.json` にあります。
- JSON構文エラーの確認用JSONは `src/fixtures/error-invalid-json.json` にあります。
- 大規模JSONは2,000 color tokens程度までを実用目安にします。それ以上の規模は描画・入力操作が重くなる可能性があるため、正式対応する場合は仮想化などの追加最適化が必要です。
