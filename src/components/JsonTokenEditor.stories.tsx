import { action } from "@ladle/react"
import { useMemo, useRef, useState } from "react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import type { EditorDiagnostic } from "./JsonTokenEditor.tsx"
import { JsonTokenEditor } from "./JsonTokenEditor.tsx"
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

function EditorSurface({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="flex max-w-[640px] flex-col gap-3">
        <h2 className="m-0 text-xs font-semibold leading-tight text-neutral-300">JsonTokenEditor</h2>
        {children}
      </div>
    </main>
  )
}

function EditorStory({
  diagnostics = [],
  initialValue = catalogEditorJson,
}: {
  diagnostics?: EditorDiagnostic[]
  initialValue?: string
}) {
  const [value, setValue] = useState(initialValue)
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)
  const lineNumbers = useMemo(
    () => Array.from({ length: value.split("\n").length }, (_, index) => index + 1),
    [value]
  )

  return (
    <EditorSurface>
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

export const DiagnosticState = () => (
  <EditorStory diagnostics={catalogEditorDiagnostics} />
)

DiagnosticState.storyName = "Diagnostic state"
