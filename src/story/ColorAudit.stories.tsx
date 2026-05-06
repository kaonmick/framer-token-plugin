import { useEffect, useRef, useState } from "react"
import type { StoryDefault } from "@ladle/react"
import { AppHeader } from "../components/AppHeader.tsx"
import { ActionButton } from "../components/ui.tsx"
import { JsonTokenEditor } from "../components/JsonTokenEditor.tsx"
import { StatsGrid } from "../components/StatsGrid.tsx"
import { TokenCardList } from "../components/TokenCardList.tsx"
import type { Language } from "../app/i18n.ts"
import {
  catalogEditorDiagnostics,
  catalogEditorJson,
  catalogTokens,
  catalogConflictGroups,
  catalogExistingConflicts,
  catalogStatsItems,
} from "./catalog.fixtures.ts"
import {
  COLOR_AUDIT_THEME_DEFAULT_KEYS,
  COLOR_AUDIT_THEME_DEFAULTS,
  onColorAuditThemeDefaultsUpdated,
} from "./colorAuditThemeDefaults.ts"
import "../tokens.css"

export default { title: "System / Color Audit" } satisfies StoryDefault

const componentSources = import.meta.glob("../components/**/*.tsx", { as: "raw", eager: true })
const appSources = import.meta.glob("../app/App.tsx", { as: "raw", eager: true })
const allTsxSource = [...Object.values(componentSources), ...Object.values(appSources)].join("\n")

function isUsedInTsx(tokenShortName: string): boolean {
  return allTsxSource.includes(tokenShortName)
}

// --- WCAG helpers ---
function toLinear(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}
function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}
function parseComputedColor(s: string): { r: number; g: number; b: number; a: number } | null {
  const rgbM = s.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d*\.?\d+))?\s*\)/,
  )
  if (rgbM) return { r: +rgbM[1]!, g: +rgbM[2]!, b: +rgbM[3]!, a: rgbM[4] !== undefined ? +rgbM[4]! : 1 }
  const srgbM = s.match(
    /color\(srgb\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s*\/\s*(\d*\.?\d+))?\s*\)/,
  )
  if (srgbM)
    return {
      r: Math.round(+srgbM[1]! * 255),
      g: Math.round(+srgbM[2]! * 255),
      b: Math.round(+srgbM[3]! * 255),
      a: srgbM[4] !== undefined ? +srgbM[4]! : 1,
    }
  return null
}
function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, "0")).join("")
}
type Color = { r: number; g: number; b: number; a: number }
function resolveVar(cssVar: string, container: HTMLElement): Color | null {
  const el = document.createElement("div")
  el.style.cssText =
    "position:absolute;visibility:hidden;pointer-events:none;" +
    "background-color:color-mix(in srgb,var(" + cssVar + ") 100%,rgba(0,0,0,0))"
  container.appendChild(el)
  const result = parseComputedColor(getComputedStyle(el).backgroundColor)
  container.removeChild(el)
  if (!result || (result.a === 0 && result.r === 0 && result.g === 0 && result.b === 0)) return null
  return result
}

// --- Tailwind color palette ---
const TAILWIND_FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
]
const TAILWIND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// --- Token definitions ---
type TokenDef = { cssVar: string; usage: string; against?: string[] }
type Group = { name: string; tokens: TokenDef[] }

