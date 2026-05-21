import type { Meta, StoryObj } from "@storybook/react-vite"
import { Upload } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Language } from "../../app/i18n.ts"
import { messages } from "../../app/i18n.ts"
import { AppHeader } from "../../components/AppHeader.tsx"
import { ImportSummary } from "../../components/ImportSummary.tsx"
import { JsonFileDropZone } from "../../components/JsonFileDropZone.tsx"
import { JsonTokenEditor, type EditorDiagnostic } from "../../components/JsonTokenEditor.tsx"
import { TokenCardList } from "../../components/TokenCardList.tsx"
import {
  ActionButton,
  DialogActions,
  DialogPanel,
  FileButton,
  HelperText,
  MessageBox,
  SectionTitle,
  SelectControl,
  cx,
} from "../../components/ui.tsx"
import {
  jsonTokenEditorDiagnostics,
  jsonTokenEditorFixtures,
} from "../fixtures/jsonTokenEditorFixtures.ts"
import { getStoryLanguage, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"
import {
  tokenCardListConflictCandidate,
  tokenCardListDuplicateGroups,
  tokenCardListExistingConflicts,
  tokenCardListLabels,
  tokenCardListNewTokens,
} from "../fixtures/tokenCardFixtures.ts"

type SemanticToken =
  | "surface.base"
  | "surface.subtle"
  | "surface.raised"
  | "surface.muted"
  | "surface.warning"
  | "surface.danger"
  | "overlay.default"
  | "elevated.default"
  | "text.default"
  | "text.subtle"
  | "text.muted"
  | "text.on-brand"
  | "text.danger"
  | "text.highlight"
  | "border.default"
  | "border.muted"
  | "border.strong"
  | "border.focus"
  | "border.brand"
  | "border.danger"
  | "surface.brand"
  | "surface.brand-hover"
  | "control.radio.selected"
  | "preview.conflict-accent"
  | "preview.new-token-accent"
  | "code.key"
  | "code.string"
  | "code.number"
  | "code.boolean"
  | "code.null"
  | "code.punctuation"
  | "code.placeholder"
  | "code.highlight"
  | "code.diagnostic-underline"

type UIStack = "ideal" | "empty" | "loading" | "partial" | "error"
type SemanticUsageSection = "shared" | "page1" | "page2"
type RgbColor = { b: number; g: number; r: number }
type ContrastGrade = "AAA" | "AA" | "Fail"

const contrastBackgroundVars = {
  "elevated.default": "--color-elevated-default",
  "surface.brand": "--color-surface-brand",
  "surface.danger": "--color-surface-danger",
  "surface.warning": "--color-surface-warning",
  "surface.base": "--color-surface-base",
  "surface.muted": "--color-surface-muted",
  "surface.raised": "--color-surface-raised",
  "surface.subtle": "--color-surface-subtle",
  "code.highlight": "--color-code-highlight",
} as const

type ContrastBackgroundToken = keyof typeof contrastBackgroundVars
type UsageMetadata = {
  background?: ContrastBackgroundToken
  component: string
  state: UIStack
  text?: SemanticToken
  tokens: SemanticToken[]
  usage: string
}
type SemanticReference = {
  dark: string
  light: string
  token: SemanticToken
}
type ReferenceTheme = "Dark" | "Light"

const semanticGroups: { label: string; tokens: SemanticToken[] }[] = [
  {
    label: "Surface Base",
    tokens: ["surface.base", "surface.subtle", "surface.raised", "elevated.default"],
  },
  {
    label: "Surface Editor",
    tokens: ["surface.muted"],
  },
  {
    label: "Surface Brand",
    tokens: ["surface.brand", "surface.brand-hover"],
  },
  {
    label: "Preview",
    tokens: ["control.radio.selected", "preview.conflict-accent", "preview.new-token-accent"],
  },
  {
    label: "Surface State",
    tokens: ["surface.warning", "surface.danger"],
  },
  {
    label: "Overlay",
    tokens: ["overlay.default"],
  },
  {
    label: "Text",
    tokens: ["text.default", "text.subtle", "text.muted", "text.on-brand", "text.danger", "text.highlight"],
  },
  {
    label: "Code",
    tokens: ["code.key", "code.string", "code.number", "code.boolean", "code.null", "code.punctuation", "code.placeholder", "code.highlight", "code.diagnostic-underline"],
  },
  {
    label: "Border",
    tokens: ["border.default", "border.muted", "border.strong", "border.focus", "border.brand", "border.danger"],
  },
]

const semanticOptions = semanticGroups.flatMap(group => group.tokens)

const semanticReferences: Record<SemanticToken, SemanticReference> = {
  "surface.base": {
    dark: "color.neutral.800",
    light: "color.neutral.50",
    token: "surface.base",
  },
  "surface.subtle": {
    dark: "color.neutral.700",
    light: "color.neutral.100",
    token: "surface.subtle",
  },
  "surface.raised": {
    dark: "color.neutral.800",
    light: "color.neutral.50",
    token: "surface.raised",
  },
  "surface.muted": {
    dark: "color.neutral.600",
    light: "color.neutral.200",
    token: "surface.muted",
  },
  "surface.warning": {
    dark: "color.yellow.800",
    light: "color.yellow.100",
    token: "surface.warning",
  },
  "surface.danger": {
    dark: "color.red.600",
    light: "color.red.400",
    token: "surface.danger",
  },
  "overlay.default": {
    dark: "color-mix(color.neutral.800 70%, transparent)",
    light: "color-mix(color.neutral.50 70%, transparent)",
    token: "overlay.default",
  },
  "elevated.default": {
    dark: "color.neutral.600",
    light: "color.neutral.200",
    token: "elevated.default",
  },
  "text.default": {
    dark: "color.neutral.100",
    light: "color.neutral.900",
    token: "text.default",
  },
  "text.subtle": {
    dark: "color.neutral.300",
    light: "color.neutral.600",
    token: "text.subtle",
  },
  "text.muted": {
    dark: "color.neutral.400",
    light: "color.neutral.500",
    token: "text.muted",
  },
  "text.on-brand": {
    dark: "color.neutral.800",
    light: "color.neutral.800",
    token: "text.on-brand",
  },
  "text.danger": {
    dark: "color.red.300",
    light: "color.red.600",
    token: "text.danger",
  },
  "text.highlight": {
    dark: "color.yellow.100",
    light: "color.yellow.800",
    token: "text.highlight",
  },
  "border.default": {
    dark: "color.neutral.200",
    light: "color.neutral.400",
    token: "border.default",
  },
  "border.muted": {
    dark: "color.neutral.500",
    light: "color.neutral.300",
    token: "border.muted",
  },
  "border.strong": {
    dark: "color.neutral.200",
    light: "color.neutral.400",
    token: "border.strong",
  },
  "border.focus": {
    dark: "color.yellow.300",
    light: "color.yellow.300",
    token: "border.focus",
  },
  "border.brand": {
    dark: "color.yellow.300",
    light: "color.yellow.300",
    token: "border.brand",
  },
  "border.danger": {
    dark: "color.red.600",
    light: "color.red.600",
    token: "border.danger",
  },
  "surface.brand": {
    dark: "color.yellow.300",
    light: "color.yellow.300",
    token: "surface.brand",
  },
  "surface.brand-hover": {
    dark: "color.yellow.500",
    light: "color.yellow.500",
    token: "surface.brand-hover",
  },
  "control.radio.selected": {
    dark: "color.yellow.300",
    light: "color.yellow.500",
    token: "control.radio.selected",
  },
  "preview.conflict-accent": {
    dark: "color.yellow.500",
    light: "color.yellow.400",
    token: "preview.conflict-accent",
  },
  "preview.new-token-accent": {
    dark: "color.green.700",
    light: "color.green.700",
    token: "preview.new-token-accent",
  },
  "code.key": {
    dark: "color.sky.300",
    light: "color.sky.700",
    token: "code.key",
  },
  "code.string": {
    dark: "color.green.300",
    light: "color.green.700",
    token: "code.string",
  },
  "code.number": {
    dark: "color.sky.300",
    light: "color.blue.700",
    token: "code.number",
  },
  "code.boolean": {
    dark: "color.orange.300",
    light: "color.orange.700",
    token: "code.boolean",
  },
  "code.null": {
    dark: "color.pink.300",
    light: "color.pink.700",
    token: "code.null",
  },
  "code.punctuation": {
    dark: "color.neutral.300",
    light: "color.neutral.600",
    token: "code.punctuation",
  },
  "code.placeholder": {
    dark: "color.neutral.400",
    light: "color.neutral.500",
    token: "code.placeholder",
  },
  "code.highlight": {
    dark: "color.yellow.800",
    light: "color.yellow.100",
    token: "code.highlight",
  },
  "code.diagnostic-underline": {
    dark: "color.yellow.300",
    light: "color.yellow.800",
    token: "code.diagnostic-underline",
  },
}

function primitiveReferenceToCssColor(value: string) {
  return value
    .replace(/^color-mix\((.*)\)$/, "color-mix(in srgb, $1)")
    .replace(/color\.([a-z]+)\.([0-9]+)/g, "var(--color-$1-$2)")
    .replace(/color\.white/g, "var(--color-white)")
}

const stackLabels: Record<UIStack, string> = {
  ideal: "Ideal",
  empty: "Blank / Empty",
  loading: "Loading",
  partial: "Partial",
  error: "Error",
}

const idealUsage = {
  title: {
    background: "surface.subtle",
    component: "SectionTitle",
    state: "ideal",
    text: "text.default",
    tokens: ["text.default"],
    usage: "見出し",
  },
  helper: {
    background: "surface.subtle",
    component: "HelperText",
    state: "ideal",
    text: "text.subtle",
    tokens: ["text.subtle"],
    usage: "説明文",
  },
  primaryButton: {
    background: "surface.brand",
    component: "ActionButton",
    state: "ideal",
    text: "text.on-brand",
    tokens: ["surface.brand", "text.on-brand", "border.focus"],
    usage: "primary solid",
  },
  secondaryButton: {
    background: "surface.subtle",
    component: "ActionButton",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.subtle", "text.default", "border.focus"],
    usage: "secondary solid",
  },
  neutralButton: {
    background: "surface.subtle",
    component: "ActionButton",
    state: "ideal",
    text: "text.default",
    tokens: ["border.strong", "text.default", "border.focus"],
    usage: "neutral outline",
  },
  select: {
    background: "surface.base",
    component: "SelectControl",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.base", "border.default", "text.default"],
    usage: "select",
  },
  dialog: {
    background: "surface.base",
    component: "DialogPanel",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.base", "border.muted", "text.default"],
    usage: "dialog body",
  },
} satisfies Record<string, UsageMetadata>

const emptyUsage = {
  helper: {
    background: "surface.subtle",
    component: "HelperText",
    state: "empty",
    text: "text.subtle",
    tokens: ["text.subtle"],
    usage: "empty message",
  },
  uploadButton: {
    background: "surface.brand",
    component: "FileButton",
    state: "empty",
    text: "text.on-brand",
    tokens: ["surface.brand", "text.on-brand", "border.focus"],
    usage: "upload CTA",
  },
  pasteButton: {
    background: "surface.subtle",
    component: "ActionButton",
    state: "empty",
    text: "text.subtle",
    tokens: ["text.subtle", "border.muted", "border.focus"],
    usage: "outline action",
  },
} satisfies Record<string, UsageMetadata>

const loadingUsage = {
  label: {
    background: "surface.subtle",
    component: "Story label",
    state: "loading",
    text: "text.muted",
    tokens: ["text.muted"],
    usage: "loading label",
  },
  loadingButton: {
    background: "surface.brand",
    component: "ActionButton",
    state: "loading",
    text: "text.on-brand",
    tokens: ["surface.brand", "text.on-brand", "border.focus"],
    usage: "loading CTA opacity 40%",
  },
  disabledButton: {
    background: "surface.brand",
    component: "ActionButton",
    state: "loading",
    text: "text.on-brand",
    tokens: ["surface.brand", "text.on-brand", "border.focus"],
    usage: "disabled CTA opacity 40%",
  },
} satisfies Record<string, UsageMetadata>

const partialUsage = {
  message: {
    background: "elevated.default",
    component: "MessageBox",
    state: "partial",
    text: "text.default",
    tokens: ["elevated.default", "text.default", "border.muted"],
    usage: "warning message",
  },
  reviewButton: {
    background: "surface.subtle",
    component: "ActionButton",
    state: "partial",
    text: "text.default",
    tokens: ["text.default", "border.brand", "surface.brand", "border.focus"],
    usage: "primary outline border",
  },
  skipButton: {
    background: "surface.brand",
    component: "ActionButton",
    state: "partial",
    text: "text.default",
    tokens: ["text.default", "surface.brand", "border.focus"],
    usage: "brand ghost hover opacity 40%",
  },
  diagnosticSummary: {
    background: "surface.warning",
    component: "JsonTokenEditor",
    state: "partial",
    text: "text.default",
    tokens: ["surface.warning", "border.brand", "text.default"],
    usage: "warning diagnostic summary",
  },
} satisfies Record<string, UsageMetadata>

const errorUsage = {
  message: {
    background: "elevated.default",
    component: "MessageBox",
    state: "error",
    text: "text.danger",
    tokens: ["elevated.default", "border.muted", "text.danger"],
    usage: "error message",
  },
  retryButton: {
    background: "surface.danger",
    component: "ActionButton",
    state: "error",
    text: "text.default",
    tokens: ["surface.danger", "text.default", "border.focus"],
    usage: "danger CTA",
  },
  removeButton: {
    background: "elevated.default",
    component: "ActionButton",
    state: "error",
    text: "text.danger",
    tokens: ["border.danger", "text.danger", "elevated.default", "border.focus"],
    usage: "danger outline hover",
  },
  overlay: {
    component: "DialogBackdrop",
    state: "error",
    tokens: ["overlay.default"],
    usage: "dialog backdrop",
  },
  dialogPreview: {
    background: "surface.base",
    component: "DialogBackdrop",
    state: "error",
    text: "text.default",
    tokens: ["surface.base", "border.muted", "text.default"],
    usage: "dialog preview",
  },
} satisfies Record<string, UsageMetadata>

const editorCommonUsage = {
  appHeader: {
    background: "surface.base",
    component: "AppHeader",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.base", "text.default"],
    usage: "page title",
  },
  languageToggleTrack: {
    background: "surface.muted",
    component: "LanguageToggle",
    state: "ideal",
    text: "text.subtle",
    tokens: ["surface.muted", "text.subtle"],
    usage: "language toggle track",
  },
  languageToggleThumb: {
    background: "surface.brand",
    component: "LanguageToggle",
    state: "ideal",
    text: "text.on-brand",
    tokens: ["surface.brand", "text.on-brand"],
    usage: "language toggle selected side",
  },
  shell: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.subtle", "border.default", "text.default"],
    usage: "editor canvas",
  },
  gutter: {
    background: "elevated.default",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "text.subtle",
    tokens: ["elevated.default", "border.muted", "text.subtle"],
    usage: "line number gutter",
  },
  copyButton: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.subtle", "text.default", "border.focus"],
    usage: "copy JSON icon button",
  },
  syntaxKey: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "code.key",
    tokens: ["code.key", "surface.subtle"],
    usage: "JSON key",
  },
  syntaxString: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "code.string",
    tokens: ["code.string", "surface.subtle"],
    usage: "JSON string",
  },
  syntaxNumber: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "code.number",
    tokens: ["code.number", "surface.subtle"],
    usage: "JSON number",
  },
  syntaxBoolean: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "code.boolean",
    tokens: ["code.boolean", "surface.subtle"],
    usage: "JSON boolean",
  },
  syntaxNull: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "code.null",
    tokens: ["code.null", "surface.subtle"],
    usage: "JSON null",
  },
  syntaxPunctuation: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "ideal",
    text: "code.punctuation",
    tokens: ["code.punctuation", "surface.subtle"],
    usage: "JSON punctuation",
  },
} satisfies Record<string, UsageMetadata>

