import type { ReactNode } from "react"
import type { ColorStyleConflict, ConflictGroup, ParsedColorToken } from "../lib/types/tokens.ts"
import { TokenCard, type TokenCardRow } from "./TokenCard.tsx"

interface TokenCardListLabels {
  conflict: string
  newTokens: string
  whichTokenToUse: string
  existingStyle: string
  existingStyleConflictTitle: string
  existingStyleConflictDescription: string
  duplicateStyleNameTitle: string
  duplicateStyleNameDescription: string
  emptyState: string
  checkingConflicts: string
  conflictCheckFailed: string
  light: string
  dark: string
}

interface TokenCardListProps {
  tokens: ParsedColorToken[]
  conflictGroups: ConflictGroup[]
  existingConflicts: ColorStyleConflict[]
  isCheckingConflicts: boolean
  conflictError: string | null
  conflictSelections: Map<string, string>
  onSelectionChange: (styleName: string, selectedId: string) => void
  labels: TokenCardListLabels
}

export function TokenCardList({
  tokens,
  conflictGroups,
  existingConflicts,
  isCheckingConflicts,
  conflictError,
  conflictSelections,
  onSelectionChange,
  labels,
}: TokenCardListProps) {
  const existingConflictNames = new Set(existingConflicts.map(c => c.styleName))
  const newTokens = tokens.filter(t => !existingConflictNames.has(t.styleName))
  const existingConflictTokens = tokens.filter(t => existingConflictNames.has(t.styleName))

  const hasJsonConflicts = conflictGroups.length > 0
  const hasExistingConflicts = existingConflicts.length > 0
  const hasConflicts = hasJsonConflicts || hasExistingConflicts
  const hasNewTokens = newTokens.length > 0
  const shouldShowConflictSection = hasConflicts || isCheckingConflicts || conflictError !== null

  if (!hasConflicts && !hasNewTokens && !isCheckingConflicts && !conflictError) {
    return (
      <p className="m-0 rounded-[4px] bg-neutral-700 px-4 py-3 text-center text-[13px] leading-[1.5] text-neutral-200">
        {labels.emptyState}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {shouldShowConflictSection && (
        <PreviewSection title={labels.conflict} accentClassName="bg-[#733e0a]" ariaLabel={labels.conflict}>
          {hasConflicts ? (
            <div className="flex flex-col gap-10">
              {hasExistingConflicts && (
                <ConflictBlock
                  title={labels.existingStyleConflictTitle}
                  description={labels.existingStyleConflictDescription}
                >
                  {existingConflictTokens.map(token => {
                    const conflict = existingConflicts.find(c => c.styleName === token.styleName)
                    const selectedId = conflictSelections.get(token.styleName) ?? "existing"
                    if (!conflict) return null
                    return (
                      <ConflictItem
                        key={token.styleName}
                        styleName={token.styleName}
                        question={labels.whichTokenToUse}
                      >
                        <CardStack>
                          <TokenCard
                            className="w-full"
                            rows={conflictToRows(conflict, labels)}
                            label={labels.existingStyle}
                            radioName={token.styleName}
                            radioValue="existing"
                            checked={selectedId === "existing"}
                            onChange={() => onSelectionChange(token.styleName, "existing")}
                          />
                          <TokenCard
                            className="w-full"
                            rows={tokenToRows(token, labels)}
                            radioName={token.styleName}
                            radioValue={token.id}
                            checked={selectedId === token.id}
                            onChange={() => onSelectionChange(token.styleName, token.id)}
                          />
                        </CardStack>
                      </ConflictItem>
                    )
                  })}
                </ConflictBlock>
              )}

              {hasJsonConflicts && (
                <ConflictBlock
                  title={labels.duplicateStyleNameTitle}
                  description={labels.duplicateStyleNameDescription}
                >
                  {conflictGroups.map(group => {
                    const selectedId = conflictSelections.get(group.styleName) ?? group.candidates[0]?.id ?? ""
                    return (
                      <ConflictItem
                        key={group.styleName}
                        styleName={group.styleName}
                        question={labels.whichTokenToUse}
                      >
                        <CardStack>
                          {group.candidates.map(candidate => (
                            <TokenCard
                              key={candidate.id}
                              className="w-full"
                              rows={tokenToRows(candidate, labels)}
                              radioName={group.styleName}
                              radioValue={candidate.id}
                              checked={selectedId === candidate.id}
                              onChange={() => onSelectionChange(group.styleName, candidate.id)}
                            />
                          ))}
                        </CardStack>
                      </ConflictItem>
                    )
                  })}
                </ConflictBlock>
              )}
            </div>
          ) : (
            <StatusMessage
              tone={conflictError ? "error" : "default"}
              title={conflictError ? labels.conflictCheckFailed : labels.checkingConflicts}
              detail={conflictError ?? undefined}
            />
          )}
        </PreviewSection>
      )}

      {hasNewTokens && (
        <PreviewSection title={labels.newTokens} accentClassName="bg-[#0d542b]" ariaLabel={labels.newTokens}>
          <div className="flex flex-col gap-4">
            {newTokens.map(token => (
              <div key={token.id} className="flex flex-col gap-4">
                <TokenCard className="w-full" rows={tokenToRows(token, labels)} />
              </div>
            ))}
          </div>
        </PreviewSection>
      )}
    </div>
  )
}

function PreviewSection({
  title,
  accentClassName,
  ariaLabel,
  children,
}: {
  title: string
  accentClassName: string
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-1" aria-label={ariaLabel}>
      <h3 className="m-0 font-['Jost','Noto_Sans_JP'] text-[16px] leading-none font-normal text-neutral-100">
        {title}
      </h3>
      <div className="flex overflow-hidden rounded-[4px] bg-neutral-700">
        <div className={`w-1 shrink-0 self-stretch ${accentClassName}`} aria-hidden="true" />
        <div className="min-w-0 flex-1 p-4">{children}</div>
      </div>
    </section>
  )
}

function ConflictBlock({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          <p className="m-0 font-['Jost','Noto_Sans_JP'] text-[14px] leading-[1.5] font-normal text-neutral-200">
            {title}
          </p>
          <p className="m-0 text-[11px] leading-[1.5] text-neutral-300">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  )
}

function ConflictItem({
  styleName,
  question,
  children,
}: {
  styleName: string
  question: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[4px] border border-[#737373] p-2">
      <SelectionPrompt styleName={styleName} question={question} />
      {children}
    </div>
  )
}

function SelectionPrompt({ styleName, question }: { styleName: string; question: string }) {
  return (
    <div className="flex flex-col items-center text-center text-neutral-200">
      <p className="m-0 font-['Jost','Noto_Sans_JP'] text-[14px] leading-[1.4]" lang="en">
        {`"${styleName}"`}
      </p>
      <p className="m-0 text-[12px] leading-[1.4]">{question}</p>
    </div>
  )
}

function CardStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>
}

function StatusMessage({
  title,
  detail,
  tone,
}: {
  title: string
  detail?: string
  tone: "default" | "error"
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 text-[13px] leading-[1.5] text-neutral-100">{title}</p>
      {detail ? (
        <p className={`m-0 text-[11px] leading-[1.5] ${tone === "error" ? "text-red-200" : "text-neutral-300"}`}>
          {detail}
        </p>
      ) : null}
    </div>
  )
}

function tokenToRows(token: ParsedColorToken, labels: { light: string; dark: string }): TokenCardRow[] {
  if (token.darkValue) {
    return [
      {
        badge: { color: token.value },
        mode: "light",
        modeLabel: labels.light,
        value: token.value,
        name: token.styleName,
      },
      {
        badge: { color: token.darkValue },
        mode: "dark",
        modeLabel: labels.dark,
        value: token.darkValue,
        name: token.styleName,
      },
    ]
  }
  return [{ badge: { color: token.value }, value: token.value, name: token.styleName }]
}

function conflictToRows(
  conflict: ColorStyleConflict,
  labels: { light: string; dark: string }
): TokenCardRow[] {
  if (conflict.existingDarkValue) {
    return [
      {
        badge: { color: conflict.existingValue },
        mode: "light",
        modeLabel: labels.light,
        value: conflict.existingValue,
        name: conflict.styleName,
      },
      {
        badge: { color: conflict.existingDarkValue },
        mode: "dark",
        modeLabel: labels.dark,
        value: conflict.existingDarkValue,
        name: conflict.styleName,
      },
    ]
  }
  return [{ badge: { color: conflict.existingValue }, value: conflict.existingValue, name: conflict.styleName }]
}
