import type { Meta, StoryObj } from "@storybook/react-vite"
import { messages } from "../../app/i18n.ts"
import { JsonFileDropZone } from "../../components/JsonFileDropZone.tsx"
import { getStoryLanguage, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

const meta = {
  title: "Components/JsonFileDropZone",
  component: JsonFileDropZone,
  args: {
    labels: {
      button: "アップロード",
      title: "JSONファイルをドロップ、またはアップロード",
    },
    onFileSelect: async file => {
      console.log(`Selected ${file.name}`)
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof JsonFileDropZone>

export default meta

type Story = StoryObj<typeof meta>

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => {
    const labels = messages[getStoryLanguage(context.globals)]

    return (
      <ThemeSummaryColumns>
        {() => (
          <div className="w-[500px] max-w-full">
            <JsonFileDropZone
              labels={{
                button: labels.uploadJsonButton,
                title: labels.dropJsonTitle,
              }}
              onFileSelect={async file => {
                console.log(`Selected ${file.name}`)
              }}
            />
          </div>
        )}
      </ThemeSummaryColumns>
    )
  },
}

export const Default: Story = {
  render: args => (
    <div className="w-[500px] max-w-full">
      <JsonFileDropZone {...args} />
    </div>
  ),
}
