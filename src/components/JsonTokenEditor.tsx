import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type {
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  ReactNode,
  UIEvent,
} from "react"
import styles from "./JsonTokenEditor.module.css"

const DEFAULT_EDITOR_HEIGHT = 300
const PREVIOUS_DEFAULT_EDITOR_HEIGHT = 240
const MIN_EDITOR_HEIGHT = 180
const MAX_EDITOR_HEIGHT = 720
const KEYBOARD_RESIZE_STEP = 16
const KEYBOARD_RESIZE_PAGE_STEP = 48
const COPY_FEEDBACK_MS = 1200
const COPY_TOAST_OFFSET_Y = 18
const COPY_TOAST_MARGIN = 36
const COPY_TOOLTIP_DELAY_MS = 600
const EDITOR_LINE_HEIGHT = 16
const EDITOR_PADDING_Y = 8
const EDITOR_DEFAULT_PADDING_BOTTOM = 32
const EDITOR_ESTIMATED_CHARACTER_WIDTH = 7
const EDITOR_CONTENT_WIDTH_BUFFER = 40
const DIAGNOSTIC_TOOLTIP_WIDTH = 260
const DIAGNOSTIC_TOOLTIP_MARGIN = 8
const ACCENT_YELLOW_COLOR = "var(--color-yellow-300)"
const ACCENT_YELLOW_SOFT_COLOR = "color-mix(in srgb, var(--color-yellow-300) 8%, transparent)"
const ACCENT_YELLOW_GHOST_COLOR = "color-mix(in srgb, var(--color-yellow-300) 50%, transparent)"
const ACCENT_YELLOW_GHOST_HOVER_COLOR = "color-mix(in srgb, var(--color-yellow-300) 78%, transparent)"

type CopyState = "idle" | "copied" | "failed"
type CopyToastPosition = { x: number; y: number }
type DiagnosticTooltipState = { left: number; line: number; top: number }
type JsonSyntaxKind = "boolean" | "key" | "null" | "number" | "punctuation" | "string"
type TextRange = { end: number; start: number }

interface JsonSyntaxSegment {
  className?: string
  text: string
}

export interface EditorDiagnostic {
  line: number
  message: string
  path?: string
  summary: string
  title: string
  tone: "danger" | "warning"
}

const jsonSyntaxClass: Record<JsonSyntaxKind, string> = {
  boolean: "text-[#FFB86C]",
  key: "text-sky-300",
  null: "text-[#FF8BA7]",
  number: "text-[#80C7FF]",
  punctuation: "text-neutral-300",
  string: "text-[#8BE9A1]",
}

interface JsonTokenEditorProps {
  diagnostics?: EditorDiagnostic[]
  labels: {
    copy: string
    copied: string
    copyFailed: string
    resize: string
  }
  lineNumbers: number[]
  lineNumbersRef: RefObject<HTMLDivElement>
  value: string
  onScroll: (scrollTop: number) => void
  onTextChange: (value: string) => void
}

