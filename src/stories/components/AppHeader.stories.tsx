import { useEffect, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { messages } from "../../app/i18n.ts"
import { AppHeader } from "../../components/AppHeader.tsx"
import { getStoryLanguage, PluginPreviewFrame, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

function AppHeaderStory({ language: storyLanguage }: { language: Language }) {
  const [language, setLanguage] = useState(storyLanguage)

  useEffect(() => {
    setLanguage(storyLanguage)
  }, [storyLanguage])

  return (
    <PluginPreviewFrame>
      <AppHeader language={language} title={messages[language].title} onLanguageChange={setLanguage} />
    </PluginPreviewFrame>
  )
}

const meta = {
  title: "Components/AppHeader",
  component: AppHeaderStory,
  args: {
    language: "ja",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof AppHeaderStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => (
    <ThemeSummaryColumns>{() => <AppHeaderStory language={getStoryLanguage(context.globals)} />}</ThemeSummaryColumns>
  ),
}

export const CurrentLanguage: Story = {
  render: (_args, context) => <AppHeaderStory language={getStoryLanguage(context.globals)} />,
}

export const Japanese: Story = {
  args: { language: "ja" },
}

export const English: Story = {
  args: { language: "en" },
}
