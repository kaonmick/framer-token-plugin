import { action } from "@ladle/react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import {
  ActionButton,
  DialogActions,
  DialogBackdrop,
  DialogPanel,
  HelperText,
  MessageBox,
  SectionTitle,
} from "../components/ui.tsx"
import "../tokens.css"

export default {
  title: "Components / UI primitives",
} satisfies StoryDefault

function Surface({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">{children}</main>
}

export const TextPrimitives = () => (
  <Surface>
    <div className="flex max-w-[420px] flex-col gap-2">
      <SectionTitle>Import preview</SectionTitle>
      <HelperText>
        変換 notice と conflict choice を同じ画面で見分けやすくするための補助テキストです。
      </HelperText>
    </div>
  </Surface>
)

TextPrimitives.storyName = "SectionTitle / HelperText"

export const MessageBoxes = () => (
  <Surface>
    <div className="flex max-w-[420px] flex-col gap-3">
      <MessageBox tone="warning">
        既存のスタイル名と衝突しています。使用するトークンを選択してください。
      </MessageBox>
      <MessageBox tone="danger">
        Framer API timeout
        {"\n"}
        既存のカラースタイルを確認できませんでした。
      </MessageBox>
    </div>
  </Surface>
)

MessageBoxes.storyName = "MessageBox / warning and danger"

export const DialogShell = () => (
  <Surface>
    <div className="min-h-[360px]">
      <DialogBackdrop onClose={action("close-dialog")}>
        <DialogPanel role="dialog" aria-modal="true" aria-labelledby="catalog-dialog-title">
          <SectionTitle id="catalog-dialog-title">Import summary</SectionTitle>
          <HelperText className="mt-2">
            作成、置換、スキップされたスタイル数をまとめて確認するダイアログの土台です。
          </HelperText>
          <DialogActions className="grid-cols-1 sm:grid-cols-2">
            <ActionButton variant="outline" onClick={action("close-outline")}>
              Close
            </ActionButton>
            <ActionButton onClick={action("confirm")}>Open Framer project</ActionButton>
          </DialogActions>
        </DialogPanel>
      </DialogBackdrop>
    </div>
  </Surface>
)

DialogShell.storyName = "DialogBackdrop / DialogPanel / DialogActions"
