import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Plus } from "lucide-react"
import { Fragment } from "react"
import type { Language } from "../../app/i18n.ts"
import { ActionButton, FileButton } from "../../components/ui.tsx"
import { getStoryLanguage, PluginPreviewFrame, ThemeSummaryColumns } from "../fixtures/storyLayout.tsx"

type ButtonColor = "primary" | "secondary" | "danger" | "neutral"
type ButtonIcon = "none" | "left" | "right" | "only"
type ButtonSize = "sm" | "md" | "lg"
type ButtonState = "default" | "disabled" | "loading"
type ButtonVariant = "solid" | "outline" | "ghost" | "text" | "danger"

const buttonStoryLabels: Record<Language, {
  import: string
  importing: string
  reload: string
  remove: string
  upload: string
}> = {
  en: {
    import: "Import Color Styles",
    importing: "Importing...",
    reload: "Reload",
    remove: "Remove",
    upload: "Upload JSON File",
  },
  ja: {
    import: "カラースタイルをインポート",
    importing: "インポート中...",
    reload: "再読み込み",
    remove: "削除",
    upload: "JSONファイルをアップロード",
  },
}

const playgroundOptions = {
  color: ["primary", "secondary", "danger", "neutral"] as const,
  icon: ["none", "left", "right", "only"] as const,
  size: ["sm", "md", "lg"] as const,
  state: ["default", "disabled", "loading"] as const,
  variant: ["solid", "outline", "ghost", "text", "danger"] as const,
}

function ButtonStory({
  color,
  icon,
  label,
  language,
  size,
  state,
  variant,
}: {
  color: ButtonColor
  icon: ButtonIcon
  label: string
  language: Language
  size: ButtonSize
  state: ButtonState
  variant: ButtonVariant
}) {
  const resolvedLabel = label || buttonStoryLabels[language].import
  const iconNode = icon === "none" ? undefined : <Plus />
  const iconPosition = icon === "none" ? undefined : icon

  return (
    <PluginPreviewFrame>
      <ActionButton
        aria-label={icon === "only" ? resolvedLabel : undefined}
        color={color}
        disabled={state === "disabled"}
        icon={iconNode}
        iconPosition={iconPosition}
        loading={state === "loading"}
        size={size}
        variant={variant}
      >
        {icon === "only" ? null : resolvedLabel}
      </ActionButton>
    </PluginPreviewFrame>
  )
}

function PlaygroundChip({ active, children }: { active: boolean; children: string }) {
  return (
    <span
      className={[
        "inline-flex min-h-[26px] items-center rounded-full border px-3 text-xs font-normal leading-none",
        active
          ? "border-text-primary bg-text-primary text-surface-canvas"
          : "border-border-muted bg-transparent text-text-secondary",
      ].join(" ")}
    >
      {children}
    </span>
  )
}