const GROUPS: Group[] = [
  {
    name: "Surface",
    tokens: [
      { cssVar: "--surface-canvas", usage: "App root・import footer bg" },
      { cssVar: "--surface-panel", usage: "StatsGrid cells・TokenCard list bg" },
      { cssVar: "--surface-raised", usage: "Dialog・tooltip bg（overlay）" },
      { cssVar: "--surface-muted", usage: "LanguageToggle track・tag pill bg" },
      { cssVar: "--surface-inset", usage: "JsonTokenEditor エディタ領域" },
    ],
  },
  {
    name: "Text",
    tokens: [
      { cssVar: "--text-primary", usage: "見出し・ラベル・本文", against: ["--surface-canvas", "--surface-panel", "--surface-raised"] },
      { cssVar: "--text-secondary", usage: "サブラベル・HelperText・アウトラインボタン文字", against: ["--surface-canvas", "--surface-panel", "--surface-muted"] },
      { cssVar: "--text-muted", usage: "プレースホルダー・行番号・disabled テキスト", against: ["--surface-canvas", "--surface-panel"] },
      { cssVar: "--text-accent", usage: "トークン位置ツールチップ文字", against: ["--surface-canvas", "--surface-raised"] },
      { cssVar: "--text-diagnostic-ghost", usage: "JsonEditor コメント ghost text", against: ["--surface-inset"] },
      { cssVar: "--text-diagnostic-ghost-hover", usage: "JsonEditor コメント ghost text hover", against: ["--surface-inset"] },
    ],
  },
  {
    name: "Border",
    tokens: [
      { cssVar: "--border-default", usage: "ボタン枠・セレクト・ラジオ外枠・エディタ外枠", against: ["--surface-canvas", "--surface-panel"] },
      { cssVar: "--border-muted", usage: "カード区切り・エディタ行番号区切り・ダイアログ枠", against: ["--surface-canvas", "--surface-panel"] },
      { cssVar: "--border-strong", usage: "tooltip 区切り線・import footer 上線", against: ["--surface-raised"] },
      { cssVar: "--border-focus", usage: "ラジオボタン focus ring", against: ["--surface-canvas", "--surface-panel"] },
    ],
  },
  {
    name: "Accent",
    tokens: [
      { cssVar: "--accent-primary", usage: "Solid ボタン bg・toggle thumb・テキストカーソル" },
      { cssVar: "--accent-primary-hover", usage: "Solid ボタン hover / active" },
      { cssVar: "--accent-primary-disabled", usage: "Solid ボタン disabled bg" },
      { cssVar: "--accent-foreground", usage: "Solid ボタン文字・toggle active ラベル", against: ["--accent-primary"] },
      { cssVar: "--accent-foreground-disabled", usage: "Solid ボタン disabled 文字", against: ["--accent-primary-disabled"] },
    ],
  },
  {
    name: "Status",
    tokens: [
      { cssVar: "--status-warning", usage: "MessageBox warning 文字・枠線・diagnostic 下線", against: ["--surface-canvas", "--status-warning-surface"] },
      { cssVar: "--status-warning-surface", usage: "MessageBox warning bg" },
      { cssVar: "--status-warning-ghost", usage: "JsonEditor テキスト選択ハイライト" },
      { cssVar: "--status-error", usage: "MessageBox danger 文字・枠線・danger ボタン bg", against: ["--surface-canvas", "--status-error-surface"] },
      { cssVar: "--status-error-surface", usage: "MessageBox danger bg" },
    ],
  },
  {
    name: "Control & Preview",
    tokens: [
      { cssVar: "--control-radio-selected", usage: "ラジオボタン選択ドット", against: ["--surface-canvas"] },
      { cssVar: "--preview-conflict-accent", usage: "Conflict セクション accent バー" },
      { cssVar: "--preview-new-token-accent", usage: "New token セクション accent バー" },
    ],
  },
  {
    name: "Code",
    tokens: [
      { cssVar: "--code-key", usage: "JSON キー", against: ["--surface-inset"] },
      { cssVar: "--code-string", usage: "JSON 文字列値", against: ["--surface-inset"] },
      { cssVar: "--code-number", usage: "JSON 数値", against: ["--surface-inset"] },
      { cssVar: "--code-boolean", usage: "JSON boolean", against: ["--surface-inset"] },
      { cssVar: "--code-null", usage: "JSON null", against: ["--surface-inset"] },
      { cssVar: "--code-punctuation", usage: "JSON ブラケット・カンマ", against: ["--surface-inset"] },
      { cssVar: "--code-diagnostic-underline", usage: "lint squiggle 下線", against: ["--surface-inset"] },
    ],
  },
]

