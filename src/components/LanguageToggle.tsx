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
      className={cx(
        "relative h-6 w-12 shrink-0 cursor-pointer overflow-visible rounded-full bg-neutral-600 p-0 font-normal text-ui-control text-neutral-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
      )}
      lang="en"
      aria-label={isEnglish ? "Language: English. Switch to Japanese." : "Language: Japanese. Switch to English."}
      aria-pressed={!isEnglish}
      onClick={() => {
        onLanguageChange(nextLanguage)
      }}
    >
      <span
        className={cx(
          "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-yellow-300 transition-[left] duration-150 ease-out",
          isEnglish ? "left-0.5" : "left-[26px]"
        )}
        aria-hidden="true"
      />
      <span
        className={cx(
          "absolute left-1.5 top-1/2 z-[1] -translate-y-1/2 leading-none",
          isEnglish ? "text-neutral-800" : "text-neutral-200"
        )}
        aria-hidden="true"
      >
        En
      </span>
      <span
        className={cx(
          "absolute right-1.5 top-1/2 z-[1] -translate-y-1/2 leading-none",
          isEnglish ? "text-neutral-200" : "text-neutral-800"
        )}
        aria-hidden="true"
      >
        Jp
      </span>
    </button>
  )
}
