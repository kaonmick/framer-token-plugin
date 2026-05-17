import type { CSSProperties, ReactNode } from "react"
import type { Language } from "../../app/i18n.ts"

export const pluginPreviewWidthClass = "w-full max-w-[420px]"
export type ThemeName = "dark" | "light"
type ThemePreviewStyle = CSSProperties & Record<`--${string}`, string>

const themePreviewStyles: Record<ThemeName, ThemePreviewStyle> = {
  dark: {
    colorScheme: "dark",
    color: "var(--color-neutral-100)",
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
    "--status-warning-surface": "var(--color-yellow-900)",
    "--status-warning-ghost": "rgba(255, 240, 133, 0.2)",
    "--status-error": "var(--color-red-400)",
    "--status-error-surface": "var(--color-red-800)",
    "--control-radio-selected": "var(--color-yellow-300)",
    "--preview-conflict-accent": "var(--color-yellow-700)",
    "--preview-new-token-accent": "var(--color-green-700)",
    "--code-key": "var(--color-sky-300)",
    "--code-string": "#8be9a1",
    "--code-number": "#80c7ff",
    "--code-boolean": "#ffb86c",
    "--code-null": "#ff8ba7",
    "--code-punctuation": "var(--color-neutral-300)",
    "--code-diagnostic-underline": "var(--status-warning)",
    "--color-surface-canvas": "var(--surface-canvas)",
    "--color-surface-panel": "var(--surface-panel)",
    "--color-surface-raised": "var(--surface-raised)",
    "--color-surface-muted": "var(--surface-muted)",
    "--color-surface-inset": "var(--surface-inset)",
    "--color-text-primary": "var(--text-primary)",
    "--color-text-secondary": "var(--text-secondary)",
    "--color-text-muted": "var(--text-muted)",
    "--color-text-accent": "var(--text-accent)",
    "--color-text-diagnostic-ghost": "var(--text-diagnostic-ghost)",
    "--color-text-diagnostic-ghost-hover": "var(--text-diagnostic-ghost-hover)",
    "--color-border-default": "var(--border-default)",
    "--color-border-muted": "var(--border-muted)",
    "--color-border-strong": "var(--border-strong)",
    "--color-border-focus": "var(--border-focus)",
    "--color-accent-primary": "var(--accent-primary)",
    "--color-accent-primary-hover": "var(--accent-primary-hover)",
    "--color-accent-primary-disabled": "var(--accent-primary-disabled)",
    "--color-accent-foreground": "var(--accent-foreground)",
    "--color-accent-foreground-disabled": "var(--accent-foreground-disabled)",
    "--color-status-warning": "var(--status-warning)",
    "--color-status-warning-surface": "var(--status-warning-surface)",
    "--color-status-warning-ghost": "var(--status-warning-ghost)",
    "--color-status-error": "var(--status-error)",
    "--color-status-error-surface": "var(--status-error-surface)",
    "--color-control-radio-selected": "var(--control-radio-selected)",
    "--color-preview-conflict-accent": "var(--preview-conflict-accent)",
    "--color-preview-new-token-accent": "var(--preview-new-token-accent)",
    "--color-code-key": "var(--code-key)",
    "--color-code-string": "var(--code-string)",
    "--color-code-number": "var(--code-number)",
    "--color-code-boolean": "var(--code-boolean)",
    "--color-code-null": "var(--code-null)",
    "--color-code-punctuation": "var(--code-punctuation)",
    "--color-code-diagnostic-underline": "var(--code-diagnostic-underline)",
  },
  light: {
    colorScheme: "light",
    color: "var(--color-neutral-900)",
    "--surface-canvas": "var(--color-neutral-50)",
    "--surface-panel": "var(--color-neutral-100)",
    "--surface-raised": "var(--color-neutral-50)",
    "--surface-muted": "var(--color-neutral-200)",
    "--surface-inset": "var(--color-neutral-100)",
    "--text-primary": "var(--color-neutral-900)",
    "--text-secondary": "var(--color-neutral-600)",
    "--text-muted": "var(--color-neutral-600)",
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
    "--status-warning": "var(--color-yellow-500)",
    "--status-warning-surface": "var(--color-yellow-100)",
    "--status-warning-ghost": "rgba(255, 240, 133, 0.2)",
    "--status-error": "var(--color-red-700)",
    "--status-error-surface": "var(--color-red-100)",
    "--control-radio-selected": "var(--color-yellow-300)",
    "--preview-conflict-accent": "var(--color-yellow-400)",
    "--preview-new-token-accent": "var(--color-green-700)",
    "--code-key": "var(--color-sky-700)",
    "--code-string": "#15803d",
    "--code-number": "#1d4ed8",
    "--code-boolean": "#b45309",
    "--code-null": "#be185d",
    "--code-punctuation": "var(--color-neutral-600)",
    "--code-diagnostic-underline": "var(--status-warning)",
    "--color-surface-canvas": "var(--surface-canvas)",
    "--color-surface-panel": "var(--surface-panel)",
    "--color-surface-raised": "var(--surface-raised)",
    "--color-surface-muted": "var(--surface-muted)",
    "--color-surface-inset": "var(--surface-inset)",
    "--color-text-primary": "var(--text-primary)",
    "--color-text-secondary": "var(--text-secondary)",
    "--color-text-muted": "var(--text-muted)",
    "--color-text-accent": "var(--text-accent)",
    "--color-text-diagnostic-ghost": "var(--text-diagnostic-ghost)",
    "--color-text-diagnostic-ghost-hover": "var(--text-diagnostic-ghost-hover)",
    "--color-border-default": "var(--border-default)",
    "--color-border-muted": "var(--border-muted)",
    "--color-border-strong": "var(--border-strong)",
    "--color-border-focus": "var(--border-focus)",
    "--color-accent-primary": "var(--accent-primary)",
    "--color-accent-primary-hover": "var(--accent-primary-hover)",
    "--color-accent-primary-disabled": "var(--accent-primary-disabled)",
    "--color-accent-foreground": "var(--accent-foreground)",
    "--color-accent-foreground-disabled": "var(--accent-foreground-disabled)",
    "--color-status-warning": "var(--status-warning)",
    "--color-status-warning-surface": "var(--status-warning-surface)",
    "--color-status-warning-ghost": "var(--status-warning-ghost)",
    "--color-status-error": "var(--status-error)",
    "--color-status-error-surface": "var(--status-error-surface)",
    "--color-control-radio-selected": "var(--control-radio-selected)",
    "--color-preview-conflict-accent": "var(--preview-conflict-accent)",
    "--color-preview-new-token-accent": "var(--preview-new-token-accent)",
    "--color-code-key": "var(--code-key)",
    "--color-code-string": "var(--code-string)",
    "--color-code-number": "var(--code-number)",
    "--color-code-boolean": "var(--code-boolean)",
    "--color-code-null": "var(--code-null)",
    "--color-code-punctuation": "var(--code-punctuation)",
    "--color-code-diagnostic-underline": "var(--code-diagnostic-underline)",
  },
}

export function PluginPreviewFrame({ children }: { children: ReactNode }) {
  return <div className={pluginPreviewWidthClass}>{children}</div>
}

export function ThemePreviewColumn({ children, theme }: { children: ReactNode; theme: ThemeName }) {
  return (
    <div className="rounded border border-border-muted bg-surface-canvas p-4" data-theme={theme} style={themePreviewStyles[theme]}>
      <div className="mb-3 text-[10px] uppercase tracking-widest text-text-muted">{theme}</div>
      {children}
    </div>
  )
}

export function ThemeSummaryColumns({ children }: { children: (theme: ThemeName) => ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ThemePreviewColumn theme="dark">{children("dark")}</ThemePreviewColumn>
      <ThemePreviewColumn theme="light">{children("light")}</ThemePreviewColumn>
    </div>
  )
}

export function getStoryLanguage(globals: Record<string, unknown>): Language {
  return globals.language === "en" ? "en" : "ja"
}
