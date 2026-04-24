export type ColorTokenKind = "primitive" | "semantic"

export type ColorTokenFormat = "hex" | "rgb" | "hsl" | "oklch"

export type ColorTokenMode = "light" | "dark"

export interface ParsedColorToken {
  id: string
  path: string[]
  sourcePath: string
  styleName: string
  value: string
  sourceValue: string
  aliasPath?: string
  darkValue?: string
  darkSourceValue?: string
  darkSourcePath?: string
  darkAliasPath?: string
  darkFormat?: ColorTokenFormat
  kind: ColorTokenKind
  format: ColorTokenFormat
  modes: ColorTokenMode[]
}

export type ParseWarningCode =
  | "circular-alias"
  | "dark-mode-without-light"
  | "duplicate-style-name"
  | "unresolved-alias"
  | "unsupported-color"
  | "unsupported-token"

export interface ParseWarning {
  code: ParseWarningCode
  path: string
  message: string
  line?: number
}

export interface ConflictGroup {
  styleName: string
  candidates: ParsedColorToken[]
}

export interface ParseColorTokensResult {
  tokens: ParsedColorToken[]
  conflictGroups: ConflictGroup[]
  warnings: ParseWarning[]
  error?: string
  errorLine?: number
}

export type ImportStrategy = "skip" | "replace"

export interface ImportFailure {
  name: string
  reason: string
}

export interface ColorStyleConflict {
  styleName: string
  existingPath: string
  existingValue: string
  existingDarkValue?: string
}

export interface ImportColorStylesResult {
  created: number
  replaced: number
  skipped: number
  failed: number
  failures: ImportFailure[]
}
