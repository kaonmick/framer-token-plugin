import firaCode400Url from "@fontsource/fira-code/files/fira-code-latin-400-normal.woff2?url"
import firaCode500Url from "@fontsource/fira-code/files/fira-code-latin-500-normal.woff2?url"
import jost400Url from "@fontsource/jost/files/jost-latin-400-normal.woff2?url"
import jost500Url from "@fontsource/jost/files/jost-latin-500-normal.woff2?url"
import jost600Url from "@fontsource/jost/files/jost-latin-600-normal.woff2?url"
import jost700Url from "@fontsource/jost/files/jost-latin-700-normal.woff2?url"

const BUNDLED_FONT_STYLE_ID = "bundled-fonts"

export function installBundledFonts() {
  if (typeof document === "undefined" || document.getElementById(BUNDLED_FONT_STYLE_ID)) return

  const style = document.createElement("style")
  style.id = BUNDLED_FONT_STYLE_ID
  style.textContent = [
    fontFace("Jost", 400, jost400Url),
    fontFace("Jost", 500, jost500Url),
    fontFace("Jost", 600, jost600Url),
    fontFace("Jost", 700, jost700Url),
    fontFace("Fira Code", 400, firaCode400Url),
    fontFace("Fira Code", 500, firaCode500Url),
  ].join("\n")

  document.head.appendChild(style)
}

function fontFace(family: string, weight: number, url: string): string {
  return `@font-face{font-family:"${family}";font-style:normal;font-display:swap;font-weight:${weight};src:url("${url}") format("woff2");}`
}
