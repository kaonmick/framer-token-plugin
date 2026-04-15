import { describe, expect, it } from "vitest"
import { parseColorTokenJson } from "../src/lib/parser/colorTokenParser.ts"

describe("parseColorTokenJson", () => {
  it("parses primitive color tokens with source paths", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "blue": {
          "500": {
            "$type": "color",
            "$value": "#0066FF"
          }
        }
      }
    }`)

    expect(result.error).toBeUndefined()
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      sourcePath: "color.blue.500",
      styleName: "blue/500",
      value: "#0066ff",
      kind: "primitive",
    })
  })

  it("inherits group color type", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "$type": "color",
        "surface": {
          "$value": "rgb(246, 246, 246)"
        }
      }
    }`)

    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]?.styleName).toBe("surface")
  })

  it("resolves semantic aliases and keeps the semantic layer", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "primitive": {
          "blue": {
            "500": {
              "$type": "color",
              "$value": "#0066ff"
            }
          }
        },
        "semantic": {
          "button": {
            "$type": "color",
            "$value": "{color.primitive.blue.500}"
          }
        }
      }
    }`)

    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[1]).toMatchObject({
      sourcePath: "color.semantic.button",
      styleName: "semantic/button",
      value: "#0066ff",
      aliasPath: "color.primitive.blue.500",
      kind: "semantic",
    })
  })

  it("groups light and dark path segments into one style token", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "light": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#ffffff"
            }
          }
        },
        "dark": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#101010"
            }
          }
        }
      }
    }`)

    expect(result.warnings).toHaveLength(0)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      sourcePath: "color.light.semantic.surface",
      darkSourcePath: "color.dark.semantic.surface",
      styleName: "semantic/surface",
      value: "#ffffff",
      darkValue: "#101010",
      modes: ["light", "dark"],
    })
  })

  it("groups light and dark values inside a token value object", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "semantic": {
          "surface": {
            "$type": "color",
            "$value": {
              "light": "#ffffff",
              "dark": "#101010"
            }
          }
        }
      }
    }`)

    expect(result.warnings).toHaveLength(0)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      sourcePath: "color.semantic.surface.light",
      darkSourcePath: "color.semantic.surface.dark",
      styleName: "semantic/surface",
      value: "#ffffff",
      darkValue: "#101010",
      modes: ["light", "dark"],
    })
  })

  it("resolves aliases against the current light or dark group when needed", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "light": {
          "primitive": {
            "blue": {
              "500": {
                "$type": "color",
                "$value": "#0066ff"
              }
            }
          },
          "semantic": {
            "button": {
              "$type": "color",
              "$value": "{color.primitive.blue.500}"
            }
          }
        },
        "dark": {
          "primitive": {
            "blue": {
              "500": {
                "$type": "color",
                "$value": "#8bb7ff"
              }
            }
          },
          "semantic": {
            "button": {
              "$type": "color",
              "$value": "{color.primitive.blue.500}"
            }
          }
        }
      }
    }`)

    const buttonToken = result.tokens.find(token => token.styleName === "semantic/button")

    expect(result.warnings).toHaveLength(0)
    expect(buttonToken).toMatchObject({
      value: "#0066ff",
      darkValue: "#8bb7ff",
      aliasPath: "color.light.primitive.blue.500",
      darkAliasPath: "color.dark.primitive.blue.500",
    })
  })

  it("keeps a dark-only token as a separate style with a warning", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "dark": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#101010"
            }
          }
        }
      }
    }`)

    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      sourcePath: "color.dark.semantic.surface",
      styleName: "dark/semantic/surface",
      value: "#101010",
    })
    expect(result.warnings[0]).toMatchObject({
      code: "dark-mode-without-light",
      path: "color.dark.semantic.surface",
    })
  })

  it("does not strip a lone light path segment that may be part of the source name", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "gray": {
          "light": {
            "$type": "color",
            "$value": "#eeeeee"
          }
        }
      }
    }`)

    expect(result.warnings).toHaveLength(0)
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]).toMatchObject({
      sourcePath: "color.gray.light",
      styleName: "gray/light",
      value: "#eeeeee",
    })
  })

  it("converts oklch to rgba for Framer import", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "accent": {
          "$type": "color",
          "$value": "oklch(62% 0.21 260)"
        }
      }
    }`)

    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0]?.format).toBe("oklch")
    expect(result.tokens[0]?.value).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/)
  })

  it("returns a parse error for invalid JSON", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "blue": {
          "$type": "color"
          "$value": "#0066ff"
        }
      }
    }`)

    expect(result.tokens).toHaveLength(0)
    expect(result.error).toContain("Invalid JSON")
    expect(result.errorLine).toBe(5)
  })

  it("adds source line numbers to warnings", () => {
    const result = parseColorTokenJson(
      [
        "{",
        '  "color": {',
        '    "semantic": {',
        '      "button": {',
        '        "$type": "color",',
        '        "$value": "{color.primitive.missing.500}"',
        "      }",
        "    }",
        "  }",
        "}",
      ].join("\n")
    )

    expect(result.warnings[0]).toMatchObject({
      code: "unresolved-alias",
      line: 4,
      path: "color.semantic.button",
    })
  })

  it("covers the expected warning codes", () => {
    const result = parseColorTokenJson(
      JSON.stringify(
        {
          color: {
            duplicate: {
              $type: "color",
              $value: "#ffffff",
            },
            badNumber: {
              $type: "color",
              $value: 123,
            },
            badFormat: {
              $type: "color",
              $value: "lab(50% 20 30)",
            },
            semantic: {
              missing: {
                $type: "color",
                $value: "{color.primitive.missing.500}",
              },
              loopA: {
                $type: "color",
                $value: "{color.semantic.loopB}",
              },
              loopB: {
                $type: "color",
                $value: "{color.semantic.loopA}",
              },
            },
          },
          colors: {
            duplicate: {
              $type: "color",
              $value: "#000000",
            },
          },
        },
        null,
        2
      )
    )

    expect(new Set(result.warnings.map(warning => warning.code))).toEqual(
      new Set(["circular-alias", "duplicate-style-name", "unresolved-alias", "unsupported-color", "unsupported-token"])
    )
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unsupported-token", line: expect.any(Number) }),
        expect.objectContaining({ code: "unsupported-color", line: expect.any(Number) }),
        expect.objectContaining({ code: "unresolved-alias", line: expect.any(Number) }),
        expect.objectContaining({ code: "circular-alias", line: expect.any(Number) }),
        expect.objectContaining({ code: "duplicate-style-name", line: expect.any(Number) }),
      ])
    )
  })
})