export function JsonTokenEditor({
  diagnostics = [],
  labels,
  lineNumbers,
  lineNumbersRef,
  value,
  onScroll,
  onTextChange,
}: JsonTokenEditorProps) {
  const [editorHeight, setEditorHeight] = useState(DEFAULT_EDITOR_HEIGHT)
  const [copyState, setCopyState] = useState<CopyState>("idle")
  const [isCopyTooltipVisible, setIsCopyTooltipVisible] = useState(false)
  const [copyToastPosition, setCopyToastPosition] = useState<CopyToastPosition | null>(null)
  const [diagnosticTooltip, setDiagnosticTooltip] = useState<DiagnosticTooltipState | null>(null)
  const [editorScrollTop, setEditorScrollTop] = useState(0)
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const copyFeedbackTimerRef = useRef<number | null>(null)
  const copyTooltipTimerRef = useRef<number | null>(null)
  const resizeCleanupRef = useRef<(() => void) | null>(null)
  const diagnosticsByLine = useMemo(() => groupDiagnosticsByLine(diagnostics), [diagnostics])
  const editorPaddingBottom = EDITOR_DEFAULT_PADDING_BOTTOM
  const editorContentHeight = Math.max(editorHeight, lineNumbers.length * EDITOR_LINE_HEIGHT + EDITOR_PADDING_Y + editorPaddingBottom)
  const editorContentWidth = useMemo(() => getEditorContentWidth(value, diagnosticsByLine), [diagnosticsByLine, value])

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current !== null) {
        window.clearTimeout(copyFeedbackTimerRef.current)
      }
      if (copyTooltipTimerRef.current !== null) {
        window.clearTimeout(copyTooltipTimerRef.current)
      }
      resizeCleanupRef.current?.()
    }
  }, [])

  useEffect(() => {
    setEditorHeight(currentHeight =>
      currentHeight === PREVIOUS_DEFAULT_EDITOR_HEIGHT ? DEFAULT_EDITOR_HEIGHT : currentHeight
    )
  }, [])

  function setTemporaryCopyState(nextState: CopyState) {
    if (copyFeedbackTimerRef.current !== null) {
      window.clearTimeout(copyFeedbackTimerRef.current)
    }

    setCopyState(nextState)
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopyState("idle")
      setCopyToastPosition(null)
      copyFeedbackTimerRef.current = null
    }, COPY_FEEDBACK_MS)
  }

  async function handleCopyClick(event: ReactMouseEvent<HTMLButtonElement>) {
    const nextCopyToastPosition = getCopyToastPosition(event)

    try {
      await copyTextToClipboard(value)
      setCopyToastPosition(nextCopyToastPosition)
      setTemporaryCopyState("copied")
    } catch {
      setCopyToastPosition(null)
      setTemporaryCopyState("failed")
    }
  }

  function showCopyTooltipAfterDelay() {
    if (copyTooltipTimerRef.current !== null) {
      window.clearTimeout(copyTooltipTimerRef.current)
    }

    copyTooltipTimerRef.current = window.setTimeout(() => {
      setIsCopyTooltipVisible(true)
      copyTooltipTimerRef.current = null
    }, COPY_TOOLTIP_DELAY_MS)
  }

  function hideCopyTooltip() {
    if (copyTooltipTimerRef.current !== null) {
      window.clearTimeout(copyTooltipTimerRef.current)
      copyTooltipTimerRef.current = null
    }

    setIsCopyTooltipVisible(false)
  }

  function handleEditorScroll(event: UIEvent<HTMLDivElement>) {
    setEditorScrollTop(event.currentTarget.scrollTop)
    onScroll(event.currentTarget.scrollTop)
  }

  function handleEditorMouseMove(event: ReactMouseEvent<HTMLDivElement>) {
    const editorRect = editorRef.current?.getBoundingClientRect()
    if (!editorRect) return

    const line = Math.floor((event.clientY - editorRect.top - EDITOR_PADDING_Y + editorScrollTop) / EDITOR_LINE_HEIGHT) + 1
    setHoveredLine(line > 0 ? line : null)
  }

  function showDiagnosticTooltip(event: ReactMouseEvent<HTMLElement>, line: number) {
    const editorRect = editorRef.current?.getBoundingClientRect()
    if (!editorRect) return

    const markerRect = event.currentTarget.getBoundingClientRect()
    const rightSideLeft = markerRect.right - editorRect.left + 8
    const leftSideLeft = markerRect.left - editorRect.left - DIAGNOSTIC_TOOLTIP_WIDTH - 8
    const nextLeft =
      rightSideLeft + DIAGNOSTIC_TOOLTIP_WIDTH <= editorRect.width - 8
        ? rightSideLeft
        : Math.max(8, leftSideLeft)

    setDiagnosticTooltip({
      left: nextLeft,
      line,
      top: Math.max(8, markerRect.top - editorRect.top - 8),
    })
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    resizeCleanupRef.current?.()

    const startY = event.clientY
    const startHeight = editorHeight
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect

    document.body.style.cursor = "ns-resize"
    document.body.style.userSelect = "none"

    function handlePointerMove(moveEvent: PointerEvent) {
      setEditorHeight(clampEditorHeight(startHeight + moveEvent.clientY - startY))
    }

    function cleanupResize() {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("pointerup", cleanupResize)
      document.removeEventListener("pointercancel", cleanupResize)
      resizeCleanupRef.current = null
    }

    resizeCleanupRef.current = cleanupResize
    document.addEventListener("pointermove", handlePointerMove)
    document.addEventListener("pointerup", cleanupResize)
    document.addEventListener("pointercancel", cleanupResize)
  }

  function handleResizeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setEditorHeight(currentHeight => clampEditorHeight(currentHeight - KEYBOARD_RESIZE_STEP))
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setEditorHeight(currentHeight => clampEditorHeight(currentHeight + KEYBOARD_RESIZE_STEP))
      return
    }

    if (event.key === "PageUp") {
      event.preventDefault()
      setEditorHeight(currentHeight => clampEditorHeight(currentHeight - KEYBOARD_RESIZE_PAGE_STEP))
      return
    }

    if (event.key === "PageDown") {
      event.preventDefault()
      setEditorHeight(currentHeight => clampEditorHeight(currentHeight + KEYBOARD_RESIZE_PAGE_STEP))
      return
    }

    if (event.key === "Home") {
      event.preventDefault()
      setEditorHeight(MIN_EDITOR_HEIGHT)
      return
    }

    if (event.key === "End") {
      event.preventDefault()
      setEditorHeight(MAX_EDITOR_HEIGHT)
    }
  }

  return (
    <div
      className="relative grid min-h-[180px] w-full grid-cols-[48px_minmax(0,1fr)] overflow-hidden rounded border border-neutral-200 bg-neutral-700"
      data-json-editor="true"
      ref={editorRef}
      style={{ height: editorHeight }}
    >
      <div
        className="overflow-hidden border-r border-neutral-600 bg-neutral-600/40 p-2 text-right font-['Fira_Code','Noto_Sans_JP'] text-[11px] leading-4 text-neutral-300 select-none"
        ref={lineNumbersRef}
        aria-hidden="true"
        style={{ paddingBottom: editorPaddingBottom }}
      >
        {lineNumbers.map(lineNumber => {
          const hasDiagnostic = diagnosticsByLine.has(lineNumber)

          return (
            <span
              className="block h-4"
              key={lineNumber}
              style={hasDiagnostic ? { backgroundColor: ACCENT_YELLOW_SOFT_COLOR, color: ACCENT_YELLOW_COLOR } : undefined}
            >
              {lineNumber}
            </span>
          )
        })}
      </div>
      <div
        className={`${styles.scrollArea} relative min-w-0 overflow-auto`}
        data-json-editor-scroll="true"
        onMouseLeave={() => {
          setHoveredLine(null)
        }}
        onMouseMove={handleEditorMouseMove}
        onScroll={handleEditorScroll}
      >
        <div
          className="relative min-w-full"
          style={{ height: editorContentHeight, width: editorContentWidth }}
        >
          <pre
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 overflow-visible whitespace-pre border-0 bg-transparent p-2 font-['Fira_Code','Noto_Sans_JP'] text-[11px] leading-4 text-neutral-100"
            style={{ paddingBottom: editorPaddingBottom }}
          >
            {renderJsonSyntaxLines(value, diagnosticsByLine, hoveredLine)}
          </pre>
          <textarea
            className="absolute inset-0 z-[1] h-full w-full resize-none overflow-hidden border-0 bg-transparent p-2 font-['Fira_Code','Noto_Sans_JP'] text-[11px] leading-4 text-transparent caret-yellow-300 selection:bg-yellow-300/25"
            value={value}
            style={{ paddingBottom: editorPaddingBottom }}
            onChange={event => {
              onTextChange(event.currentTarget.value)
            }}
            spellCheck={false}
            wrap="off"
            aria-label="JSON token source"
          />
        </div>
      </div>
      <EditorDiagnosticMarkers
        diagnosticsByLine={diagnosticsByLine}
        editorHeight={editorHeight}
        scrollTop={editorScrollTop}
        onHideTooltip={() => {
          setDiagnosticTooltip(null)
        }}
        onShowTooltip={showDiagnosticTooltip}
      />
      {diagnosticTooltip ? (
        <EditorDiagnosticTooltip
          diagnostics={diagnosticsByLine.get(diagnosticTooltip.line) ?? []}
          editorHeight={editorHeight}
          tooltip={diagnosticTooltip}
        />
      ) : null}
      <button
        aria-describedby={isCopyTooltipVisible ? "json-copy-tooltip" : undefined}
        aria-label={getCopyButtonLabel(copyState, labels)}
        className="absolute right-2 top-2 z-10 inline-flex size-7 cursor-pointer items-center justify-center rounded bg-transparent text-neutral-200"
        type="button"
        onBlur={hideCopyTooltip}
        onClick={event => {
          hideCopyTooltip()
          void handleCopyClick(event)
        }}
        onMouseEnter={showCopyTooltipAfterDelay}
        onMouseLeave={hideCopyTooltip}
      >
        <ContentCopyIcon />
      </button>
      {isCopyTooltipVisible ? (
        <div
          className="pointer-events-none absolute right-2 top-10 z-50 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-normal leading-none text-neutral-100 shadow-md"
          id="json-copy-tooltip"
          role="tooltip"
        >
          {labels.copy}
        </div>
      ) : null}
      {copyState === "copied" && copyToastPosition ? (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-normal leading-none text-yellow-300 shadow-md"
          role="status"
          style={{ left: copyToastPosition.x, top: copyToastPosition.y }}
        >
          copied
        </div>
      ) : null}
      <div
        aria-label={labels.resize}
        aria-orientation="horizontal"
        aria-valuemax={MAX_EDITOR_HEIGHT}
        aria-valuemin={MIN_EDITOR_HEIGHT}
        aria-valuenow={editorHeight}
        className="absolute bottom-0 right-0 z-10 inline-flex size-6 cursor-ns-resize items-center justify-center rounded text-neutral-200"
        role="separator"
        tabIndex={0}
        onKeyDown={handleResizeKeyDown}
        onPointerDown={handleResizePointerDown}
      >
        <ResizeWindowIcon />
      </div>
    </div>
  )
}