const editorEmptyUsage = {
  dropZone: {
    background: "surface.base",
    component: "JsonFileDropZone",
    state: "empty",
    text: "text.subtle",
    tokens: ["surface.base", "border.muted", "text.subtle", "text.muted"],
    usage: "file drop zone",
  },
  dropZoneButton: {
    background: "surface.subtle",
    component: "JsonFileDropZone",
    state: "empty",
    text: "text.subtle",
    tokens: ["surface.subtle", "border.muted", "text.subtle", "border.focus"],
    usage: "drop zone upload button",
  },
  placeholder: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "empty",
    text: "code.placeholder",
    tokens: ["code.placeholder", "surface.subtle"],
    usage: "empty placeholder",
  },
} satisfies Record<string, UsageMetadata>

const editorLoadingUsage = {
  loadingLabel: {
    background: "surface.subtle",
    component: "JsonTokenEditor",
    state: "loading",
    text: "text.muted",
    tokens: ["surface.subtle", "border.muted", "text.muted"],
    usage: "story-only loading note",
  },
} satisfies Record<string, UsageMetadata>

const editorDiagnosticUsage = {
  diagnosticLine: {
    background: "code.highlight",
    component: "JsonTokenEditor",
    state: "partial",
    text: "code.diagnostic-underline",
    tokens: ["code.highlight", "code.diagnostic-underline"],
    usage: "diagnostic line highlight",
  },
  diagnosticGhost: {
    background: "code.highlight",
    component: "JsonTokenEditor",
    state: "partial",
    text: "text.highlight",
    tokens: ["text.highlight", "code.highlight"],
    usage: "inline diagnostic comment",
  },
  diagnosticSummary: {
    background: "surface.warning",
    component: "JsonTokenEditor",
    state: "partial",
    text: "text.default",
    tokens: ["surface.warning", "border.brand", "text.default"],
    usage: "diagnostic summary chip",
  },
  diagnosticTooltip: {
    background: "surface.raised",
    component: "JsonTokenEditor",
    state: "partial",
    text: "text.subtle",
    tokens: ["surface.raised", "text.subtle", "code.diagnostic-underline", "border.strong"],
    usage: "diagnostic tooltip",
  },
} satisfies Record<string, UsageMetadata>

