import { defineConfig } from "vite"
import framer from "vite-plugin-framer"
import mkcert from "vite-plugin-mkcert"
import react from "@vitejs/plugin-react"

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), command === "serve" && mode === "https" ? mkcert() : undefined, framer()],
}))
