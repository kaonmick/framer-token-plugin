import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { messages } from "../../app/i18n.ts"
import { TokenCardList } from "../../components/TokenCardList.tsx"
import {
  tokenCardListConflictCandidate,
  tokenCardListDuplicateGroups,
  tokenCardListExistingConflicts,
  tokenCardListLabels,
  tokenCardListNewTokens,
} from "../fixtures/tokenCardFixtures.ts"
import { getStoryLanguage, PluginPreviewFrame } from "../fixtures/storyLayout.tsx"

function TokenCardListStory({
  language,
  state,
}: {
  language: Language
  state: "ideal" | "empty" | "loading" | "partial" | "error"
}) {
  const [selections, setSelections] = useState(new Map<string, string>())
  const labels = getTokenCardListLabels(language)

  if (state === "empty") {
    return (
      <PluginPreviewFrame>
        <TokenCardList
          tokens={[]}
          conflictGroups={[]}
          existingConflicts={[]}
          isCheckingConflicts={false}
          conflictError={null}
          conflictSelections={selections}
          onSelectionChange={setSelection}
          labels={labels}
        />
      </PluginPreviewFrame>
    )
  }

  return (
    <PluginPreviewFrame>
      <TokenCardList
        tokens={state === "partial" ? [tokenCardListConflictCandidate, ...tokenCardListNewTokens] : tokenCardListNewTokens}
        conflictGroups={state === "partial" ? tokenCardListDuplicateGroups : []}
        existingConflicts={state === "partial" ? tokenCardListExistingConflicts : []}
        isCheckingConflicts={state === "loading"}
        conflictError={state === "error" ? "Framer styles could not be read in this preview." : null}
        conflictSelections={selections}
        onSelectionChange={setSelection}
        labels={labels}
      />
    </PluginPreviewFrame>
  )

  function setSelection(styleName: string, selectedId: string) {
    setSelections(prev => {
      const next = new Map(prev)
      next.set(styleName, selectedId)
      return next
    })
  }
}

function getTokenCardListLabels(language: Language): typeof tokenCardListLabels {
  const t = messages[language]

  return {
    ...tokenCardListLabels,
    checkingConflicts: t.checkingConflicts,
    conflict: t.conflict,
    conflictCheckFailed: t.conflictCheckFailed,
    dark: t.dark,
    duplicateStyleNameDescription: t.duplicateStyleNameDescription,
    duplicateStyleNameTitle: t.duplicateStyleNameTitle,
    emptyState: t.emptyState,
    existingStyle: t.existingStyle,
    existingStyleConflictDescription: t.existingStyleConflictDescription,
    existingStyleConflictTitle: t.existingStyleConflictTitle,
    light: t.light,
    newTokens: t.newTokens,
    whichTokenToUse: t.whichTokenToUse,
  }
}

const meta = {
  title: "Components/TokenCardList",
  component: TokenCardListStory,
  args: {
    language: "ja",
    state: "ideal",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
    state: {
      control: "select",
      options: ["ideal", "empty", "loading", "partial", "error"],
    },
  },
} satisfies Meta<typeof TokenCardListStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  render: (_args, context) => {
    const language = getStoryLanguage(context.globals)

    return (
      <div className="flex flex-col gap-6">
        {(["ideal", "empty", "loading", "partial", "error"] satisfies Array<"ideal" | "empty" | "loading" | "partial" | "error">).map(
          state => (
            <TokenCardListStory key={state} language={language} state={state} />
          )
        )}
      </div>
    )
  },
}

export const Ideal: Story = {
  render: (args, context) => <TokenCardListStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Empty: Story = {
  args: { state: "empty" },
  render: (args, context) => <TokenCardListStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Loading: Story = {
  args: { state: "loading" },
  render: (args, context) => <TokenCardListStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Partial: Story = {
  args: { state: "partial" },
  render: (args, context) => <TokenCardListStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Error: Story = {
  args: { state: "error" },
  render: (args, context) => <TokenCardListStory {...args} language={getStoryLanguage(context.globals)} />,
}
