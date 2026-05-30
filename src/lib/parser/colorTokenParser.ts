import { pathToSourcePath, pathToStyleName } from "../mapping/styleNames.ts"
import type {
  ColorTokenFormat,
  ColorTokenKind,
  ColorTokenMode,
  ConflictGroup,
  ParsedColorToken,
  ParseColorTokensResult,
  ParseWarning,
} from "../types/tokens.ts"

const META_KEYS = new Set([
  "$description",
  "$extensions",
  "$type",
  "$value",
  "description",
  "extensions",
  "type",
  "value",
])

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const NUMBER_RE_PART = "-?(?:\\d+|\\d*\\.\\d+)"
const COLOR_CHANNEL_RE_PART = "(?:\\d{1,3}|\\d*\\.\\d+)%?"
const PERCENT_RE_PART = "(?:\\d{1,3}|\\d*\\.\\d+)%"
const ALPHA_RE_PART = "(?:0|1|0?\\.\\d+|\\d{1,3}%)"
const HUE_RE_PART = `${NUMBER_RE_PART}(?:deg|rad|turn)?`
const RGB_COLOR_RE = new RegExp(
  `^rgba?\\(\\s*${COLOR_CHANNEL_RE_PART}(?:\\s*,\\s*${COLOR_CHANNEL_RE_PART}\\s*,\\s*${COLOR_CHANNEL_RE_PART}(?:\\s*,\\s*${ALPHA_RE_PART})?|\\s+${COLOR_CHANNEL_RE_PART}\\s+${COLOR_CHANNEL_RE_PART}(?:\\s*/\\s*${ALPHA_RE_PART})?)\\s*\\)$`,
  "i"
)
const HSL_COLOR_RE = new RegExp(
  `^hsla?\\(\\s*${HUE_RE_PART}(?:\\s*,\\s*${PERCENT_RE_PART}\\s*,\\s*${PERCENT_RE_PART}(?:\\s*,\\s*${ALPHA_RE_PART})?|\\s+${PERCENT_RE_PART}\\s+${PERCENT_RE_PART}(?:\\s*/\\s*${ALPHA_RE_PART})?)\\s*\\)$`,
  "i"
)
const ALIAS_RE = /^\{([^{}]+)\}$/

interface RawColorToken {
  path: string[]
  stylePath: string[]
  sourcePath: string
  value: string
  nodeType: string | undefined
  kind: ColorTokenKind
  mode?: ColorTokenMode
  modeSource?: "path" | "value"
}

interface ResolvedColorValue {
  value: string
  sourceValue: string
  format: ColorTokenFormat
  aliasPath?: string
}

interface ResolvedRawColorToken extends RawColorToken, ResolvedColorValue {
  styleName: string
}

export function parseColorTokenJson(jsonText: string): ParseColorTokensResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    const errorMessage = formatUnknownError(error)

    return {
      tokens: [],
      conflictGroups: [],
      warnings: [],
      error: `Invalid JSON: ${errorMessage}`,
      errorLine: findJsonParseErrorLine(errorMessage, jsonText),
    }
  }

  const rawTokens: RawColorToken[] = []
  const warnings: ParseWarning[] = []

  walkTokenTree(parsed, [], undefined, rawTokens, warnings)

  const rawTokensByPath = new Map(rawTokens.map(token => [token.sourcePath, token]))
  const resolvedCache = new Map<string, ResolvedColorValue | null>()
  const resolvedTokens: ResolvedRawColorToken[] = []

  for (const rawToken of rawTokens) {
    const resolved = resolveColorToken(rawToken, rawTokensByPath, resolvedCache, warnings, [])
    if (!resolved) continue

    resolvedTokens.push({
      ...rawToken,
      ...resolved,
      styleName: pathToStyleName(rawToken.stylePath),
    })
  }

  const lineMap = buildJsonPathLineMap(jsonText)
  const { tokens, conflictGroups } = buildParsedTokens(resolvedTokens, warnings)

  return {
    tokens,
    conflictGroups,
    warnings: warnings.map(warning => ({
      ...warning,
      line: lineMap.get(warning.path),
    })),
  }
}

