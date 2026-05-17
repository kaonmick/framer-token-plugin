import { useRef, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { messages } from "../../app/i18n.ts"
import { JsonTokenEditor } from "../../components/JsonTokenEditor.tsx"
import {
  jsonTokenEditorDiagnostics,
  jsonTokenEditorFixtures,
  jsonTokenEditorLabels,
} from "../fixtures/jsonTokenEditorFixtures.ts"
import { getStoryLanguage, PluginPreviewFrame, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

type EditorState = "ideal" | "empty" | "loading" | "partial" | "error"

const stateLabels: Record<EditorState, string> = {
  ideal: "Ideal State",
  empty: "Blank / Empty State",
  loading: "Loading State",
  partial: "Partial State",
  error: "Error State",
}

const storyOnlyNotes: Partial<Record<EditorState, string>> = {
  loading: "Story-only: JsonTokenEditor本体にloading propはないため、周辺UIとして表示しています。",
}

function JsonTokenEditorStory({
  language,
  state,
  showStateLabel = false,
}: {
  language: Language
  state: EditorState
  showStateLabel?: boolean
}) {
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)
  const initialValue = state === "empty" ? "" : jsonTokenEditorFixtures[state === "loading" ? "ideal" : state]
  const [value, setValue] = useState(initialValue)
  const diagnostics = state === "partial" ? jsonTokenEditorDiagnostics.partial : state === "error" ? jsonTokenEditorDiagnostics.error : []

  return (
    <PluginPreviewFrame>
      <div className="flex flex-col gap-3">
        {showStateLabel || storyOnlyNotes[state] ? (
          <div className="flex flex-wrap items-center gap-2 text-[12px] leading-[1.5]">
            {showStateLabel ? <span className="font-semibold text-text-primary">{stateLabels[state]}</span> : null}
            {storyOnlyNotes[state] ? (
              <span className="rounded-[4px] border border-border-muted bg-surface-panel px-2 py-1 text-text-secondary">
                {storyOnlyNotes[state]}
              </span>
            ) : null}
          </div>
        ) : null}
        {state === "loading" ? (
          <div className="rounded-[4px] border border-border-muted bg-surface-panel px-3 py-2 text-[12px] leading-[1.5] text-text-secondary">
            Analyzing JSON...
          </div>
        ) : null}
        <JsonTokenEditor
          diagnostics={diagnostics}
          labels={language === "ja" ? {
            copied: messages.ja.copiedJson,
            copy: messages.ja.copyJson,
            copyFailed: messages.ja.copyJsonFailed,
          } : jsonTokenEditorLabels}
          lineNumbersRef={lineNumbersRef}
          placeholder={language === "ja" ? messages.ja.editorPlaceholder : jsonTokenEditorFixtures.emptyPlaceholder}
          value={value}
          onScroll={() => {}}
          onTextChange={setValue}
        />
      </div>
    </PluginPreviewFrame>
  )
}

const meta = {
  title: "Components/JsonTokenEditor",
  component: JsonTokenEditorStory,
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
} satisfies Meta<typeof JsonTokenEditorStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => {
    const language = getStoryLanguage(context.globals)

    return (
      <ThemeSummaryColumns>
        {() => (
          <div className="flex flex-col gap-6">
            {(["ideal", "empty", "loading", "partial", "error"] satisfies EditorState[]).map((state) => (
              <JsonTokenEditorStory key={state} language={language} state={state} showStateLabel />
            ))}
          </div>
        )}
      </ThemeSummaryColumns>
    )
  },
}

export const Ideal: Story = {
  render: (args, context) => <JsonTokenEditorStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Empty: Story = {
  args: { state: "empty" },
  render: (args, context) => <JsonTokenEditorStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Loading: Story = {
  args: { state: "loading" },
  render: (args, context) => <JsonTokenEditorStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Partial: Story = {
  args: { state: "partial" },
  render: (args, context) => <JsonTokenEditorStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Error: Story = {
  args: { state: "error" },
  render: (args, context) => <JsonTokenEditorStory {...args} language={getStoryLanguage(context.globals)} />,
}
