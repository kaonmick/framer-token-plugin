import type { Language } from "../app/i18n.ts"
import { cx } from "./ui.tsx"

interface LanguageToggleProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  const isEnglish = language === "en"
  const nextLanguage = isEnglish ? "ja" : "en"

  return (
    <button
      type="button"
      className="relative h-[26px] w-[52px] shrink-0 cursor-pointer overflow-visible rounded-full bg-surface-muted p-0 font-normal text-ui-control text-text-secondary"
      lang="en"
      aria-label={isEnglish ? "Language: English. Switch to Japanese." : "Language: Japanese. Switch to English."}
      aria-pressed={!isEnglish}
      onClick={() => {
        onLanguageChange(nextLanguage)
      }}
    >
      <span
        className={cx(
          "absolute top-1/2 size-[22px] -translate-y-1/2 rounded-full bg-accent-primary transition-[left] duration-200 ease-[cubic-bezier(0.5,1.4,0.6,1)]",
          isEnglish ? "left-0.5" : "left-[28px]"
        )}
        aria-hidden="true"
      />
      <span
        className={cx(
          "absolute left-1.5 top-1/2 z-[1] -translate-y-1/2 leading-none",
          isEnglish ? "text-accent-foreground" : "text-text-secondary"
        )}
        aria-hidden="true"
      >
        En
      </span>
      <span
        className={cx(
          "absolute right-1.5 top-1/2 z-[1] -translate-y-1/2 leading-none",
          isEnglish ? "text-text-secondary" : "text-accent-foreground"
        )}
        aria-hidden="true"
      >
        Jp
      </span>
    </button>
  )
}
