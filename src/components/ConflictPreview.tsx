import type { Language } from "../app/i18n.ts"
import { messages } from "../app/i18n.ts"
import type { ColorStyleConflict } from "../lib/types/tokens.ts"
import { ActionButton } from "./ui.tsx"

interface ConflictPreviewProps {
  conflicts: ColorStyleConflict[]
  error: string | null
  isChecking: boolean
  language: Language
  onShowAll: () => void
}

export function ConflictPreview({ conflicts, error, isChecking, language, onShowAll }: ConflictPreviewProps) {
  const t = messages[language]

  if (isChecking) {
    return <p className="m-0 text-xs leading-relaxed text-neutral-300">{t.checkingConflicts}</p>
  }

  if (error) {
    return <p className="m-0 text-xs leading-relaxed text-red-100">{t.conflictCheckFailed}</p>
  }

  if (conflicts.length === 0) {
    return <p className="m-0 text-xs leading-relaxed text-neutral-300">{t.noConflicts}</p>
  }

  return (
    <section
      className="flex flex-col gap-[5px] rounded border border-yellow-700 bg-yellow-950/50 p-[9px] text-xs leading-relaxed text-yellow-100"
      aria-label={t.conflictPreview}
    >
      <h3 className="m-0 text-xs leading-tight text-yellow-100">{t.conflictPreview}</h3>
      <p className="m-0">{t.conflictCount.replace("{count}", String(conflicts.length))}</p>
      <ul className="m-0 flex min-w-0 flex-col gap-0.5 pl-4">
        {conflicts.slice(0, 5).map(conflict => (
          <li className="min-w-0 overflow-hidden truncate text-yellow-100" key={conflict.styleName}>
            {conflict.styleName}
          </li>
        ))}
      </ul>
      {conflicts.length > 5 ? (
        <>
          <p className="m-0">{t.moreConflicts.replace("{count}", String(conflicts.length - 5))}</p>
          <ActionButton className="self-start" variant="outline" onClick={onShowAll}>
            {t.showAllConflicts}
          </ActionButton>
        </>
      ) : null}
    </section>
  )
}