function clampEditorHeight(height: number) {
  return Math.min(Math.max(height, MIN_EDITOR_HEIGHT), MAX_EDITOR_HEIGHT)
}

function EditorDiagnosticMarkers({
  diagnosticsByLine,
  editorHeight,
  scrollTop,
  onHideTooltip,
  onShowTooltip,
}: {
  diagnosticsByLine: Map<number, EditorDiagnostic[]>
  editorHeight: number
  scrollTop: number
  onHideTooltip: () => void
  onShowTooltip: (event: ReactMouseEvent<HTMLElement>, line: number) => void
}) {
  return Array.from(diagnosticsByLine.keys()).map(line => {
    const top = EDITOR_PADDING_Y + (line - 1) * EDITOR_LINE_HEIGHT - scrollTop + 5
    if (top < -8 || top > editorHeight) return null

    return (
      <span
        aria-hidden="true"
        className="absolute left-2 z-20 size-1.5 rounded-full"
        key={line}
        style={{ backgroundColor: ACCENT_YELLOW_COLOR, top }}
        onMouseEnter={event => {
          onShowTooltip(event, line)
        }}
        onMouseLeave={onHideTooltip}
      />
    )
  })
}

function EditorDiagnosticTooltip({
  diagnostics,
  editorHeight,
  tooltip,
}: {
  diagnostics: EditorDiagnostic[]
  editorHeight: number
  tooltip: DiagnosticTooltipState
}) {
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [adjustedTop, setAdjustedTop] = useState(tooltip.top)

  useLayoutEffect(() => {
    const tooltipElement = tooltipRef.current
    if (!tooltipElement) {
      setAdjustedTop(tooltip.top)
      return
    }

    const tooltipHeight = tooltipElement.offsetHeight
    const maxTop = Math.max(DIAGNOSTIC_TOOLTIP_MARGIN, editorHeight - tooltipHeight - DIAGNOSTIC_TOOLTIP_MARGIN)
    const nextTop = Math.min(Math.max(tooltip.top, DIAGNOSTIC_TOOLTIP_MARGIN), maxTop)
    setAdjustedTop(nextTop)
  }, [diagnostics, editorHeight, tooltip.top])

  if (diagnostics.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute z-50 rounded bg-neutral-900 px-2.5 py-2 text-[11px] font-normal leading-[1.35] text-neutral-100 shadow-md"
      ref={tooltipRef}
      role="tooltip"
      style={{
        left: tooltip.left,
        maxHeight: Math.max(80, editorHeight - DIAGNOSTIC_TOOLTIP_MARGIN * 2),
        maxWidth: DIAGNOSTIC_TOOLTIP_WIDTH,
        overflow: "auto",
        top: adjustedTop,
        width: DIAGNOSTIC_TOOLTIP_WIDTH,
      }}
    >
      {diagnostics.map((diagnostic, index) => (
        <div className={index > 0 ? "mt-2 border-t border-neutral-700 pt-2" : ""} key={`${diagnostic.line}:${diagnostic.title}:${index}`}>
          <p className="m-0 font-normal leading-tight" style={{ color: ACCENT_YELLOW_COLOR }}>
            {diagnostic.title}
          </p>
          <DiagnosticTooltipMessage message={diagnostic.message} />
        </div>
      ))}
    </div>
  )
}

