import { beforeEach, describe, expect, it, vi } from "vitest"
import type { PluginThemeMode } from "../src/app/theme.ts"
import {
  applyDocumentTheme,
  getDocumentThemeMode,
  resolvePluginThemeMode,
  syncDocumentThemeFromFramer,
} from "../src/app/theme.ts"

class MutationObserverMock {
  static instances: MutationObserverMock[] = []

  callback: MutationCallback
  disconnect = vi.fn()
  observe = vi.fn()

  constructor(callback: MutationCallback) {
    this.callback = callback
    MutationObserverMock.instances.push(this)
  }
}

vi.stubGlobal("MutationObserver", MutationObserverMock)

describe("theme sync", () => {
  beforeEach(() => {
    MutationObserverMock.instances = []
  })

  it("falls back to dark when no Framer theme attribute is present", () => {
    const doc = createDocumentStub()

    expect(resolvePluginThemeMode(undefined)).toBe("dark")
    expect(resolvePluginThemeMode(null)).toBe("dark")
    expect(getDocumentThemeMode(doc as Document)).toBe("dark")
  })

  it("maps Framer body theme onto html data-theme and watches for updates", () => {
    const doc = createDocumentStub()
    const cleanup = syncDocumentThemeFromFramer(doc as Document)

    expect(doc.documentElement.dataset.theme).toBe("dark")
    expect(MutationObserverMock.instances).toHaveLength(1)
    expect(MutationObserverMock.instances[0]?.observe).toHaveBeenCalledWith(doc.body, {
      attributeFilter: ["data-framer-theme"],
      attributes: true,
    })

    doc.body.setAttribute("data-framer-theme", "light")
    MutationObserverMock.instances[0]?.callback([] as MutationRecord[], {} as MutationObserver)

    expect(doc.documentElement.dataset.theme).toBe("light")

    cleanup()
    expect(MutationObserverMock.instances[0]?.disconnect).toHaveBeenCalled()
  })

  it("defaults unknown values back to dark", () => {
    const doc = createDocumentStub()

    applyDocumentTheme(doc as Document, "light")
    doc.body.setAttribute("data-framer-theme", "sepia")

    expect(getDocumentThemeMode(doc as Document)).toBe("dark")
  })
})

function createDocumentStub(initialTheme?: PluginThemeMode) {
  const bodyAttributes = new Map<string, string>()
  if (initialTheme) {
    bodyAttributes.set("data-framer-theme", initialTheme)
  }

  return {
    body: {
      getAttribute(name: string) {
        return bodyAttributes.get(name) ?? null
      },
      setAttribute(name: string, value: string) {
        bodyAttributes.set(name, value)
      },
    },
    documentElement: {
      dataset: {} as Record<string, string | undefined>,
    },
  }
}
