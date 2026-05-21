import { framer, useIsAllowedTo } from "framer-plugin"
import { ArrowLeft } from "lucide-react"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { AppHeader } from "../components/AppHeader.tsx"
import { ImportSummary } from "../components/ImportSummary.tsx"
import { JsonFileDropZone } from "../components/JsonFileDropZone.tsx"
import { JsonTokenEditor, type EditorDiagnostic } from "../components/JsonTokenEditor.tsx"
import { TokenCardList } from "../components/TokenCardList.tsx"
import {
  ActionButton,
  DialogActions,
  DialogBackdrop,
  DialogPanel,
  MessageBox,
} from "../components/ui.tsx"
import { findColorStyleConflicts, importColorStyles } from "../lib/framer/colorStyles.ts"
import { parseColorTokenJson } from "../lib/parser/colorTokenParser.ts"
import type {
  ColorStyleConflict,
  ImportColorStylesResult,
  ParsedColorToken,
  ParseColorTokensResult,
  ParseWarning,
} from "../lib/types/tokens.ts"
import { type Language, messages } from "./i18n.ts"
import { syncDocumentThemeFromFramer } from "./theme.ts"

const MIN_ACTION_FEEDBACK_MS = 1000
const CAPTURE_MODES = [
  "default",
  "preview-normal",
  "light-dark",
  "oklch",
  "warning",
  "invalid-json",
  "conflict",
  "summary-success",
  "summary-failed",
] as const

type CaptureMode = (typeof CAPTURE_MODES)[number]
type AppPage = "editor" | "preview"
type JsonInputSource = "empty" | "file" | "text"

interface InitialCaptureState {
  conflicts: ColorStyleConflict[]
  summary: ImportColorStylesResult | null
}

const initialCaptureMode = getCaptureMode()
const EMPTY_PARSE_RESULT: ParseColorTokensResult = {
  tokens: [],
  conflictGroups: [],
  warnings: [],
}

if (!initialCaptureMode) {
  void framer.showUI({
    position: "top right",
    width: 420,
    height: 620,
    resizable: true,
    minWidth: 360,
    minHeight: 520,
    maxWidth: 720,
    maxHeight: 900,
  })
}

