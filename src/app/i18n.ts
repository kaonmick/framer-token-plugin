export type Language = "en" | "ja"

export const languageLabels: Record<Language, string> = {
  en: "English",
  ja: "日本語",
}

export const messages = {
  en: {
    title: "Token Color Importer",
    language: "Language",
    json: "JSON",
    uploadJson: "Upload JSON File",
    uploadJsonButton: "Upload",
    dropJsonTitle: "Drop or upload a JSON file",
    copyJson: "Copy JSON",
    copiedJson: "JSON copied",
    copyJsonFailed: "Copy failed",
    editorPlaceholder: `// Upload a JSON file or paste your tokens here
// Supports W3C Design Tokens format ($type / $value)
{
  "color": {
    "primitive": {
      "blue": {
        "500": {
          "$type": "color",
          "$value": "#0066ff"
        }
      }
    }
  }
}`,
    analyze: "Reload",
    analyzing: "Reloading...",
    analyzeHelp:
      'The JSON is analyzed as you type. Use "Analyze JSON" to refresh the preview manually after a large paste.',
    primitive: "Primitive",
    semantic: "Semantic",
    lightDark: "Light/Dark",
    warnings: "Warnings",
    light: "Light",
    dark: "Dark",
    line: "Line",
    warningTitle: "Warnings",
    preview: "Preview",
    emptyState: "No importable color tokens found.",
    conflict: "Conflict",
    newTokens: "New Token",
    whichTokenToUse: "Which token to use?",
    existingStyle: "Existing style",
    existingStyleConflictTitle: "Existing style conflict",
    existingStyleConflictDescription:
      "There is a conflict with an existing style. Select the token that should be registered.",
    duplicateStyleNameTitle: "Duplicate style name",
    duplicateStyleNameDescription:
      "Multiple tokens have the same style name. Select the token that should be imported.",
    checkingConflicts: "Checking existing Color Styles...",
    conflictCheckFailed: "Could not check existing Color Styles.",
    cancel: "Cancel",
    ok: "OK",
    import: "Import Color Styles",
    importing: "Importing...",
    insufficientPermissions: "Insufficient permissions",
    importCompleteTitle: "Import complete!",
    importFailedTitle: "Import failed",
    summary: "Summary",
    created: "Created",
    replaced: "replaced",
    skipped: "skipped",
    failed: "failed",
    importedNotice: "Imported {count} color style(s){failed}.",
    importFailed: "Import failed: {message}",
    alias: "Reference",
    conversionNote: "{count} OKLCH color(s) were converted to rgba() for Framer compatibility.",
    modePairNote: "{count} light/dark pair(s) were imported as Framer Color Style theme values.",
    invalidJsonTitle: "Invalid JSON",
    invalidJson: "Invalid JSON: {message}",
  },
  ja: {
    title: "Token Color Importer",
    language: "言語",
    json: "JSON",
    uploadJson: "JSONファイルをアップロード",
    uploadJsonButton: "アップロード",
    dropJsonTitle: "JSONファイルをドロップ、またはアップロード",
    copyJson: "JSONをコピー",
    copiedJson: "JSONをコピーしました",
    copyJsonFailed: "コピーに失敗しました",
    editorPlaceholder: `// JSONファイルをアップロードするか、ここにトークンを貼り付けてください
// W3C Design Tokens形式（$type / $value）に対応しています
{
  "color": {
    "primitive": {
      "blue": {
        "500": {
          "$type": "color",
          "$value": "#0066ff"
        }
      }
    }
  }
}`,
    analyze: "再読み込み",
    analyzing: "再読み込み中...",
    analyzeHelp:
      "JSONは入力時に自動解析されます。大量貼り付け後にプレビューを手動更新したい場合は「JSONを解析」ボタンを押してください。",
    primitive: "プリミティブ",
    semantic: "セマンティック",
    lightDark: "Light/Dark",
    warnings: "警告",
    light: "Light",
    dark: "Dark",
    line: "行",
    warningTitle: "警告",
    preview: "プレビュー",
    emptyState: "インポート可能なカラートークンがありません。",
    conflict: "Conflict",
    newTokens: "New Token",
    whichTokenToUse: "どのトークンを登録しますか？",
    existingStyle: "既存のスタイル",
    existingStyleConflictTitle: "Existing style conflict",
    existingStyleConflictDescription: "既存のスタイルとの競合があります。登録するトークンを選択してください。",
    duplicateStyleNameTitle: "Duplicate style name",
    duplicateStyleNameDescription: "同じスタイル名が複数あります。インポートするトークンを選択してください。",
    checkingConflicts: "既存のカラースタイルを確認中...",
    conflictCheckFailed: "既存のカラースタイルを確認できませんでした。",
    cancel: "キャンセル",
    ok: "OK",
    import: "カラースタイルをインポート",
    importing: "インポート中...",
    insufficientPermissions: "権限が不足しています",
    importCompleteTitle: "インポートが完了しました！",
    importFailedTitle: "インポートに失敗しました",
    summary: "サマリー",
    created: "作成",
    replaced: "置換",
    skipped: "スキップ",
    failed: "失敗",
    importedNotice: "{count}件のカラースタイルをインポートしました{failed}。",
    importFailed: "インポートに失敗しました: {message}",
    alias: "参照先のトークン",
    conversionNote: "{count}件のOKLCHカラーをFramer互換のためrgba()に変換しました。",
    modePairNote: "{count}件のlight/darkペアをFramerカラースタイルのテーマ値としてインポートしました。",
    invalidJsonTitle: "JSONが不正です",
    invalidJson: "JSONが不正です。構文を確認してください。\n詳細: {message}",
  },
} as const
