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
  forceFocusRing = false,
  wide = false,
}: {
  children: ReactNode
  forceFocusRing?: boolean
  wide?: boolean
}) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div
        className={`${wide ? "max-w-5xl" : "max-w-[420px]"} ${forceFocusRing ? "[&_label>div]:outline-2 [&_label>div]:outline-offset-2 [&_label>div]:outline-yellow-300" : ""}`}
      >
        {children}
      </div>
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
        <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
        <p className="text-xs leading-5 text-neutral-400">{description}</p>
      </div>
      {children}
    </section>
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

export const Overview = () => (
  <CardSurface forceFocusRing wide>
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
          TokenCard states
        </p>
        <h1 className="text-2xl font-semibold text-neutral-50">TokenCard overview</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-400">
          Default、Selected、Conflict、FocusVisible を 1 ページで並べて確認するための
          story。badge、mode 表示、既存 style conflict、keyboard focus ring の差分をまとめて見る。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <OverviewSection
          title="Default"
          description="light color badge と通常行の組み合わせ。"
        >
          <TokenCard badge={{ lightColor: "#2f6bff" }} rows={catalogTokenCardRows} />
        </OverviewSection>

        <OverviewSection
          title="Selected"
          description="light / dark mode rows と選択済み radio の見え方。"
        >
          <TokenCard
            badge={{ lightColor: "#ffffff", darkColor: "#111313" }}
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
            badge={{ lightColor: "#1d4ed8" }}
            rows={[{ value: "#1d4ed8", name: "primitive/blue/500" }]}
            label="既存のスタイル"
            radioName="overview-primitive-blue-500"
            radioValue="existing"
            onChange={action("overview-select-existing-style")}
          />
        </OverviewSection>

        <OverviewSection
          title="FocusVisible"
          description="keyboard 操作時の focus ring を強制表示した状態。"
        >
          <TokenCard
            badge={{ lightColor: "#ffffff", darkColor: "#111313" }}
            rows={catalogTokenCardModeRows}
            radioName="overview-focus-token"
            radioValue="semantic-background-primary"
            onChange={action("overview-focus-token")}
          />
        </OverviewSection>
      </div>
    </div>
  </CardSurface>
)
