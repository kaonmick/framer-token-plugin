import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, searchForWorkspaceRoot } from "vite"
import tailwindcss from "@tailwindcss/vite"

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ladleAppRoot = resolve(
  projectRoot,
  "node_modules/@ladle/react/typings-for-build/app",
)

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(projectRoot), ladleAppRoot],
    },
  },
})
