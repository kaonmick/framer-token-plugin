import type { Language } from "../app/i18n.ts"
import { messages } from "../app/i18n.ts"
import type { ImportColorStylesResult } from "../lib/types/tokens.ts"

interface ImportSummaryProps {
  convertedColorCount: number
  language: Language
  modePairCount: number
  summary: ImportColorStylesResult
}

export function ImportSummary({ convertedColorCount, language, modePairCount, summary }: ImportSummaryProps) {
  const t = messages[language]
  const title = summary.failed > 0 ? t.importFailedTitle : t.importCompleteTitle

  return (
    <div className="text-xs leading-relaxed text-text-default" aria-label="Import summary">
      <h2 className="m-0 text-xs leading-tight text-text-default" id="summary-dialog-title">
        {title}
      </h2>
      <div className="mt-3 rounded border border-border-muted bg-surface-raised p-2.5" aria-label={t.summary}>
        <h3 className="m-0 text-xs leading-tight text-text-default">{t.summary}</h3>
        <p className="m-0 mt-2 text-text-default">
          {t.created} {summary.created}, {t.replaced} {summary.replaced}, {t.skipped} {summary.skipped}, {t.failed}{" "}
          {summary.failed}.
        </p>
        {convertedColorCount > 0 ? (
          <p className="m-0 mt-1.5 text-xs leading-relaxed text-text-subtle">
            {t.conversionNote.replace("{count}", String(convertedColorCount))}
          </p>
        ) : null}
        {modePairCount > 0 ? (
          <p className="m-0 mt-1.5 text-xs leading-relaxed text-text-subtle">
            {t.modePairNote.replace("{count}", String(modePairCount))}
          </p>
        ) : null}
        {summary.failures.length > 0 ? (
          <ul className="m-0 mt-2.5 flex max-h-40 flex-col gap-1 overflow-auto pl-4">
            {summary.failures.map(failure => (
              <li className="[overflow-wrap:anywhere]" key={failure.name}>{`${failure.name}: ${failure.reason}`}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
