import { framer, useIsAllowedTo } from "framer-plugin"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
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
import { type Language, languageLabels, messages } from "./i18n.ts"
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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    const text = await file.text()
    setJsonText(text)
    analyzeJson(text)
    event.currentTarget.value = ""
  }

  function handleEditorScroll(event: React.UIEvent<HTMLTextAreaElement>) {
    if (!lineNumbersRef.current) return
    lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop
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
    <main className="app-shell" data-capture-mode={captureMode ?? undefined} data-ready="true">
      <header className="app-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>
        <div className="language-control">
          <span className="select-wrap compact">
            <select
              aria-label="Language"
              value={language}
              onChange={event => {
                setLanguage(event.currentTarget.value as Language)
              }}
            >
              {Object.entries(languageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </span>
        </div>
      </header>

      <section className="input-section" aria-labelledby="json-heading">
        <div className="section-title-row">
          <h2 id="json-heading">{t.json}</h2>
          <label className="file-button">
            {t.uploadJson}
            <input type="file" accept="application/json,.json" onChange={handleFileChange} />
          </label>
        </div>

        <div className="json-editor">
          <div className="line-numbers" ref={lineNumbersRef} aria-hidden="true">
            {lineNumbers.map(lineNumber => (
              <span key={lineNumber}>{lineNumber}</span>
            ))}
          </div>
          <textarea
            className="json-input"
            value={jsonText}
            onChange={event => {
              handleJsonTextChange(event.currentTarget.value)
            }}
            onScroll={handleEditorScroll}
            spellCheck={false}
            aria-label="JSON token source"
          />
        </div>

        <button
          type="button"
          className="primary-action"
          disabled={isPending || isAnalyzing}
          onClick={() => {
            void runManualAnalyze()
          }}
        >
          {isPending || isAnalyzing ? t.analyzing : t.analyze}
        </button>
        <p className="helper-text">{t.analyzeHelp}</p>
      </section>

      {parseResult.error ? (
        <section className="message error" aria-live="polite">
          {formatParseError(parseResult.error, parseResult.errorLine, language)}
        </section>
      ) : (
        <>
          <section className="stats-row" aria-label="Import stats">
            {stats.map(item => (
              <div className="stat" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </section>

          {parseResult.warnings.length > 0 ? (
            <section className="message warning" aria-label="Warnings">
              <h2>{t.warningTitle}</h2>
              <ul>
                {parseResult.warnings.map(warning => (
                  <li key={`${warning.code}:${warning.path}`}>{formatWarning(warning, language)}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="preview-section" aria-labelledby="preview-heading">
            <h2 id="preview-heading">{t.preview}</h2>
            {hasTokens ? (
              <div className="token-list">
                {parseResult.tokens.map(token => (
                  <div className="token-row" key={token.id}>
                    <span className={token.darkValue ? "swatch-stack paired" : "swatch-stack"} aria-hidden="true">
                      <span className="swatch" style={{ backgroundColor: token.value }} />
                      {token.darkValue ? <span className="swatch" style={{ backgroundColor: token.darkValue }} /> : null}
                    </span>
                    <div className="token-copy">
                      <strong>{token.styleName}</strong>
                      {token.darkSourcePath ? (
                        <>
                          <span>{`${t.light}: ${token.sourcePath}`}</span>
                          <span>{`${t.dark}: ${token.darkSourcePath}`}</span>
                        </>
                      ) : (
                        <span>{token.sourcePath}</span>
                      )}
                      {token.aliasPath || token.darkAliasPath ? (
                        <div className="token-meta">
                          {token.aliasPath ? (
                            <span>
                              {token.darkValue ? `${t.light} ${t.alias}: ` : `${t.alias}: `}
                              {token.aliasPath}
                            </span>
                          ) : null}
                          {token.darkAliasPath ? <span>{`${t.dark} ${t.alias}: ${token.darkAliasPath}`}</span> : null}
                        </div>
                      ) : null}
                      <code className="token-values">
                        <span>
                          {token.darkValue ? `${t.light}: ` : ""}
                          {token.value}
                        </span>
                        {token.darkValue ? (
                          <span>
                            {t.dark}: {token.darkValue}
                          </span>
                        ) : null}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">{t.emptyState}</p>
            )}
          </section>

          <section className="apply-section" aria-labelledby="apply-heading">
            <h2 id="apply-heading">{t.apply}</h2>
            <label className="strategy-row">
              {t.existingStyles}
              <span className="select-wrap">
                <select
                  value={importStrategy}
                  onChange={event => {
                    setImportStrategy(event.currentTarget.value as ImportStrategy)
                  }}
                >
                  <option value="skip">{t.skip}</option>
                  <option value="replace">{t.replace}</option>
                </select>
              </span>
            </label>
            <p className="helper-text">{importStrategy === "skip" ? t.skipDescription : t.replaceDescription}</p>
            <ConflictPreview
              conflicts={conflicts}
              isChecking={isCheckingConflicts}
              error={conflictError}
              language={language}
              onShowAll={() => {
                setIsConflictListOpen(true)
              }}
            />
            <div className="fixed-import-bar">
              <button
                type="button"
                className="primary-action"
                disabled={!canImport}
                title={isAllowedToImportColorStyles || captureMode ? undefined : t.insufficientPermissions}
                onClick={() => {
                  handleImport()
                }}
              >
                {importButtonLabel}
              </button>
            </div>
          </section>

          {summary ? (
            <DialogBackdrop
              onClose={() => {
                setSummary(null)
              }}
            >
              <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="summary-dialog-title">
                <ImportSummary
                  summary={summary}
                  language={language}
                  convertedOklchCount={convertedOklchCount}
                  modePairCount={modePairCount}
                />
                <div className="dialog-actions single">
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => {
                      setSummary(null)
                    }}
                  >
                    {t.ok}
                  </button>
                </div>
              </section>
            </DialogBackdrop>
          ) : null}
        </>
      )}

      {isReplaceConfirmOpen ? (
        <DialogBackdrop
          onClose={() => {
            setIsReplaceConfirmOpen(false)
          }}
        >
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="replace-dialog-title">
            <h2 id="replace-dialog-title">{t.replaceDialogTitle}</h2>
            <p>{t.replaceDialogBody}</p>
            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setIsReplaceConfirmOpen(false)
                }}
              >
                {t.cancel}
              </button>
              <button type="button" className="danger-action" onClick={handleConfirmReplace}>
                {t.confirmReplace}
              </button>
            </div>
          </section>
        </DialogBackdrop>
      ) : null}

      {isConflictListOpen ? (
        <DialogBackdrop
          onClose={() => {
            setIsConflictListOpen(false)
          }}
        >
          <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="conflict-list-dialog-title">
            <h2 id="conflict-list-dialog-title">{t.allConflictsTitle}</h2>
            <div className="dialog-scroll-list" role="list">
              {conflicts.map(conflict => (
                <div className="dialog-list-item" role="listitem" key={conflict.styleName}>
                  {conflict.styleName}
                </div>
              ))}
            </div>
            <div className="dialog-actions single">
              <button
                type="button"
                className="primary-action"
                onClick={() => {
                  setIsConflictListOpen(false)
                }}
              >
                {t.ok}
              </button>
            </div>
          </section>
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

function DialogBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={event => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      {children}
    </div>
  )
}

function waitForMinimumActionFeedback(startedAt: number): Promise<void> {
  const remaining = MIN_ACTION_FEEDBACK_MS - (Date.now() - startedAt)
  if (remaining <= 0) return Promise.resolve()
  return new Promise(resolve => {
    window.setTimeout(resolve, remaining)
  })
}

function ConflictPreview({
  conflicts,
  isChecking,
  error,
  language,
  onShowAll,
}: {
  conflicts: ColorStyleConflict[]
  isChecking: boolean
  error: string | null
  language: Language
  onShowAll: () => void
}) {
  const t = messages[language]

  if (isChecking) {
    return <p className="conflict-preview neutral">{t.checkingConflicts}</p>
  }

  if (error) {
    return <p className="conflict-preview warning-text">{t.conflictCheckFailed}</p>
  }

  if (conflicts.length === 0) {
    return <p className="conflict-preview neutral">{t.noConflicts}</p>
  }

  return (
    <section className="conflict-preview conflict" aria-label={t.conflictPreview}>
      <h3>{t.conflictPreview}</h3>
      <p>{t.conflictCount.replace("{count}", String(conflicts.length))}</p>
      <ul>
        {conflicts.slice(0, 5).map(conflict => (
          <li key={conflict.styleName}>{conflict.styleName}</li>
        ))}
      </ul>
      {conflicts.length > 5 ? (
        <>
          <p>{t.moreConflicts.replace("{count}", String(conflicts.length - 5))}</p>
          <button type="button" className="secondary-action compact-action" onClick={onShowAll}>
            {t.showAllConflicts}
          </button>
        </>
      ) : null}
    </section>
  )
}

function ImportSummary({
  summary,
  language,
  convertedOklchCount,
  modePairCount,
}: {
  summary: ImportColorStylesResult
  language: Language
  convertedOklchCount: number
  modePairCount: number
}) {
  const t = messages[language]
  const title = summary.failed > 0 ? t.importFailedTitle : t.importCompleteTitle

  return (
    <div className="summary-content" aria-label="Import summary">
      <h2 id="summary-dialog-title">{title}</h2>
      <div className="summary-area" aria-label={t.summary}>
        <h3>{t.summary}</h3>
        <p>
          {t.created} {summary.created}, {t.replaced} {summary.replaced}, {t.skipped} {summary.skipped}, {t.failed}{" "}
          {summary.failed}.
        </p>
        {convertedOklchCount > 0 ? (
          <p className="summary-note">{t.conversionNote.replace("{count}", String(convertedOklchCount))}</p>
        ) : null}
        {modePairCount > 0 ? (
          <p className="summary-note">{t.modePairNote.replace("{count}", String(modePairCount))}</p>
        ) : null}
        {summary.failures.length > 0 ? (
          <ul>
            {summary.failures.map(failure => (
              <li key={failure.name}>{`${failure.name}: ${failure.reason}`}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
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

function formatJapaneseWarning(warning: ParseWarning): string {
  switch (warning.code) {
    case "circular-alias":
      return "aliasの参照が循環している（AがBを参照し、BがAを参照するなど）ため、このtokenはスキップしました。"
    case "dark-mode-without-light":
      return "対応するlight tokenがないdark tokenのため、dark階層を残した通常styleとしてインポートします。"
    case "duplicate-style-name":
      return "同じstyle名があるため、このtokenはスキップしました。"
    case "unresolved-alias":
      return "aliasの参照先が見つからないため、このtokenはスキップしました。"
    case "unsupported-color":
      return "色形式が認識できないためスキップしました。hex、rgb(a)、hsl(a)、oklch()のいずれかの形式で指定してください。"
    case "unsupported-token":
      return "color tokenの値が文字列ではないため、このtokenはスキップしました。"
  }
}