const editorErrorUsage = {
  diagnosticSummary: {
    background: "elevated.default",
    component: "JsonTokenEditor",
    state: "error",
    text: "text.danger",
    tokens: ["elevated.default", "border.danger", "text.danger"],
    usage: "invalid JSON summary chip",
  },
} satisfies Record<string, UsageMetadata>

function usageForState(usages: UsageMetadata[], state: UIStack) {
  return usages.map(usage => ({ ...usage, state }))
}

const usageByState: Record<UIStack, UsageMetadata[]> = {
  ideal: Object.values(idealUsage),
  empty: Object.values(emptyUsage),
  loading: Object.values(loadingUsage),
  partial: Object.values(partialUsage),
  error: Object.values(errorUsage),
}

const editorUsageByState: Record<UIStack, UsageMetadata[]> = {
  ideal: Object.values(editorCommonUsage),
  empty: [...usageForState(Object.values(editorCommonUsage), "empty"), ...Object.values(editorEmptyUsage)],
  loading: [...usageForState(Object.values(editorCommonUsage), "loading"), ...Object.values(editorLoadingUsage)],
  partial: [...usageForState(Object.values(editorCommonUsage), "partial"), ...Object.values(editorDiagnosticUsage)],
  error: [
    ...usageForState(Object.values(editorCommonUsage), "error"),
    ...usageForState(Object.values(editorDiagnosticUsage), "error"),
    ...Object.values(editorErrorUsage),
  ],
}

const previewCommonUsage = {
  importSummaryPanel: {
    background: "surface.raised",
    component: "ImportSummary",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.raised", "border.muted", "text.default", "text.subtle"],
    usage: "import result summary",
  },
  tokenCard: {
    background: "surface.subtle",
    component: "TokenCard",
    state: "ideal",
    text: "text.default",
    tokens: ["surface.subtle", "text.default", "text.subtle", "border.default"],
    usage: "token card body",
  },
  colorBadge: {
    background: "surface.subtle",
    component: "TokenCard",
    state: "ideal",
    tokens: ["border.default"],
    usage: "color badge border",
  },
  lightDarkRow: {
    background: "surface.subtle",
    component: "TokenCard",
    state: "ideal",
    text: "text.default",
    tokens: ["text.default", "text.subtle"],
    usage: "light / dark token rows",
  },
  newTokenAccent: {
    component: "TokenCardList",
    state: "ideal",
    tokens: ["preview.new-token-accent"],
    usage: "new tokens section accent",
  },
} satisfies Record<string, UsageMetadata>

