import tokensCssSource from "../tokens.css?raw"

export type ColorAuditThemeName = "dark" | "light"
type ColorAuditThemeDefaults = Record<ColorAuditThemeName, Record<string, string>>
const COLOR_AUDIT_THEME_DEFAULTS_UPDATED_EVENT = "color-audit-theme-defaults-updated"

const FALLBACK_THEME_DEFAULTS: ColorAuditThemeDefaults = {
  dark: {
    "--surface-canvas": "var(--color-neutral-800)",
    "--surface-panel": "var(--color-neutral-700)",
    "--surface-raised": "var(--color-neutral-800)",
    "--surface-muted": "var(--color-neutral-600)",
    "--surface-inset": "var(--color-neutral-700)",
    "--text-primary": "var(--color-neutral-100)",
    "--text-secondary": "var(--color-neutral-300)",
    "--text-muted": "var(--color-neutral-400)",
    "--text-accent": "var(--color-yellow-300)",
    "--text-diagnostic-ghost": "var(--status-warning-ghost)",
    "--text-diagnostic-ghost-hover": "color-mix(in srgb, var(--color-code-diagnostic-underline) 32%, transparent)",
    "--border-default": "var(--color-neutral-200)",
    "--border-muted": "var(--color-neutral-500)",
    "--border-strong": "var(--color-neutral-200)",
    "--border-focus": "var(--color-yellow-300)",
    "--accent-primary": "var(--color-yellow-300)",
    "--accent-primary-hover": "var(--color-yellow-500)",
    "--accent-primary-disabled": "color-mix(in srgb, var(--color-yellow-300) 35%, transparent)",
    "--accent-foreground": "var(--color-neutral-800)",
    "--accent-foreground-disabled": "rgba(26, 26, 26, 0.5)",
    "--status-warning": "var(--color-yellow-300)",
    "--status-warning-surface": "#422006",
    "--status-warning-ghost": "#fff08533",
    "--status-error": "var(--color-red-400)",
    "--status-error-surface": "#450a0a",
    "--control-radio-selected": "var(--color-yellow-300)",
    "--preview-conflict-accent": "#733e0a",
    "--preview-new-token-accent": "#0d542b",
    "--code-key": "var(--color-sky-300)",
    "--code-string": "#8be9a1",
    "--code-number": "#80c7ff",
    "--code-boolean": "#ffb86c",
    "--code-null": "#ff8ba7",
    "--code-punctuation": "var(--color-neutral-300)",
    "--code-diagnostic-underline": "var(--status-warning)",
  },
  light: {
    "--surface-canvas": "var(--color-neutral-50)",
    "--surface-panel": "var(--color-neutral-100)",
    "--surface-raised": "var(--color-neutral-50)",
    "--surface-muted": "var(--color-neutral-200)",
    "--surface-inset": "var(--color-neutral-100)",
    "--text-primary": "var(--color-neutral-900)",
    "--text-secondary": "var(--color-neutral-600)",
    "--text-muted": "var(--color-neutral-500)",
    "--text-accent": "#9a6a00",
    "--text-diagnostic-ghost": "color-mix(in srgb, var(--color-code-diagnostic-underline) 56%, var(--color-surface-inset))",
    "--text-diagnostic-ghost-hover": "color-mix(in srgb, var(--color-code-diagnostic-underline) 64%, var(--color-surface-inset))",
    "--border-default": "var(--color-neutral-400)",
    "--border-muted": "var(--color-neutral-300)",
    "--border-strong": "var(--color-neutral-400)",
    "--border-focus": "var(--color-yellow-300)",
    "--accent-primary": "var(--color-yellow-300)",
    "--accent-primary-hover": "var(--color-yellow-500)",
    "--accent-primary-disabled": "color-mix(in srgb, var(--color-yellow-300) 50%, var(--color-white))",
    "--accent-foreground": "var(--color-neutral-800)",
    "--accent-foreground-disabled": "rgba(38, 38, 38, 0.5)",
    "--status-warning": "#9a6a00",
    "--status-warning-surface": "#fff6db",
    "--status-warning-ghost": "#facc1533",
    "--status-error": "var(--color-red-700)",
    "--status-error-surface": "#fee2e2",
    "--control-radio-selected": "#f0b100",
    "--preview-conflict-accent": "#fdc700",
    "--preview-new-token-accent": "#5ea500",
    "--code-key": "var(--color-sky-700)",
    "--code-string": "#15803d",
    "--code-number": "#1d4ed8",
    "--code-boolean": "#b45309",
    "--code-null": "#be185d",
    "--code-punctuation": "var(--color-neutral-600)",
    "--code-diagnostic-underline": "var(--status-warning)",
  },
}

