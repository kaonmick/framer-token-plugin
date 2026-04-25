import { action } from "@ladle/react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { ActionButton, FileButton, SelectControl } from "./ui.tsx"
import "../tokens.css"

export default {
  title: "Components / Controls",
} satisfies StoryDefault

function CatalogSurface({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="flex max-w-[420px] flex-col gap-5">{children}</div>
    </main>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2" aria-label={title}>
      <h2 className="m-0 text-xs font-semibold leading-tight text-neutral-300">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  )
}

export const ActionButtonStates = () => (
  <CatalogSurface>
    <Group title="solid">
      <ActionButton variant="solid" size="sm" onClick={action("solid-sm")}>
        Import
      </ActionButton>
      <ActionButton variant="solid" size="md" onClick={action("solid-md")}>
        Import Color Styles
      </ActionButton>
      <ActionButton variant="solid" disabled>
        Disabled
      </ActionButton>
    </Group>
    <Group title="outline">
      <ActionButton variant="outline" size="sm" onClick={action("outline-sm")}>
        Cancel
      </ActionButton>
      <ActionButton variant="outline" size="md" onClick={action("outline-md")}>
        Reload
      </ActionButton>
      <ActionButton variant="outline" disabled>
        Disabled
      </ActionButton>
    </Group>
    <Group title="danger">
      <ActionButton variant="danger" size="sm" onClick={action("danger-sm")}>
        Replace
      </ActionButton>
      <ActionButton variant="danger" size="md" onClick={action("danger-md")}>
        Replace all
      </ActionButton>
      <ActionButton variant="danger" disabled>
        Disabled
      </ActionButton>
    </Group>
  </CatalogSurface>
)

ActionButtonStates.storyName = "ActionButton / variants and states"

export const FileButtonStates = () => (
  <CatalogSurface>
    <Group title="FileButton">
      <FileButton accept="application/json,.json" size="sm" onChange={action("file-sm")}>
        Upload JSON File
      </FileButton>
      <FileButton accept="application/json,.json" size="md" onChange={action("file-md")}>
        JSONファイルをアップロード
      </FileButton>
    </Group>
  </CatalogSurface>
)

FileButtonStates.storyName = "FileButton / default and focus-within"

export const SelectControlStates = () => (
  <CatalogSurface>
    <Group title="SelectControl">
      <SelectControl defaultValue="skip" aria-label="Import strategy" onChange={action("strategy")}>
        <option value="skip">Skip existing styles</option>
        <option value="replace">Replace existing styles</option>
      </SelectControl>
      <SelectControl defaultValue="ja" aria-label="Language" onChange={action("language")}>
        <option value="en">English</option>
        <option value="ja">日本語</option>
      </SelectControl>
    </Group>
  </CatalogSurface>
)

SelectControlStates.storyName = "SelectControl / options"