// --- CSS output generator ---
function generateCss(dark: Record<string, string>, light: Record<string, string>): string {
  const render = (vals: Record<string, string>) =>
    GROUPS.map(g => g.tokens.map(t => `    ${t.cssVar}: ${vals[t.cssVar] ?? ""};`).join("\n")).join("\n\n")
  return [
    "@layer base {",
    "  :root,",
    '  :root[data-theme="dark"] {',
    "    color-scheme: dark;",
    "",
    render(dark),
    "  }",
    "",
    '  :root[data-theme="light"] {',
    "    color-scheme: light;",
    "",
    render(light),
    "  }",
    "}",
  ].join("\n")
}

// --- Plugin preview ---
const PLUGIN_LABELS = {
  conflict: "Conflict", newTokens: "New Token", whichTokenToUse: "どのトークンを登録しますか？",
  existingStyle: "既存のスタイル", existingStyleConflictTitle: "Existing style conflict",
  existingStyleConflictDescription: "既存のスタイルとの競合があります。登録するトークンを選択してください。",
  duplicateStyleNameTitle: "Duplicate style name",
  duplicateStyleNameDescription: "同じスタイル名が複数あります。インポートするトークンを選択してください。",
  emptyState: "インポート可能なカラートークンがありません。",
  checkingConflicts: "既存のカラースタイルを確認中...",
  conflictCheckFailed: "既存のカラースタイルを確認できませんでした。",
  light: "Light", dark: "Dark",
}

function PluginPreview() {
  const [language, setLanguage] = useState<Language>("en")
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const editorLabels = {
    copy: language === "en" ? "Copy JSON" : "JSONをコピー",
    copied: language === "en" ? "Copied" : "コピーしました",
    copyFailed: language === "en" ? "Copy failed" : "コピーできませんでした",
    resize: language === "en" ? "Resize editor" : "エディタの高さを変更",
  }
  return (
    <div
      className="flex h-[620px] w-[420px] shrink-0 flex-col overflow-hidden rounded border border-border-muted font-['Jost','Noto_Sans_JP',ui-sans-serif]"
      aria-label="Plugin preview"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-surface-canvas px-5 pt-8 pb-6">
        <div className="flex flex-col gap-6">
          <AppHeader language={language} title="Token Importer" onLanguageChange={setLanguage} />
          <section className="flex flex-col gap-3">
            <JsonTokenEditor
              diagnostics={catalogEditorDiagnostics}
              labels={editorLabels}
              lineNumbersRef={lineNumbersRef}
              placeholder="JSONをここに貼り付け..."
              value={catalogEditorJson}
              onScroll={top => { if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = top }}
              onTextChange={() => {}}
            />
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton size="md" variant="outline">{language === "en" ? "Upload JSON" : "JSONをアップロード"}</ActionButton>
              <ActionButton size="md" variant="outline">{language === "en" ? "Analyze" : "解析する"}</ActionButton>
            </div>
          </section>
          <StatsGrid items={catalogStatsItems} />
          <TokenCardList
            tokens={catalogTokens}
            conflictGroups={catalogConflictGroups}
            existingConflicts={catalogExistingConflicts}
            isCheckingConflicts={false}
            conflictError={null}
            conflictSelections={new Map([["semantic/accent/default", "semantic-accent-default-a"]])}
            onSelectionChange={() => {}}
            labels={PLUGIN_LABELS}
          />
        </div>
      </div>
      <div className="shrink-0 border-t border-border-strong bg-surface-canvas px-5 py-3.5">
        <ActionButton size="md">{language === "en" ? "Import" : "インポート"}</ActionButton>
      </div>
    </div>
  )
}

// --- Main story ---
type Resolved = Record<string, Color | null>

