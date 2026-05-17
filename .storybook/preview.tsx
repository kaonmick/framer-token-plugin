import type { Decorator, Preview } from "@storybook/react-vite"
import { useGlobals } from "storybook/preview-api"
import { installBundledFonts } from "../src/app/fonts.ts"
import "../src/tokens.css"

const withTheme: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals()
  const theme = globals.theme === "light" ? "light" : "dark"
  const language = globals.language === "en" ? "en" : "ja"
  const hideThemeToggle = context.parameters.hideThemeToggle === true

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = language
    installBundledFonts()
  }

  return (
    <div className="min-h-screen bg-surface-canvas p-6 font-['Jost','Noto_Sans_JP',ui-sans-serif,system-ui,sans-serif] text-text-primary">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-[12px] leading-none">
        {hideThemeToggle ? null : (
          <span className="inline-flex overflow-hidden rounded-full border border-border-muted bg-surface-panel">
            <button
              type="button"
              className={getToggleButtonClass(theme === "dark")}
              aria-pressed={theme === "dark"}
              onClick={() => updateGlobals({ theme: "dark" })}
            >
              Dark
            </button>
            <button
              type="button"
              className={getToggleButtonClass(theme === "light")}
              aria-pressed={theme === "light"}
              onClick={() => updateGlobals({ theme: "light" })}
            >
              Light
            </button>
          </span>
        )}
        <span className="inline-flex overflow-hidden rounded-full border border-border-muted bg-surface-panel">
          <button
            type="button"
            className={getToggleButtonClass(language === "ja")}
            aria-pressed={language === "ja"}
            onClick={() => updateGlobals({ language: "ja" })}
          >
            日本語
          </button>
          <button
            type="button"
            className={getToggleButtonClass(language === "en")}
            aria-pressed={language === "en"}
            onClick={() => updateGlobals({ language: "en" })}
          >
            English
          </button>
        </span>
      </div>
      <Story />
    </div>
  )
}

function getToggleButtonClass(isActive: boolean): string {
  return [
    "min-h-[28px] cursor-pointer border-0 px-3 py-1 font-normal transition-colors",
    isActive
      ? "bg-accent-primary text-accent-foreground"
      : "bg-transparent text-text-secondary hover:bg-surface-muted",
  ].join(" ")
}

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: {
    language: "ja",
    theme: "dark",
  },
  parameters: {
    a11y: {
      context: "#storybook-root",
    },
    controls: {
      expanded: true,
    },
  },
}

export default preview
