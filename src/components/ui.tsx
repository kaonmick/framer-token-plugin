import type {
  ButtonHTMLAttributes,
  ChangeEventHandler,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
} from "react"
import { cloneElement, useRef } from "react"
import { LoaderCircle } from "lucide-react"

type ClassValue = string | false | null | undefined

export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ")
}

const buttonBaseClass = cx(
  "inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-full border font-normal leading-none outline-none transition-all duration-150",
  "active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [outline-color:var(--color-border-focus)]"
)

const buttonSizeClass = {
  sm: "min-h-[26px] gap-1.5 px-3 py-1.5 text-xs",
  md: "min-h-8 gap-2 px-3.5 py-2 text-sm",
  lg: "min-h-[38px] gap-2.5 px-5 py-2.5 text-base",
} as const

const iconOnlySizeClass = {
  sm: "size-[26px] p-[5px] text-xs",
  md: "size-8 p-[7px] text-sm",
  lg: "size-[38px] p-[9px] text-base",
} as const

const iconSize = {
  sm: 12,
  md: 14,
  lg: 16,
} as const

const iconOnlySize = {
  sm: 14,
  md: 16,
  lg: 18,
} as const

const buttonToneClass = {
  primary: {
    solid:
      "border-transparent bg-accent-primary text-accent-foreground hover:bg-accent-primary-hover active:bg-accent-primary-hover disabled:bg-accent-primary-disabled disabled:text-[color:var(--color-accent-foreground-disabled)] disabled:hover:bg-accent-primary-disabled",
    outline:
      "border-accent-primary bg-transparent text-text-accent hover:bg-status-warning-ghost active:bg-status-warning-ghost disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-accent hover:bg-status-warning-ghost active:bg-status-warning-ghost disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-accent hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
  secondary: {
    solid:
      "border-transparent bg-surface-panel text-text-primary hover:bg-surface-muted active:bg-surface-muted disabled:bg-surface-panel disabled:text-text-muted disabled:hover:bg-surface-panel",
    outline:
      "border-border-muted bg-transparent text-text-secondary hover:bg-surface-panel active:bg-surface-panel disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-secondary hover:bg-surface-panel active:bg-surface-panel disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-secondary hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
  danger: {
    solid:
      "border-transparent bg-status-error text-white hover:opacity-90 active:opacity-100 disabled:bg-status-error disabled:text-white disabled:opacity-40",
    outline:
      "border-status-error bg-transparent text-status-error hover:bg-status-error-surface active:bg-status-error-surface disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-status-error hover:bg-status-error-surface active:bg-status-error-surface disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-status-error hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
  neutral: {
    solid:
      "border-transparent bg-text-primary text-surface-canvas hover:opacity-90 active:opacity-100 disabled:bg-surface-muted disabled:text-text-muted disabled:hover:opacity-100",
    outline:
      "border-border-strong bg-transparent text-text-primary hover:bg-surface-panel active:bg-surface-panel disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-primary hover:bg-surface-panel active:bg-surface-panel disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-primary hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
} as const

const actionVariantClass = {
  solid: buttonToneClass.primary.solid,
  outline: buttonToneClass.secondary.outline,
  ghost: buttonToneClass.secondary.ghost,
  text: buttonToneClass.neutral.text,
  danger: buttonToneClass.danger.solid,
} as const

const selectWrapClass = cx(
  "relative inline-flex min-w-[116px]",
  "after:pointer-events-none after:absolute after:right-2.5 after:top-1/2 after:size-[7px]",
  "after:-translate-y-[65%] after:rotate-45 after:border-b-[1.5px] after:border-r-[1.5px]",
  "after:border-text-primary after:content-['']"
)
const selectClass = cx(
  "h-8 min-h-8 w-full cursor-pointer appearance-none rounded-full border border-border-default",
  "bg-surface-canvas px-2 pr-7 text-xs text-text-primary"
)

export const tokenTextClass = "block min-w-0 max-w-full overflow-hidden truncate"

type ActionButtonVariant = keyof typeof actionVariantClass
type ButtonColor = keyof typeof buttonToneClass
type ButtonStyleVariant = keyof (typeof buttonToneClass)["primary"]
type ButtonSize = keyof typeof buttonSizeClass
type IconPosition = "left" | "right" | "only"

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor
  icon?: ReactElement
  iconPosition?: IconPosition
  loading?: boolean
  size?: ButtonSize
  variant?: ActionButtonVariant
}

function resolveButtonStyle(variant: ActionButtonVariant, color: ButtonColor): {
  color: ButtonColor
  variant: ButtonStyleVariant
} {
  if (variant === "danger") return { color: "danger", variant: "solid" }
  return { color, variant }
}

function renderButtonIcon(icon: ReactElement | undefined, size: number, loading: boolean) {
  if (loading) return <LoaderCircle aria-hidden="true" className="animate-spin" size={size} />
  if (!icon) return null
  return cloneElement(icon, { "aria-hidden": true, size })
}

export function ActionButton({
  children,
  className,
  color = "primary",
  disabled,
  icon,
  iconPosition,
  loading = false,
  size = "sm",
  type = "button",
  variant = "solid",
  ...buttonProps
}: ActionButtonProps) {
  const isIconOnly = iconPosition === "only"
  const resolved = resolveButtonStyle(variant, color)
  const resolvedIcon = renderButtonIcon(icon, isIconOnly ? iconOnlySize[size] : iconSize[size], loading)
  const shouldShowLeadingIcon = Boolean(resolvedIcon) && (iconPosition === "left" || loading)
  const shouldShowTrailingIcon = Boolean(resolvedIcon) && iconPosition === "right" && !loading

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        buttonBaseClass,
        isIconOnly ? iconOnlySizeClass[size] : buttonSizeClass[size],
        buttonToneClass[resolved.color][resolved.variant],
        className
      )}
      {...buttonProps}
    >
      {isIconOnly ? (
        resolvedIcon
      ) : (
        <>
          {shouldShowLeadingIcon ? resolvedIcon : null}
          {children ? <span className="whitespace-nowrap">{children}</span> : null}
          {shouldShowTrailingIcon ? resolvedIcon : null}
        </>
      )}
    </button>
  )
}

