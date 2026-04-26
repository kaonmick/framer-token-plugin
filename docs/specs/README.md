# Framer Token Importer / 仕様パック

このディレクトリには、JSON のカラートークンを忠実にインポートする Framer プラグイン開発向けの軽量な仕様パックをまとめています。

## ファイル

- `01-roadmap.md` — 拡張ロードマップ
- `02-mvp-spec.md` — MVP スコープ（コアのみ）
- `03-core-requirements-and-phases.md` — コア要件とフェーズ計画
- `04-audit-items-and-release-phases.md` — 監査項目とリリースフェーズの対応
- `05-business-model.md` — 収益化と財務モデル
- `06-codex-handoff.md` — Codex への引き継ぎプロンプト / コンテキスト
- `07-plugin-registration-flow.md` — ローカル開発から公開までの大まかな流れ
- `08-technical-validation-plan.md` — Pro 版の中核機能を実装前に検証するための計画
- `09-design-system.md` — theme token / semantic color / light-dark 対応の叩き台
- `10-codex-issue-workflow.md` — GitHub Issues で Codex 作業と Kaon 確認を分離する運用ルール
- `11-component-catalog.md` — コンポーネントと状態を管理するカタログ
- `12-ai-operation-usage-design.md` — AI利用ログ、Usage / Costs API、統計件数、モデル運用ルール化の設計
- `13-git-workflow.md` — `main` 同期、branch、merge 後整理の最小 git 運用

## プロダクト原則

> ソース作成者が定義した構造と意図を壊さない。

このプラグインは、不足しているトークンを生成したり補完したりするのではなく、ソース JSON を忠実に反映するべきです。
