import { action } from "@ladle/react"
import { useState } from "react"
import type { StoryDefault } from "@ladle/react"
import type { ReactNode } from "react"
import { LanguageToggle } from "../components/LanguageToggle.tsx"
import "../tokens.css"

export default {
  title: "Components / LanguageToggle",
} satisfies StoryDefault

function ToggleSurface({
  children,
  forceFocusRing = false,
}: {
  children: ReactNode
  forceFocusRing?: boolean
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-950 p-6 text-neutral-100">
      <div
        className={
          forceFocusRing
            ? "[&_button]:outline-2 [&_button]:outline-offset-2 [&_button]:outline-yellow-300"
            : undefined
        }
      >
        {children}
      </div>
    </main>
  )
}

function ToggleStory({
  initialLanguage,
  forceFocusRing = false,
}: {
  initialLanguage: "en" | "ja"
  forceFocusRing?: boolean
}) {
  const [language, setLanguage] = useState<"en" | "ja">(initialLanguage)

  return (
    <ToggleSurface forceFocusRing={forceFocusRing}>
      <LanguageToggle
        language={language}
        onLanguageChange={nextLanguage => {
          setLanguage(nextLanguage)
          action("language-change")(nextLanguage)
        }}
      />
    </ToggleSurface>
  )
}

export const Default = () => <ToggleStory initialLanguage="en" />

export const JapaneseSelected = () => <ToggleStory initialLanguage="ja" />

JapaneseSelected.storyName = "Japanese selected"

export const FocusVisible = () => <ToggleStory initialLanguage="en" forceFocusRing />
