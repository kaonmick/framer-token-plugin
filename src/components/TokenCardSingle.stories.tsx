import { action } from "@ladle/react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { TokenCard } from "./TokenCard.tsx"
import {
  catalogTokenCardModeRows,
  catalogTokenCardRows,
} from "./catalog.fixtures.ts"
import "../tokens.css"

export default {
  title: "Components / TokenCard",
} satisfies StoryDefault

function CardSurface({
  children,
  forceFocusRing = false,
}: {
  children: ReactNode
  forceFocusRing?: boolean
}) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div
        className={`max-w-[420px] ${forceFocusRing ? "[&_label>div]:outline-2 [&_label>div]:outline-offset-2 [&_label>div]:outline-yellow-300" : ""}`}
      >
        {children}
      </div>
    </main>
  )
}

export const Default = () => (
  <CardSurface>
    <TokenCard badge={{ lightColor: "#2f6bff" }} rows={catalogTokenCardRows} />
  </CardSurface>
)

export const Selected = () => (
  <CardSurface>
    <TokenCard
      badge={{ lightColor: "#ffffff", darkColor: "#111313" }}
      rows={catalogTokenCardModeRows}
      radioName="semantic/background/primary"
      radioValue="semantic-background-primary"
      checked
      onChange={action("select-token")}
    />
  </CardSurface>
)

export const Conflict = () => (
  <CardSurface>
    <TokenCard
      badge={{ lightColor: "#1d4ed8" }}
      rows={[{ value: "#1d4ed8", name: "primitive/blue/500" }]}
      label="既存のスタイル"
      radioName="primitive/blue/500"
      radioValue="existing"
      onChange={action("select-existing-style")}
    />
  </CardSurface>
)

export const FocusVisible = () => (
  <CardSurface forceFocusRing>
    <TokenCard
      badge={{ lightColor: "#ffffff", darkColor: "#111313" }}
      rows={catalogTokenCardModeRows}
      radioName="semantic/background/primary"
      radioValue="semantic-background-primary"
      onChange={action("focus-token")}
    />
  </CardSurface>
)
