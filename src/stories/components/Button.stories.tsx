import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { ActionButton, FileButton } from "../../components/ui.tsx"
import { getStoryLanguage, PluginPreviewFrame } from "../fixtures/storyLayout.tsx"

const buttonStoryLabels: Record<Language, {
  import: string
  importing: string
  reload: string
  remove: string
  upload: string
}> = {
  en: {
    import: "Import Color Styles",
    importing: "Importing...",
    reload: "Reload",
    remove: "Remove",
    upload: "Upload JSON File",
  },
  ja: {
    import: "カラースタイルをインポート",
    importing: "インポート中...",
    reload: "再読み込み",
    remove: "削除",
    upload: "JSONファイルをアップロード",
  },
}

function ButtonStory({
  disabled,
  label,
  language,
  size,
  variant,
}: {
  disabled: boolean
  label: string
  language: Language
  size: "sm" | "md"
  variant: "solid" | "outline" | "danger"
}) {
  const resolvedLabel = label || buttonStoryLabels[language].import

  return (
    <PluginPreviewFrame>
      <ActionButton disabled={disabled} size={size} variant={variant}>
        {resolvedLabel}
      </ActionButton>
    </PluginPreviewFrame>
  )
}

const meta = {
  title: "Components/Button",
  component: ButtonStory,
  args: {
    disabled: false,
    label: "",
    language: "ja",
    size: "md",
    variant: "solid",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    variant: {
      control: "select",
      options: ["solid", "outline", "danger"],
    },
  },
} satisfies Meta<typeof ButtonStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  render: (_args, context) => {
    const labels = buttonStoryLabels[getStoryLanguage(context.globals)]

    return (
      <PluginPreviewFrame>
        <div className="flex flex-col gap-3">
          <ActionButton size="md">{labels.import}</ActionButton>
          <div className="flex flex-wrap items-center gap-3">
            <FileButton accept="application/json,.json" size="md" onChange={() => {}}>
              {labels.upload}
            </FileButton>
            <ActionButton size="md" variant="outline">
              {labels.reload}
            </ActionButton>
          </div>
          <ActionButton disabled size="md">
            {labels.importing}
          </ActionButton>
          <ActionButton size="sm" variant="danger">
            {labels.remove}
          </ActionButton>
        </div>
      </PluginPreviewFrame>
    )
  },
}

export const PrimaryImport: Story = {
  render: (args, context) => <ButtonStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const OutlineReload: Story = {
  args: {
    variant: "outline",
  },
  render: (args, context) => (
    <ButtonStory
      {...args}
      label={buttonStoryLabels[getStoryLanguage(context.globals)].reload}
      language={getStoryLanguage(context.globals)}
    />
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args, context) => <ButtonStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const FileUpload: Story = {
  render: (_args, context) => (
    <PluginPreviewFrame>
      <FileButton accept="application/json,.json" size="md" onChange={() => {}}>
        {buttonStoryLabels[getStoryLanguage(context.globals)].upload}
      </FileButton>
    </PluginPreviewFrame>
  ),
}
