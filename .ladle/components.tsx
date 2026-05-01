import type { PropsWithChildren } from "react"
import { installBundledFonts } from "../src/app/fonts.ts"
import "../src/tokens.css"

installBundledFonts()

export const Provider = ({ children }: PropsWithChildren) => (
  <div className="font-['Jost','Noto_Sans_JP',ui-sans-serif,system-ui,sans-serif] text-neutral-100">
    {children}
  </div>
)
