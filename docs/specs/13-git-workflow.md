# Git Workflow

## 目的

この文書は、この repo の最小 git 運用を揃えるためのガイドです。

既存の `Codex Issue Workflow` は「どの issue に着手できるか」「どこで Kaon 確認に止めるか」を整理する文書です。
この文書では、その前後にある `main` 同期、branch 運用、merge 後の整理を扱います。

## 基本方針

- Issue を起点に作業する
- `main` へ直接コミットしない
- 1 branch は 1 目的に保つ
- `main` の同期は `fast-forward only` で行う
- 通常の PR merge 方針は `squash merge` を推奨する

## branch の考え方

- issue に対応する作業は、できるだけ issue ごとに branch を分ける
- 無関係な修正を同じ branch に混ぜない
- branch 名は今すぐ厳格統一しないが、目的と issue の対応が追える名前にする
- 既存の `codex/...` 系 branch はそのまま扱ってよい

## `merge` と `squash merge` の違い

- `merge`: branch 上の commit をそのまま `main` に残す
- `squash merge`: PR 全体の変更を 1 commit にまとめて `main` に残す

この repo では、`main` を issue 単位で追いやすく保つため、通常は `squash merge` を推奨します。
branch 上の細かい commit の流れ自体を履歴として残したい場合だけ、例外的に通常の `merge` を検討します。

## 役割分担

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

## 代表コマンド

| 工程 | 例 |
|---|---|
| `main` を最新化する | `git switch main` → `npm run git:sync-main` |
| branch を作る | `git switch -c codex/issue-16-git-ops-minimal` |
| ローカル `main` を更新する | `git switch main` → `npm run git:sync-main` |
| merge 済みのローカル branch を整理する | `npm run git:sync-main:cleanup` |
| 削除候補だけ先に確認する | `npm run git:sync-main:cleanup:dry-run` |

## merge 後の整理

GitHub 側では、PR を merge したあとに head branch を自動削除する設定を推奨します。

一方で、GitHub は各開発者のローカル clone を自動更新しません。
ローカル `main` を更新したいときは、必ず `main` に切り替えてから次を実行します。

```bash
git switch main
npm run git:sync-main
```

このコマンドは次を行います。

- `origin` を `fetch --prune` する
- `origin/main` を `fast-forward only` でローカル `main` に取り込む
- 未コミット変更がある場合は止まる
- ローカル `main` に独自 commit があり fast-forward できない場合は止まる

意図しない merge commit を防ぎたいので、通常の `git pull` よりもこの手順を優先します。

ローカルに残った merge 済み branch もまとめて整理したい場合は、次を使います。

```bash
npm run git:sync-main:cleanup
```

先に候補だけ確認したい場合は、次を使います。

```bash
npm run git:sync-main:cleanup:dry-run
```

cleanup では、通常 merge で `main` の祖先になった branch に加え、`squash merge` のように commit hash が変わっていても patch が `main` に取り込み済みと判定できる branch を削除対象にします。
`main` に未反映の patch がある branch や、merge commit を含む branch は削除しません。

## 関連文書

- `docs/specs/10-codex-issue-workflow.md`
- `README.md`
- `docs/README.md`
