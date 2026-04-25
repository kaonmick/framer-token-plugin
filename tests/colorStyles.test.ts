import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ConflictGroup, ParsedColorToken } from "../src/lib/types/tokens.ts"

const framerMock = vi.hoisted(() => ({
  createColorStyle: vi.fn(),
  getColorStyles: vi.fn(),
}))

vi.mock("framer-plugin", () => ({
  framer: framerMock,
}))

const { findColorStyleConflicts, importColorStyles } = await import("../src/lib/framer/colorStyles.ts")

describe("color style import", () => {
  beforeEach(() => {
    framerMock.createColorStyle.mockReset()
    framerMock.getColorStyles.mockReset()
  })

  it("creates new styles for non-conflicting tokens", async () => {
    framerMock.getColorStyles.mockResolvedValue([])
    framerMock.createColorStyle.mockImplementation(async style => ({ ...style, name: style.path }))

    const result = await importColorStyles([token("color.blue.500", "blue/500", "#0066ff")], [], new Map())

    expect(result).toMatchObject({ created: 1, replaced: 0, skipped: 0, failed: 0 })
    expect(framerMock.createColorStyle).toHaveBeenCalledWith({
      path: "blue/500",
      light: "#0066ff",
      dark: null,
    })
  })

  it("replaces an existing style only when the imported token is selected", async () => {
    const existingStyle = existingColorStyle("semantic/action", "#111111")
    framerMock.getColorStyles.mockResolvedValue([existingStyle])

    const importedToken = token("color.semantic.action", "semantic/action", "#0066ff")
    const result = await importColorStyles([importedToken], [], new Map([["semantic/action", importedToken.id]]))

    expect(result).toMatchObject({ created: 0, replaced: 1, skipped: 0, failed: 0 })
    expect(existingStyle.setAttributes).toHaveBeenCalledWith({ light: "#0066ff", dark: null })
  })

  it("keeps an existing style when the existing option is selected", async () => {
    const existingStyle = existingColorStyle("semantic/action", "#111111")
    framerMock.getColorStyles.mockResolvedValue([existingStyle])

    const result = await importColorStyles(
      [token("color.semantic.action", "semantic/action", "#0066ff")],
      [],
      new Map([["semantic/action", "existing"]])
    )

    expect(result).toMatchObject({ created: 0, replaced: 0, skipped: 1, failed: 0 })
    expect(existingStyle.setAttributes).not.toHaveBeenCalled()
    expect(framerMock.createColorStyle).not.toHaveBeenCalled()
  })

  it("imports only the selected candidate from a duplicate JSON style group", async () => {
    framerMock.getColorStyles.mockResolvedValue([])
    framerMock.createColorStyle.mockImplementation(async style => ({ ...style, name: style.path }))

    const first = token("color.semantic.action", "semantic/action", "#0066ff")
    const second = token("colors.semantic.action", "semantic/action", "#ff6600")
    const conflictGroup: ConflictGroup = { styleName: "semantic/action", candidates: [first, second] }

    const result = await importColorStyles([], [conflictGroup], new Map([["semantic/action", second.id]]))

    expect(result).toMatchObject({ created: 1, replaced: 0, skipped: 0, failed: 0 })
    expect(framerMock.createColorStyle).toHaveBeenCalledTimes(1)
    expect(framerMock.createColorStyle).toHaveBeenCalledWith({
      path: "semantic/action",
      light: "#ff6600",
      dark: null,
    })
  })

  it("detects existing style conflicts for tokens from duplicate JSON groups", async () => {
    framerMock.getColorStyles.mockResolvedValue([existingColorStyle("semantic/action", "#111111")])

    const conflicts = await findColorStyleConflicts([
      token("color.semantic.action", "semantic/action", "#0066ff"),
      token("colors.semantic.action", "semantic/action", "#ff6600"),
    ])

    expect(conflicts).toEqual([
      {
        styleName: "semantic/action",
        existingPath: "semantic/action",
        existingValue: "#111111",
        existingDarkValue: undefined,
      },
    ])
  })
})

function token(sourcePath: string, styleName: string, value: string): ParsedColorToken {
  return {
    format: "hex",
    id: sourcePath,
    kind: "semantic",
    modes: ["light"],
    path: sourcePath.split("."),
    sourcePath,
    sourceValue: value,
    styleName,
    value,
  }
}

function existingColorStyle(path: string, light: string) {
  return {
    dark: null,
    id: path,
    light,
    name: path.split("/").at(-1) ?? path,
    path,
    setAttributes: vi.fn(),
  }
}
