import { action } from "@ladle/react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode, RefObject } from "react"
import type { EditorDiagnostic } from "../components/JsonTokenEditor.tsx"
import { JsonTokenEditor } from "../components/JsonTokenEditor.tsx"
import {
  catalogEditorDiagnostics,
  catalogEditorJson,
} from "./catalog.fixtures.ts"
import "../tokens.css"

export default {
  title: "Components / JsonTokenEditor",
} satisfies StoryDefault

const editorLabels = {
  copy: "JSONをコピー",
  copied: "コピーしました",
  copyFailed: "コピーできませんでした",
  resize: "エディタの高さを変更",
}

function EditorSurface({
  children,
  surfaceRef,
}: {
  children: ReactNode
  surfaceRef?: RefObject<HTMLElement>
}) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100" ref={surfaceRef}>
      <div className="flex max-w-[640px] flex-col gap-3">
        <h2 className="m-0 text-xs font-normal leading-tight text-neutral-300">JsonTokenEditor</h2>
        {children}
      </div>
    </main>
  )
}

function EditorStory({
  diagnostics = [],
  initialValue = catalogEditorJson,
  mode = "default",
}: {
  diagnostics?: EditorDiagnostic[]
  initialValue?: string
  mode?: "copied" | "default" | "focused" | "tooltip"
}) {
  const [value, setValue] = useState(initialValue)
  const surfaceRef = useRef<HTMLElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)
  const lineNumbers = useMemo(
    () => Array.from({ length: value.split("\n").length }, (_, index) => index + 1),
    [value]
  )

  useEffect(() => {
    if (mode !== "focused") return

    const textarea = surfaceRef.current?.querySelector<HTMLTextAreaElement>('textarea[aria-label="JSON token source"]')
    textarea?.focus()
  }, [mode])

  useEffect(() => {
    if (mode !== "tooltip") return

    const button = surfaceRef.current?.querySelector<HTMLButtonElement>('button[aria-label="JSONをコピー"]')
    if (!button) return

    button.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))

    return () => {
      button.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }))
    }
  }, [mode])

  useEffect(() => {
    if (mode !== "copied") return

    const button = surfaceRef.current?.querySelector<HTMLButtonElement>('button[aria-label="JSONをコピー"]')
    if (!button) return

    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard")
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => undefined,
      },
    })

    button.click()

    return () => {
      if (originalClipboard) {
        Object.defineProperty(navigator, "clipboard", originalClipboard)
        return
      }

      Reflect.deleteProperty(navigator, "clipboard")
    }
  }, [mode])

  return (
    <EditorSurface surfaceRef={surfaceRef}>
      <JsonTokenEditor
        diagnostics={diagnostics}
        labels={editorLabels}
        lineNumbers={lineNumbers}
        lineNumbersRef={lineNumbersRef}
        value={value}
        onScroll={scrollTop => {
          if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = scrollTop
          }
          action("editor-scroll")(scrollTop)
        }}
        onTextChange={nextValue => {
          setValue(nextValue)
          action("editor-change")(nextValue)
        }}
      />
    </EditorSurface>
  )
}

export const Default = () => <EditorStory />

export const FocusedState = () => <EditorStory mode="focused" />

FocusedState.storyName = "Focused state"

export const CopiedState = () => <EditorStory mode="copied" />

CopiedState.storyName = "Copied state"

export const TooltipState = () => <EditorStory mode="tooltip" />

TooltipState.storyName = "Tooltip state"

export const DiagnosticState = () => (
  <EditorStory diagnostics={catalogEditorDiagnostics} />
)

DiagnosticState.storyName = "Diagnostic state"