function walkTokenTree(
  node: unknown,
  path: string[],
  inheritedType: string | undefined,
  tokens: RawColorToken[],
  warnings: ParseWarning[]
) {
  if (!isPlainObject(node)) return

  const nodeType = readString(node.$type) ?? readString(node.type) ?? inheritedType
  const tokenValue = readTokenValue(node)

  if (tokenValue !== undefined) {
    collectTokenValue(tokenValue, nodeType, path, tokens, warnings)
    return
  }

  for (const [key, value] of Object.entries(node)) {
    if (META_KEYS.has(key)) continue
    walkTokenTree(value, [...path, key], nodeType, tokens, warnings)
  }
}

function collectTokenValue(
  value: unknown,
  nodeType: string | undefined,
  path: string[],
  tokens: RawColorToken[],
  warnings: ParseWarning[]
) {
  const sourcePath = pathToSourcePath(path)
  const modeInfo = readColorMode(path)

  if (typeof value !== "string") {
    if (isPlainObject(value) && (nodeType === "color" || pathLooksLikeColor(path))) {
      const modeEntries = Object.entries(value).filter(([key]) => readModeSegment(key))

      if (modeEntries.length > 0) {
        for (const [key, modeValue] of modeEntries) {
          const mode = readModeSegment(key)
          if (!mode) continue

          const modePath = [...path, key]
          const modeSourcePath = pathToSourcePath(modePath)

          if (typeof modeValue !== "string") {
            warnings.push({
              code: "unsupported-token",
              path: modeSourcePath,
              message: "Color mode value must be a string.",
            })
            continue
          }

          tokens.push({
            path: modePath,
            stylePath: path,
            sourcePath: modeSourcePath,
            value: modeValue.trim(),
            nodeType,
            kind: inferTokenKind(path),
            mode,
            modeSource: "value",
          })
        }
        return
      }
    }

    if (nodeType === "color") {
      warnings.push({
        code: "unsupported-token",
        path: sourcePath,
        message: "Color token value must be a string.",
      })
    }
    return
  }

  const canTreatAsColor = nodeType === "color" || pathLooksLikeColor(path)
  if (!canTreatAsColor) return

  tokens.push({
    path,
    stylePath: modeInfo ? removePathIndex(path, modeInfo.index) : path,
    sourcePath,
    value: value.trim(),
    nodeType,
    kind: inferTokenKind(modeInfo ? removePathIndex(path, modeInfo.index) : path),
    mode: modeInfo?.mode,
    modeSource: modeInfo ? "path" : undefined,
  })
}

function resolveColorToken(
  token: RawColorToken,
  tokensByPath: Map<string, RawColorToken>,
  cache: Map<string, ResolvedColorValue | null>,
  warnings: ParseWarning[],
  stack: string[]
): ResolvedColorValue | null {
  const cached = cache.get(token.sourcePath)
  if (cached !== undefined) return cached

  if (stack.includes(token.sourcePath)) {
    warnings.push({
      code: "circular-alias",
      path: token.sourcePath,
      message: "Circular alias reference was skipped.",
    })
    cache.set(token.sourcePath, null)
    return null
  }

  const aliasPath = readAliasPath(token.value)

  if (aliasPath) {
    const aliasTarget = findAliasTarget(token, aliasPath, tokensByPath, warnings)

    if (!aliasTarget) {
      warnings.push({
        code: "unresolved-alias",
        path: token.sourcePath,
        message: `Alias target "${aliasPath}" was not found.`,
      })
      cache.set(token.sourcePath, null)
      return null
    }

    const resolvedTarget = resolveColorToken(aliasTarget, tokensByPath, cache, warnings, [...stack, token.sourcePath])
    const resolved = resolvedTarget
      ? {
          ...resolvedTarget,
          sourceValue: token.value,
          aliasPath: aliasTarget.sourcePath,
        }
      : null

    cache.set(token.sourcePath, resolved)
    return resolved
  }

  const color = parseColorValue(token.value)

  if (!color) {
    warnings.push({
      code: "unsupported-color",
      path: token.sourcePath,
      message: "Only hex, rgb(a), hsl(a), and oklch() color values are imported.",
    })
    cache.set(token.sourcePath, null)
    return null
  }

  cache.set(token.sourcePath, color)
  return color
}

