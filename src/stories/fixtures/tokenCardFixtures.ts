import type { ColorStyleConflict, ConflictGroup, ParsedColorToken } from "../../lib/types/tokens.ts"

export const tokenCardListLabels = {
  conflict: "Conflict",
  newTokens: "New tokens",
  whichTokenToUse: "Which token should be used?",
  existingStyle: "Existing style",
  existingStyleConflictTitle: "Existing Framer style conflict",
  existingStyleConflictDescription: "The JSON token and existing Framer style share the same style name.",
  duplicateStyleNameTitle: "Duplicate style name",
  duplicateStyleNameDescription: "Multiple JSON tokens resolve to the same Framer style name.",
  emptyState: "No color tokens found yet.",
  checkingConflicts: "Checking conflicts...",
  conflictCheckFailed: "Conflict check failed.",
  light: "Light",
  dark: "Dark",
}

export const tokenCardListNewTokens: ParsedColorToken[] = [
  token({
    id: "brand-primary",
    path: ["color", "brand", "primary"],
    styleName: "brand / primary",
    value: "#fff085",
    darkValue: "#713f12",
    kind: "primitive",
  }),
  token({
    id: "text-danger",
    path: ["color", "text", "danger"],
    styleName: "text / danger",
    value: "#dc2626",
    kind: "semantic",
  }),
]

export const tokenCardListConflictCandidate = token({
  id: "button-bg-json",
  path: ["color", "button", "background"],
  styleName: "button / background",
  value: "#fff085",
  darkValue: "#713f12",
  kind: "semantic",
})

export const tokenCardListExistingConflicts: ColorStyleConflict[] = [
  {
    styleName: "button / background",
    existingPath: "button/background",
    existingValue: "#fde047",
    existingDarkValue: "#854d0e",
  },
]

export const tokenCardListDuplicateGroups: ConflictGroup[] = [
  {
    styleName: "card / surface",
    candidates: [
      token({
        id: "card-surface-light",
        path: ["color", "card", "surface"],
        styleName: "card / surface",
        value: "#fafafa",
        kind: "semantic",
      }),
      token({
        id: "panel-surface-light",
        path: ["color", "panel", "surface"],
        styleName: "card / surface",
        value: "#f5f5f5",
        kind: "semantic",
      }),
    ],
  },
]

function token({
  id,
  path,
  styleName,
  value,
  darkValue,
  kind,
}: {
  id: string
  path: string[]
  styleName: string
  value: string
  darkValue?: string
  kind: ParsedColorToken["kind"]
}): ParsedColorToken {
  return {
    id,
    path,
    sourcePath: path.join("."),
    styleName,
    value,
    sourceValue: value,
    darkValue,
    darkSourceValue: darkValue,
    darkSourcePath: darkValue ? `${path.join(".")}.dark` : undefined,
    kind,
    format: value.startsWith("#") ? "hex" : "rgb",
    darkFormat: darkValue ? "hex" : undefined,
    modes: darkValue ? ["light", "dark"] : ["light"],
  }
}
