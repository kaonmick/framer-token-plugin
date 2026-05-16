import type { EditorDiagnostic } from "../../components/JsonTokenEditor.tsx"

export const jsonTokenEditorLabels = {
  copied: "Copied JSON",
  copy: "Copy JSON",
  copyFailed: "Could not copy JSON",
  resize: "Resize editor",
}

export const jsonTokenEditorFixtures = {
  emptyPlaceholder: `{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#fff085"
      }
    }
  }
}`,
  ideal: `{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#fff085"
      }
    },
    "semantic": {
      "accent": {
        "$type": "color",
        "$value": {
          "light": "{color.brand.primary}",
          "dark": "#713f12"
        }
      }
    }
  }
}`,
  partial: `{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#fff085"
      },
      "legacy": {
        "$type": "color",
        "$value": "oklab(70% 0.1 0.1)"
      }
    },
    "semantic": {
      "button": {
        "$type": "color",
        "$value": "{color.brand.missing}"
      }
    }
  }
}`,
  error: `{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#fff085",
      }
    }
  }
}`,
}

export const jsonTokenEditorDiagnostics = {
  partial: [
    {
      line: 11,
      message: "Line 11 · color.brand.legacy:\nUnsupported color format. Use hex, rgb(a), hsl(a), or oklch().",
      path: "color.brand.legacy",
      summary: "Unsupported color",
      title: "unsupported-color",
      tone: "warning",
    },
    {
      line: 17,
      message: "Line 17 · color.semantic.button:\nAlias target could not be found.",
      path: "color.semantic.button",
      summary: "Missing alias target",
      title: "unresolved-alias",
      tone: "warning",
    },
  ] satisfies EditorDiagnostic[],
  error: [
    {
      line: 6,
      message: "Line 6 · Invalid JSON: trailing comma is not allowed.",
      summary: "Invalid JSON",
      title: "Invalid JSON",
      tone: "danger",
    },
  ] satisfies EditorDiagnostic[],
}