function parseColorValue(value: string): ResolvedColorValue | null {
  const hex = parseHexColor(value)
  if (hex) {
    return {
      value: hex,
      sourceValue: value,
      format: "hex",
    }
  }

  const rgb = parseRgbColor(value)
  if (rgb) {
    return {
      value: rgb,
      sourceValue: value,
      format: "rgb",
    }
  }

  const hsl = parseHslColor(value)
  if (hsl) {
    return {
      value: hsl,
      sourceValue: value,
      format: "hsl",
    }
  }

  const oklch = parseOklch(value)
  if (oklch) return oklch

  return null
}

function parseHexColor(value: string): string | null {
  if (!HEX_COLOR_RE.test(value)) return null

  const hex = value.slice(1)
  const normalized =
    hex.length === 3 || hex.length === 4
      ? hex
          .split("")
          .map(character => `${character}${character}`)
          .join("")
      : hex

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const alpha = normalized.length === 8 ? Number.parseInt(normalized.slice(6, 8), 16) / 255 : 1

  return formatRgba(red, green, blue, alpha)
}

function parseRgbColor(value: string): string | null {
  if (!RGB_COLOR_RE.test(value)) return null

  const body = readFunctionBody(value)
  if (!body) return null

  const { channels, alpha } = readColorFunctionParts(body)
  if (channels.length !== 3) return null

  const red = parseRgbChannel(channels[0])
  const green = parseRgbChannel(channels[1])
  const blue = parseRgbChannel(channels[2])
  const parsedAlpha = alpha ? parseAlpha(alpha) : 1

  if (red === null || green === null || blue === null || parsedAlpha === null) return null

  return formatRgba(red, green, blue, parsedAlpha)
}

function parseHslColor(value: string): string | null {
  if (!HSL_COLOR_RE.test(value)) return null

  const body = readFunctionBody(value)
  if (!body) return null

  const { channels, alpha } = readColorFunctionParts(body)
  if (channels.length !== 3) return null

  const [hueChannel, saturationChannel, lightnessChannel] = channels
  if (!hueChannel || !saturationChannel || !lightnessChannel) return null

  const hue = parseHue(hueChannel)
  const saturation = parsePercentage(saturationChannel)
  const lightness = parsePercentage(lightnessChannel)
  const parsedAlpha = alpha ? parseAlpha(alpha) : 1

  if (hue === null || saturation === null || lightness === null || parsedAlpha === null) return null

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const normalizedHue = (((hue % 360) + 360) % 360) / 60
  const x = chroma * (1 - Math.abs((normalizedHue % 2) - 1))
  const m = lightness - chroma / 2
  const [redPrime, greenPrime, bluePrime] =
    normalizedHue < 1
      ? [chroma, x, 0]
      : normalizedHue < 2
        ? [x, chroma, 0]
        : normalizedHue < 3
          ? [0, chroma, x]
          : normalizedHue < 4
            ? [0, x, chroma]
            : normalizedHue < 5
              ? [x, 0, chroma]
              : [chroma, 0, x]

  return formatRgba((redPrime + m) * 255, (greenPrime + m) * 255, (bluePrime + m) * 255, parsedAlpha)
}