function PlaygroundGroup<T extends string>({
  label,
  options,
  value,
}: {
  label: string
  options: readonly T[]
  value: T
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <PlaygroundChip active={option === value} key={option}>
            {option}
          </PlaygroundChip>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: "Components/Button",
  component: ButtonStory,
  args: {
    color: "primary",
    icon: "none",
    label: "",
    language: "ja",
    size: "md",
    state: "default",
    variant: "solid",
  },
  argTypes: {
    language: {
      table: { disable: true },
    },
    label: {
      control: "text",
    },
    size: {
      control: "select",
      options: playgroundOptions.size,
    },
    variant: {
      control: "select",
      options: playgroundOptions.variant,
    },
    color: {
      control: "select",
      options: playgroundOptions.color,
    },
    state: {
      control: "select",
      options: playgroundOptions.state,
    },
    icon: {
      control: "select",
      options: playgroundOptions.icon,
    },
  },
} satisfies Meta<typeof ButtonStory>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args, context) => {
    const language = getStoryLanguage(context.globals)
    const label = args.label || buttonStoryLabels[language].import
    const iconNode = args.icon === "none" ? undefined : <Plus />
    const iconPosition = args.icon === "none" ? undefined : args.icon

    return (
      <div className="w-full rounded border border-border-muted bg-surface-canvas p-6 shadow-sm">
        <div className="mb-6 text-[11px] uppercase tracking-widest text-text-muted">Playground</div>
        <div className="grid gap-6 md:grid-cols-[minmax(180px,240px)_1fr]">
          <div className="flex flex-col gap-5">
            <PlaygroundGroup label="Variant" options={playgroundOptions.variant} value={args.variant} />
            <PlaygroundGroup label="Color" options={playgroundOptions.color} value={args.color} />
            <PlaygroundGroup label="Size" options={playgroundOptions.size} value={args.size} />
            <PlaygroundGroup label="State" options={playgroundOptions.state} value={args.state} />
            <PlaygroundGroup label="Icon" options={playgroundOptions.icon} value={args.icon} />
          </div>
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-5 rounded bg-surface-panel p-6">
            <span className="text-[10px] uppercase tracking-widest text-text-muted">Preview</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ActionButton
                aria-label={args.icon === "only" ? label : undefined}
                color={args.color}
                disabled={args.state === "disabled"}
                icon={iconNode}
                iconPosition={iconPosition}
                loading={args.state === "loading"}
                size={args.size}
                variant={args.variant}
              >
                {args.icon === "only" ? null : label}
              </ActionButton>
              <ActionButton color={args.color} icon={<Plus />} iconPosition="left" size={args.size} variant={args.variant}>
                Add
              </ActionButton>
              <ActionButton color={args.color} icon={<ArrowRight />} iconPosition="right" size={args.size} variant={args.variant}>
                Next
              </ActionButton>
              <ActionButton aria-label="Add" color={args.color} icon={<Plus />} iconPosition="only" size={args.size} variant={args.variant} />
              <ActionButton color={args.color} disabled size={args.size} variant={args.variant}>
                Disabled
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const Summary: Story = {
  parameters: {
    hideThemeToggle: true,
  },
  render: (_args, context) => {
    const labels = buttonStoryLabels[getStoryLanguage(context.globals)]

    return (
      <ThemeSummaryColumns>
        {() => (
          <PluginPreviewFrame>
            <div className="flex flex-col gap-3">
              <ActionButton size="md">{labels.import}</ActionButton>
              <div className="flex flex-wrap items-center gap-3">
                <FileButton accept="application/json,.json" color="primary" size="md" variant="solid" onChange={() => {}}>
                  {labels.upload}
                </FileButton>
                <ActionButton size="md" variant="outline">
                  {labels.reload}
                </ActionButton>
              </div>
              <ActionButton disabled size="md">
                {labels.importing}
              </ActionButton>
              <ActionButton color="danger" size="sm" variant="solid">
                {labels.remove}
              </ActionButton>
            </div>
          </PluginPreviewFrame>
        )}
      </ThemeSummaryColumns>
    )
  },
}

export const PrimaryImport: Story = {
  render: (args, context) => <ButtonStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const OutlineReload: Story = {
  args: {
    color: "neutral",
    variant: "outline",
  },
  render: (args, context) => (
    <ButtonStory
      {...args}
      label={buttonStoryLabels[getStoryLanguage(context.globals)].reload}
      language={getStoryLanguage(context.globals)}
    />
  ),
}

export const Disabled: Story = {
  args: {
    state: "disabled",
  },
  render: (args, context) => <ButtonStory {...args} language={getStoryLanguage(context.globals)} />,
}

export const VariantColorMatrix: Story = {
  render: () => {
    const label = "Button"
    const colors = ["primary", "secondary", "danger", "neutral"] as const
    const variants = ["solid", "outline", "ghost", "text"] as const

    return (
      <div className="w-full overflow-x-auto rounded border border-border-muted bg-surface-canvas p-4 shadow-sm">
        <div className="grid min-w-[560px] grid-cols-[88px_repeat(4,104px)] items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-text-muted">Color</span>
          {variants.map(variant => (
            <span className="text-center text-[10px] uppercase tracking-widest text-text-muted" key={variant}>
              {variant}
            </span>
          ))}
          {colors.map(color => (
            <Fragment key={color}>
              <span className="text-xs text-text-secondary" key={`${color}-label`}>
                {color}
              </span>
              {variants.map(variant => (
                <ActionButton className="justify-self-center" color={color} key={`${color}-${variant}`} size="md" variant={variant}>
                  {label}
                </ActionButton>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    )
  },
}

export const IconsAndLoading: Story = {
  render: (_args, context) => {
    const labels = buttonStoryLabels[getStoryLanguage(context.globals)]

    return (
      <PluginPreviewFrame>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton icon={<Plus />} iconPosition="left" size="md">
            {labels.import}
          </ActionButton>
          <ActionButton color="neutral" icon={<ArrowRight />} iconPosition="right" size="md" variant="outline">
            {labels.reload}
          </ActionButton>
          <ActionButton aria-label={labels.import} icon={<Plus />} iconPosition="only" size="md" />
          <ActionButton loading size="md">
            {labels.importing}
          </ActionButton>
        </div>
      </PluginPreviewFrame>
    )
  },
}

export const FileUpload: Story = {
  render: (_args, context) => (
    <PluginPreviewFrame>
      <FileButton accept="application/json,.json" color="primary" size="md" variant="solid" onChange={() => {}}>
        {buttonStoryLabels[getStoryLanguage(context.globals)].upload}
      </FileButton>
    </PluginPreviewFrame>
  ),
}
