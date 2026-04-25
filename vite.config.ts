import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import framer from "vite-plugin-framer"
import mkcert from "vite-plugin-mkcert"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command, mode }) => ({
  plugins: [tailwindcss(), react(), command === "serve" && mode === "https" ? mkcert() : undefined, framer()],
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/.claude/**"],
  },
}))
