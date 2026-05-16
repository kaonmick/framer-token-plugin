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
  { name: "surface.canvas", cssVar: "--surface-canvas" },
  { name: "surface.panel", cssVar: "--surface-panel" },
  { name: "text.primary", cssVar: "--text-primary" },
  { name: "text.secondary", cssVar: "--text-secondary" },
  { name: "border.default", cssVar: "--border-default" },
  { name: "accent.primary", cssVar: "--accent-primary" },
  { name: "status.warning", cssVar: "--status-warning" },
  { name: "status.error", cssVar: "--status-error" },
]

function TokenCatalog() {
  return (
    <div className="flex max-w-[920px] flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="m-0 text-[24px] leading-tight font-normal text-text-primary">Token catalog</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {primitiveGroups.map(group => (
            <PrimitiveGroup key={group.name} name={group.name} tokens={group.tokens} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[18px] leading-tight font-normal text-text-primary">Semantic tokens</h2>
        <div className="overflow-hidden rounded-[4px] border border-border-muted bg-surface-panel">
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
    <section className="flex flex-col gap-3 rounded-[4px] border border-border-muted bg-surface-panel p-4">
      <h2 className="m-0 text-[16px] leading-tight font-normal text-text-primary">{name}</h2>
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
      <span className="min-w-0 truncate text-[13px] leading-none text-text-primary" lang="en">
        {name}
      </span>
      <span className="size-8 rounded-full border border-border-default" style={{ backgroundColor: `var(${cssVar})` }} aria-hidden="true" />
      <code className="min-w-0 truncate font-['Fira_Code',monospace] text-[12px] leading-none text-text-secondary">{cssVar}</code>
    </div>
  )
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[4px] bg-surface-canvas p-2">
      <span className="size-6 shrink-0 rounded-full border border-border-default" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="min-w-0 truncate text-[12px] leading-none text-text-secondary" lang="en">
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
