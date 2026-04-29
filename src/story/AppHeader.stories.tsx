import { action } from "@ladle/react"
import { useState } from "react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { AppHeader } from "../components/AppHeader.tsx"
import "../tokens.css"

export default {
  title: "Components / AppHeader",
} satisfies StoryDefault

function HeaderSurface({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="mx-auto flex max-w-[420px] flex-col gap-4 rounded-[24px] border border-neutral-700 bg-neutral-900 p-4 shadow-2xl">
        {children}
      </div>
    </main>
  )
}

function HeaderStory({ initialLanguage }: { initialLanguage: "en" | "ja" }) {
  const [language, setLanguage] = useState<"en" | "ja">(initialLanguage)

  return (
    <HeaderSurface>
      <AppHeader
        language={language}
        title="Token Color Styles Importer"
        onLanguageChange={nextLanguage => {
          setLanguage(nextLanguage)
          action("language-change")(nextLanguage)
        }}
      />
    </HeaderSurface>
  )
}

export const Default = () => <HeaderStory initialLanguage="en" />

export const JapaneseSelected = () => <HeaderStory initialLanguage="ja" />

JapaneseSelected.storyName = "Japanese selected"
