import { action } from "@ladle/react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { TokenCard } from "../components/TokenCard.tsx"
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
  wide = false,
}: {
  children: ReactNode
  wide?: boolean
}) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className={wide ? "max-w-5xl" : "max-w-[420px]"}>{children}</div>
    </main>
  )
}

function OverviewSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-normal text-neutral-100">{title}</h2>
        <p className="text-xs leading-5 text-neutral-400">{description}</p>
      </div>
      {children}
    </section>
  )
}

export const Default = () => (
  <CardSurface>
    <TokenCard rows={catalogTokenCardRows} />
  </CardSurface>
)

export const Selected = () => (
  <CardSurface>
    <TokenCard
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
      rows={[{ badge: { color: "#1d4ed8" }, value: "#1d4ed8", name: "primitive/blue/500" }]}
      label="既存のスタイル"
      radioName="primitive/blue/500"
      radioValue="existing"
      onChange={action("select-existing-style")}
    />
  </CardSurface>
)

export const Selectable = () => (
  <CardSurface>
    <TokenCard
      rows={catalogTokenCardModeRows}
      radioName="semantic/background/primary"
      radioValue="semantic-background-primary"
      onChange={action("selectable-token")}
    />
  </CardSurface>
)

export const Overview = () => (
  <CardSurface wide>
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
          TokenCard states
        </p>
        <h1 className="text-2xl font-normal text-neutral-50">TokenCard overview</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-400">
          Default、Selectable、Selected、Conflict を 1 ページで並べて確認するための
          story。badge、mode 表示、radio の有無、既存 style conflict の差分をまとめて見る。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <OverviewSection
          title="Default"
          description="light color badge と通常行の組み合わせ。"
        >
          <TokenCard rows={catalogTokenCardRows} />
        </OverviewSection>

        <OverviewSection
          title="Selectable"
          description="light / dark mode rows と未選択 radio の見え方。"
        >
          <TokenCard
            rows={catalogTokenCardModeRows}
            radioName="overview-selectable-background-primary"
            radioValue="semantic-background-primary"
            onChange={action("overview-selectable-token")}
          />
        </OverviewSection>

        <OverviewSection
          title="Selected"
          description="light / dark mode rows と選択済み radio の見え方。"
        >
          <TokenCard
            rows={catalogTokenCardModeRows}
            radioName="overview-semantic-background-primary"
            radioValue="semantic-background-primary"
            checked
            onChange={action("overview-select-token")}
          />
        </OverviewSection>

        <OverviewSection
          title="Conflict"
          description="既存のスタイル候補として表示される isolated card。"
        >
          <TokenCard
            rows={[{ badge: { color: "#1d4ed8" }, value: "#1d4ed8", name: "primitive/blue/500" }]}
            label="既存のスタイル"
            radioName="overview-primitive-blue-500"
            radioValue="existing"
            onChange={action("overview-select-existing-style")}
          />
        </OverviewSection>
      </div>
    </div>
  </CardSurface>
)

Overview.storyName = "0verview"