function readFunctionBody(value: string): string | null {
  const start = value.indexOf("(")
  const end = value.lastIndexOf(")")
  if (start < 0 || end < start) return null
  return value.slice(start + 1, end).trim()
}

function readColorFunctionParts(body: string): { channels: string[]; alpha?: string } {
  if (body.includes(",")) {
    const parts = body.split(",").map(part => part.trim()).filter(Boolean)
    return {
      channels: parts.slice(0, 3),
      alpha: parts[3],
    }
  }

  const [channelPart = "", alpha] = body.split("/").map(part => part.trim())
  return {
    channels: channelPart.split(/\s+/).filter(Boolean),
    alpha,
  }
}

function parseRgbChannel(value: string | undefined): number | null {
  if (!value) return null

  if (value.endsWith("%")) {
    const percentage = parsePercentage(value)
    return percentage === null ? null : Math.round(percentage * 255)
  }

  const channel = Number(value)
  if (!Number.isFinite(channel)) return null
  return Math.round(Math.min(255, Math.max(0, channel)))
}

function parseOklch(value: string): ResolvedColorValue | null {
  const match = value.match(/^oklch\(\s*([^\s]+)\s+([^\s]+)\s+([^\s/]+)(?:\s*\/\s*([^)]+))?\s*\)$/i)
  if (!match) return null

  const lightness = parseLightness(match[1])
  const chroma = Number(match[2])
  const hue = parseHue(match[3])
  const alpha = match[4] ? parseAlpha(match[4]) : 1

  if (lightness === null || !Number.isFinite(chroma) || hue === null || alpha === null) return null

  return {
    value: oklchToRgba(lightness, chroma, hue, alpha),
    sourceValue: value,
    format: "oklch",
  }
}

function oklchToRgba(lightness: number, chroma: number, hueDegrees: number, alpha: number): string {
  const hueRadians = (hueDegrees * Math.PI) / 180
  const a = chroma * Math.cos(hueRadians)
  const b = chroma * Math.sin(hueRadians)

  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b

  const l = lPrime ** 3
  const m = mPrime ** 3
  const s = sPrime ** 3

  const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  return formatRgba(linearToSrgbByte(red), linearToSrgbByte(green), linearToSrgbByte(blue), alpha)
}

function linearToSrgbByte(value: number): number {
  const clamped = Math.min(1, Math.max(0, value))
  const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
  return Math.round(encoded * 255)
}

function parseLightness(value: string | undefined): number | null {
  if (!value) return null
  if (value.endsWith("%")) return parsePercentage(value)

  const lightness = Number(value)
  if (!Number.isFinite(lightness)) return null
  return lightness
}

function parseHue(value: string | undefined): number | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized.endsWith("deg")) return parseFiniteNumber(normalized.slice(0, -3))
  if (normalized.endsWith("turn")) {
    const turns = parseFiniteNumber(normalized.slice(0, -4))
    return turns === null ? null : turns * 360
  }
  if (normalized.endsWith("rad")) {
    const radians = parseFiniteNumber(normalized.slice(0, -3))
    return radians === null ? null : (radians * 180) / Math.PI
  }
  return parseFiniteNumber(normalized)
}

function parseAlpha(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed.endsWith("%")) return parsePercentage(trimmed)

  const alpha = Number(trimmed)
  if (!Number.isFinite(alpha)) return null
  return Math.min(1, Math.max(0, alpha))
}

function parsePercentage(value: string): number | null {
  const parsed = Number(value.slice(0, -1))
  if (!Number.isFinite(parsed)) return null
  return Math.min(1, Math.max(0, parsed / 100))
}