export function ColorAudit() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [split, setSplit] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [resolved, setResolved] = useState<Resolved>({})
  const [darkValues, setDarkValues] = useState<Record<string, string>>({ ...COLOR_AUDIT_THEME_DEFAULTS.dark })
  const [lightValues, setLightValues] = useState<Record<string, string>>({ ...COLOR_AUDIT_THEME_DEFAULTS.light })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    return onColorAuditThemeDefaultsUpdated(detail => {
      setDarkValues({ ...detail.defaults.dark })
      setLightValues({ ...detail.defaults.light })
    })
  }, [])

  // Apply current theme values as inline :root styles, then re-resolve computed colors.
  // Inline styles have higher specificity than data-theme selectors in tokens.css.
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = theme

    const root = document.documentElement
    // Clear previously applied overrides
    for (const key of COLOR_AUDIT_THEME_DEFAULT_KEYS) root.style.removeProperty(key)
    // Apply current theme's edited values
    const current = theme === "dark" ? darkValues : lightValues
    for (const [k, v] of Object.entries(current)) root.style.setProperty(k, v)

    // Resolve computed colors now that styles are applied
    const el = containerRef.current
    if (el) {
      const allVars = new Set(GROUPS.flatMap(g => g.tokens).flatMap(t => [t.cssVar, ...(t.against ?? [])]))
      const result: Resolved = {}
      for (const v of allVars) result[v] = resolveVar(v, el)
      setResolved(result)
    }

    return () => {
      if (prev !== undefined) document.documentElement.dataset.theme = prev
      else document.documentElement.removeAttribute("data-theme")
      for (const key of COLOR_AUDIT_THEME_DEFAULT_KEYS) root.style.removeProperty(key)
    }
  }, [theme, darkValues, lightValues])

  const updateValue = (cssVar: string, value: string, t: "dark" | "light") => {
    if (t === "dark") setDarkValues(prev => ({ ...prev, [cssVar]: value }))
    else setLightValues(prev => ({ ...prev, [cssVar]: value }))
  }

  // Duplicate detection
  const hexIndex: Record<string, string[]> = {}
  for (const [varName, color] of Object.entries(resolved)) {
    if (!color) continue
    const hex = toHex(color.r, color.g, color.b)
    if (!hexIndex[hex]) hexIndex[hex] = []
    hexIndex[hex].push(varName)
  }
  const duplicateHexes = new Set(Object.keys(hexIndex).filter(h => (hexIndex[h]?.length ?? 0) > 1))

  // Failing contrast pairs
  type FailPair = { fg: string; bg: string; ratio: number }
  const failingPairs: FailPair[] = []
  for (const group of GROUPS) {
    for (const token of group.tokens) {
      if (!token.against) continue
      const fg = resolved[token.cssVar]
      if (!fg) continue
      for (const bgVar of token.against) {
        const bg = resolved[bgVar]
        if (!bg) continue
        const ratio = contrastRatio(luminance(fg.r, fg.g, fg.b), luminance(bg.r, bg.g, bg.b))
        if (ratio < 4.5) failingPairs.push({ fg: token.cssVar, bg: bgVar, ratio })
      }
    }
  }

  const cssOutput = generateCss(darkValues, lightValues)

  const copyOutput = async () => {
    await navigator.clipboard.writeText(cssOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-surface-canvas p-6 font-['Jost','Noto_Sans_JP',ui-sans-serif] text-text-primary"
    >
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-xl font-normal">Color Audit</h1>
        {!split && (
          <div className="flex overflow-hidden rounded-full border border-border-default text-sm">
            {(["dark", "light"] as const).map(t => (
              <button
                key={t}
                type="button"
                style={{ border: "none" }}
                className={
                  "cursor-pointer px-3 py-1 transition-colors " +
                  (theme === t
                    ? "bg-accent-primary text-accent-foreground"
                    : "bg-transparent text-text-secondary hover:bg-surface-muted")
                }
                onClick={() => setTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          style={{ border: "none" }}
          className={
            "cursor-pointer rounded-full px-3 py-1 text-sm transition-colors " +
            (split ? "bg-surface-muted text-text-primary" : "bg-transparent text-text-secondary hover:bg-surface-muted")
          }
          onClick={() => setSplit(v => !v)}
        >
          {split ? "Split ✕" : "Split →"}
        </button>
        <span className="text-xs text-text-muted">D/L欄を編集 → 下部CSS出力をコピー</span>
      </div>

      {/* Legend */}
      <div className="mb-5 flex flex-wrap gap-4 text-[11px] text-text-muted">
        <span>
          <span className="mr-1 inline-block size-3 rounded-sm bg-status-warning-ghost align-middle" />
          黄色い行 = 別トークンと同じ解決済み値（重複）
        </span>
        <span>
          <span className="mr-1 inline-block rounded bg-red-100 px-1 text-red-800">✗</span>
          赤バッジ = WCAG AA 未達（4.5:1未満）
        </span>
        <span>
          <span className="mr-1 text-green-600">●</span>
          緑ドット = .tsx で使用中
        </span>
      </div>

      {/* Contrast summary banner */}
      {failingPairs.length === 0 ? (
        <div className="mb-5 rounded border border-green-400 bg-green-50 p-2.5">
          <p className="m-0 text-xs text-green-800">全コントラストペアが AA 合格（4.5:1以上）✓</p>
        </div>
      ) : (
        <div className="mb-5 rounded border border-status-error bg-status-error-surface p-2.5">
          <p className="m-0 mb-1.5 text-xs font-medium text-status-error">
            AA 不合格ペア {failingPairs.length}件（4.5:1未満）
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {failingPairs.map(pair => (
              <li key={`${pair.fg}:${pair.bg}`} className="text-[11px] text-status-error">
                <code>{pair.fg}</code> on <code>{pair.bg}</code> → <strong>{pair.ratio.toFixed(2)}:1</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main content */}
      <div className={split ? "flex items-start gap-8" : ""}>
        <div className={split ? "min-w-0 flex-1" : ""}>
          <div className="flex flex-col gap-8">
            {GROUPS.map(group => (
              <section key={group.name}>
                <h2 className="mb-2 text-[10px] font-normal uppercase tracking-widest text-text-muted">
                  {group.name}
                </h2>
                <div className="overflow-hidden rounded border border-border-muted">
                  {group.tokens.map((token, i) => {
                    const color = resolved[token.cssVar]
                    const hex = color ? toHex(color.r, color.g, color.b) : null
                    const hasAlpha = !!color && color.a < 0.99
                    const isDuplicate = hex ? duplicateHexes.has(hex) : false
                    const dupeWith = isDuplicate && hex
                      ? (hexIndex[hex] ?? []).filter(v => v !== token.cssVar)
                      : []

                    return (
                      <div
                        key={token.cssVar}
                        className={
                          "flex items-start gap-3 p-2 " +
                          (i > 0 ? "border-t border-border-muted " : "") +
                          (isDuplicate ? "bg-status-warning-ghost" : "")
                        }
                      >
                        {/* Swatch */}
                        <div
                          className="mt-1 size-5 shrink-0 rounded-sm border border-white/20"
                          style={{
                            backgroundColor: color
                              ? `rgba(${color.r},${color.g},${color.b},${color.a})`
                              : "transparent",
                            backgroundImage: hasAlpha
                              ? "repeating-conic-gradient(#aaa 0% 25%,transparent 0% 50%) 0 0/8px 8px"
                              : undefined,
                          }}
                        />

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          {/* Var name + hex + dupes */}
                          <div className="flex flex-wrap items-baseline gap-2">
                            <code className="text-[11px] text-text-primary">{token.cssVar}</code>
                            <code className="text-[11px] text-text-muted">
                              {hex ?? "—"}{hasAlpha && color ? ` α${color.a.toFixed(2)}` : ""}
                            </code>
                            {dupeWith.map(dupe => (
                              <span key={dupe} className="text-[10px] text-status-warning">同値: {dupe}</span>
                            ))}
                          </div>

                          {/* Usage + used indicator */}
                          <p className="m-0 flex items-center gap-1 text-[10px] leading-tight text-text-muted">
                            {(() => {
                              const shortName = token.cssVar.replace(/^--/, "")
                              const used = isUsedInTsx(shortName)
                              return (
                                <span title={used ? ".tsxで使用中" : ".tsxに参照なし"} className={used ? "text-green-600" : "text-red-500"}>
                                  {used ? "●" : "○"}
                                </span>
                              )
                            })()}
                            {token.usage}
                          </p>

                          {/* Contrast badges */}
                          {token.against && token.against.length > 0 && (
                            <div className="mt-0.5 flex flex-wrap gap-1.5">
                              {token.against.map(bgVar => {
                                const bg = resolved[bgVar]
                                if (!color || !bg) return null
                                const ratio = contrastRatio(luminance(color.r, color.g, color.b), luminance(bg.r, bg.g, bg.b))
                                const passAA = ratio >= 4.5
                                const passLarge = ratio >= 3.0
                                return (
                                  <span
                                    key={bgVar}
                                    className={
                                      "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] leading-none " +
                                      (passAA ? "bg-green-100 text-green-800" : passLarge ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800")
                                    }
                                  >
                                    {bgVar.replace(/^--/, "")}&thinsp;{ratio.toFixed(1)}:1&thinsp;
                                    {passAA ? "AA✓" : passLarge ? "large✓" : "✗"}
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          {/* Value editors — D: dark, L: light */}
                          <div className="mt-1.5 flex flex-col gap-1">
                            {(["dark", "light"] as const).map(t => {
                              const vals = t === "dark" ? darkValues : lightValues
                              const cur = vals[token.cssVar] ?? ""
                              const isTw = cur.startsWith("var(--color-")
                              return (
                                <div key={t} className="flex items-center gap-1">
                                  <span style={{ color: "var(--text-muted)", fontSize: 9, width: 10, textAlign: "center", flexShrink: 0 }}>
                                    {t === "dark" ? "D" : "L"}
                                  </span>
                                  <select
                                    value={isTw ? cur : ""}
                                    onChange={e => { if (e.target.value) updateValue(token.cssVar, e.target.value, t) }}
                                    style={{
                                      backgroundColor: "var(--surface-panel)",
                                      color: "var(--text-primary)",
                                      border: "1px solid var(--border-muted)",
                                      borderRadius: 3,
                                      fontSize: 10,
                                      padding: "1px 2px",
                                      flexShrink: 0,
                                      maxWidth: 150,
                                      outline: "none",
                                    }}
                                  >
                                    <option value="">— pick —</option>
                                    <optgroup label="Special">
                                      <option value="var(--color-white)">white</option>
                                      <option value="var(--color-black)">black</option>
                                    </optgroup>
                                    {TAILWIND_FAMILIES.map(family => (
                                      <optgroup key={family} label={family}>
                                        {TAILWIND_SHADES.map(shade => (
                                          <option key={shade} value={`var(--color-${family}-${shade})`}>
                                            {family}-{shade}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={cur}
                                    onChange={e => updateValue(token.cssVar, e.target.value, t)}
                                    style={{
                                      backgroundColor: "var(--surface-panel)",
                                      color: "var(--text-primary)",
                                      border: "1px solid var(--border-muted)",
                                      borderRadius: 3,
                                      fontSize: 10,
                                      fontFamily: "monospace",
                                      padding: "1px 4px",
                                      minWidth: 0,
                                      flex: 1,
                                      outline: "none",
                                    }}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* CSS Output */}
          <section className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="m-0 text-[10px] font-normal uppercase tracking-widest text-text-muted">
                CSS Output
              </h2>
              <button
                type="button"
                style={{ border: "none" }}
                className="cursor-pointer rounded px-3 py-1 text-[11px] bg-accent-primary text-accent-foreground hover:bg-accent-primary-hover"
                onClick={copyOutput}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <pre
              className="overflow-x-auto rounded border border-border-muted bg-surface-inset p-3 text-[11px] leading-relaxed"
              style={{ color: "var(--code-punctuation)", margin: 0 }}
            >
              {cssOutput}
            </pre>
          </section>
        </div>

        {/* Plugin preview (split mode) */}
        {split && (
          <div className="sticky top-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="m-0 text-[10px] uppercase tracking-widest text-text-muted">Plugin Preview</p>
              <div className="flex overflow-hidden rounded-full border border-border-default text-sm">
                {(["dark", "light"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    style={{ border: "none" }}
                    className={
                      "cursor-pointer px-3 py-1 transition-colors " +
                      (theme === t
                        ? "bg-accent-primary text-accent-foreground"
                        : "bg-transparent text-text-secondary hover:bg-surface-muted")
                    }
                    onClick={() => setTheme(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <PluginPreview />
          </div>
        )}
      </div>
    </div>
  )
}

ColorAudit.storyName = "Color Audit"
