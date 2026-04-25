import { framer } from "framer-plugin"
import { normalizeStylePath } from "../mapping/styleNames.ts"
import type {
  ColorStyleConflict,
  ConflictGroup,
  ImportColorStylesResult,
  ParsedColorToken,
} from "../types/tokens.ts"

type ExistingColorStyle = Awaited<ReturnType<typeof framer.getColorStyles>>[number]

export async function findColorStyleConflicts(tokens: ParsedColorToken[]): Promise<ColorStyleConflict[]> {
  const existingStyles = await framer.getColorStyles()
  const stylesByPath = buildStylesByPath(existingStyles)
  const conflicts: ColorStyleConflict[] = []
  const seenStyleNames = new Set<string>()

  for (const token of tokens) {
    const normalizedTokenPath = normalizeStylePath(token.styleName)
    const lookupKey = styleLookupKey(normalizedTokenPath)
    if (seenStyleNames.has(lookupKey)) continue

    const existingStyle = stylesByPath.get(styleLookupKey(normalizedTokenPath))

    if (existingStyle) {
      seenStyleNames.add(lookupKey)
      conflicts.push({
        styleName: normalizedTokenPath,
        existingPath: existingStyle.path || existingStyle.name,
        existingValue: existingStyle.light,
        existingDarkValue: existingStyle.dark ?? undefined,
      })
    }
  }

  return conflicts
}

export async function importColorStyles(
  tokens: ParsedColorToken[],
  conflictGroups: ConflictGroup[],
  conflictSelections: Map<string, string>
): Promise<ImportColorStylesResult> {
  const result: ImportColorStylesResult = {
    created: 0,
    replaced: 0,
    skipped: 0,
    failed: 0,
    failures: [],
  }

  const existingStyles = await framer.getColorStyles()
  const stylesByPath = buildStylesByPath(existingStyles)

  const selectedConflictCandidates = conflictGroups.map(group => {
    const selectedId = conflictSelections.get(group.styleName)
    return group.candidates.find(c => c.id === selectedId) ?? group.candidates[0]!
  })

  const tokensToProcess = [...tokens, ...selectedConflictCandidates]

  for (const token of tokensToProcess) {
    try {
      const normalizedTokenPath = normalizeStylePath(token.styleName)
      const selectedId = conflictSelections.get(token.styleName)

      if (selectedId === "existing") {
        result.skipped += 1
        continue
      }

      const existingStyle = stylesByPath.get(styleLookupKey(normalizedTokenPath))

      if (existingStyle) {
        await existingStyle.setAttributes(colorStyleAttributesForToken(token))
        result.replaced += 1
        continue
      }

      const createdStyle = await framer.createColorStyle({
        path: normalizedTokenPath,
        ...colorStyleAttributesForToken(token),
      })

      stylesByPath.set(styleLookupKey(normalizedTokenPath), createdStyle)
      result.created += 1
    } catch (error) {
      result.failed += 1
      result.failures.push({
        name: token.styleName,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return result
}

function styleLookupKey(path: string): string {
  return normalizeStylePath(path).toLowerCase()
}

function buildStylesByPath(existingStyles: ExistingColorStyle[]): Map<string, ExistingColorStyle> {
  const stylesByPath = new Map<string, ExistingColorStyle>()

  for (const style of existingStyles) {
    const normalizedPath = styleLookupKey(style.path)
    const normalizedName = styleLookupKey(style.name)

    if (normalizedPath) stylesByPath.set(normalizedPath, style)
    if (normalizedName) stylesByPath.set(normalizedName, style)
  }

  return stylesByPath
}

function colorStyleAttributesForToken(token: ParsedColorToken): { light: string; dark: string | null } {
  return {
    light: token.value,
    dark: token.darkValue ?? null,
  }
}
