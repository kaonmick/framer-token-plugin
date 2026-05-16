import type { ReactNode } from "react"
import type { Language } from "../../app/i18n.ts"

export const pluginPreviewWidthClass = "w-full max-w-[420px]"

export function PluginPreviewFrame({ children }: { children: ReactNode }) {
  return <div className={pluginPreviewWidthClass}>{children}</div>
}

export function getStoryLanguage(globals: Record<string, unknown>): Language {
  return globals.language === "en" ? "en" : "ja"
}
