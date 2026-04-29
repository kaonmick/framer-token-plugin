import type { ColorStyleConflict, ConflictGroup, ParsedColorToken } from "../lib/types/tokens.ts"
import { TokenCard, type TokenCardRow } from "./TokenCard.tsx"

interface TokenCardListLabels {
  conflict: string
  newTokens: string
  whichTokenToUse: string
  existingStyle: string
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

  if (!hasConflicts && !hasNewTokens && !isCheckingConflicts) {
    return (
      <p className="m-0 rounded border border-dashed border-neutral-500 p-3.5 text-center text-xs text-neutral-300">
        {labels.emptyState}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {(hasConflicts || isCheckingConflicts) && (
        <section className="flex flex-col gap-2" aria-label={labels.conflict}>
          <h3 className="m-0 text-sm font-semibold leading-tight text-neutral-100">{labels.conflict}</h3>
          <div className="flex flex-col gap-0 border-l-2 border-orange-600 pl-3">
            {conflictGroups.map((group, groupIndex) => (
              <DuplicateConflictGroup
                key={group.styleName}
                group={group}
                existingConflict={existingConflicts.find(c => c.styleName === group.styleName)}
                selectedId={conflictSelections.get(group.styleName) ?? group.candidates[0]?.id ?? ""}
                onSelect={id => onSelectionChange(group.styleName, id)}
                labels={labels}
                showDivider={groupIndex > 0}
              />
            ))}

            {existingConflictTokens.map((token, index) => {
              const conflict = existingConflicts.find(c => c.styleName === token.styleName)
              if (!conflict) return null
              return (
                <ExistingConflictGroup
                  key={token.styleName}
                  token={token}
                  conflict={conflict}
                  selectedId={conflictSelections.get(token.styleName) ?? "existing"}
                  onSelect={id => onSelectionChange(token.styleName, id)}
                  labels={labels}
                  showDivider={index > 0 || conflictGroups.length > 0}
                />
              )
            })}

            {isCheckingConflicts && !conflictError && !hasConflicts && (
              <p className="m-0 py-2 text-xs text-neutral-300">{labels.checkingConflicts}</p>
            )}

            {conflictError && (
              <p className="m-0 py-2 text-xs text-red-300">{labels.conflictCheckFailed}</p>
            )}
          </div>
        </section>
      )}

      {hasNewTokens && (
        <section className="flex flex-col gap-2" aria-label={labels.newTokens}>
          <h3 className="m-0 text-sm font-semibold leading-tight text-neutral-100">{labels.newTokens}</h3>
          <div className="flex flex-col border-l-2 border-green-600 pl-3">
            {newTokens.map((token, index) => (
              <div key={token.id}>
                {index > 0 && <hr className="border-neutral-600" />}
                <div className="py-1.5">
                  <TokenCard rows={tokenToRows(token, labels)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function DuplicateConflictGroup({
  group,
  existingConflict,
  selectedId,
  onSelect,
  labels,
  showDivider,
}: {
  group: ConflictGroup
  existingConflict?: ColorStyleConflict
  selectedId: string
  onSelect: (id: string) => void
  labels: TokenCardListLabels
  showDivider: boolean
}) {
  return (
    <div>
      {showDivider && <hr className="border-neutral-600" />}
      <div className="flex flex-col gap-2 py-3">
        <p className="m-0 text-center text-[11px] text-neutral-300">{labels.whichTokenToUse}</p>
        {existingConflict ? (
          <>
            <TokenCard
              rows={conflictToRows(existingConflict, labels)}
              label={labels.existingStyle}
              radioName={group.styleName}
              radioValue="existing"
              checked={selectedId === "existing"}
              onChange={() => onSelect("existing")}
            />
            <hr className="border-dashed border-neutral-600" />
          </>
        ) : null}
        {group.candidates.map((candidate, index) => (
          <div key={candidate.id}>
            {index > 0 && <hr className="border-dashed border-neutral-600" />}
            <div className={index > 0 ? "pt-2" : ""}>
              <TokenCard
                rows={tokenToRows(candidate, labels)}
                radioName={group.styleName}
                radioValue={candidate.id}
                checked={candidate.id === selectedId}
                onChange={() => onSelect(candidate.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExistingConflictGroup({
  token,
  conflict,
  selectedId,
  onSelect,
  labels,
  showDivider,
}: {
  token: ParsedColorToken
  conflict: ColorStyleConflict
  selectedId: string
  onSelect: (id: string) => void
  labels: TokenCardListLabels
  showDivider: boolean
}) {
  return (
    <div>
      {showDivider && <hr className="border-neutral-600" />}
      <div className="flex flex-col gap-2 py-3">
        <p className="m-0 text-center text-[11px] text-neutral-300">{labels.whichTokenToUse}</p>

        <TokenCard
          rows={conflictToRows(conflict, labels)}
          label={labels.existingStyle}
          radioName={token.styleName}
          radioValue="existing"
          checked={selectedId === "existing"}
          onChange={() => onSelect("existing")}
        />

        <hr className="border-dashed border-neutral-600" />

        <TokenCard
          rows={tokenToRows(token, labels)}
          radioName={token.styleName}
          radioValue={token.id}
          checked={selectedId === token.id}
          onChange={() => onSelect(token.id)}
        />
      </div>
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
        name: token.sourcePath,
      },
      {
        badge: { color: token.darkValue },
        mode: "dark",
        modeLabel: labels.dark,
        value: token.darkValue,
        name: token.darkSourcePath ?? token.sourcePath,
      },
    ]
  }
  return [{ badge: { color: token.value }, value: token.value, name: token.sourcePath }]
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
        name: conflict.existingPath,
      },
      {
        badge: { color: conflict.existingDarkValue },
        mode: "dark",
        modeLabel: labels.dark,
        value: conflict.existingDarkValue,
        name: conflict.existingPath,
      },
    ]
  }
  return [{ badge: { color: conflict.existingValue }, value: conflict.existingValue, name: conflict.existingPath }]
}
