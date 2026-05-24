# Marketplace Submission Copy

Framer Marketplace の plugin 申請画面へ貼り付ける文面です。

公開文言は、現在実装済みの color token import に限定します。spacing、typography、radius、project-wide audit、sync、variables manager は含めません。

## Plugin Name

Json Color Importer

## Tagline

```text
Color tokens from JSON / 色取込
```

- 文字数: 30 / 30

## Summary

```text
No more rebuilding color styles by hand. Paste your JSON token file and import directly into Framer Color Styles — with light/dark, color preview, and conflict handling.

カラースタイルをFramerで一から再現する手間をなくします。JSONを貼り付けるだけでカラースタイルへ直接取り込み。ライト/ダーク、カラープレビュー、コンフリクト選択に対応。
```

- 文字数: 約 243 / 260

## Description

```text
Json Color Importer lets individuals and teams bring their JSON color tokens into Framer Color Styles with minimal steps.

If you already store colors as design tokens in a JSON file — from a token pipeline, Tokens Studio, or a shared design system repository — this plugin imports them directly into Framer and keeps your Color Styles organized without manual re-entry.

Json Color Importerは、個人やチームのJSONで管理しているカラートークンをFramer カラースタイルへ簡単に取り込むためのプラグインです。Tokens StudioやToken pipelineなど、すでにJSONでデザイントークンを管理している場合は最小限のステップでカラースタイルを整理できます。

---

### What it supports / 対応内容

Primitive color tokens ($type: "color" with $value)
Semantic alias tokens that reference other color tokens
Light and dark theme values mapped to Framer Color Style themes
Preview before importing — see exactly what will be created or updated
Conflict handling — choose skip or replace for each existing Color Style
Import summary showing created, replaced, skipped, and failed counts
English and Japanese UI

$type: "color" と $value を持つプリミティブカラートークン
他のカラートークンを参照するセマンティックエイリアス
ライト / ダークテーマ値をFramer カラースタイルのテーマへマッピング
インポート前のプレビュー（作成・更新される内容を事前確認）
コンフリクト処理
インポート後のサマリー（作成・更新・スキップ・失敗数）
英語 / 日本語の言語切り替え

---

Scope of this release:

Color token import only. This release does not cover spacing, typography, border radius, project-wide audits, syncing, or a variables manager.

このリリースはcolor token importのみです。spacing、typography、radius、audit、sync、variables managerは対象外です。

---

Known behavior / 既知の挙動
Alias tokens resolve only when the referenced token exists in the same file.
Conflicts with existing Color Styles require a manual choice before importing — existing styles are kept by default.
OKLCH values are converted to rgba for Framer compatibility.
Dark-only tokens without a matching light value are imported as regular styles.

エイリアスは参照先トークンが同じファイル内に存在する場合のみ解決します。
既存カラースタイルとのコンフリクトは、インポート前にどのカラートークンをインポートするかを手動で選ぶ必要があります（デフォルトは既存のトークンが選択されます）。
OKLCHはFramer互換性のためrgbaへ変換します。
対応するライトモードがないダークのみのトークンは通常スタイルとしてインポートされます。
```

## Review Instructions

```text
Open the plugin on any Framer canvas.

Test 1 — Basic import
1. Paste or upload a JSON file with $type: "color" tokens.
2. Confirm valid tokens appear in the preview list before importing.
3. Press Import and check the summary for created/replaced/skipped/failed counts.
4. Open Framer Color Styles and confirm styles were created under the correct names.

JSONを貼り付け、previewに色が出ることを確認。import後のsummaryとColor Style作成を確認します。

Test 2 — Light/dark tokens
5. Use a JSON file with light and dark values (nested light/dark keys or hierarchy).
6. Confirm one Color Style is created with both light and dark theme values.

light/dark両方を持つJSONで、1つのColor Styleにまとまることを確認します。

Test 3 — Conflict handling
7. Import the same JSON a second time.
8. Confirm a conflict prompt appears for existing Color Styles.
9. Choose skip for some, replace for others, and verify the result.

2回目importで既存styleのconflict選択が表示されることを確認します。

Test 4 — Error handling
10. Paste invalid JSON and confirm an error appears without importing.

不正なJSONでimportが実行されずerrorが表示されることを確認します。

Scope: color tokens only. No spacing, typography, radius, audit, sync, or variables manager.
対象はcolor tokenのみ。spacing、typography等は対象外です。
```

- 文字数: 約 970 / 1000

## 変更メモ

- tagline: 「Color tokens from JSON」でデザインシステムユーザーへの訴求を強化し、日本語「色取込」を添えて30文字ちょうど
- summary: 「No more rebuilding by hand」という課題起点の訴求に変更。機能列挙より「何を解決するか」を前面に
- description: Who this is for（ターゲット）→ The problem → Features → Scope → Known behavior の構成に整理。チームでトークン管理しているユーザー像を明示
- Review Instructions: 4つのテストシナリオ（基本・light/dark・conflict・エラー）に分けて番号を連番化。各テストに日本語サマリーを追加
