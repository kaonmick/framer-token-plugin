import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { MessageBox } from "../../components/ui.tsx"
import { getStoryLanguage, PluginPreviewFrame, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

const messageBoxLabels: Record<Language, {
  danger: string
  longText: string
  warning: string
}> = {
  en: {
    danger: "Import failed: Permission changed while importing.",
    longText:
      "Import failed: Color / Semantic / Accent could not be updated because the existing style changed during import.",
    warning: "Could not check existing Color Styles.",
  },
  ja: {
    danger: "インポートに失敗しました: インポート中に権限が変更されました。",
    longText:
      "インポートに失敗しました: Color / Semantic / Accent は、インポート中に既存スタイルが変更されたため更新できませんでした。",
    warning: "既存のカラースタイルを確認できませんでした。",
  },
}

function MessageBoxStory({
  language,
  message,
  tone,
}: {
  language: Language
  message: string
  tone: "danger" | "warning"
}) {
  const resolvedMessage = message || messageBoxLabels[language][tone]

  return (
    <PluginPreviewFrame>
      <MessageBox tone={tone}>{resolvedMessage}</MessageBox>
    </PluginPreviewFrame>
  )
}

const meta = {
  title: "Components/MessageBox",
  component: MessageBoxStory,
  args: {
    language: "ja",
    message: "",
    tone: "warning",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
    tone: {
      control: "select",
      options: ["warning", "danger"],
    },
  },
} satisfies Meta<typeof MessageBoxStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => {
    const labels = messageBoxLabels[getStoryLanguage(context.globals)]

    return (
      <ThemeSummaryColumns>
        {() => (
          <PluginPreviewFrame>
            <div className="flex flex-col gap-3">
              <MessageBox tone="warning">{labels.warning}</MessageBox>
              <MessageBox tone="danger">{labels.danger}</MessageBox>
            </div>
          </PluginPreviewFrame>
        )}
      </ThemeSummaryColumns>
    )
  },
}

export const Warning: Story = {
  render: (args, context) => <MessageBoxStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Danger: Story = {
  args: {
    tone: "danger",
  },
  render: (args, context) => <MessageBoxStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const LongText: Story = {
  args: {
    tone: "danger",
  },
  render: (args, context) => (
    <MessageBoxStory
      {...args}
      language={getStoryLanguage(context.globals)}
      message={messageBoxLabels[getStoryLanguage(context.globals)].longText}
    />
  ),
}
