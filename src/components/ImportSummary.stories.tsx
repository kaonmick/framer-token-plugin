import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { ImportSummary } from "./ImportSummary.tsx"
import { summaryFailed, summarySuccess } from "./catalog.fixtures.ts"
import "../tokens.css"

export default {
  title: "Components / ImportSummary",
} satisfies StoryDefault

function SummarySurface({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="max-w-[360px] rounded border border-neutral-600 bg-neutral-800 p-4">{children}</div>
    </main>
  )
}

export const Success = () => (
  <SummarySurface>
    <ImportSummary convertedOklchCount={3} language="ja" modePairCount={4} summary={summarySuccess} />
  </SummarySurface>
)

export const Failed = () => (
  <SummarySurface>
    <ImportSummary convertedOklchCount={1} language="ja" modePairCount={2} summary={summaryFailed} />
  </SummarySurface>
)
