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
      value: "rgba(0, 102, 255, 1)",
      sourceValue: "#0066FF",
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

  it("accepts CSS Color 4 rgb and hsl syntax", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "$type": "color",
        "surface": {
          "$value": "rgb(246 246 246 / .72)"
        },
        "accent": {
          "$value": "hsl(210 50% 40% / 0.6)"
        }
      }
    }`)

    expect(result.warnings).toHaveLength(0)
    expect(result.tokens).toHaveLength(2)
    expect(result.tokens[0]).toMatchObject({
      format: "rgb",
      value: "rgba(246, 246, 246, 0.72)",
      sourceValue: "rgb(246 246 246 / .72)",
    })
    expect(result.tokens[1]).toMatchObject({
      format: "hsl",
      value: "rgba(51, 102, 153, 0.6)",
      sourceValue: "hsl(210 50% 40% / 0.6)",
    })
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
      value: "rgba(0, 102, 255, 1)",
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
      value: "rgba(255, 255, 255, 1)",
      darkValue: "rgba(16, 16, 16, 1)",
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
      value: "rgba(255, 255, 255, 1)",
      darkValue: "rgba(16, 16, 16, 1)",
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
      value: "rgba(0, 102, 255, 1)",
      darkValue: "rgba(139, 183, 255, 1)",
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
      value: "rgba(16, 16, 16, 1)",
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
      value: "rgba(238, 238, 238, 1)",
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

  it("separates duplicate style names into conflict groups instead of importing both by default", () => {
    const result = parseColorTokenJson(`{
      "color": {
        "semantic": {
          "action": {
            "$type": "color",
            "$value": "#0066ff"
          }
        }
      },
      "colors": {
        "semantic": {
          "action": {
            "$type": "color",
            "$value": "#ff6600"
          }
        }
      }
    }`)

    expect(result.tokens).toHaveLength(0)
    expect(result.conflictGroups).toHaveLength(1)
    expect(result.conflictGroups[0]).toMatchObject({
      styleName: "semantic/action",
      candidates: [
        { sourcePath: "color.semantic.action", value: "rgba(0, 102, 255, 1)" },
        { sourcePath: "colors.semantic.action", value: "rgba(255, 102, 0, 1)" },
      ],
    })
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "duplicate-style-name",
          path: "colors.semantic.action",
        }),
      ])
    )
  })

  it("keeps four light dark duplicate candidates in one conflict group", () => {
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
              "$value": "#111111"
            }
          }
        }
      },
      "colors": {
        "light": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#f5f5f5"
            }
          }
        },
        "dark": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#151515"
            }
          }
        }
      },
      "colour": {
        "light": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#ededed"
            }
          }
        },
        "dark": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#1d1d1d"
            }
          }
        }
      },
      "colours": {
        "light": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#e5e5e5"
            }
          }
        },
        "dark": {
          "semantic": {
            "surface": {
              "$type": "color",
              "$value": "#252525"
            }
          }
        }
      }
    }`)

    expect(result.tokens).toHaveLength(0)
    expect(result.conflictGroups).toHaveLength(1)
    expect(result.conflictGroups[0]?.styleName).toBe("semantic/surface")
    expect(result.conflictGroups[0]?.candidates).toHaveLength(4)
    expect(result.conflictGroups[0]?.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourcePath: "color.light.semantic.surface",
          darkSourcePath: "color.dark.semantic.surface",
          value: "rgba(255, 255, 255, 1)",
          darkValue: "rgba(17, 17, 17, 1)",
        }),
        expect.objectContaining({
          sourcePath: "colors.light.semantic.surface",
          darkSourcePath: "colors.dark.semantic.surface",
          value: "rgba(245, 245, 245, 1)",
          darkValue: "rgba(21, 21, 21, 1)",
        }),
        expect.objectContaining({
          sourcePath: "colour.light.semantic.surface",
          darkSourcePath: "colour.dark.semantic.surface",
          value: "rgba(237, 237, 237, 1)",
          darkValue: "rgba(29, 29, 29, 1)",
        }),
        expect.objectContaining({
          sourcePath: "colours.light.semantic.surface",
          darkSourcePath: "colours.dark.semantic.surface",
          value: "rgba(229, 229, 229, 1)",
          darkValue: "rgba(37, 37, 37, 1)",
        }),
      ])
    )
  })
})