function parseFiniteNumber(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function roundAlpha(alpha: number): number {
  return Math.round(alpha * 1000) / 1000
}

function formatRgba(red: number, green: number, blue: number, alpha: number): string {
  return `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${roundAlpha(alpha)})`
}

function readAliasPath(value: string): string | null {
  const match = value.match(ALIAS_RE)
  return match?.[1]?.trim() ?? null
}

function buildParsedTokens(
  tokens: ResolvedRawColorToken[],
  warnings: ParseWarning[]
): { tokens: ParsedColorToken[]; conflictGroups: ConflictGroup[] } {
  const parsedTokens: ParsedColorToken[] = []
  const tokensByCandidateKey = new Map<string, { light?: ResolvedRawColorToken; dark?: ResolvedRawColorToken }>()

  for (const token of tokens) {
    if (!token.mode) {
      parsedTokens.push(toParsedToken(token))
      continue
    }

    const candidateKey = pathToSourcePath(token.stylePath)
    const groupedToken = tokensByCandidateKey.get(candidateKey) ?? {}
    if (groupedToken[token.mode]) {
      warnings.push({
        code: "duplicate-style-name",
        path: token.sourcePath,
        message: `Duplicate ${token.mode} mode style name "${token.styleName}" was skipped.`,
      })
      continue
    }

    groupedToken[token.mode] = token
    tokensByCandidateKey.set(candidateKey, groupedToken)
  }

  for (const groupedToken of tokensByCandidateKey.values()) {
    if (groupedToken.light) {
      if (groupedToken.dark || groupedToken.light.modeSource === "value") {
        parsedTokens.push(toParsedToken(groupedToken.light, groupedToken.dark))
      } else {
        parsedTokens.push(toParsedToken(asPlainToken(groupedToken.light)))
      }
      continue
    }

    if (groupedToken.dark) {
      warnings.push({
        code: "dark-mode-without-light",
        path: groupedToken.dark.sourcePath,
        message: "Dark mode token was imported as a separate light value because no matching light mode token was found.",
      })
      parsedTokens.push(toParsedToken(asPlainToken(groupedToken.dark)))
    }
  }

  return separateConflicts(parsedTokens, warnings)
}

function toParsedToken(lightToken: ResolvedRawColorToken, darkToken?: ResolvedRawColorToken): ParsedColorToken {
  return {
    id: `${lightToken.styleName}:${lightToken.sourcePath}:${lightToken.value}:${darkToken?.sourcePath ?? ""}:${darkToken?.value ?? ""}`,
    path: lightToken.stylePath,
    sourcePath: lightToken.sourcePath,
    styleName: lightToken.styleName,
    value: lightToken.value,
    sourceValue: lightToken.sourceValue,
    aliasPath: lightToken.aliasPath,
    darkValue: darkToken?.value,
    darkSourceValue: darkToken?.sourceValue,
    darkSourcePath: darkToken?.sourcePath,
    darkAliasPath: darkToken?.aliasPath,
    darkFormat: darkToken?.format,
    kind: lightToken.kind,
    format: lightToken.format,
    modes: darkToken ? ["light", "dark"] : lightToken.mode ? [lightToken.mode] : [],
  }
}

function asPlainToken(token: ResolvedRawColorToken): ResolvedRawColorToken {
  return {
    ...token,
    mode: undefined,
    modeSource: undefined,
    stylePath: token.path,
    styleName: pathToStyleName(token.path),
  }
}

function findAliasTarget(
  token: RawColorToken,
  aliasPath: string,
  tokensByPath: Map<string, RawColorToken>,
  warnings: ParseWarning[]
): RawColorToken | undefined {
  const exactTarget = tokensByPath.get(aliasPath) ?? findModeScopedAliasTarget(token, aliasPath, tokensByPath)
  if (exactTarget) return exactTarget

  const relativeTarget = findRelativeAliasTarget(aliasPath, tokensByPath)
  if (relativeTarget === "ambiguous") {
    warnings.push({
      code: "unresolved-alias",
      path: token.sourcePath,
      message: `Alias target "${aliasPath}" matched multiple tokens.`,
    })
    return undefined
  }

  return relativeTarget
}

function findModeScopedAliasTarget(
  token: RawColorToken,
  aliasPath: string,
  tokensByPath: Map<string, RawColorToken>
): RawColorToken | undefined {
  if (!token.mode) return undefined

  const aliasParts = aliasPath.split(".").filter(Boolean)
  if (aliasParts.some(part => readModeSegment(part))) return undefined

  const colorRootIndex = aliasParts.findIndex(isColorRootSegment)
  if (colorRootIndex < 0) return undefined

  const modeScopedPath = pathToSourcePath([
    ...aliasParts.slice(0, colorRootIndex + 1),
    token.mode,
    ...aliasParts.slice(colorRootIndex + 1),
  ])

  return tokensByPath.get(modeScopedPath)
}

function findRelativeAliasTarget(
  aliasPath: string,
  tokensByPath: Map<string, RawColorToken>
): RawColorToken | "ambiguous" | undefined {
  const suffix = `.${aliasPath}`
  const matches = [...tokensByPath.entries()]
    .filter(([sourcePath]) => sourcePath.endsWith(suffix))
    .map(([, token]) => token)

  if (matches.length === 0) return undefined
  if (matches.length > 1) return "ambiguous"
  return matches[0]
}

function readColorMode(path: string[]): { mode: ColorTokenMode; index: number } | null {
  const index = path.findIndex(segment => readModeSegment(segment) !== null)
  if (index < 0) return null

  const mode = readModeSegment(path[index] ?? "")
  return mode ? { mode, index } : null
}

function readModeSegment(segment: string): ColorTokenMode | null {
  const normalized = segment.trim().toLowerCase()
  if (normalized === "light") return "light"
  if (normalized === "dark") return "dark"
  return null
}

function removePathIndex(path: string[], index: number): string[] {
  return [...path.slice(0, index), ...path.slice(index + 1)]
}

function inferTokenKind(path: string[]): ColorTokenKind {
  return path.some(segment => segment.toLowerCase() === "semantic") ? "semantic" : "primitive"
}

function readTokenValue(node: Record<string, unknown>): unknown {
  if (Object.prototype.hasOwnProperty.call(node, "$value")) return node.$value
  if (Object.prototype.hasOwnProperty.call(node, "value")) return node.value
  return undefined
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function pathLooksLikeColor(path: string[]): boolean {
  return path.some(isColorRootSegment)
}

function isColorRootSegment(segment: string): boolean {
  const normalized = segment.toLowerCase()
  return normalized === "color" || normalized === "colors" || normalized === "colour" || normalized === "colours"
}

function separateConflicts(
  tokens: ParsedColorToken[],
  warnings: ParseWarning[]
): { tokens: ParsedColorToken[]; conflictGroups: ConflictGroup[] } {
  const groupsByStyleName = new Map<string, ParsedColorToken[]>()

  for (const token of tokens) {
    const group = groupsByStyleName.get(token.styleName) ?? []
    group.push(token)
    groupsByStyleName.set(token.styleName, group)
  }

  const uniqueTokens: ParsedColorToken[] = []
  const conflictGroups: ConflictGroup[] = []

  for (const [styleName, candidates] of groupsByStyleName) {
    if (candidates.length === 1) {
      uniqueTokens.push(candidates[0]!)
    } else {
      for (const candidate of candidates.slice(1)) {
        warnings.push({
          code: "duplicate-style-name",
          path: candidate.sourcePath,
          message: `Duplicate style name "${styleName}" requires user selection.`,
        })
      }
      conflictGroups.push({ styleName, candidates })
    }
  }

  return { tokens: uniqueTokens, conflictGroups }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

interface JsonScanToken {
  type: "literal" | "string" | "punctuation"
  value: string
  line: number
}

function buildJsonPathLineMap(jsonText: string): Map<string, number> {
  const tokens = scanJsonTokens(jsonText)
  const lineMap = new Map<string, number>()
  let index = 0

  parseValue([])
  return lineMap

  function parseValue(path: string[]) {
    const token = tokens[index]
    if (!token) return

    if (token.value === "{") {
      parseObject(path)
      return
    }

    if (token.value === "[") {
      parseArray(path)
      return
    }

    index += 1
  }

  function parseObject(path: string[]) {
    index += 1

    while (index < tokens.length) {
      const token = tokens[index]
      if (!token) return

      if (token.value === "}") {
        index += 1
        return
      }

      if (token.type !== "string") {
        index += 1
        continue
      }

      const key = token.value
      index += 1

      if (tokens[index]?.value === ":") index += 1

      const childPath = META_KEYS.has(key) ? path : [...path, key]
      if (!META_KEYS.has(key) && childPath.length > 0) {
        lineMap.set(pathToSourcePath(childPath), token.line)
      }

      parseValue(childPath)

      if (tokens[index]?.value === ",") {
        index += 1
        continue
      }

      if (tokens[index]?.value === "}") {
        index += 1
        return
      }
    }
  }

  function parseArray(path: string[]) {
    index += 1

    while (index < tokens.length) {
      const token = tokens[index]
      if (!token) return

      if (token.value === "]") {
        index += 1
        return
      }

      parseValue(path)

      if (tokens[index]?.value === ",") {
        index += 1
      }
    }
  }
}

function scanJsonTokens(jsonText: string): JsonScanToken[] {
  const tokens: JsonScanToken[] = []
  let line = 1
  let index = 0

  while (index < jsonText.length) {
    const character = jsonText[index]

    if (character === "\n") {
      line += 1
      index += 1
      continue
    }

    if (character === '"') {
      const stringLine = line
      const [value, nextIndex, nextLine] = readJsonString(jsonText, index, line)
      tokens.push({
        type: "string",
        value,
        line: stringLine,
      })
      index = nextIndex
      line = nextLine
      continue
    }

    if (character && "{}[]:,".includes(character)) {
      tokens.push({
        type: "punctuation",
        value: character,
        line,
      })
      index += 1
      continue
    }

    if (character && !/\s/.test(character)) {
      const literalLine = line
      const [value, nextIndex] = readJsonLiteral(jsonText, index)
      tokens.push({
        type: "literal",
        value,
        line: literalLine,
      })
      index = nextIndex
      continue
    }

    index += 1
  }

  return tokens
}

function readJsonString(jsonText: string, startIndex: number, startLine: number): [string, number, number] {
  let value = ""
  let line = startLine
  let index = startIndex + 1

  while (index < jsonText.length) {
    const character = jsonText[index]

    if (character === "\n") line += 1

    if (character === "\\") {
      const escaped = jsonText[index + 1]
      if (escaped === "u") {
        value += jsonText.slice(index, index + 6)
        index += 6
        continue
      }

      value += escaped ?? ""
      index += 2
      continue
    }

    if (character === '"') return [value, index + 1, line]

    value += character ?? ""
    index += 1
  }

  return [value, index, line]
}

function readJsonLiteral(jsonText: string, startIndex: number): [string, number] {
  let value = ""
  let index = startIndex

  while (index < jsonText.length) {
    const character = jsonText[index]
    if (!character || /\s/.test(character) || "{}[]:,".includes(character)) break

    value += character
    index += 1
  }

  return [value, index]
}

function findJsonParseErrorLine(errorMessage: string, jsonText: string): number | undefined {
  const lineMatch = errorMessage.match(/\bline\s+(\d+)\b/i)
  if (lineMatch?.[1]) return Number(lineMatch[1])

  const positionMatch = errorMessage.match(/\bposition\s+(\d+)\b/i)
  if (!positionMatch?.[1]) return undefined

  const position = Number(positionMatch[1])
  if (!Number.isFinite(position)) return undefined

  return jsonText.slice(0, position).split("\n").length
}