function DiagnosticTooltipMessage({ message }: { message: string }) {
  const [firstLine = "", ...remainingLines] = message.split("\n")
  const pathLine = splitDiagnosticPathLine(firstLine)

  if (remainingLines.length === 0) {
    return <p className="m-0 mt-1 whitespace-pre-line text-neutral-200">{message}</p>
  }

  return (
    <div className="mt-1 text-neutral-200">
      <p className="m-0 flex min-w-0">
        {pathLine.prefix ? <span className="shrink-0">{pathLine.prefix}</span> : null}
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title={pathLine.path}>
          {pathLine.path}
        </span>
      </p>
      <p className="m-0 whitespace-pre-line">{remainingLines.join("\n")}</p>
    </div>
  )
}

function splitDiagnosticPathLine(line: string) {
  const separator = " · "
  const separatorIndex = line.indexOf(separator)

  if (separatorIndex < 0) {
    return {
      path: line,
      prefix: "",
    }
  }

  return {
    path: line.slice(separatorIndex + separator.length),
    prefix: line.slice(0, separatorIndex + separator.length),
  }
}

function getCopyToastPosition(event: ReactMouseEvent<HTMLButtonElement>): CopyToastPosition {
  const editorRect = event.currentTarget.closest("[data-json-editor]")?.getBoundingClientRect()
  const fallbackRect = event.currentTarget.getBoundingClientRect()
  const rawX = (event.clientX || fallbackRect.left + fallbackRect.width / 2) - (editorRect?.left ?? 0)
  const rawY = (event.clientY || fallbackRect.top + fallbackRect.height / 2) - (editorRect?.top ?? 0)
  const maxX = Math.max(COPY_TOAST_MARGIN, (editorRect?.width ?? fallbackRect.width) - COPY_TOAST_MARGIN)
  const maxY = Math.max(COPY_TOAST_MARGIN, (editorRect?.height ?? fallbackRect.height) - COPY_TOAST_MARGIN)

  return {
    x: Math.min(Math.max(rawX, COPY_TOAST_MARGIN), maxX),
    y: Math.min(Math.max(rawY + COPY_TOAST_OFFSET_Y, COPY_TOAST_MARGIN), maxY),
  }
}