export function App() {
  const captureMode = useMemo(() => initialCaptureMode, [])
  const initialJsonText = useMemo(() => getInitialJsonText(captureMode), [captureMode])
  const initialParseResult = useMemo(() => parseEditorJson(initialJsonText), [initialJsonText])
  const initialCaptureState = useMemo(
    () => getInitialCaptureState(captureMode, initialParseResult),
    [captureMode, initialParseResult]
  )
  const [language, setLanguage] = useState<Language>("en")
  const [jsonText, setJsonText] = useState(initialJsonText)
  const [parseResult, setParseResult] = useState<ParseColorTokensResult>(initialParseResult)
  const [conflicts, setConflicts] = useState<ColorStyleConflict[]>(initialCaptureState.conflicts)
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)
  const [conflictSelections, setConflictSelections] = useState<Map<string, string>>(new Map())
  const [summary, setSummary] = useState<ImportColorStylesResult | null>(initialCaptureState.summary)
  const [isImporting, setIsImporting] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>("editor")
  const [inputSource, setInputSource] = useState<JsonInputSource>(initialJsonText.trim() ? "text" : "empty")
  const [fileAlert, setFileAlert] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)

  const t = messages[language]
  const isAllowedToImportColorStyles = useIsAllowedTo("createColorStyle", "ColorStyle.setAttributes")
  const hasTokens = parseResult.tokens.length > 0 || parseResult.conflictGroups.length > 0
  const hasJsonInput = jsonText.trim().length > 0
  const canExtract = hasJsonInput && hasTokens && !parseResult.error && !isPending
  const canImport =
    currentPage === "preview" && hasTokens && (isAllowedToImportColorStyles || Boolean(captureMode)) && !isImporting
  const extractButtonTitle = hasJsonInput ? undefined : t.extractColorDisabled
  const importButtonLabel = isImporting ? t.importing : t.import
  const importButtonTitle = isAllowedToImportColorStyles || captureMode ? undefined : t.insufficientPermissions

  const allTokensForStats = useMemo(
    () => [
      ...parseResult.tokens,
      ...parseResult.conflictGroups.flatMap(g => g.candidates.slice(0, 1)),
    ],
    [parseResult.tokens, parseResult.conflictGroups]
  )
  const modePairCount = allTokensForStats.filter(token => token.darkValue).length
  const rgbaConversionCount = allTokensForStats.reduce(
    (count, token) => count + countRgbaConversions(token),
    0
  )
  const skippedWarningItems = useMemo(
    () => getSkippedWarningItems(parseResult.warnings, language),
    [language, parseResult.warnings]
  )
  const hasPreviewAnnouncements = rgbaConversionCount > 0 || skippedWarningItems.length > 0
  const editorDiagnostics = useMemo(
    () => buildEditorDiagnostics(parseResult, language),
    [language, parseResult.error, parseResult.errorLine, parseResult.warnings]
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => syncDocumentThemeFromFramer(document), [])

  // Initialize conflict selections when parse result changes
  useEffect(() => {
    setConflictSelections(prev => {
      const next = new Map<string, string>()
      for (const group of parseResult.conflictGroups) {
        const defaultId = group.candidates[0]?.id
        if (defaultId) {
          next.set(group.styleName, prev.get(group.styleName) ?? defaultId)
        }
      }
      return next
    })
  }, [parseResult.conflictGroups])

  // Add existing-conflict selections when Framer conflict check completes
  useEffect(() => {
    if (conflicts.length === 0) return
    setConflictSelections(prev => {
      const next = new Map(prev)
      for (const conflict of conflicts) {
        if (!next.has(conflict.styleName)) {
          next.set(conflict.styleName, "existing")
        }
      }
      return next
    })
  }, [conflicts])

  useEffect(() => {
    if (captureMode) {
      if (captureMode === "conflict") {
        setConflicts(getCaptureConflicts(parseResult))
        setConflictError(null)
      }
      setIsCheckingConflicts(false)
      return
    }

    let isCurrent = true

    async function checkConflicts() {
      if (parseResult.error || !hasTokens) {
        setConflicts([])
        setConflictError(null)
        setIsCheckingConflicts(false)
        return
      }

      setIsCheckingConflicts(true)
      setConflictError(null)

      try {
        const nextConflicts = await findColorStyleConflicts(getConflictCheckTokens(parseResult))
        if (!isCurrent) return
        setConflicts(nextConflicts)
      } catch (error) {
        if (!isCurrent) return
        setConflicts([])
        setConflictError(error instanceof Error ? error.message : String(error))
      } finally {
        if (isCurrent) setIsCheckingConflicts(false)
      }
    }

    void checkConflicts()

    return () => {
      isCurrent = false
    }
  }, [captureMode, parseResult, hasTokens])

  function analyzeJson(nextText = jsonText) {
    const nextResult = parseEditorJson(nextText)
    startTransition(() => {
      setParseResult(nextResult)
      setSummary(null)
    })
    return nextResult
  }

  function goToPreview() {
    if (!canExtract) return
    setFileAlert(null)
    setCurrentPage("preview")
  }

  function handleJsonTextChange(nextText: string) {
    const nextResult = analyzeJson(nextText)
    setJsonText(nextText)
    setInputSource(nextText.trim() ? "text" : "empty")
    setFileAlert(null)

    if (captureMode && nextText.length > 0 && captureMode !== "default" && captureMode !== "invalid-json") {
      setCurrentPage("preview")
      return
    }

    if (nextResult.error || currentPage === "preview" || nextText.trim().length === 0) {
      setCurrentPage("editor")
    }
  }

  async function handleJsonFileSelect(file: File) {
    const text = await file.text()
    const nextResult = analyzeJson(text)
    setJsonText(text)
    setInputSource(text.trim() ? "file" : "empty")

    if (nextResult.error) {
      setCurrentPage("editor")
      setFileAlert(t.fileParseErrorAlert)
      return
    }

    if (!hasImportableTokens(nextResult)) {
      setCurrentPage("editor")
      setFileAlert(t.fileEmptyAlert)
      return
    }

    setFileAlert(null)
    setCurrentPage(nextResult.warnings.length > 0 ? "editor" : "preview")
  }

  function handleEditorScroll(scrollTop: number) {
    if (!lineNumbersRef.current) return
    lineNumbersRef.current.scrollTop = scrollTop
  }

  function resetImportSession() {
    setJsonText("")
    setParseResult(EMPTY_PARSE_RESULT)
    setConflicts([])
    setConflictError(null)
    setIsCheckingConflicts(false)
    setConflictSelections(new Map())
    setSummary(null)
    setCurrentPage("editor")
    setInputSource("empty")
    setFileAlert(null)
  }

  async function runImport() {
    if (!canImport) return

    if (captureMode) {
      setSummary(getManualCaptureImportSummary(captureMode))
      return
    }

    const importStartedAt = Date.now()
    setIsImporting(true)
    setSummary(null)

    try {
      const result = await importColorStyles(parseResult.tokens, parseResult.conflictGroups, conflictSelections)
      await waitForMinimumActionFeedback(importStartedAt)
      setSummary(result)
      void refreshConflicts()
      const failedText = result.failed > 0 ? `, ${result.failed} ${t.failed}` : ""
      framer.notify(
        t.importedNotice.replace("{count}", String(result.created + result.replaced)).replace("{failed}", failedText)
      )
    } catch (error) {
      await waitForMinimumActionFeedback(importStartedAt)
      const message = error instanceof Error ? error.message : String(error)
      setSummary({
        created: 0,
        replaced: 0,
        skipped: 0,
        failed: 1,
        failures: [{ name: t.import, reason: message }],
      })
      framer.notify(t.importFailed.replace("{message}", message), { variant: "error" })
    } finally {
      setIsImporting(false)
    }
  }

  async function refreshConflicts() {
    if (captureMode) return
    if (parseResult.error || !hasTokens) return

    try {
      const nextConflicts = await findColorStyleConflicts(getConflictCheckTokens(parseResult))
      setConflicts(nextConflicts)
      setConflictError(null)
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col gap-6 bg-surface-base px-5 pb-28 pt-8 font-['Jost','Noto_Sans_JP'] text-text-default md:gap-16 md:px-16 md:pb-32 md:pt-20"
      data-capture-mode={captureMode ?? undefined}
      data-ready="true"
      lang={language}
    >
      <AppHeader language={language} title={t.title} onLanguageChange={setLanguage} />

      {currentPage === "editor" ? (
        <section className="flex flex-col gap-3" aria-label={t.json}>
          <JsonFileDropZone
            labels={{
              button: t.uploadJsonButton,
              title: t.dropJsonTitle,
            }}
            onFileSelect={handleJsonFileSelect}
          />

          {fileAlert ? <MessageBox tone="danger">{fileAlert}</MessageBox> : null}

          <JsonTokenEditor
            diagnostics={editorDiagnostics}
            labels={{
              copied: t.copiedJson,
              copy: t.copyJson,
              copyFailed: t.copyJsonFailed,
            }}
            lineNumbersRef={lineNumbersRef}
            placeholder={t.editorPlaceholder}
            value={jsonText}
            onScroll={handleEditorScroll}
            onTextChange={handleJsonTextChange}
          />
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-4" aria-label={t.preview}>
            <div className="flex justify-start">
              <ActionButton
                color="secondary"
                icon={<ArrowLeft />}
                iconPosition="left"
                size="sm"
                variant="outline"
                onClick={() => {
                  setCurrentPage("editor")
                }}
              >
                {t.backToJson}
              </ActionButton>
            </div>
            {hasPreviewAnnouncements ? (
              <MessageBox tone="warning">
                <div className="flex flex-col gap-1">
                  {rgbaConversionCount > 0 ? (
                    <p className="m-0">{t.rgbaConversionNotice.replace("{count}", String(rgbaConversionCount))}</p>
                  ) : null}
                  {skippedWarningItems.length > 0 ? (
                    <div>
                      <p className="m-0">{t.skippedWarningsNotice}</p>
                      <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
                        {skippedWarningItems.map(item => (
                          <li className="m-0" key={item}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </MessageBox>
            ) : null}
            <TokenCardList
              tokens={parseResult.tokens}
              conflictGroups={parseResult.conflictGroups}
              existingConflicts={conflicts}
              isCheckingConflicts={isCheckingConflicts}
              conflictError={conflictError}
              conflictSelections={conflictSelections}
              onSelectionChange={(styleName, selectedId) => {
                setConflictSelections(prev => new Map(prev).set(styleName, selectedId))
              }}
              labels={{
                conflict: t.conflict,
                newTokens: t.newTokens,
                whichTokenToUse: t.whichTokenToUse,
                existingStyle: t.existingStyle,
                existingStyleConflictTitle: t.existingStyleConflictTitle,
                existingStyleConflictDescription: t.existingStyleConflictDescription,
                duplicateStyleNameTitle: t.duplicateStyleNameTitle,
                duplicateStyleNameDescription: t.duplicateStyleNameDescription,
                emptyState: t.emptyState,
                checkingConflicts: t.checkingConflicts,
                conflictCheckFailed: t.conflictCheckFailed,
                light: t.light,
                dark: t.dark,
              }}
            />
          </section>

          {summary ? (
            <DialogBackdrop
              onClose={() => {
                resetImportSession()
              }}
            >
              <DialogPanel role="dialog" aria-modal="true" aria-labelledby="summary-dialog-title">
                <ImportSummary
                  summary={summary}
                  language={language}
                  convertedColorCount={rgbaConversionCount}
                  modePairCount={modePairCount}
                />
                <DialogActions className="grid-cols-1">
                  <ActionButton
                    onClick={() => {
                      resetImportSession()
                    }}
                  >
                    {t.ok}
                  </ActionButton>
                </DialogActions>
              </DialogPanel>
            </DialogBackdrop>
          ) : null}
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[8] border-t border-border-strong bg-surface-base px-5 py-3.5 md:px-16 md:py-4">
        {currentPage === "editor" ? (
          <ActionButton
            className="w-full"
            disabled={!canExtract}
            loading={isPending && inputSource !== "empty"}
            size="md"
            title={extractButtonTitle}
            onClick={goToPreview}
          >
            {t.extractColor}
          </ActionButton>
        ) : (
          <ActionButton
            className="w-full"
            disabled={!canImport}
            size="md"
            title={importButtonTitle}
            onClick={() => {
              void runImport()
            }}
          >
            {importButtonLabel}
          </ActionButton>
        )}
      </div>
    </main>
  )
}

function getCaptureMode(): CaptureMode | null {
  if (typeof window === "undefined") return null

  const value = new URLSearchParams(window.location.search).get("capture")
  if (!value) return null

  return CAPTURE_MODES.includes(value as CaptureMode) ? (value as CaptureMode) : null
}

function getInitialJsonText(captureMode: CaptureMode | null): string {
  switch (captureMode) {
    case "default":
    case "preview-normal":
    case "light-dark":
    case "oklch":
    case "warning":
    case "invalid-json":
    case "conflict":
    case "summary-success":
    case "summary-failed":
    case null:
      return ""
  }
}

function parseEditorJson(jsonText: string): ParseColorTokensResult {
  if (jsonText.length === 0) return EMPTY_PARSE_RESULT
  return parseColorTokenJson(jsonText)
}

function hasImportableTokens(parseResult: ParseColorTokensResult): boolean {
  return parseResult.tokens.length > 0 || parseResult.conflictGroups.length > 0
}

function countRgbaConversions(token: ParsedColorToken): number {
  return (
    (isConvertedToRgba(token.sourceValue, token.value) ? 1 : 0) +
    (token.darkSourceValue && token.darkValue && isConvertedToRgba(token.darkSourceValue, token.darkValue) ? 1 : 0)
  )
}

function isConvertedToRgba(sourceValue: string, value: string): boolean {
  return !sourceValue.trim().startsWith("{") && sourceValue.trim() !== value.trim() && value.trim().startsWith("rgba(")
}

function getSkippedWarningItems(warnings: ParseWarning[], language: Language): string[] {
  return warnings
    .filter(isSkippedWarning)
    .map(warning => {
      const lineLabel = warning.line ? `${messages[language].line} ${warning.line}` : messages[language].warningTitle
      return `${lineLabel} · ${warning.path} / ${formatWarningSummary(warning, language)}`
    })
}

function isSkippedWarning(warning: ParseWarning): boolean {
  return (
    warning.code === "circular-alias" ||
    warning.code === "unresolved-alias" ||
    warning.code === "unsupported-color" ||
    warning.code === "unsupported-token"
  )
}

function getInitialCaptureState(
  captureMode: CaptureMode | null,
  parseResult: ParseColorTokensResult
): InitialCaptureState {
  const emptyState: InitialCaptureState = {
    conflicts: [],
    summary: null,
  }

  if (!captureMode) return emptyState

  switch (captureMode) {
    case "conflict":
      return {
        ...emptyState,
        conflicts: getCaptureConflicts(parseResult),
      }
    case "summary-success":
      return {
        ...emptyState,
        summary: {
          created: 3,
          replaced: 1,
          skipped: 0,
          failed: 0,
          failures: [],
        },
      }
    case "summary-failed":
      return {
        ...emptyState,
        summary: {
          created: 2,
          replaced: 0,
          skipped: 1,
          failed: 2,
          failures: [
            {
              name: "Color / Conflict / Five",
              reason: "Color Style could not be updated.",
            },
            {
              name: "Color / Conflict / Six",
              reason: "Permission changed while importing.",
            },
          ],
        },
      }
    case "default":
    case "preview-normal":
    case "light-dark":
    case "oklch":
    case "warning":
    case "invalid-json":
      return emptyState
  }
}

function getConflictCheckTokens(parseResult: ParseColorTokensResult): ParsedColorToken[] {
  return [
    ...parseResult.tokens,
    ...parseResult.conflictGroups.flatMap(group => group.candidates),
  ]
}

function getCaptureConflicts(parseResult: ParseColorTokensResult): ColorStyleConflict[] {
  return getConflictCheckTokens(parseResult).map(token => ({
    styleName: token.styleName,
    existingPath: token.styleName,
    existingValue: token.value,
    existingDarkValue: token.darkValue,
  }))
}

function getManualCaptureImportSummary(captureMode: CaptureMode): ImportColorStylesResult {
  if (captureMode === "summary-failed") {
    return {
      created: 2,
      replaced: 0,
      skipped: 1,
      failed: 2,
      failures: [
        {
          name: "Color / Conflict / Five",
          reason: "Color Style could not be updated.",
        },
        {
          name: "Color / Conflict / Six",
          reason: "Permission changed while importing.",
        },
      ],
    }
  }

  return {
    created: 3,
    replaced: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  }
}

function waitForMinimumActionFeedback(startedAt: number): Promise<void> {
  const remaining = MIN_ACTION_FEEDBACK_MS - (Date.now() - startedAt)
  if (remaining <= 0) return Promise.resolve()
  return new Promise(resolve => {
    window.setTimeout(resolve, remaining)
  })
}

function buildEditorDiagnostics(parseResult: ParseColorTokensResult, language: Language): EditorDiagnostic[] {
  if (parseResult.error) {
    return [
      {
        line: parseResult.errorLine ?? 1,
        message: formatParseError(parseResult.error, parseResult.errorLine, language),
        summary: messages[language].invalidJsonTitle,
        title: messages[language].invalidJsonTitle,
        tone: "danger",
      },
    ]
  }

  return parseResult.warnings.map(warning => ({
    line: warning.line ?? 1,
    message: formatWarning(warning, language),
    path: warning.path,
    summary: formatWarningSummary(warning, language),
    title: warning.code,
    tone: "warning" as const,
  }))
}

function formatParseError(error: string, errorLine: number | undefined, language: Language): string {
  const detail = error.startsWith("Invalid JSON: ") ? error.replace("Invalid JSON: ", "") : error
  const linePrefix = errorLine ? `${messages[language].line} ${errorLine} · ` : ""
  return `${linePrefix}${messages[language].invalidJson.replace("{message}", detail)}`
}

function formatWarning(warning: ParseWarning, language: Language): string {
  const linePrefix = warning.line ? `${messages[language].line} ${warning.line} · ` : ""

  if (language === "en") return `${linePrefix}${warning.path}:\n${warning.message}`

  return `${linePrefix}${warning.path}:\n${formatJapaneseWarning(warning)}`
}

function formatWarningSummary(warning: ParseWarning, language: Language): string {
  if (language === "en") {
    switch (warning.code) {
      case "circular-alias":
        return "Circular alias"
      case "dark-mode-without-light":
        return "Missing light mode"
      case "duplicate-style-name":
        return "Duplicate style name"
      case "unresolved-alias":
        return "Missing alias target"
      case "unsupported-color":
        return "Unsupported color"
      case "unsupported-token":
        return "Invalid token value"
    }
  }

  switch (warning.code) {
    case "circular-alias":
      return "参照が循環"
    case "dark-mode-without-light":
      return "Light設定なし"
    case "duplicate-style-name":
      return "スタイル名が重複"
    case "unresolved-alias":
      return "参照先なし"
    case "unsupported-color":
      return "未対応の色形式"
    case "unsupported-token":
      return "値が不正"
  }
}

function formatJapaneseWarning(warning: ParseWarning): string {
  switch (warning.code) {
    case "circular-alias":
      return "参照先のトークンが循環しているため、このトークンはスキップしました。"
    case "dark-mode-without-light":
      return "ライトモードの設定がありません。このままインポートした場合はダークモードのみのスタイルとして登録されます。"
    case "duplicate-style-name":
      return "同じスタイル名が複数あります。プレビューでインポートするトークンを選択してください。"
    case "unresolved-alias":
      return "参照先のトークンが見つからないため、このトークンはスキップしました。"
    case "unsupported-color":
      return "色形式が認識できないため、このトークンはスキップしました。"
    case "unsupported-token":
      return "値が文字列ではないため、このトークンはスキップしました。"
  }
}