interface FileButtonProps {
  accept: string
  children: ReactNode
  className?: string
  color?: ButtonColor
  onChange: ChangeEventHandler<HTMLInputElement>
  size?: ButtonSize
  variant?: ActionButtonVariant
}

export function FileButton({
  accept,
  children,
  className,
  color = "secondary",
  onChange,
  size = "sm",
  variant = "outline",
}: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const resolved = resolveButtonStyle(variant, color)

  return (
    <span className="inline-flex">
      <button
        type="button"
        className={cx(
          buttonBaseClass,
          buttonSizeClass[size],
          buttonToneClass[resolved.color][resolved.variant],
          "overflow-hidden",
          className
        )}
        onClick={() => {
          const input = inputRef.current
          if (!input) return
          input.value = ""
          input.click()
        }}
      >
        {children}
      </button>
      <input ref={inputRef} className="sr-only" type="file" accept={accept} onChange={onChange} tabIndex={-1} />
    </span>
  )
}

export function SelectControl({ children, className, ...selectProps }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cx(selectWrapClass, className)}>
      <select className={selectClass} {...selectProps}>
        {children}
      </select>
    </span>
  )
}

export function SectionTitle({ children, className, ...headingProps }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cx("m-0 text-base font-normal leading-tight text-text-primary", className)} {...headingProps}>
      {children}
    </h2>
  )
}

export function HelperText({ children, className, ...paragraphProps }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx("m-0 text-xs leading-relaxed text-text-secondary", className)} {...paragraphProps}>
      {children}
    </p>
  )
}

interface MessageBoxProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  tone: "danger" | "warning"
}

export function MessageBox({ children, className, tone, ...sectionProps }: MessageBoxProps) {
  const toneClass =
    tone === "danger"
      ? "whitespace-pre-line border border-status-error bg-status-error-surface text-status-error"
      : "border border-status-warning bg-status-warning-surface text-status-warning"

  return (
    <section className={cx("rounded p-2.5 text-xs leading-relaxed", toneClass, className)} {...sectionProps}>
      {children}
    </section>
  )
}

export function DialogBackdrop({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-[color:color-mix(in_srgb,var(--color-surface-raised)_70%,transparent)] p-4"
      role="presentation"
      onClick={event => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      {children}
    </div>
  )
}

export function DialogPanel({ children, className, ...sectionProps }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cx("w-full max-w-[360px] rounded border border-border-muted bg-surface-canvas p-3.5 text-text-primary shadow-2xl", className)}
      {...sectionProps}
    >
      {children}
    </section>
  )
}

export function DialogActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "mt-3.5 grid grid-cols-2 gap-2 [&_button]:min-w-0 [&_button]:w-full [&_button]:[overflow-wrap:anywhere]",
        className
      )}
    >
      {children}
    </div>
  )
}