const previewEmptyUsage = {
  emptyMessage: {
    background: "surface.subtle",
    component: "TokenCardList",
    state: "empty",
    text: "text.subtle",
    tokens: ["surface.subtle", "text.subtle"],
    usage: "empty preview message",
  },
} satisfies Record<string, UsageMetadata>

const previewLoadingUsage = {
  checkingMessage: {
    background: "surface.subtle",
    component: "TokenCardList",
    state: "loading",
    text: "text.default",
    tokens: ["surface.subtle", "text.default", "text.subtle"],
    usage: "checking conflicts message",
  },
} satisfies Record<string, UsageMetadata>

const previewConflictUsage = {
  previewNotice: {
    background: "elevated.default",
    component: "MessageBox",
    state: "partial",
    text: "text.default",
    tokens: ["elevated.default", "text.default", "border.muted"],
    usage: "preview warning notice",
  },
  conflictAccent: {
    component: "TokenCardList",
    state: "partial",
    tokens: ["preview.conflict-accent"],
    usage: "conflict section accent",
  },
  conflictPanel: {
    background: "surface.subtle",
    component: "TokenCardList",
    state: "partial",
    text: "text.subtle",
    tokens: ["surface.subtle", "border.muted", "text.default", "text.subtle"],
    usage: "conflict selection panel",
  },
  selectedCard: {
    background: "surface.brand",
    component: "TokenCard",
    state: "partial",
    text: "text.default",
    tokens: ["surface.brand", "text.default", "control.radio.selected", "border.focus"],
    usage: "selected conflict candidate",
  },
} satisfies Record<string, UsageMetadata>

const previewErrorUsage = {
  conflictError: {
    background: "surface.subtle",
    component: "TokenCardList",
    state: "error",
    text: "text.danger",
    tokens: ["surface.subtle", "text.default", "text.danger"],
    usage: "conflict check error",
  },
} satisfies Record<string, UsageMetadata>

const previewUsageByState: Record<UIStack, UsageMetadata[]> = {
  ideal: Object.values(previewCommonUsage),
  empty: Object.values(previewEmptyUsage),
  loading: [...usageForState(Object.values(previewCommonUsage), "loading"), ...Object.values(previewLoadingUsage)],
  partial: [...usageForState(Object.values(previewCommonUsage), "partial"), ...Object.values(previewConflictUsage)],
  error: [...usageForState(Object.values(previewCommonUsage), "error"), ...Object.values(previewErrorUsage)],
}

function usageMetadataForSections(sections: SemanticUsageSection[]) {
  const sectionSet = new Set(sections)
  const usages: UsageMetadata[] = []

  if (sectionSet.has("shared")) usages.push(...Object.values(usageByState).flat())
  if (sectionSet.has("page1")) usages.push(...Object.values(editorUsageByState).flat())
  if (sectionSet.has("page2")) usages.push(...Object.values(previewUsageByState).flat())

  return usages
}

function usageTokens(usage: UsageMetadata) {
  return Array.from(new Set([...usage.tokens, usage.text, usage.background].filter(Boolean))) as SemanticToken[]
}

function semanticTokensForUsages(usages: UsageMetadata[]) {
  return new Set(usages.flatMap(usageTokens))
}

function hasSemantic(usages: UsageMetadata[], selected: SemanticToken) {
  return usages.some(usage => usageTokens(usage).includes(selected))
}

function UsageTarget({
  children,
  selected,
  usage,
}: {
  children: ReactNode
  selected: SemanticToken
  usage: UsageMetadata | UsageMetadata[]
}) {
  const usages = Array.isArray(usage) ? usage : [usage]
  const highlighted = hasSemantic(usages, selected)

  return (
    <div
      className={cx(
        "semantic-usage-target relative rounded-[6px] p-1",
        highlighted && "semantic-usage-target-active"
      )}
      data-semantic-highlighted={highlighted ? "true" : undefined}
    >
      {children}
    </div>
  )
}

function UsageCard({
  children,
  selected,
  state,
  usages,
}: {
  children: ReactNode
  selected: SemanticToken
  state: UIStack
  usages?: UsageMetadata[]
}) {
  return (
    <section className="rounded-[6px] border border-border-muted bg-surface-subtle p-3">
      <div className="mb-3 text-[10px] uppercase tracking-widest text-text-muted">{stackLabels[state]}</div>
      <div className="flex flex-col gap-3">{children}</div>
      <SectionTextContrast selected={selected} usages={usages ?? usageByState[state]} />
    </section>
  )
}

