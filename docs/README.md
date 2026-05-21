# Json Color Importer Docs

このページは、既存の Markdown 文書を Docsify で横断的に読むための入口です。

## よく見る文書

- [仕様パック README](specs/README.md)
- [Roadmap](specs/01-roadmap.md)
- [MVP Spec](specs/02-mvp-spec.md)
- [Git Workflow](specs/13-git-workflow.md)
- [AI Operation Usage Design](specs/12-ai-operation-usage-design.md)
- [Technical Validation Plan](specs/08-technical-validation-plan.md)
- [Spike README](spikes/README.md)

## ローカルで見る

```bash
npm run docs:dev
```

起動後、ブラウザで `http://127.0.0.1:4173/` を開きます。

Docsify は Markdown をブラウザ内で読み込むため、`file://` で直接開くのではなく、専用のローカルサーバー経由で確認します。このサーバーは Framer plugin 用の Vite dev server とは別管理です。

## Git運用を見る

`main` 同期、merge 後の branch 整理、`squash merge` 前提の考え方は [Git Workflow](specs/13-git-workflow.md) にまとめています。

```bash
git switch main
npm run git:sync-main
```

ローカル branch の整理まで行う場合は次を使います。

```bash
npm run git:sync-main:cleanup
```
