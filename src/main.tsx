import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./app/App.tsx"
import { installBundledFonts } from "./app/fonts.ts"
import "./tokens.css"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

installBundledFonts()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
