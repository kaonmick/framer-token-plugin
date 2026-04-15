const EMPTY_STYLE_NAME = "Imported Color"

export function pathToSourcePath(path: string[]): string {
  return path.length > 0 ? path.join(".") : "(root)"
}

export function pathToStyleName(path: string[]): string {
  const parts = stripFramerColorRoot(path).map(sanitizePathSegment).filter(Boolean)
  return parts.length > 0 ? parts.join("/") : EMPTY_STYLE_NAME
}

export function normalizeStylePath(path: string): string {
  const parts = path
    .split("/")
    .map(sanitizePathSegment)
    .filter(Boolean)

  return stripFramerColorRoot(parts).join("/")
}

function stripFramerColorRoot(path: string[]): string[] {
  if (path.length === 0) return path

  const [first, ...rest] = path
  const normalizedFirst = first?.trim().toLowerCase()

  if (
    normalizedFirst === "color" ||
    normalizedFirst === "colors" ||
    normalizedFirst === "colour" ||
    normalizedFirst === "colours"
  ) {
    return rest
  }

  return path
}

function sanitizePathSegment(segment: string): string {
  return segment.trim().replaceAll("/", "-")
}