function getCopyButtonLabel(copyState: CopyState, labels: JsonTokenEditorProps["labels"]) {
  if (copyState === "copied") return labels.copied
  if (copyState === "failed") return labels.copyFailed
  return labels.copy
}

function groupDiagnosticsByLine(diagnostics: EditorDiagnostic[]) {
  const diagnosticsByLine = new Map<number, EditorDiagnostic[]>()

  for (const diagnostic of diagnostics) {
    if (diagnostic.line < 1) continue

    const currentDiagnostics = diagnosticsByLine.get(diagnostic.line) ?? []
    currentDiagnostics.push(diagnostic)
    diagnosticsByLine.set(diagnostic.line, currentDiagnostics)
  }

  return diagnosticsByLine
}

function renderJsonSyntaxLines(
  source: string,
  diagnosticsByLine: Map<number, EditorDiagnostic[]>,
  hoveredLine: number | null
): ReactNode[] {
  return source.split("\n").map((lineText, index) => {
    const line = index + 1
    const diagnostics = diagnosticsByLine.get(line) ?? []
    const firstDiagnostic = diagnostics[0]
    const problemRange = firstDiagnostic ? getProblemRange(lineText) : null

    return (
      <div
        className="h-4 whitespace-pre"
        key={`${line}:${lineText}`}
        style={firstDiagnostic ? { backgroundColor: ACCENT_YELLOW_SOFT_COLOR } : undefined}
      >
        {renderJsonSyntaxLine(lineText, problemRange)}
        {firstDiagnostic ? (
          <span
            className="ml-3 select-none transition-colors"
            style={{
              color: hoveredLine === line ? ACCENT_YELLOW_GHOST_HOVER_COLOR : ACCENT_YELLOW_GHOST_COLOR,
              pointerEvents: "none",
            }}
          >
            // {getGhostText(firstDiagnostic, diagnostics.length)}
          </span>
        ) : null}
      </div>
    )
  })
}

