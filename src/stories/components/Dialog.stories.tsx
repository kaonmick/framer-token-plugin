import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { Language } from "../../app/i18n.ts"
import { messages } from "../../app/i18n.ts"
import { ActionButton, DialogActions, DialogBackdrop, DialogPanel, HelperText, SectionTitle } from "../../components/ui.tsx"
import { getStoryLanguage, PluginPreviewFrame, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

const dialogBodyText: Record<Language, string> = {
  en: "Imported 3 color styles. You can continue to the next step.",
  ja: "3件のカラースタイルをインポートしました。次の操作に進めます。",
}

function DialogContent({ language }: { language: Language }) {
  const labels = messages[language]

  return (
    <>
      <SectionTitle id="story-dialog-title">{labels.importCompleteTitle}</SectionTitle>
      <HelperText className="mt-2">{dialogBodyText[language]}</HelperText>
      <DialogActions>
        <ActionButton color="neutral" variant="outline">
          {labels.cancel}
        </ActionButton>
        <ActionButton>{labels.ok}</ActionButton>
      </DialogActions>
    </>
  )
}

function DialogPanelStory({ language }: { language: Language }) {
  return (
    <DialogPanel role="dialog" aria-modal="true" aria-labelledby="story-dialog-title">
      <DialogContent language={language} />
    </DialogPanel>
  )
}

function BackdropStory({ language }: { language: Language }) {
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <PluginPreviewFrame>
        <ActionButton onClick={() => setOpen(true)}>{language === "ja" ? "Dialogを開く" : "Open dialog"}</ActionButton>
      </PluginPreviewFrame>
    )
  }

  return (
    <DialogBackdrop onClose={() => setOpen(false)}>
      <DialogPanelStory language={language} />
    </DialogBackdrop>
  )
}

const meta = {
  title: "Components/Dialog",
  component: DialogPanel,
} satisfies Meta<typeof DialogPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => {
    const language = getStoryLanguage(context.globals)

    return (
      <ThemeSummaryColumns>{() => <DialogPanelStory language={language} />}</ThemeSummaryColumns>
    )
  },
}

export const DialogPanelOnly: Story = {
  render: (_args, context) => (
    <PluginPreviewFrame>
      <DialogPanel>
        <SectionTitle>DialogPanel</SectionTitle>
        <HelperText className="mt-2">
          {getStoryLanguage(context.globals) === "ja"
            ? "境界線、背景、余白、影を持つダイアログ本体です。"
            : "Dialog body with border, background, spacing, and shadow."}
        </HelperText>
      </DialogPanel>
    </PluginPreviewFrame>
  ),
}

export const DialogActionsOnly: Story = {
  render: (_args, context) => {
    const labels = messages[getStoryLanguage(context.globals)]

    return (
      <PluginPreviewFrame>
        <DialogActions>
          <ActionButton color="neutral" variant="outline">
            {labels.cancel}
          </ActionButton>
          <ActionButton>{labels.ok}</ActionButton>
        </DialogActions>
      </PluginPreviewFrame>
    )
  },
}

export const DialogBackdropOverlay: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: (_args, context) => <BackdropStory language={getStoryLanguage(context.globals)} />,
}
