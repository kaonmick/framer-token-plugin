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
      "border-transparent bg-surface-brand text-text-on-brand hover:bg-surface-brand-hover active:bg-surface-brand-hover disabled:bg-surface-brand disabled:text-text-on-brand disabled:opacity-40 disabled:hover:bg-surface-brand",
    outline:
      "border-border-brand bg-transparent text-text-default hover:bg-[color:color-mix(in_srgb,var(--color-surface-brand)_40%,transparent)] active:bg-[color:color-mix(in_srgb,var(--color-surface-brand)_40%,transparent)] disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-default hover:bg-[color:color-mix(in_srgb,var(--color-surface-brand)_40%,transparent)] active:bg-[color:color-mix(in_srgb,var(--color-surface-brand)_40%,transparent)] disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-default hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
  secondary: {
    solid:
      "border-transparent bg-surface-subtle text-text-default hover:bg-surface-muted active:bg-surface-muted disabled:bg-surface-subtle disabled:text-text-muted disabled:hover:bg-surface-subtle",
    outline:
      "border-border-muted bg-transparent text-text-subtle hover:bg-surface-subtle active:bg-surface-subtle disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-subtle hover:bg-surface-subtle active:bg-surface-subtle disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-subtle hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
  danger: {
    solid:
      "border-transparent bg-surface-danger text-text-default hover:opacity-90 active:opacity-100 disabled:bg-surface-danger disabled:text-text-default disabled:opacity-40",
    outline:
      "border-border-danger bg-transparent text-text-danger hover:bg-elevated-default active:bg-elevated-default disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-danger hover:bg-elevated-default active:bg-elevated-default disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-danger hover:underline active:underline disabled:text-text-muted disabled:no-underline",
  },
  neutral: {
    solid:
      "border-transparent bg-text-default text-surface-base hover:opacity-90 active:opacity-100 disabled:bg-surface-muted disabled:text-text-muted disabled:hover:opacity-100",
    outline:
      "border-border-strong bg-transparent text-text-default hover:bg-surface-subtle active:bg-surface-subtle disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
    ghost:
      "border-transparent bg-transparent text-text-default hover:bg-surface-subtle active:bg-surface-subtle disabled:text-text-muted disabled:hover:bg-transparent",
    text:
      "border-transparent bg-transparent px-0 text-text-default hover:underline active:underline disabled:text-text-muted disabled:no-underline",
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
  "after:border-text-default after:content-['']"
)
const selectClass = cx(
  "h-8 min-h-8 w-full cursor-pointer appearance-none rounded-full border border-border-default",
  "bg-surface-base px-2 pr-7 text-xs text-text-default"
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
    <h2 className={cx("m-0 text-base font-normal leading-tight text-text-default", className)} {...headingProps}>
      {children}
    </h2>
  )
}

export function HelperText({ children, className, ...paragraphProps }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx("m-0 text-xs leading-relaxed text-text-subtle", className)} {...paragraphProps}>
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
      ? "whitespace-pre-line border border-border-muted bg-elevated-default text-text-danger"
      : "border border-border-muted bg-elevated-default text-text-default"

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
      className="fixed inset-0 z-10 flex items-center justify-center bg-overlay-default p-4"
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
      className={cx("w-full max-w-[360px] rounded border border-border-muted bg-surface-base p-3.5 text-text-default shadow-2xl", className)}
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