function SemanticSelector({
  availableTokens,
  selected,
  onSelect,
}: {
  availableTokens: Set<SemanticToken>
  selected: SemanticToken
  onSelect: (token: SemanticToken) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {semanticGroups.map(group => (
        <section className="flex min-w-0 flex-col gap-2 rounded-[6px] border border-border-muted bg-surface-subtle p-3" key={group.label}>
          <h2 className="m-0 text-[10px] uppercase tracking-widest text-text-muted">{group.label}</h2>
          <div className="flex flex-col gap-2">
            {group.tokens.map(token => {
              const isAvailable = availableTokens.has(token)

              return (
                <button
                  className={cx(
                    "min-h-[28px] w-full rounded-full border px-3 text-left text-[12px] leading-none",
                    token === selected
                      ? "border-text-default bg-text-default text-surface-base"
                      : "border-border-muted bg-surface-base text-text-subtle hover:bg-surface-muted",
                    !isAvailable && "cursor-not-allowed opacity-40 hover:bg-surface-base"
                  )}
                  disabled={!isAvailable}
                  key={token}
                  type="button"
                  onClick={() => onSelect(token)}
                >
                  {token}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function SemanticReferencePanel({ selected }: { selected: SemanticToken }) {
  const reference = semanticReferences[selected]

  return (
    <section className="rounded-[6px] border border-border-muted bg-surface-subtle p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-[12px] font-normal leading-tight text-text-default">Primitive reference</h2>
        <code className="rounded-[4px] bg-surface-base px-2 py-1 font-['Fira_Code',monospace] text-[11px] text-text-subtle">
          {reference.token}
        </code>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <ReferenceValue label="Dark" value={reference.dark} />
        <ReferenceValue label="Light" value={reference.light} />
      </div>
    </section>
  )
}

function ReferenceValue({ label, value }: { label: ReferenceTheme; value: string }) {
  return (
    <div className="rounded-[4px] border border-border-muted bg-surface-base p-2">
      <div className="mb-1 text-[10px] uppercase tracking-widest text-text-muted">{label}</div>
      <div className="flex items-center gap-2">
        <ColorChip value={value} />
        <code className="block min-w-0 break-words font-['Fira_Code',monospace] text-[12px] leading-relaxed text-text-default">
          {value}
        </code>
      </div>
    </div>
  )
}

function ColorChip({ value }: { value: string }) {
  return (
    <span
      aria-label={`Color preview: ${value}`}
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border-muted"
      style={{
        backgroundImage:
          "linear-gradient(45deg, var(--color-border-muted) 25%, transparent 25%), linear-gradient(-45deg, var(--color-border-muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-border-muted) 75%), linear-gradient(-45deg, transparent 75%, var(--color-border-muted) 75%)",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
        backgroundSize: "10px 10px",
      }}
      title={value}
    >
      <span className="size-full rounded-full" style={{ backgroundColor: primitiveReferenceToCssColor(value) }} />
    </span>
  )
}

function SemanticUsageTable({ selected, usages }: { selected: SemanticToken; usages: UsageMetadata[] }) {
  const rows = usages.filter(usage => usageTokens(usage).includes(selected))

  return (
    <div className="overflow-hidden rounded-[6px] border border-border-muted bg-surface-subtle">
      <div className="grid grid-cols-[132px_132px_minmax(0,1fr)] border-b border-border-muted bg-surface-muted px-3 py-2 text-[11px] text-text-default">
        <span>Semantic</span>
        <span>State</span>
        <span>Usage</span>
      </div>
      {rows.map(row => (
        <div
          className="grid grid-cols-[132px_132px_minmax(0,1fr)] gap-2 border-b border-border-muted px-3 py-2 text-[12px] last:border-b-0"
          key={`${row.state}-${row.component}-${row.usage}`}
        >
          <span className="truncate text-text-default">{row.component}</span>
          <span className="truncate text-text-subtle">{stackLabels[row.state]}</span>
          <span className="text-text-subtle">{row.usage}</span>
        </div>
      ))}
    </div>
  )
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function toSrgbChannel(value: number) {
  const clamped = clamp01(value)
  const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
  return Math.round(clamp01(srgb) * 255)
}

function parseRgbColor(value: string): RgbColor | null {
  const match = value.match(/rgba?\(([^)]+)\)/)
  const channelText = match?.[1]
  if (!channelText) return null

  const channels = channelText
    .split(/[,\s/]+/)
    .map(channel => Number.parseFloat(channel))
    .filter(channel => Number.isFinite(channel))

  if (channels.length < 3) return null
  const [r = 0, g = 0, b = 0] = channels
  return { r, g, b }
}

function parseOklchColor(value: string): RgbColor | null {
  const match = value.match(/oklch\(([^)]+)\)/)
  const channelText = match?.[1]
  if (!channelText) return null

  const channels = channelText
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map((channel, index) => {
      if (index === 0 && channel.endsWith("%")) return Number.parseFloat(channel) / 100
      return Number.parseFloat(channel)
    })

  const [l, c, h] = channels
  if (l === undefined || c === undefined || h === undefined) return null

  const hue = (h * Math.PI) / 180
  const a = c * Math.cos(hue)
  const b = c * Math.sin(hue)
  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b
  const lLinear = lPrime ** 3
  const mLinear = mPrime ** 3
  const sLinear = sPrime ** 3

  return {
    r: toSrgbChannel(4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear),
    g: toSrgbChannel(-1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear),
    b: toSrgbChannel(-0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.707614701 * sLinear),
  }
}

function parseCssColor(value: string): RgbColor | null {
  return parseRgbColor(value) ?? parseOklchColor(value)
}

function relativeLuminance({ b, g, r }: RgbColor) {
  const toLinear = (channel: number) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(foreground: RgbColor, background: RgbColor) {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

function contrastGrade(ratio: number): ContrastGrade {
  if (ratio >= 7) return "AAA"
  if (ratio >= 4.5) return "AA"
  return "Fail"
}

function contrastGradeClass(grade: ContrastGrade) {
  if (grade === "AAA") {
    return "border-[color:var(--color-preview-new-token-accent)] bg-[color:color-mix(in_srgb,var(--color-preview-new-token-accent)_18%,transparent)] text-text-default"
  }
  if (grade === "AA") return "border-border-muted bg-surface-base text-text-default"
  return "border-border-danger bg-elevated-default text-text-danger"
}

function SectionTextContrast({ selected, usages }: { selected: SemanticToken; usages: UsageMetadata[] }) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [rows, setRows] = useState<{
    background: ContrastBackgroundToken
    component: string
    grade: ContrastGrade
    ratio: number
    usage: string
  }[]>([])
  const selectedRows = useMemo(
    () =>
      usages.filter(
        (usage): usage is UsageMetadata & { background: ContrastBackgroundToken; text: SemanticToken } =>
          usage.text === selected && usage.background !== undefined
      ),
    [selected, usages]
  )

  useEffect(() => {
    if (selectedRows.length === 0) {
      setRows([])
      return
    }

    const panel = panelRef.current
    if (!panel) return

    const textNode = panel.querySelector<HTMLElement>("[data-contrast-text]")
    if (!textNode) return

    const textColor = parseCssColor(getComputedStyle(textNode).color)
    if (!textColor) return

    const nextRows = selectedRows.flatMap(row => {
      const backgroundNode = panel.querySelector<HTMLElement>(`[data-contrast-background="${row.background}"]`)
      if (!backgroundNode) return []

      const backgroundColor = parseCssColor(getComputedStyle(backgroundNode).backgroundColor)
      if (!backgroundColor) return []

      const ratio = contrastRatio(textColor, backgroundColor)
      return [{ background: row.background, component: row.component, grade: contrastGrade(ratio), ratio, usage: row.usage }]
    })

    setRows(nextRows)
  }, [selected, selectedRows])

  if (selectedRows.length === 0) return null

  return (
    <section className="mt-3 rounded-[6px] border border-border-muted bg-surface-base p-3" ref={panelRef}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-[12px] font-normal leading-tight text-text-default">Text contrast</h2>
        <code className="rounded-[4px] bg-surface-base px-2 py-1 font-['Fira_Code',monospace] text-[11px] text-text-subtle">
          {selected}
        </code>
      </div>
      <span className="sr-only" data-contrast-text style={{ color: `var(--color-${selected.replace(".", "-")})` }} />
      {selectedRows.map(row => (
        <span
          className="sr-only"
          data-contrast-background={row.background}
          key={`${row.component}-${row.usage}`}
          style={{ backgroundColor: `var(${contrastBackgroundVars[row.background]})` }}
        />
      ))}
      <div className="grid gap-2">
        {rows.map(row => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_96px_64px_52px] items-center gap-2 text-[12px]"
            key={`${row.component}-${row.usage}-${row.background}`}
          >
            <span className="min-w-0 truncate text-text-default">{row.component}</span>
            <span className="min-w-0 truncate text-text-subtle">{row.background}</span>
            <span className="text-right font-['Fira_Code',monospace] text-text-default">{row.ratio.toFixed(2)}:1</span>
            <span className={cx("rounded-full border px-2 py-1 text-center text-[11px] leading-none", contrastGradeClass(row.grade))}>
              {row.grade}
            </span>
            <span className="col-span-4 min-w-0 text-[11px] text-text-muted">{row.usage}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function getEditorLabels(language: Language) {
  const t = messages[language]

  return {
    copied: t.copiedJson,
    copy: t.copyJson,
    copyFailed: t.copyJsonFailed,
  }
}

function getTokenCardLabels(language: Language): typeof tokenCardListLabels {
  const t = messages[language]

  return {
    ...tokenCardListLabels,
    checkingConflicts: t.checkingConflicts,
    conflict: t.conflict,
    conflictCheckFailed: t.conflictCheckFailed,
    dark: t.dark,
    duplicateStyleNameDescription: t.duplicateStyleNameDescription,
    duplicateStyleNameTitle: t.duplicateStyleNameTitle,
    emptyState: t.emptyState,
    existingStyle: t.existingStyle,
    existingStyleConflictDescription: t.existingStyleConflictDescription,
    existingStyleConflictTitle: t.existingStyleConflictTitle,
    light: t.light,
    newTokens: t.newTokens,
    whichTokenToUse: t.whichTokenToUse,
  }
}

const semanticMapCopy = {
  en: {
    cancel: "Cancel",
    checkingJson: "Checking JSON...",
    close: "Close",
    dialogBackdrop: "Dialog backdrop",
    editorDescription: "Semantic usage for the screen where users add, read, and fix JSON.",
    editorTitle: "Page 1: Editor",
    import: "Import",
    importColors: "Import colors",
    importComplete: "Import complete",
    importCompleteBody: "3 styles were imported.",
    importing: "Importing",
    jsonHelp: "Review color tokens in JSON before importing.",
    missingValue: "Missing paired light value",
    noJson: "No JSON has been selected yet.",
    partialMessage: "Some Color Styles need review.",
    paste: "Paste",
    preview: "Preview",
    previewDescription: "Semantic usage for the screen where token cards show differences, conflicts, and new tokens.",
    previewTitle: "Page 2: Preview",
    remove: "Remove",
    retry: "Retry",
    review: "Review",
    sharedDescription: "Shared components used across Page 1 and Page 2.",
    sharedTitle: "Shared UI Components",
    skipWarnings: "Skip warnings",
    uploadJson: "Upload JSON",
    waiting: "Waiting",
    jsonError: "JSON could not be loaded.",
  },
  ja: {
    cancel: "キャンセル",
    checkingJson: "JSONを確認中...",
    close: "閉じる",
    dialogBackdrop: "Dialog backdrop",
    editorDescription: "JSON を入れる、読む、修正する画面の semantic 使用箇所です。",
    editorTitle: "Page 1: Editor",
    import: "インポート",
    importColors: "カラーをインポート",
    importComplete: "インポート完了",
    importCompleteBody: "3件のスタイルを取り込みました。",
    importing: "インポート中",
    jsonHelp: "JSON の color token を確認してから取り込みます。",
    missingValue: "light の値が不足しています",
    noJson: "まだ JSON が選択されていません。",
    partialMessage: "一部の Color Style は確認が必要です。",
    paste: "貼り付け",
    preview: "プレビュー",
    previewDescription: "token card で差分、競合、新規 token を確認する画面の semantic 使用箇所です。",
    previewTitle: "Page 2: Preview",
    remove: "削除",
    retry: "再試行",
    review: "確認",
    sharedDescription: "Page 1 / Page 2 の両方で使う共通部品です。",
    sharedTitle: "Shared UI Components",
    skipWarnings: "警告をスキップ",
    uploadJson: "JSONをアップロード",
    waiting: "待機中",
    jsonError: "JSON の読み込みに失敗しました。",
  },
} satisfies Record<Language, Record<string, string>>

const importSummaryFixture = {
  created: 3,
  failed: 0,
  failures: [],
  replaced: 1,
  skipped: 0,
}

const semanticMapEditorValue = `{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "#fff085",
        "$extensions": {
          "deprecated": false,
          "alpha": 1,
          "fallback": null
        }
      }
    }
  }
}`

function editorStateValue(state: UIStack) {
  if (state === "empty") return ""
  if (state === "partial") return jsonTokenEditorFixtures.partial
  if (state === "error") return jsonTokenEditorFixtures.error
  return semanticMapEditorValue
}

function editorStateDiagnostics(state: UIStack): EditorDiagnostic[] {
  if (state === "partial") return jsonTokenEditorDiagnostics.partial
  if (state === "error") return jsonTokenEditorDiagnostics.error
  return []
}

function EditorSample({ language, selected, state }: { language: Language; selected: SemanticToken; state: UIStack }) {
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)
  const [value, setValue] = useState(editorStateValue(state))
  const usages = editorUsageByState[state]
  const t = semanticMapCopy[language]

  return (
    <UsageCard selected={selected} state={state} usages={usages}>
      {state === "loading" ? (
        <UsageTarget selected={selected} usage={editorLoadingUsage.loadingLabel}>
          <div className="rounded-[4px] border border-border-muted bg-surface-subtle px-3 py-2 text-[12px] leading-[1.5] text-text-muted">
            {t.checkingJson}
          </div>
        </UsageTarget>
      ) : null}
      <UsageTarget selected={selected} usage={usages}>
        <JsonTokenEditor
          diagnostics={editorStateDiagnostics(state)}
          labels={getEditorLabels(language)}
          lineNumbersRef={lineNumbersRef}
          placeholder={language === "ja" ? messages.ja.editorPlaceholder : jsonTokenEditorFixtures.emptyPlaceholder}
          value={value}
          onScroll={() => {}}
          onTextChange={setValue}
        />
      </UsageTarget>
    </UsageCard>
  )
}

function EditorPagePreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 text-[16px] font-normal leading-tight text-text-default">{t.editorTitle}</h2>
        <p className="m-0 mt-1 text-[12px] leading-relaxed text-text-subtle">
          {t.editorDescription}
        </p>
      </div>
      <ThemeSummaryColumns>
        {() => (
          <div className="grid gap-3">
            <EditorHeaderSample language={language} selected={selected} />
            <DropZoneSample language={language} selected={selected} />
            {(["ideal", "empty", "loading", "partial", "error"] satisfies UIStack[]).map(state => (
              <EditorSample key={state} language={language} selected={selected} state={state} />
            ))}
          </div>
        )}
      </ThemeSummaryColumns>
    </section>
  )
}

function EditorHeaderSample({ language, selected }: { language: Language; selected: SemanticToken }) {
  return (
    <UsageCard selected={selected} state="ideal" usages={[editorCommonUsage.appHeader, editorCommonUsage.languageToggleTrack, editorCommonUsage.languageToggleThumb]}>
      <UsageTarget selected={selected} usage={[editorCommonUsage.appHeader, editorCommonUsage.languageToggleTrack, editorCommonUsage.languageToggleThumb]}>
        <AppHeader language={language} title={messages[language].title} onLanguageChange={() => {}} />
      </UsageTarget>
    </UsageCard>
  )
}

function DropZoneSample({ language, selected }: { language: Language; selected: SemanticToken }) {
  return (
    <UsageCard selected={selected} state="empty" usages={[editorEmptyUsage.dropZone, editorEmptyUsage.dropZoneButton]}>
      <UsageTarget selected={selected} usage={[editorEmptyUsage.dropZone, editorEmptyUsage.dropZoneButton]}>
        <JsonFileDropZone
          labels={{
            button: messages[language].uploadJsonButton,
            title: messages[language].dropJsonTitle,
          }}
          onFileSelect={() => {}}
        />
      </UsageTarget>
    </UsageCard>
  )
}

function PreviewPageSample({ language, selected, state }: { language: Language; selected: SemanticToken; state: UIStack }) {
  const [selections, setSelections] = useState(new Map<string, string>())
  const usages = previewUsageByState[state]

  return (
    <UsageCard selected={selected} state={state} usages={usages}>
      {state === "partial" ? (
        <UsageTarget selected={selected} usage={previewConflictUsage.previewNotice}>
          <MessageBox tone="warning">
            <div className="flex flex-col gap-1">
              <p className="m-0">{messages[language].rgbaConversionNotice.replace("{count}", "1")}</p>
              <div>
                <p className="m-0">{messages[language].skippedWarningsNotice}</p>
                <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
                  <li className="m-0">
                    {messages[language].line} 11 · color.badFormat / {language === "ja" ? "未対応の色形式" : "Unsupported color"}
                  </li>
                </ul>
              </div>
            </div>
          </MessageBox>
        </UsageTarget>
      ) : null}
      <UsageTarget selected={selected} usage={usages}>
        <TokenCardList
          tokens={state === "empty" ? [] : state === "partial" ? [tokenCardListConflictCandidate, ...tokenCardListNewTokens] : tokenCardListNewTokens}
          conflictGroups={state === "partial" ? tokenCardListDuplicateGroups : []}
          existingConflicts={state === "partial" ? tokenCardListExistingConflicts : []}
          isCheckingConflicts={state === "loading"}
          conflictError={state === "error" ? "Framer styles could not be read in this preview." : null}
          conflictSelections={selections}
          onSelectionChange={setSelection}
          labels={getTokenCardLabels(language)}
        />
      </UsageTarget>
    </UsageCard>
  )

  function setSelection(styleName: string, selectedId: string) {
    setSelections(prev => {
      const next = new Map(prev)
      next.set(styleName, selectedId)
      return next
    })
  }
}

function PreviewPagePreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 text-[16px] font-normal leading-tight text-text-default">{t.previewTitle}</h2>
        <p className="m-0 mt-1 text-[12px] leading-relaxed text-text-subtle">
          {t.previewDescription}
        </p>
      </div>
      <ThemeSummaryColumns>
        {() => (
          <div className="grid gap-3">
            <ImportSummarySample language={language} selected={selected} />
            {(["ideal", "empty", "loading", "partial", "error"] satisfies UIStack[]).map(state => (
              <PreviewPageSample key={state} language={language} selected={selected} state={state} />
            ))}
          </div>
        )}
      </ThemeSummaryColumns>
    </section>
  )
}

function ImportSummarySample({ language, selected }: { language: Language; selected: SemanticToken }) {
  return (
    <UsageCard selected={selected} state="ideal" usages={[previewCommonUsage.importSummaryPanel]}>
      <UsageTarget selected={selected} usage={previewCommonUsage.importSummaryPanel}>
        <ImportSummary convertedColorCount={2} language={language} modePairCount={1} summary={importSummaryFixture} />
      </UsageTarget>
    </UsageCard>
  )
}

function IdealPreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <UsageCard selected={selected} state="ideal">
      <UsageTarget selected={selected} usage={idealUsage.title}>
        <SectionTitle>{t.importColors}</SectionTitle>
      </UsageTarget>
      <UsageTarget selected={selected} usage={idealUsage.helper}>
        <HelperText>{t.jsonHelp}</HelperText>
      </UsageTarget>
      <div className="flex flex-wrap gap-2">
        <UsageTarget selected={selected} usage={idealUsage.primaryButton}>
          <ActionButton>{t.import}</ActionButton>
        </UsageTarget>
        <UsageTarget selected={selected} usage={idealUsage.secondaryButton}>
          <ActionButton color="secondary" variant="solid">
            {t.preview}
          </ActionButton>
        </UsageTarget>
        <UsageTarget selected={selected} usage={idealUsage.neutralButton}>
          <ActionButton color="neutral" variant="outline">
            {t.cancel}
          </ActionButton>
        </UsageTarget>
      </div>
      <UsageTarget selected={selected} usage={idealUsage.select}>
        <SelectControl defaultValue="replace" aria-label="Import mode">
          <option value="replace">Replace</option>
          <option value="skip">Skip</option>
        </SelectControl>
      </UsageTarget>
      <UsageTarget selected={selected} usage={idealUsage.dialog}>
        <DialogPanel>
          <SectionTitle>{t.importComplete}</SectionTitle>
          <HelperText className="mt-2">{t.importCompleteBody}</HelperText>
          <DialogActions>
            <ActionButton color="neutral" variant="outline">
              {t.close}
            </ActionButton>
            <ActionButton>{messages[language].ok}</ActionButton>
          </DialogActions>
        </DialogPanel>
      </UsageTarget>
    </UsageCard>
  )
}

function EmptyPreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <UsageCard selected={selected} state="empty">
      <UsageTarget selected={selected} usage={emptyUsage.helper}>
        <HelperText>{t.noJson}</HelperText>
      </UsageTarget>
      <div className="flex flex-wrap gap-2">
        <UsageTarget selected={selected} usage={emptyUsage.uploadButton}>
          <FileButton accept="application/json,.json" color="primary" size="md" variant="solid" onChange={() => {}}>
            {t.uploadJson}
          </FileButton>
        </UsageTarget>
        <UsageTarget selected={selected} usage={emptyUsage.pasteButton}>
          <ActionButton color="secondary" icon={<Upload />} iconPosition="left" variant="outline">
            {t.paste}
          </ActionButton>
        </UsageTarget>
      </div>
    </UsageCard>
  )
}

function LoadingPreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <UsageCard selected={selected} state="loading">
      <UsageTarget selected={selected} usage={loadingUsage.label}>
        <div className="text-[12px] text-text-muted">{t.checkingJson}</div>
      </UsageTarget>
      <div className="flex flex-wrap gap-2">
        <UsageTarget selected={selected} usage={loadingUsage.loadingButton}>
          <ActionButton loading>{t.importing}</ActionButton>
        </UsageTarget>
        <UsageTarget selected={selected} usage={loadingUsage.disabledButton}>
          <ActionButton disabled>{t.waiting}</ActionButton>
        </UsageTarget>
      </div>
    </UsageCard>
  )
}

function PartialPreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <UsageCard selected={selected} state="partial">
      <UsageTarget selected={selected} usage={partialUsage.message}>
        <MessageBox tone="warning">{t.partialMessage}</MessageBox>
      </UsageTarget>
      <div className="flex flex-wrap gap-2">
        <UsageTarget selected={selected} usage={partialUsage.reviewButton}>
          <ActionButton variant="outline">{t.review}</ActionButton>
        </UsageTarget>
        <UsageTarget selected={selected} usage={partialUsage.skipButton}>
          <ActionButton variant="ghost">{t.skipWarnings}</ActionButton>
        </UsageTarget>
      </div>
      <UsageTarget selected={selected} usage={partialUsage.diagnosticSummary}>
        <div className="inline-flex max-w-full items-center gap-1 self-start rounded-full border border-border-brand bg-surface-warning px-2.5 py-1 text-[11px] leading-none text-text-default">
          <span className="shrink-0 font-normal">12</span>
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{t.missingValue}</span>
        </div>
      </UsageTarget>
    </UsageCard>
  )
}

function ErrorPreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <UsageCard selected={selected} state="error">
      <UsageTarget selected={selected} usage={errorUsage.message}>
        <MessageBox tone="danger">{t.jsonError}</MessageBox>
      </UsageTarget>
      <div className="flex flex-wrap gap-2">
        <UsageTarget selected={selected} usage={errorUsage.retryButton}>
          <ActionButton color="danger" variant="solid">
            {t.retry}
          </ActionButton>
        </UsageTarget>
        <UsageTarget selected={selected} usage={errorUsage.removeButton}>
          <ActionButton color="danger" variant="outline">
            {t.remove}
          </ActionButton>
        </UsageTarget>
      </div>
      <UsageTarget selected={selected} usage={[errorUsage.overlay, errorUsage.dialogPreview]}>
        <div className="relative h-24 overflow-hidden rounded-[6px] border border-border-muted bg-surface-base">
          <div className="absolute inset-0 bg-overlay-default" />
          <div className="absolute inset-x-4 top-4 rounded-[6px] border border-border-muted bg-surface-base p-3 text-[12px] text-text-default">
            {t.dialogBackdrop}
          </div>
        </div>
      </UsageTarget>
    </UsageCard>
  )
}

function SharedComponentsPreview({ language, selected }: { language: Language; selected: SemanticToken }) {
  const t = semanticMapCopy[language]

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="m-0 text-[16px] font-normal leading-tight text-text-default">{t.sharedTitle}</h2>
        <p className="m-0 mt-1 text-[12px] leading-relaxed text-text-subtle">
          {t.sharedDescription}
        </p>
      </div>
      <ThemeSummaryColumns>
        {() => (
          <div className="grid gap-3">
            <IdealPreview language={language} selected={selected} />
            <EmptyPreview language={language} selected={selected} />
            <LoadingPreview language={language} selected={selected} />
            <PartialPreview language={language} selected={selected} />
            <ErrorPreview language={language} selected={selected} />
          </div>
        )}
      </ThemeSummaryColumns>
    </section>
  )
}

