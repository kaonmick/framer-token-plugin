import type { CSSProperties, ReactNode } from "react"
import type { Language } from "../../app/i18n.ts"

export const pluginPreviewWidthClass = "w-full max-w-[420px]"
export type ThemeName = "dark" | "light"
type ThemePreviewStyle = CSSProperties & Record<`--${string}`, string>

const themePreviewStyles: Record<ThemeName, ThemePreviewStyle> = {
  dark: {
    colorScheme: "dark",
    color: "var(--color-neutral-100)",
    "--surface-base": "var(--color-neutral-800)",
    "--surface-subtle": "var(--color-neutral-700)",
    "--surface-raised": "var(--color-neutral-800)",
    "--surface-muted": "var(--color-neutral-600)",
    "--surface-warning": "var(--color-yellow-800)",
    "--surface-danger": "var(--color-red-600)",
    "--overlay-default": "color-mix(in srgb, var(--color-neutral-800) 70%, transparent)",
    "--elevated-default": "var(--color-neutral-600)",
    "--text-default": "var(--color-neutral-100)",
    "--text-subtle": "var(--color-neutral-300)",
    "--text-muted": "var(--color-neutral-400)",
    "--text-on-brand": "var(--color-neutral-800)",
    "--text-danger": "var(--color-red-300)",
    "--text-highlight": "var(--color-yellow-100)",
    "--border-default": "var(--color-neutral-200)",
    "--border-muted": "var(--color-neutral-500)",
    "--border-strong": "var(--color-neutral-200)",
    "--border-focus": "var(--color-yellow-300)",
    "--border-brand": "var(--color-yellow-300)",
    "--border-danger": "var(--color-red-600)",
    "--surface-brand": "var(--color-yellow-300)",
    "--surface-brand-hover": "var(--color-yellow-500)",
    "--control-radio-selected": "var(--color-yellow-300)",
    "--preview-conflict-accent": "var(--color-yellow-500)",
    "--preview-new-token-accent": "var(--color-green-700)",
    "--code-key": "var(--color-sky-300)",
    "--code-string": "var(--color-green-300)",
    "--code-number": "var(--color-sky-300)",
    "--code-boolean": "var(--color-orange-300)",
    "--code-null": "var(--color-pink-300)",
    "--code-punctuation": "var(--color-neutral-300)",
    "--code-placeholder": "var(--color-neutral-400)",
    "--code-highlight": "var(--color-yellow-800)",
    "--code-diagnostic-underline": "var(--border-brand)",
    "--color-surface-base": "var(--surface-base)",
    "--color-surface-subtle": "var(--surface-subtle)",
    "--color-surface-raised": "var(--surface-raised)",
    "--color-surface-muted": "var(--surface-muted)",
    "--color-surface-warning": "var(--surface-warning)",
    "--color-surface-danger": "var(--surface-danger)",
    "--color-overlay-default": "var(--overlay-default)",
    "--color-elevated-default": "var(--elevated-default)",
    "--color-text-default": "var(--text-default)",
    "--color-text-subtle": "var(--text-subtle)",
    "--color-text-muted": "var(--text-muted)",
    "--color-text-on-brand": "var(--text-on-brand)",
    "--color-text-danger": "var(--text-danger)",
    "--color-text-highlight": "var(--text-highlight)",
    "--color-border-default": "var(--border-default)",
    "--color-border-muted": "var(--border-muted)",
    "--color-border-strong": "var(--border-strong)",
    "--color-border-focus": "var(--border-focus)",
    "--color-border-brand": "var(--border-brand)",
    "--color-border-danger": "var(--border-danger)",
    "--color-surface-brand": "var(--surface-brand)",
    "--color-surface-brand-hover": "var(--surface-brand-hover)",
    "--color-control-radio-selected": "var(--control-radio-selected)",
    "--color-preview-conflict-accent": "var(--preview-conflict-accent)",
    "--color-preview-new-token-accent": "var(--preview-new-token-accent)",
    "--color-code-key": "var(--code-key)",
    "--color-code-string": "var(--code-string)",
    "--color-code-number": "var(--code-number)",
    "--color-code-boolean": "var(--code-boolean)",
    "--color-code-null": "var(--code-null)",
    "--color-code-punctuation": "var(--code-punctuation)",
    "--color-code-placeholder": "var(--code-placeholder)",
    "--color-code-highlight": "var(--code-highlight)",
    "--color-code-diagnostic-underline": "var(--code-diagnostic-underline)",
  },
  light: {
    colorScheme: "light",
    color: "var(--color-neutral-900)",
    "--surface-base": "var(--color-neutral-50)",
    "--surface-subtle": "var(--color-neutral-100)",
    "--surface-raised": "var(--color-neutral-50)",
    "--surface-muted": "var(--color-neutral-200)",
    "--surface-warning": "var(--color-yellow-100)",
    "--surface-danger": "var(--color-red-400)",
    "--overlay-default": "color-mix(in srgb, var(--color-neutral-50) 70%, transparent)",
    "--elevated-default": "var(--color-neutral-200)",
    "--text-default": "var(--color-neutral-900)",
    "--text-subtle": "var(--color-neutral-600)",
    "--text-muted": "var(--color-neutral-500)",
    "--text-on-brand": "var(--color-neutral-800)",
    "--text-danger": "var(--color-red-600)",
    "--text-highlight": "var(--color-yellow-800)",
    "--border-default": "var(--color-neutral-400)",
    "--border-muted": "var(--color-neutral-300)",
    "--border-strong": "var(--color-neutral-400)",
    "--border-focus": "var(--color-yellow-300)",
    "--border-brand": "var(--color-yellow-300)",
    "--border-danger": "var(--color-red-600)",
    "--surface-brand": "var(--color-yellow-300)",
    "--surface-brand-hover": "var(--color-yellow-500)",
    "--control-radio-selected": "var(--color-yellow-300)",
    "--preview-conflict-accent": "var(--color-yellow-400)",
    "--preview-new-token-accent": "var(--color-green-700)",
    "--code-key": "var(--color-sky-700)",
    "--code-string": "var(--color-green-700)",
    "--code-number": "var(--color-blue-700)",
    "--code-boolean": "var(--color-orange-700)",
    "--code-null": "var(--color-pink-700)",
    "--code-punctuation": "var(--color-neutral-600)",
    "--code-placeholder": "var(--color-neutral-500)",
    "--code-highlight": "var(--color-yellow-100)",
    "--code-diagnostic-underline": "var(--color-yellow-800)",
    "--color-surface-base": "var(--surface-base)",
    "--color-surface-subtle": "var(--surface-subtle)",
    "--color-surface-raised": "var(--surface-raised)",
    "--color-surface-muted": "var(--surface-muted)",
    "--color-surface-warning": "var(--surface-warning)",
    "--color-surface-danger": "var(--surface-danger)",
    "--color-overlay-default": "var(--overlay-default)",
    "--color-elevated-default": "var(--elevated-default)",
    "--color-text-default": "var(--text-default)",
    "--color-text-subtle": "var(--text-subtle)",
    "--color-text-muted": "var(--text-muted)",
    "--color-text-on-brand": "var(--text-on-brand)",
    "--color-text-danger": "var(--text-danger)",
    "--color-text-highlight": "var(--text-highlight)",
    "--color-border-default": "var(--border-default)",
    "--color-border-muted": "var(--border-muted)",
    "--color-border-strong": "var(--border-strong)",
    "--color-border-focus": "var(--border-focus)",
    "--color-border-brand": "var(--border-brand)",
    "--color-border-danger": "var(--border-danger)",
    "--color-surface-brand": "var(--surface-brand)",
    "--color-surface-brand-hover": "var(--surface-brand-hover)",
    "--color-control-radio-selected": "var(--control-radio-selected)",
    "--color-preview-conflict-accent": "var(--preview-conflict-accent)",
    "--color-preview-new-token-accent": "var(--preview-new-token-accent)",
    "--color-code-key": "var(--code-key)",
    "--color-code-string": "var(--code-string)",
    "--color-code-number": "var(--code-number)",
    "--color-code-boolean": "var(--code-boolean)",
    "--color-code-null": "var(--code-null)",
    "--color-code-punctuation": "var(--code-punctuation)",
    "--color-code-placeholder": "var(--code-placeholder)",
    "--color-code-highlight": "var(--code-highlight)",
    "--color-code-diagnostic-underline": "var(--code-diagnostic-underline)",
  },
}

export function PluginPreviewFrame({ children }: { children: ReactNode }) {
  return <div className={pluginPreviewWidthClass}>{children}</div>
}

export function ThemePreviewColumn({ children, theme }: { children: ReactNode; theme: ThemeName }) {
  return (
    <div className="rounded border border-border-muted bg-surface-base p-4" data-theme={theme} style={themePreviewStyles[theme]}>
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
