# Framer Token Importer

JSON color tokensをFramerのColor Styleへインポートするプラグインです。

現在の実装はフェーズ1の基本インポート版です。primitive color tokenに加えて、semantic alias tokenを解決してインポートできます。

主要ドキュメントを探すときは、Docsifyビューアとして `docs/index.html` を使います。ローカルでは `npm run docs:dev` を起動して `http://127.0.0.1:4173/` を開いてください。

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

## 既知の制約

- 現在の対象は color token import のみです。spacing、typography、radius などの non-color token は扱いません。
- alias は参照先が存在する color token のみ解決します。参照先が欠けている token は生成しません。
- 既存Color Styleとの conflict は自動解決せず、skip / replace をユーザーが選ぶ前提です。
- `dark` のみで対応する `light` がない token は通常 style として扱い、warning を表示します。
- `oklch()` は Framer 互換性のため `rgba(...)` に変換して登録します。
- screenshot は補助確認です。最終的な import 結果と permission 挙動は Framer 実機で確認が必要です。
- 大規模JSONは 2,000 color tokens 程度までを実用目安とします。それ以上は描画や操作が重くなる可能性があります。

## サポートとドキュメント

- ローカル docs の入口は `docs/index.html` です。仕様書、issue progress、screenshots へのリンクは Docsify sidebar から辿れます。
- Docsify で Markdown 文書を読む場合は `npm run docs:dev` を使い、`http://127.0.0.1:4173/` を開いてください。
- 公開前チェックの進捗メモは `docs/issues/34-release-check.md` にあります。
- support 窓口として GitHub Issues を使う場合は `https://github.com/kaonmick/framer-token-plugin/issues` を案内先にできます。

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

DocsifyでMarkdown文書だけを確認する場合は、Framer plugin 用のVite dev serverとは別に次を使います。

```bash
npm run docs:dev
```

| 用途 | コマンド | URL |
|---|---|---|
| Framer plugin 開発 | `npm run dev` | dev server起動時に表示される `https://framer.com/plugins/open` |
| Framer plugin HTTP確認 | `npm run dev:http` | `http://localhost:5173/` |
| Docsify文書確認 | `npm run docs:dev` | `http://127.0.0.1:4173/` |

## Git運用

git 運用の最小ルールは `docs/specs/13-git-workflow.md` にまとめています。
既存の `docs/specs/10-codex-issue-workflow.md` が Issue の進め方を扱うのに対して、こちらは `main` 同期、branch、merge 後の整理を扱います。

- `main` へ直接コミットしない
- 1 branch は 1 目的に保つ
- `main` の同期は `fast-forward only` で行う
- 通常の PR merge 方針は `squash merge` を推奨する

### よく使うコマンド

```bash
git switch main
npm run git:sync-main
```

merge 済みのローカル branch も整理したい場合は次を使います。

```bash
npm run git:sync-main:cleanup
```

削除候補だけ先に見たい場合は次を使います。

```bash
npm run git:sync-main:cleanup:dry-run
```

| 工程 | 進め方 |
|---|---|
| Issue を作成する | ユーザーまたは Codex 依頼 |
| `main` を最新化する | ユーザーまたは Codex 依頼 |
| Issue に対応する branch を作る | ユーザーまたは Codex 依頼 |
| 実装する | ユーザーまたは Codex 依頼 |
| テスト・機械的確認をする | ユーザーまたは Codex 依頼 |
| commit する | ユーザーまたは Codex 依頼 |
| push する | ユーザーまたは Codex 依頼 |
| PR を作成する | ユーザーまたは Codex 依頼 |
| PR をレビューする | ユーザー操作マスト |
| PR を merge する | ユーザー操作マスト |
| merge 後に remote branch を削除する | 自動 |
| ローカル `main` を更新する | ユーザーまたは Codex 依頼 |
| merge 済みのローカル branch を整理する | ユーザーまたは Codex 依頼 |

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
  components/       Project master components
  lib/
    framer/         Framer API integration
    mapping/        Token path to Framer style name mapping
    parser/         JSON token parser
    types/          Shared TypeScript types
fixtures/           Verification token JSON
tests/              Parser tests
scripts/
  serve-docs.mjs    Docsify static server
docs/
  specs/            Original specification pack
  index.html        Docsify documentation viewer
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
- light/dark確認用JSONは `fixtures/light-dark-colors.json` にあります。
- OKLCH変換の確認用JSONは `fixtures/oklch-colors.json` にあります。
- warning表示の確認用JSONは `fixtures/warning-cases.json` にあります。
- JSON構文エラーの確認用JSONは `fixtures/error-invalid-json.json` にあります。
- 大規模JSONは2,000 color tokens程度までを実用目安にします。それ以上の規模は描画・入力操作が重くなる可能性があるため、正式対応する場合は仮想化などの追加最適化が必要です。
