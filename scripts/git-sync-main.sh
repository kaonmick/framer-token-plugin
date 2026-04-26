#!/bin/sh

set -eu

usage() {
  cat <<'EOF'
使い方:
  sh scripts/git-sync-main.sh
  sh scripts/git-sync-main.sh --delete-merged-local
  sh scripts/git-sync-main.sh --delete-merged-local --dry-run

説明:
  - origin/main を fetch --prune する
  - ローカル main を fast-forward で同期する
  - `--delete-merged-local` を付けると、main に取り込み済みのローカル branch を削除する
  - `--dry-run` を付けると、削除せず判定結果だけを表示する
EOF
}

delete_merged_local=false
dry_run=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --delete-merged-local)
      delete_merged_local=true
      ;;
    --dry-run)
      dry_run=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 1
      ;;
  esac
  shift
done

current_branch="$(git branch --show-current)"

if [ "$current_branch" != "main" ]; then
  echo "このコマンドは main 上で実行してください。現在の branch: $current_branch" >&2
  echo "例: git switch main && npm run git:sync-main" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "作業ツリーに未コミットの変更があります。commit または stash のあとで再実行してください。" >&2
  exit 1
fi

echo "[1/3] origin/main を取得します"
git fetch --prune origin

echo "[2/3] ローカル main を fast-forward 同期します"
git merge --ff-only origin/main

if [ "$delete_merged_local" != "true" ]; then
  echo "[3/3] 同期が完了しました"
  echo 'ローカル branch を整理する場合は `npm run git:sync-main:cleanup` を実行してください。'
  exit 0
fi

if [ "$dry_run" = "true" ]; then
  echo "[3/3] main に取り込み済みのローカル branch を dry-run で確認します"
else
  echo "[3/3] main に取り込み済みのローカル branch を整理します"
fi

candidate_branches="$(
  git for-each-ref refs/heads --format='%(refname:short)' \
    | while IFS= read -r branch; do
        [ "$branch" != "main" ] || continue

        if git merge-base --is-ancestor "$branch" main; then
          printf '%s\t%s\t%s\n' "$branch" "merged" "main に commit ancestry で取り込み済み"
          continue
        fi

        if [ -n "$(git rev-list --merges main.."$branch")" ]; then
          printf '%s\t%s\t%s\n' "$branch" "skip" "merge commit を含むため自動 cleanup しない"
          continue
        fi

        cherry_output="$(git cherry main "$branch")"

        if printf '%s\n' "$cherry_output" | grep -q '^\+'; then
          printf '%s\t%s\t%s\n' "$branch" "skip" "main に未反映の patch がある"
          continue
        fi

        if [ -n "$cherry_output" ]; then
          printf '%s\t%s\t%s\n' "$branch" "squash-equivalent" "main に同等 patch あり（squash merge など）"
          continue
        fi

        printf '%s\t%s\t%s\n' "$branch" "skip" "main への取り込み状況を判定できない"
      done
)"

if [ -z "$candidate_branches" ]; then
  echo "判定対象のローカル branch はありません。"
  exit 0
fi

delete_count=0
keep_count=0

while IFS="$(printf '\t')" read -r branch status reason; do
  [ -n "$branch" ] || continue

  case "$status" in
    merged)
      if [ "$dry_run" = "true" ]; then
        echo "would delete: $branch ($reason)"
      else
        echo "delete: $branch ($reason)"
        git branch -d "$branch"
      fi
      delete_count=$((delete_count + 1))
      ;;
    squash-equivalent)
      if [ "$dry_run" = "true" ]; then
        echo "would delete: $branch ($reason)"
      else
        echo "delete: $branch ($reason)"
        git branch -D "$branch"
      fi
      delete_count=$((delete_count + 1))
      ;;
    skip)
      echo "keep: $branch ($reason)"
      keep_count=$((keep_count + 1))
      ;;
  esac
done <<EOF
$candidate_branches
EOF

if [ "$dry_run" = "true" ]; then
  echo "dry-run complete: delete candidate=$delete_count, keep=$keep_count"
else
  echo "cleanup complete: deleted=$delete_count, kept=$keep_count"
fi
