import type {
  ColorStyleConflict,
  ConflictGroup,
  ImportColorStylesResult,
  ParsedColorToken,
} from "../lib/types/tokens.ts"
import type { EditorDiagnostic } from "../components/JsonTokenEditor.tsx"
import type { TokenCardRow } from "../components/TokenCard.tsx"

export const catalogEditorJson = `{
  "color": {
    "primitive": {
      "blue": {
        "500": {
          "$type": "color",
          "$value": "#2f6bff"
        }
      },
      "accent": {
        "300": {
          "$type": "color",
          "$value": "oklch(0.9 0.18 98)"
        }
      }
    },
    "semantic": {
      "background": {
        "primary": {
          "$type": "color",
          "$value": "{color.primitive.white}",
          "$extensions": {
            "mode": {
              "dark": "{color.primitive.neutral.950}"
            }
          }
        }
      },
      "text": {
        "link": {
          "$type": "color",
          "$value": "var(--link)"
        }
      }
    }
  }
}`

export const catalogEditorDiagnostics: EditorDiagnostic[] = [
  {
    line: 13,
    message: "color.primitive.accent.300 · OKLCH は hex に変換して import します。",
    path: "color.primitive.accent.300",
    summary: "OKLCH conversion",
    title: "OKLCH conversion",
    tone: "warning",
  },
  {
    line: 31,
    message: "color.semantic.text.link · Unsupported color value: var(--link)",
    path: "color.semantic.text.link",
    summary: "Unsupported value",
    title: "Unsupported color value",
    tone: "danger",
  },
]

export const catalogTokens: ParsedColorToken[] = [
  {
    id: "primitive-blue-500",
    path: ["color", "primitive", "blue", "500"],
    sourcePath: "color.primitive.blue.500",
    styleName: "primitive/blue/500",
    value: "#2f6bff",
    sourceValue: "#2f6bff",
    kind: "primitive",
    format: "hex",
    modes: ["light"],
  },
  {
    id: "semantic-background-primary",
    path: ["color", "semantic", "background", "primary"],
    sourcePath: "color.semantic.background.primary",
    styleName: "semantic/background/primary",
    value: "#ffffff",
    sourceValue: "{color.primitive.white}",
    aliasPath: "color.primitive.white",
    darkValue: "#111313",
    darkSourceValue: "{color.primitive.neutral.950}",
    darkSourcePath: "color.semantic.background.primary.dark",
    darkAliasPath: "color.primitive.neutral.950",
    kind: "semantic",
    format: "hex",
    darkFormat: "hex",
    modes: ["light", "dark"],
  },
]

export const catalogConflictGroups: ConflictGroup[] = [
  {
    styleName: "semantic/accent/default",
    candidates: [
      {
        id: "semantic-accent-default-a",
        path: ["color", "semantic", "accent", "default"],
        sourcePath: "color.semantic.accent.default",
        styleName: "semantic/accent/default",
        value: "#f9d84a",
        sourceValue: "{color.primitive.yellow.300}",
        aliasPath: "color.primitive.yellow.300",
        kind: "semantic",
        format: "hex",
        modes: ["light"],
      },
      {
        id: "semantic-accent-default-b",
        path: ["color", "semantic", "accent", "default"],
        sourcePath: "color.semantic.accent.default.duplicate",
        styleName: "semantic/accent/default",
        value: "#ffb020",
        sourceValue: "#ffb020",
        kind: "semantic",
        format: "hex",
        modes: ["light"],
      },
    ],
  },
]

export const catalogExistingConflicts: ColorStyleConflict[] = [
  {
    styleName: "primitive/blue/500",
    existingPath: "primitive/blue/500",
    existingValue: "#1d4ed8",
  },
]

export const catalogStatsItems = [
  { label: "Color tokens", value: 12 },
  { label: "Create", value: 8 },
  { label: "Replace", value: 2 },
  { label: "Skip", value: 1 },
]

export const catalogStatsItemsLongLabel = [
  { label: "Imported semantic color tokens", value: 124 },
  { label: "Existing styles with replacements", value: 32 },
  { label: "Conflicts requiring user choice", value: 7 },
  { label: "Warnings kept as notices", value: 18 },
]

export const catalogTokenCardRows: TokenCardRow[] = [
  {
    value: "#2f6bff",
    name: "color.primitive.blue.500",
  },
]

export const catalogTokenCardModeRows: TokenCardRow[] = [
  {
    mode: "Light",
    value: "#ffffff",
    name: "color.semantic.background.primary",
  },
  {
    mode: "Dark",
    value: "#111313",
    name: "color.semantic.background.primary.dark",
  },
]

export const summarySuccess: ImportColorStylesResult = {
  created: 8,
  replaced: 2,
  skipped: 1,
  failed: 0,
  failures: [],
}

export const summaryFailed: ImportColorStylesResult = {
  created: 4,
  replaced: 1,
  skipped: 2,
  failed: 2,
  failures: [
    { name: "semantic/text/link", reason: "Unsupported color value: var(--link)" },
    { name: "primitive/brand/oklch", reason: "Framer API rejected converted color value." },
  ],
}