type SemanticUsageMapProps = {
  language?: Language
  sections?: SemanticUsageSection[]
  selectedSemantic: SemanticToken
}

function SemanticUsageMap({ language = "ja", selectedSemantic, sections = ["shared"] }: SemanticUsageMapProps) {
  const [selected, setSelected] = useState<SemanticToken>(selectedSemantic)
  const visibleSections = useMemo(() => new Set(sections), [sections])
  const storyUsageMetadata = useMemo(() => usageMetadataForSections(sections), [sections])
  const availableTokens = useMemo(() => semanticTokensForUsages(storyUsageMetadata), [storyUsageMetadata])

  useEffect(() => {
    const fallbackToken = semanticOptions.find(token => availableTokens.has(token)) ?? selectedSemantic
    setSelected(availableTokens.has(selectedSemantic) ? selectedSemantic : fallbackToken)
  }, [availableTokens, selectedSemantic])

  return (
    <div className="flex max-w-[1180px] flex-col gap-6">
      <style>{`
        .semantic-usage-target {
          transition: box-shadow 150ms ease, background-color 150ms ease;
        }

        .semantic-usage-target-active {
          box-shadow: 0 0 0 2px oklch(70.4% 0.14 182.503);
          background-color: color-mix(in oklch, oklch(70.4% 0.14 182.503) 12%, transparent);
        }
      `}</style>
      <section className="flex flex-col gap-3">
        <h1 className="m-0 text-[22px] font-normal leading-tight text-text-default">Semantic Usage Map</h1>
        <SemanticSelector availableTokens={availableTokens} selected={selected} onSelect={setSelected} />
        <SemanticReferencePanel selected={selected} />
        <SemanticUsageTable selected={selected} usages={storyUsageMetadata} />
      </section>
      {visibleSections.has("page1") ? <EditorPagePreview language={language} selected={selected} /> : null}
      {visibleSections.has("page2") ? <PreviewPagePreview language={language} selected={selected} /> : null}
      {visibleSections.has("shared") ? <SharedComponentsPreview language={language} selected={selected} /> : null}
    </div>
  )
}

const meta = {
  title: "Tokens/Semantic Usage Map",
  component: SemanticUsageMap,
  args: {
    language: "ja",
    sections: ["shared"],
    selectedSemantic: "surface.brand",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
    sections: {
      table: { disable: true },
    },
    selectedSemantic: {
      control: "select",
      options: semanticOptions,
    },
  },
  parameters: {
    hideThemeToggle: true,
  },
} satisfies Meta<typeof SemanticUsageMap>

export default meta
type Story = StoryObj<typeof meta>

export const UiComponents: Story = {
  render: (args, context) => <SemanticUsageMap {...args} language={getStoryLanguage(context.globals)} />,
}

export const Page1Editor: Story = {
  args: {
    sections: ["page1"],
    selectedSemantic: "code.key",
  },
  render: (args, context) => <SemanticUsageMap {...args} language={getStoryLanguage(context.globals)} />,
}

export const Page2Preview: Story = {
  args: {
    sections: ["page2"],
    selectedSemantic: "preview.new-token-accent",
  },
  render: (args, context) => <SemanticUsageMap {...args} language={getStoryLanguage(context.globals)} />,
}
