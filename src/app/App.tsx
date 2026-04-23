import { framer, useIsAllowedTo } from "framer-plugin"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import type { ChangeEvent } from "react"
import { AppHeader } from "../components/AppHeader.tsx"
import { ConflictPreview } from "../components/ConflictPreview.tsx"
import { ImportSummary } from "../components/ImportSummary.tsx"
import { JsonTokenEditor, type EditorDiagnostic } from "../components/JsonTokenEditor.tsx"
import { StatsGrid } from "../components/StatsGrid.tsx"
import { TokenPreviewList } from "../components/TokenPreviewList.tsx"
import {
  ActionButton,
  DialogActions,
  DialogBackdrop,
  DialogPanel,
  FileButton,
  SectionTitle,
  SelectControl,
} from "../components/ui.tsx"
import conflictManyColorsJson from "../fixtures/conflict-many-colors.json?raw"
import invalidJsonFixture from "../fixtures/error-invalid-json.json?raw"
import lightDarkColorsJson from "../fixtures/light-dark-colors.json?raw"
import oklchColorsJson from "../fixtures/oklch-colors.json?raw"
import primitiveColorsJson from "../fixtures/primitive-colors.json?raw"
import warningCasesJson from "../fixtures/warning-cases.json?raw"
import { findColorStyleConflicts, importColorStyles } from "../lib/framer/colorStyles.ts"
import { parseColorTokenJson } from "../lib/parser/colorTokenParser.ts"
import type {
  ColorStyleConflict,
  ImportColorStylesResult,
  ImportStrategy,
  ParseColorTokensResult,
  ParseWarning,
} from "../lib/types/tokens.ts"
import { type Language, messages } from "./i18n.ts"
import { sampleTokenJson } from "./sample.ts"

const MIN_ACTION_FEEDBACK_MS = 1000
const CAPTURE_MODES = [
  "default",
  "preview-normal",
  "light-dark",
  "oklch",
  "warning",
  "invalid-json",
  "conflict",
  "replace-modal",
  "summary-success",
  "summary-failed",
  "conflict-list",
] as const

type CaptureMode = (typeof CAPTURE_MODES)[number]

interface InitialCaptureState {
  conflicts: ColorStyleConflict[]
  importStrategy: ImportStrategy
  summary: ImportColorStylesResult | null
  isReplaceConfirmOpen: boolean
  isConflictListOpen: boolean
}

const initialCaptureMode = getCaptureMode()

if (!initialCaptureMode) {
  void framer.showUI({
    position: "top right",
    width: 420,
    height: 620,
  })
}

