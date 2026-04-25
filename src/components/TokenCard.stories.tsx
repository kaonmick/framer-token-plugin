import { useState } from "react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { TokenCardList } from "./TokenCardList.tsx"
import {
  catalogConflictGroups,
  catalogExistingConflicts,
  catalogTokens,
} from "./catalog.fixtures.ts"
import "../tokens.css"

export default {
  title: "Components / TokenCardList",
} satisfies StoryDefault

const labels = {
  conflict: "Conflict",
  newTokens: "New Token",
  whichTokenToUse: "どのトークンを使用しますか？",
  existingStyle: "既存のスタイル",
  emptyState: "インポート可能なカラートークンがありません。",
  checkingConflicts: "既存のカラースタイルを確認中...",
  conflictCheckFailed: "既存のカラースタイルを確認できませんでした。",
  light: "Light",
  dark: "Dark",
}

function ListSurface({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="max-w-[420px]">{children}</div>
    </main>
  )
}

export const IdealState = () => (
  <ListSurface>
    <TokenCardList
      tokens={catalogTokens}
      conflictGroups={[]}
      existingConflicts={[]}
      isCheckingConflicts={false}
      conflictError={null}
      conflictSelections={new Map()}
      onSelectionChange={() => undefined}
      labels={labels}
    />
  </ListSurface>
)

export const EmptyState = () => (
  <ListSurface>
    <TokenCardList
      tokens={[]}
      conflictGroups={[]}
      existingConflicts={[]}
      isCheckingConflicts={false}
      conflictError={null}
      conflictSelections={new Map()}
      onSelectionChange={() => undefined}
      labels={labels}
    />
  </ListSurface>
)

export const LoadingState = () => (
  <ListSurface>
    <TokenCardList
      tokens={[]}
      conflictGroups={[]}
      existingConflicts={[]}
      isCheckingConflicts
      conflictError={null}
      conflictSelections={new Map()}
      onSelectionChange={() => undefined}
      labels={labels}
    />
  </ListSurface>
)

export const PartialState = () => {
  const [selections, setSelections] = useState(
    () =>
      new Map([
        ["semantic/accent/default", "semantic-accent-default-a"],
        ["primitive/blue/500", "existing"],
      ])
  )

  return (
    <ListSurface>
      <TokenCardList
        tokens={catalogTokens}
        conflictGroups={catalogConflictGroups}
        existingConflicts={catalogExistingConflicts}
        isCheckingConflicts={false}
        conflictError={null}
        conflictSelections={selections}
        onSelectionChange={(styleName, selectedId) => {
          setSelections(current => new Map(current).set(styleName, selectedId))
        }}
        labels={labels}
      />
    </ListSurface>
  )
}

export const ErrorState = () => (
  <ListSurface>
    <TokenCardList
      tokens={[]}
      conflictGroups={[]}
      existingConflicts={[]}
      isCheckingConflicts={false}
      conflictError="Framer API timeout"
      conflictSelections={new Map()}
      onSelectionChange={() => undefined}
      labels={labels}
    />
  </ListSurface>
)
