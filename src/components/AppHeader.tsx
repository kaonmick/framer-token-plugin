import type { Language } from "../app/i18n.ts"
import { LanguageToggle } from "./LanguageToggle.tsx"

interface AppHeaderProps {
  language: Language
  title: string
  onLanguageChange: (language: Language) => void
}

export function AppHeader({ language, title, onLanguageChange }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-5">
      <h1 className="m-0 min-w-0 text-ui-title font-semibold text-neutral-100" lang="en">
        {title}
      </h1>
      <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
    </header>
  )
}
