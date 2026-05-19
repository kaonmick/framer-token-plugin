import type { Meta, StoryObj } from "@storybook/react-vite"

const primitiveGroups = [
  {
    name: "Neutral",
    tokens: ["neutral-50", "neutral-100", "neutral-200", "neutral-300", "neutral-400", "neutral-500", "neutral-600", "neutral-700", "neutral-800", "neutral-900"],
  },
  {
    name: "Functional",
    tokens: ["red-400", "red-700", "yellow-300", "yellow-500", "green-700", "sky-300", "sky-700"],
  },
]

const semanticTokens = [
  { name: "surface.base", cssVar: "--surface-base" },
  { name: "surface.subtle", cssVar: "--surface-subtle" },
  { name: "surface.diagnostic", cssVar: "--surface-diagnostic" },
  { name: "surface.gutter", cssVar: "--surface-gutter" },
  { name: "surface.warning", cssVar: "--surface-warning" },
  { name: "surface.danger", cssVar: "--surface-danger" },
  { name: "elevated.default", cssVar: "--elevated-default" },
  { name: "overlay.default", cssVar: "--overlay-default" },
  { name: "text.default", cssVar: "--text-default" },
  { name: "text.subtle", cssVar: "--text-subtle" },
  { name: "text.on-brand", cssVar: "--text-on-brand" },
  { name: "text.danger", cssVar: "--text-danger" },
  { name: "border.default", cssVar: "--border-default" },
  { name: "border.brand", cssVar: "--border-brand" },
  { name: "border.danger", cssVar: "--border-danger" },
  { name: "surface.brand", cssVar: "--surface-brand" },
  { name: "code.placeholder", cssVar: "--code-placeholder" },
]

function TokenCatalog() {
  return (
    <div className="flex max-w-[920px] flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="m-0 text-[24px] leading-tight font-normal text-text-default">Token catalog</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {primitiveGroups.map(group => (
            <PrimitiveGroup key={group.name} name={group.name} tokens={group.tokens} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[18px] leading-tight font-normal text-text-default">Semantic tokens</h2>
        <div className="overflow-hidden rounded-[4px] border border-border-muted bg-surface-subtle">
          {semanticTokens.map(token => (
            <SemanticRow key={token.name} name={token.name} cssVar={token.cssVar} />
          ))}
        </div>
      </section>
    </div>
  )
}

function PrimitiveGroup({ name, tokens }: { name: string; tokens: string[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-[4px] border border-border-muted bg-surface-subtle p-4">
      <h2 className="m-0 text-[16px] leading-tight font-normal text-text-default">{name}</h2>
      <div className="grid grid-cols-2 gap-2">
        {tokens.map(token => (
          <Swatch key={token} label={token} color={`var(--color-${token})`} />
        ))}
      </div>
    </section>
  )
}

function SemanticRow({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_96px_minmax(120px,1fr)] items-center gap-3 border-b border-border-muted px-4 py-3 last:border-b-0">
      <span className="min-w-0 truncate text-[13px] leading-none text-text-default" lang="en">
        {name}
      </span>
      <span className="size-8 rounded-full border border-border-default" style={{ backgroundColor: `var(${cssVar})` }} aria-hidden="true" />
      <code className="min-w-0 truncate font-['Fira_Code',monospace] text-[12px] leading-none text-text-subtle">{cssVar}</code>
    </div>
  )
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[4px] bg-surface-base p-2">
      <span className="size-6 shrink-0 rounded-full border border-border-default" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="min-w-0 truncate text-[12px] leading-none text-text-subtle" lang="en">
        {label}
      </span>
    </div>
  )
}

const meta = {
  title: "Tokens/Token Catalog",
  component: TokenCatalog,
} satisfies Meta<typeof TokenCatalog>

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {}