function renderJsonSyntaxLine(source: string, problemRange: TextRange | null): ReactNode[] {
  return getJsonSyntaxSegments(source).map((segment, index, segments) => {
    if (!segment.className) return segment.text

    const segmentStart = segments.slice(0, index).reduce((offset, currentSegment) => offset + currentSegment.text.length, 0)
    const segmentEnd = segmentStart + segment.text.length
    const isProblemSegment =
      problemRange !== null && segmentEnd > problemRange.start && segmentStart < problemRange.end && segment.text.trim().length > 0

    return (
      <span
        className={segment.className}
        key={`${index}:${segment.text}`}
        style={
          isProblemSegment
            ? {
                textDecorationColor: ACCENT_YELLOW_COLOR,
                textDecorationLine: "underline",
                textDecorationStyle: "wavy",
                textUnderlineOffset: 3,
              }
            : undefined
        }
      >
        {segment.text}
      </span>
    )
  })
}

function getGhostText(diagnostic: EditorDiagnostic, count: number) {
  return count > 1 ? `${diagnostic.summary} +${count - 1}` : diagnostic.summary
}

function getEditorContentWidth(source: string, diagnosticsByLine: Map<number, EditorDiagnostic[]>) {
  let longestLineLength = 0

  source.split("\n").forEach((lineText, index) => {
    const line = index + 1
    const diagnostics = diagnosticsByLine.get(line) ?? []
    const firstDiagnostic = diagnostics[0]
    const ghostTextLength = firstDiagnostic ? ` // ${getGhostText(firstDiagnostic, diagnostics.length)}`.length : 0

    longestLineLength = Math.max(longestLineLength, lineText.length + ghostTextLength)
  })

  return longestLineLength * EDITOR_ESTIMATED_CHARACTER_WIDTH + EDITOR_PADDING_Y * 2 + EDITOR_CONTENT_WIDTH_BUFFER
}

function getProblemRange(lineText: string): TextRange | null {
  const valueKeyIndex = Math.max(lineText.indexOf('"$value"'), lineText.indexOf('"value"'))
  const colonIndex = lineText.indexOf(":", valueKeyIndex >= 0 ? valueKeyIndex : 0)

  if (colonIndex >= 0) {
    return getValueRange(lineText, colonIndex + 1)
  }

  const firstNonWhitespaceIndex = lineText.search(/\S/)
  if (firstNonWhitespaceIndex < 0) return null

  return {
    start: firstNonWhitespaceIndex,
    end: lineText.length,
  }
}

function getValueRange(lineText: string, startIndex: number): TextRange {
  let start = startIndex

  while (start < lineText.length && /\s/.test(lineText[start] ?? "")) {
    start += 1
  }

  let end = lineText.length
  let isInsideString = false
  let isEscaped = false

  for (let index = start; index < lineText.length; index += 1) {
    const character = lineText[index]

    if (isEscaped) {
      isEscaped = false
      continue
    }

    if (character === "\\") {
      isEscaped = true
      continue
    }

    if (character === '"') {
      isInsideString = !isInsideString
      continue
    }

    if (!isInsideString && character === ",") {
      end = index
      break
    }
  }

  return {
    start,
    end,
  }
}

