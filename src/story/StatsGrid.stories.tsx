import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { StatsGrid } from "../components/StatsGrid.tsx"
import {
  catalogStatsItems,
  catalogStatsItemsLongLabel,
} from "./catalog.fixtures.ts"
import "../tokens.css"

export default {
  title: "Components / StatsGrid",
} satisfies StoryDefault

function StatsSurface({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="max-w-[420px]">{children}</div>
    </main>
  )
}

export const Default = () => (
  <StatsSurface>
    <StatsGrid items={catalogStatsItems} />
  </StatsSurface>
)

export const LongLabelLargeNumber = () => (
  <StatsSurface>
    <StatsGrid items={catalogStatsItemsLongLabel} />
  </StatsSurface>
)

LongLabelLargeNumber.storyName = "Long label / large number"
