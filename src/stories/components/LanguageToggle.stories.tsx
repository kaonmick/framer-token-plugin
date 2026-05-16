import { useEffect, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { LanguageToggle } from "../../components/LanguageToggle.tsx"
import { getStoryLanguage, PluginPreviewFrame } from "../fixtures/storyLayout.tsx"

function LanguageToggleStory({ language: storyLanguage }: { language: Language }) {
  const [language, setLanguage] = useState(storyLanguage)

  useEffect(() => {
    setLanguage(storyLanguage)
  }, [storyLanguage])

  return (
    <PluginPreviewFrame>
      <div className="flex items-center justify-between gap-5">
        <h1 className="m-0 min-w-0 text-ui-title font-normal text-text-primary" lang="en">
          Token Color Importer
        </h1>
        <LanguageToggle language={language} onLanguageChange={setLanguage} />
      </div>
    </PluginPreviewFrame>
  )
}

const meta = {
  title: "Components/LanguageToggle",
  component: LanguageToggleStory,
  args: {
    language: "ja",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
  },
} satisfies Meta<typeof LanguageToggleStory>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <LanguageToggleStory language="ja" />
      <LanguageToggleStory language="en" />
    </div>
  ),
}

export const CurrentLanguage: Story = {
  render: (args, context) => <LanguageToggleStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const Japanese: Story = {
  args: { language: "ja" },
}

export const English: Story = {
  args: { language: "en" },
}
