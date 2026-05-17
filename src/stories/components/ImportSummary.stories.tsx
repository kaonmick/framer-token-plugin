import type { Meta, StoryObj } from "@storybook/react-vite"
import { ImportSummary } from "../../components/ImportSummary.tsx"
import { DialogPanel } from "../../components/ui.tsx"
import type { Language } from "../../app/i18n.ts"
import { importSummaryFixtures } from "../fixtures/importSummaryFixtures.ts"
import { getStoryLanguage, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

type ImportSummaryState = "success" | "partial" | "failed"

function ImportSummaryStory({
  language,
  state,
}: {
  language: Language
  state: ImportSummaryState
}) {
  const fixture = importSummaryFixtures[state]

  return (
    <DialogPanel role="dialog" aria-modal="true" aria-labelledby="summary-dialog-title">
      <ImportSummary
        convertedColorCount={fixture.convertedColorCount}
        language={language}
        modePairCount={fixture.modePairCount}
        summary={fixture.summary}
      />
    </DialogPanel>
  )
}

const meta = {
  title: "Components/ImportSummary",
  component: ImportSummaryStory,
  args: {
    language: "ja",
    state: "success",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
    state: {
      control: "select",
      options: ["success", "partial", "failed"],
    },
  },
} satisfies Meta<typeof ImportSummaryStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (args, context) => (
    <ThemeSummaryColumns>
      {() => (
        <div className="flex flex-col gap-4">
          {(["success", "partial", "failed"] satisfies ImportSummaryState[]).map(state => (
            <ImportSummaryStory key={state} {...args} language={getStoryLanguage(context.globals)} state={state} />
          ))}
        </div>
      )}
    </ThemeSummaryColumns>
  ),
}

export const Success: Story = {
  render: (args, context) => <ImportSummaryStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Partial: Story = {
  args: { state: "partial" },
  render: (args, context) => <ImportSummaryStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Failed: Story = {
  args: { state: "failed" },
  render: (args, context) => <ImportSummaryStory {...args} language={getStoryLanguage(context.globals)} />,
}