function extractBlockByHeader(source: string, header: string): string | null {
  const headerIndex = source.indexOf(header)
  if (headerIndex === -1) return null

  const startBraceIndex = source.indexOf("{", headerIndex + header.length)
  if (startBraceIndex === -1) return null

  let depth = 1
  for (let index = startBraceIndex + 1; index < source.length; index += 1) {
    const char = source[index]
    if (char === "{") depth += 1
    if (char === "}") depth -= 1
    if (depth === 0) return source.slice(startBraceIndex + 1, index)
  }

  return null
}

function parseCustomProperties(ruleBody: string): Record<string, string> {
  const values: Record<string, string> = {}
  for (const match of ruleBody.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
    const [, key, value] = match
    if (!key || !value) continue
    values[key.trim()] = value.trim()
  }
  return values
}

function extractThemeDefaults(baseLayerBody: string, selector: string): Record<string, string> | null {
  for (const match of baseLayerBody.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selectorSource, ruleBody] = match
    if (!selectorSource || !ruleBody) continue
    const selectors = selectorSource
      .split(",")
      .map(value => value.trim())
      .filter(Boolean)

    if (!selectors.includes(selector)) continue

    return parseCustomProperties(ruleBody)
  }

  return null
}

function parseThemeDefaults(source: string): ColorAuditThemeDefaults | null {
  const baseLayerBody = extractBlockByHeader(source, "@layer base")
  if (!baseLayerBody) return null

  const dark = extractThemeDefaults(baseLayerBody, ':root[data-theme="dark"]')
  const light = extractThemeDefaults(baseLayerBody, ':root[data-theme="light"]')
  if (!dark || !light) return null

  return { dark, light }
}

const parsedThemeDefaults = parseThemeDefaults(tokensCssSource)

if (!parsedThemeDefaults) {
  console.warn("[ColorAudit] Failed to parse src/tokens.css. Falling back to bundled defaults.")
}

export const COLOR_AUDIT_THEME_DEFAULTS = parsedThemeDefaults ?? FALLBACK_THEME_DEFAULTS
export const COLOR_AUDIT_THEME_DEFAULT_KEYS = Array.from(
  new Set([
    ...Object.keys(COLOR_AUDIT_THEME_DEFAULTS.dark),
    ...Object.keys(COLOR_AUDIT_THEME_DEFAULTS.light),
  ]),
)
export const COLOR_AUDIT_THEME_DEFAULT_VERSION = JSON.stringify(COLOR_AUDIT_THEME_DEFAULTS)

export type ColorAuditThemeDefaultsUpdatedDetail = {
  defaults: ColorAuditThemeDefaults
  keys: string[]
  version: string
}

export function createColorAuditThemeDefaultsDetail(): ColorAuditThemeDefaultsUpdatedDetail {
  return {
    defaults: COLOR_AUDIT_THEME_DEFAULTS,
    keys: COLOR_AUDIT_THEME_DEFAULT_KEYS,
    version: COLOR_AUDIT_THEME_DEFAULT_VERSION,
  }
}

function dispatchColorAuditThemeDefaultsUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<ColorAuditThemeDefaultsUpdatedDetail>(COLOR_AUDIT_THEME_DEFAULTS_UPDATED_EVENT, {
      detail: createColorAuditThemeDefaultsDetail(),
    }),
  )
}

export function onColorAuditThemeDefaultsUpdated(
  listener: (detail: ColorAuditThemeDefaultsUpdatedDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {}

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ColorAuditThemeDefaultsUpdatedDetail>
    if (!customEvent.detail) return
    listener(customEvent.detail)
  }

  window.addEventListener(COLOR_AUDIT_THEME_DEFAULTS_UPDATED_EVENT, handler)
  return () => window.removeEventListener(COLOR_AUDIT_THEME_DEFAULTS_UPDATED_EVENT, handler)
}

if (import.meta.hot) {
  import.meta.hot.accept()
  queueMicrotask(() => dispatchColorAuditThemeDefaultsUpdated())
}
