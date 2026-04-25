import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve, sep } from "node:path"

const host = process.env.DOCS_HOST ?? "127.0.0.1"
const port = Number(process.env.DOCS_PORT ?? 4173)
const root = resolve("docs")

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".drawio": "application/xml; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mmd": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
}

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname)
  const relativePath = normalize(pathname.replace(/^\/+/, ""))
  const filePath = resolve(root, relativePath)

  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    return null
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    return join(filePath, "index.html")
  }

  return filePath
}

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url ?? "/")

  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    response.end("Not found")
    return
  }

  const contentType = mimeTypes[extname(filePath)] ?? "application/octet-stream"
  response.writeHead(200, {
    "cache-control": "no-cache",
    "content-type": contentType,
  })
  createReadStream(filePath).pipe(response)
})

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Docsify docs server port is already in use: http://${host}:${port}/`)
    console.error("Set DOCS_PORT to another port, for example: DOCS_PORT=4174 npm run docs:dev")
    process.exit(1)
  }

  if (error.code === "EPERM") {
    console.error(`Docsify docs server cannot listen on http://${host}:${port}/ in this environment.`)
    process.exit(1)
  }

  throw error
})

server.listen(port, host, () => {
  console.log(`Docsify docs server: http://${host}:${port}/`)
  console.log("Serving ./docs without Vite or Framer plugin middleware.")
})