export function App() {
  const captureMode = useMemo(() => initialCaptureMode, [])
  const initialJsonText = useMemo(() => getInitialJsonText(captureMode), [captureMode])
  const initialParseResult = useMemo(() => parseColorTokenJson(initialJsonText), [initialJsonText])
  const initialCaptureState = useMemo(
    () => getInitialCaptureState(captureMode, initialParseResult),
    [captureMode, initialParseResult]
  )
  const [language, setLanguage] = useState<Language>("en")
  const [jsonText, setJsonText] = useState(initialJsonText)
  const [parseResult, setParseResult] = useState<ParseColorTokensResult>(initialParseResult)
  const [importStrategy, setImportStrategy] = useState<ImportStrategy>(initialCaptureState.importStrategy)
  const [conflicts, setConflicts] = useState<ColorStyleConflict[]>(initialCaptureState.conflicts)
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false)
  const [summary, setSummary] = useState<ImportColorStylesResult | null>(initialCaptureState.summary)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(initialCaptureState.isReplaceConfirmOpen)
  const [isConflictListOpen, setIsConflictListOpen] = useState(initialCaptureState.isConflictListOpen)
  const [isPending, startTransition] = useTransition()
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)

  const t = messages[language]
  const isAllowedToImportColorStyles = useIsAllowedTo("createColorStyle", "ColorStyle.setAttributes")
  const hasTokens = parseResult.tokens.length > 0
  const canImport = hasTokens && (isAllowedToImportColorStyles || Boolean(captureMode)) && !isImporting
  const importButtonLabel = isImporting ? t.importing : t.import
  const importButtonTitle = isAllowedToImportColorStyles || captureMode ? undefined : t.insufficientPermissions
  const primitiveCount = parseResult.tokens.filter(token => token.kind === "primitive").length
  const semanticCount = parseResult.tokens.filter(token => token.kind === "semantic").length
  const modePairCount = parseResult.tokens.filter(token => token.darkValue).length
  const convertedOklchCount = parseResult.tokens.reduce(
    (count, token) => count + (token.format === "oklch" ? 1 : 0) + (token.darkFormat === "oklch" ? 1 : 0),
    0
  )
  const lineNumbers = useMemo(
    () => Array.from({ length: jsonText.split("\n").length }, (_, index) => index + 1),
    [jsonText]
  )
  const editorDiagnostics = useMemo(
    () => buildEditorDiagnostics(parseResult, language),
    [language, parseResult.error, parseResult.errorLine, parseResult.warnings]
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (captureMode) {
      setIsCheckingConflicts(false)
      return
    }

    let isCurrent = true

    async function checkConflicts() {
      if (parseResult.error || parseResult.tokens.length === 0) {
        setConflicts([])
        setConflictError(null)
        setIsCheckingConflicts(false)
        return
      }

      setIsCheckingConflicts(true)
      setConflictError(null)

      try {
        const nextConflicts = await findColorStyleConflicts(parseResult.tokens)
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
  }, [captureMode, parseResult.error, parseResult.tokens])

  const stats = useMemo(
    () => [
      { label: t.primitive, value: primitiveCount },
      { label: t.semantic, value: semanticCount },
      { label: t.lightDark, value: modePairCount },
      { label: t.warnings, value: parseResult.warnings.length },
    ],
    [
      modePairCount,
      parseResult.warnings.length,
      primitiveCount,
      semanticCount,
      t.lightDark,
      t.primitive,
      t.semantic,
      t.warnings,
    ]
  )

  function analyzeJson(nextText = jsonText) {
    startTransition(() => {
      setParseResult(parseColorTokenJson(nextText))
      setSummary(null)
    })
  }

  async function runManualAnalyze() {
    const analyzeStartedAt = Date.now()
    setIsAnalyzing(true)
    analyzeJson()
    await waitForMinimumActionFeedback(analyzeStartedAt)
    setIsAnalyzing(false)
  }

  function handleJsonTextChange(nextText: string) {
    setJsonText(nextText)
    analyzeJson(nextText)
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    const text = await file.text()
    setJsonText(text)
    analyzeJson(text)
    event.currentTarget.value = ""
  }

  function handleEditorScroll(scrollTop: number) {
    if (!lineNumbersRef.current) return
    lineNumbersRef.current.scrollTop = scrollTop
  }

  async function runImport() {
    if (!canImport) return

    if (captureMode) {
      setSummary(getManualCaptureImportSummary(importStrategy))
      return
    }

    const importStartedAt = Date.now()
    setIsImporting(true)
    setSummary(null)

    try {
      const result = await importColorStyles(parseResult.tokens, importStrategy)
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

  function handleImport() {
    if (!canImport) return

    if (importStrategy === "replace") {
      setIsReplaceConfirmOpen(true)
      return
    }

    void runImport()
  }

  function handleConfirmReplace() {
    setIsReplaceConfirmOpen(false)
    void runImport()
  }

  async function refreshConflicts() {
    if (captureMode) return
    if (parseResult.error || parseResult.tokens.length === 0) return

    try {
      const nextConflicts = await findColorStyleConflicts(parseResult.tokens)
      setConflicts(nextConflicts)
      setConflictError(null)
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col gap-6 bg-neutral-800 px-5 pb-28 pt-8 font-['Jost','Noto_Sans_JP',ui-sans-serif,system-ui,sans-serif] text-neutral-100 md:gap-16 md:px-16 md:pb-32 md:pt-20"
      data-capture-mode={captureMode ?? undefined}
      data-ready="true"
      lang={language}
    >
      <AppHeader language={language} title={t.title} onLanguageChange={setLanguage} />

      <section className="flex flex-col gap-3" aria-label={t.json}>
        <JsonTokenEditor
          diagnostics={editorDiagnostics}
          labels={{
            copied: t.copiedJson,
            copy: t.copyJson,
            copyFailed: t.copyJsonFailed,
            resize: t.resizeEditor,
          }}
          lineNumbers={lineNumbers}
          lineNumbersRef={lineNumbersRef}
          value={jsonText}
          onScroll={handleEditorScroll}
          onTextChange={handleJsonTextChange}
        />

        <div className="flex flex-wrap items-center gap-3">
          <FileButton accept="application/json,.json" size="md" onChange={handleFileChange}>
            {t.uploadJson}
          </FileButton>
          <ActionButton
            disabled={isPending || isAnalyzing}
            size="md"
            variant="outline"
            onClick={() => {
              void runManualAnalyze()
            }}
          >
            {isPending || isAnalyzing ? t.analyzing : t.analyze}
          </ActionButton>
        </div>
      </section>

      {parseResult.error ? null : (
        <>
          <StatsGrid items={stats} />

          <section className="flex flex-col gap-2.5" aria-labelledby="preview-heading">
            <SectionTitle id="preview-heading">{t.preview}</SectionTitle>
            <TokenPreviewList
              labels={{ alias: t.alias, dark: t.dark, emptyState: t.emptyState, light: t.light }}
              tokens={parseResult.tokens}
            />
          </section>

          <section className="flex flex-col gap-2.5" aria-labelledby="apply-heading">
            <SectionTitle id="apply-heading">{t.apply}</SectionTitle>
            <label className="flex items-center justify-between gap-2.5 text-xs text-neutral-300">
              {t.existingStyles}
              <SelectControl
                value={importStrategy}
                onChange={event => {
                  setImportStrategy(event.currentTarget.value as ImportStrategy)
                }}
              >
                <option value="skip">{t.skip}</option>
                <option value="replace">{t.replace}</option>
              </SelectControl>
            </label>
            <ConflictPreview
              conflicts={conflicts}
              isChecking={isCheckingConflicts}
              error={conflictError}
              language={language}
              onShowAll={() => {
                setIsConflictListOpen(true)
              }}
            />
          </section>

          {summary ? (
            <DialogBackdrop
              onClose={() => {
                setSummary(null)
              }}
            >
              <DialogPanel role="dialog" aria-modal="true" aria-labelledby="summary-dialog-title">
                <ImportSummary
                  summary={summary}
                  language={language}
                  convertedOklchCount={convertedOklchCount}
                  modePairCount={modePairCount}
                />
                <DialogActions className="grid-cols-1">
                  <ActionButton
                    onClick={() => {
                      setSummary(null)
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

      <div className="fixed inset-x-0 bottom-0 z-[8] border-t border-neutral-700 bg-neutral-800 px-5 py-3.5 md:px-16 md:py-4">
        <ActionButton
          disabled={!canImport}
          size="md"
          title={importButtonTitle}
          onClick={() => {
            handleImport()
          }}
        >
          {importButtonLabel}
        </ActionButton>
      </div>

      {isReplaceConfirmOpen ? (
        <DialogBackdrop
          onClose={() => {
            setIsReplaceConfirmOpen(false)
          }}
        >
          <DialogPanel role="dialog" aria-modal="true" aria-labelledby="replace-dialog-title">
            <h2 className="m-0 text-xs leading-tight text-neutral-100" id="replace-dialog-title">
              {t.replaceDialogTitle}
            </h2>
            <p className="m-0 mt-2 text-xs leading-relaxed text-neutral-300">{t.replaceDialogBody}</p>
            <DialogActions>
              <ActionButton
                variant="outline"
                onClick={() => {
                  setIsReplaceConfirmOpen(false)
                }}
              >
                {t.cancel}
              </ActionButton>
              <ActionButton variant="danger" onClick={handleConfirmReplace}>
                {t.confirmReplace}
              </ActionButton>
            </DialogActions>
          </DialogPanel>
        </DialogBackdrop>
      ) : null}

      {isConflictListOpen ? (
        <DialogBackdrop
          onClose={() => {
            setIsConflictListOpen(false)
          }}
        >
          <DialogPanel role="dialog" aria-modal="true" aria-labelledby="conflict-list-dialog-title">
            <h2 className="m-0 text-xs leading-tight text-neutral-100" id="conflict-list-dialog-title">
              {t.allConflictsTitle}
            </h2>
            <div
              className="mt-2.5 flex max-h-[260px] flex-col gap-1 overflow-auto rounded border border-neutral-600 bg-neutral-900 p-2"
              role="list"
            >
              {conflicts.map(conflict => (
                <div className="text-xs leading-[1.35] text-neutral-100 [overflow-wrap:anywhere]" role="listitem" key={conflict.styleName}>
                  {conflict.styleName}
                </div>
              ))}
            </div>
            <DialogActions className="grid-cols-1">
              <ActionButton
                onClick={() => {
                  setIsConflictListOpen(false)
                }}
              >
                {t.ok}
              </ActionButton>
            </DialogActions>
          </DialogPanel>
        </DialogBackdrop>
      ) : null}
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
    case "preview-normal":
      return primitiveColorsJson
    case "light-dark":
    case "summary-success":
      return lightDarkColorsJson
    case "oklch":
      return oklchColorsJson
    case "warning":
      return warningCasesJson
    case "invalid-json":
      return invalidJsonFixture
    case "conflict":
    case "replace-modal":
    case "summary-failed":
    case "conflict-list":
      return conflictManyColorsJson
    case "default":
    case null:
      return sampleTokenJson
  }
}

function getInitialCaptureState(
  captureMode: CaptureMode | null,
  parseResult: ParseColorTokensResult
): InitialCaptureState {
  const emptyState: InitialCaptureState = {
    conflicts: [],
    importStrategy: "skip",
    summary: null,
    isReplaceConfirmOpen: false,
    isConflictListOpen: false,
  }

  if (!captureMode) return emptyState

  switch (captureMode) {
    case "conflict":
      return {
        ...emptyState,
        conflicts: getCaptureConflicts(parseResult),
      }
    case "replace-modal":
      return {
        ...emptyState,
        conflicts: getCaptureConflicts(parseResult),
        importStrategy: "replace",
        isReplaceConfirmOpen: true,
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
    case "conflict-list":
      return {
        ...emptyState,
        conflicts: getCaptureConflicts(parseResult),
        isConflictListOpen: true,
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

function getCaptureConflicts(parseResult: ParseColorTokensResult): ColorStyleConflict[] {
  return parseResult.tokens.map(token => ({
    styleName: token.styleName,
    existingPath: token.styleName,
  }))
}

function getManualCaptureImportSummary(importStrategy: ImportStrategy): ImportColorStylesResult {
  if (importStrategy === "replace") {
    return {
      created: 1,
      replaced: 5,
      skipped: 0,
      failed: 0,
      failures: [],
    }
  }

  return {
    created: 3,
    replaced: 0,
    skipped: 3,
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
