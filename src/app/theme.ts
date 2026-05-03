export type PluginThemeMode = "light" | "dark"

const FRAMER_THEME_ATTRIBUTE = "data-framer-theme"

export function resolvePluginThemeMode(value: string | null | undefined): PluginThemeMode {
  return value === "light" ? "light" : "dark"
}

export function getDocumentThemeMode(doc: Document): PluginThemeMode {
  return resolvePluginThemeMode(doc.body?.getAttribute(FRAMER_THEME_ATTRIBUTE))
}

export function applyDocumentTheme(doc: Document, mode: PluginThemeMode) {
  doc.documentElement.dataset.theme = mode
}

export function syncDocumentThemeFromFramer(doc: Document) {
  applyDocumentTheme(doc, getDocumentThemeMode(doc))

  const observer = new MutationObserver(() => {
    applyDocumentTheme(doc, getDocumentThemeMode(doc))
  })

  if (doc.body) {
    observer.observe(doc.body, {
      attributeFilter: [FRAMER_THEME_ATTRIBUTE],
      attributes: true,
    })
  }

  return () => observer.disconnect()
}