function getJsonSyntaxSegments(source: string): JsonSyntaxSegment[] {
  const segments: JsonSyntaxSegment[] = []
  let index = 0

  while (index < source.length) {
    const character = source[index]

    if (isWhitespace(character)) {
      const start = index
      index += 1

      while (index < source.length && isWhitespace(source[index])) {
        index += 1
      }

      segments.push({ text: source.slice(start, index) })
      continue
    }

    if (character === '"') {
      const end = findStringEnd(source, index)
      const text = source.slice(index, end)
      segments.push({ className: getStringSyntaxClass(source, end), text })
      index = end
      continue
    }

    const numberMatch = source.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (numberMatch?.[0]) {
      segments.push({ className: jsonSyntaxClass.number, text: numberMatch[0] })
      index += numberMatch[0].length
      continue
    }

    if (source.startsWith("true", index) || source.startsWith("false", index)) {
      const text = source.startsWith("true", index) ? "true" : "false"
      segments.push({ className: jsonSyntaxClass.boolean, text })
      index += text.length
      continue
    }

    if (source.startsWith("null", index)) {
      segments.push({ className: jsonSyntaxClass.null, text: "null" })
      index += 4
      continue
    }

    if ("{}[]:,".includes(character ?? "")) {
      segments.push({ className: jsonSyntaxClass.punctuation, text: character ?? "" })
      index += 1
      continue
    }

    segments.push({ text: character ?? "" })
    index += 1
  }

  return segments
}

function getStringSyntaxClass(source: string, stringEndIndex: number) {
  let index = stringEndIndex

  while (index < source.length && isWhitespace(source[index])) {
    index += 1
  }

  return source[index] === ":" ? jsonSyntaxClass.key : jsonSyntaxClass.string
}

function findStringEnd(source: string, startIndex: number) {
  let index = startIndex + 1
  let isEscaped = false

  while (index < source.length) {
    const character = source[index]
    index += 1

    if (isEscaped) {
      isEscaped = false
      continue
    }

    if (character === "\\") {
      isEscaped = true
      continue
    }

    if (character === '"') {
      break
    }
  }

  return index
}

function isWhitespace(character: string | undefined) {
  return character === " " || character === "\n" || character === "\r" || character === "\t"
}

async function copyTextToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // Continue to the document command fallback below.
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.left = "0"
  textarea.style.opacity = "0"
  textarea.style.pointerEvents = "none"
  textarea.style.position = "fixed"
  textarea.style.top = "0"

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  const wasCopied = document.execCommand("copy")
  textarea.remove()

  if (!wasCopied) {
    throw new Error("Copy command failed")
  }
}

function ContentCopyIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 11.3333 13.3333">
      <path
        d="M1.33333 13.3333C0.966667 13.3333 0.652667 13.2029 0.391333 12.942C0.130444 12.6807 0 12.3667 0 12V2.66667H1.33333V12H8.66667V13.3333H1.33333ZM4 10.6667C3.63333 10.6667 3.31956 10.5362 3.05867 10.2753C2.79733 10.014 2.66667 9.7 2.66667 9.33333V1.33333C2.66667 0.966667 2.79733 0.652667 3.05867 0.391333C3.31956 0.130444 3.63333 0 4 0H10C10.3667 0 10.6807 0.130444 10.942 0.391333C11.2029 0.652667 11.3333 0.966667 11.3333 1.33333V9.33333C11.3333 9.7 11.2029 10.014 10.942 10.2753C10.6807 10.5362 10.3667 10.6667 10 10.6667H4ZM4 9.33333H10V1.33333H4V9.33333Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ResizeWindowIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 11.2 11.2">
      <g transform="translate(11.2 0) scale(-1 1)">
        <path
          d="M10.35 11.2L0 0.85L0.85 0L11.2 10.35L10.35 11.2ZM4.35 11.2L0 6.85L0.85 6L5.2 10.35L4.35 11.2Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
