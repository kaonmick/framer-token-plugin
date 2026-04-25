import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import net from "node:net"
import path from "node:path"
import { chromium } from "playwright"

const VIEWPORT = { width: 420, height: 620 }
const MIN_CAPTURE_HEIGHT = VIEWPORT.height
const SERVER_HOST = "127.0.0.1"
const PREFERRED_PORT = 5173
const SERVER_TIMEOUT_MS = 30_000
const CAPTURE_DELAY_MS = 300

const screens = [
  ["01-default.png", "/?capture=default"],
  ["02-preview-normal.png", "/?capture=preview-normal"],
  ["03-light-dark.png", "/?capture=light-dark"],
  ["04-oklch.png", "/?capture=oklch"],
  ["05-warning.png", "/?capture=warning"],
  ["06-invalid-json.png", "/?capture=invalid-json"],
  ["07-conflict-preview.png", "/?capture=conflict"],
  ["09-import-summary-success.png", "/?capture=summary-success"],
  ["10-import-summary-failed.png", "/?capture=summary-failed"],
]

const projectRoot = process.cwd()
const outputDir = path.join(projectRoot, "docs", "screenshots")

await fs.mkdir(outputDir, { recursive: true })

const port = await findAvailablePort(PREFERRED_PORT)
const baseUrl = `http://${SERVER_HOST}:${port}`
const server = startViteServer(port)

let browser

try {
  await waitForServer(baseUrl, server)

  browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  })
  page.on("console", message => {
    if (message.type() === "error" || message.type() === "warning") {
      console.error(`[browser:${message.type()}] ${message.text()}`)
    }
  })
  page.on("pageerror", error => {
    console.error(`[browser:error] ${error.stack ?? error.message}`)
  })

  await page.goto(`${baseUrl}/src/main.tsx`, { waitUntil: "load" })

  for (const [filename, route] of screens) {
    const outputPath = path.join(outputDir, filename)

    await page.setViewportSize(VIEWPORT)
    await page.setContent(buildFramerHostPage(`${baseUrl}${route}`), {
      waitUntil: "domcontentloaded",
    })

    const iframe = await page.waitForSelector("iframe", { state: "attached" })
    const frame = await iframe.contentFrame()
    if (!frame) throw new Error(`Could not access iframe for ${filename}`)

    await frame.waitForSelector('main[data-ready="true"]', { timeout: 10_000 })
    const captureHeight = await getFrameCaptureHeight(frame)
    await page.setViewportSize({ width: VIEWPORT.width, height: captureHeight })
    await resizeHostFrame(page, captureHeight)
    await frame.waitForTimeout(CAPTURE_DELAY_MS)
    await page.screenshot({ path: outputPath, fullPage: false })

    console.log(`Captured ${path.relative(projectRoot, outputPath)}`)
  }
} finally {
  if (browser) await browser.close()
  await stopServer(server)
}

function startViteServer(port) {
  const child = spawn(
    "npm",
    ["run", "dev:http", "--", "--host", SERVER_HOST, "--port", String(port), "--strictPort"],
    {
      cwd: projectRoot,
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    }
  )

  child.output = ""
  child.stdout.on("data", chunk => {
    child.output += chunk.toString()
  })
  child.stderr.on("data", chunk => {
    child.output += chunk.toString()
  })

  return child
}

async function waitForServer(url, serverProcess) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < SERVER_TIMEOUT_MS) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Vite dev server exited early.\n${serverProcess.output}`)
    }

    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      await wait(100)
    }
  }

  throw new Error(`Timed out waiting for Vite dev server at ${url}.\n${serverProcess.output}`)
}

async function stopServer(serverProcess) {
  if (serverProcess.exitCode !== null) return

  serverProcess.kill("SIGTERM")

  await Promise.race([
    new Promise(resolve => {
      serverProcess.once("exit", resolve)
    }),
    wait(3_000).then(() => {
      if (serverProcess.exitCode === null) serverProcess.kill("SIGKILL")
    }),
  ])
}

async function findAvailablePort(preferredPort) {
  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    if (await isPortAvailable(port)) return port
  }

  throw new Error(`No available port found starting at ${preferredPort}`)
}

function isPortAvailable(port) {
  return new Promise(resolve => {
    const server = net.createServer()

    server.once("error", () => {
      resolve(false)
    })
    server.once("listening", () => {
      server.close(() => {
        resolve(true)
      })
    })
    server.listen(port, SERVER_HOST)
  })
}

async function getFrameCaptureHeight(frame) {
  const contentHeight = await frame.evaluate(() => {
    const main = document.querySelector("main")

    return Math.ceil(
      Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        main?.scrollHeight ?? 0,
        main?.getBoundingClientRect().height ?? 0
      )
    )
  })

  return Math.max(MIN_CAPTURE_HEIGHT, contentHeight)
}

async function resizeHostFrame(page, height) {
  await page.evaluate(
    nextHeight => {
      document.documentElement.style.height = `${nextHeight}px`
      document.body.style.height = `${nextHeight}px`

      const iframe = document.querySelector("iframe")
      if (iframe) iframe.style.height = `${nextHeight}px`
    },
    height
  )
}

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function buildFramerHostPage(frameUrl) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      html,
      body,
      iframe {
        width: ${VIEWPORT.width}px;
        height: ${VIEWPORT.height}px;
        margin: 0;
        overflow: hidden;
      }

      iframe {
        display: block;
        border: 0;
      }
    </style>
  </head>
  <body>
    <script>
      window.addEventListener("message", event => {
        const data = event.data;
        if (!data || typeof data !== "object") return;

        if (data.type === "pluginReadySignal") {
          event.source.postMessage({
            type: "pluginReadyResponse",
            mode: "canvas",
            permissionMap: {
              createColorStyle: true,
              "ColorStyle.setAttributes": true
            },
            environmentInfo: {},
            theme: {
              mode: "light",
              tokens: {}
            },
            initialState: null
          }, "*");
          return;
        }

        if (data.type === "methodInvocation") {
          event.source.postMessage({
            type: "methodResponse",
            id: data.id,
            result: getFramerMethodResult(data.methodName, data.args)
          }, "*");
        }
      });

      function getFramerMethodResult(methodName, args) {
        switch (methodName) {
          case "getColorStyles":
            return [];
          case "showUI":
            return null;
          case "notify":
            return null;
          case "createColorStyle":
            return createColorStyleResult(args[0]);
          case "setColorStyleAttributes":
            return null;
          default:
            return null;
        }
      }

      function createColorStyleResult(attributes) {
        const path = attributes?.path ?? "Capture / Color";
        const parts = path.split("/");
        return {
          __class: "ColorStyle",
          id: "capture-color-style",
          name: parts[parts.length - 1]?.trim() || path,
          path,
          light: attributes?.light ?? "#000000",
          dark: attributes?.dark ?? null
        };
      }
    </script>
    <iframe src="${escapeHtml(frameUrl)}"></iframe>
  </body>
</html>`
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}
