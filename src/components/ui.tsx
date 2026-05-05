import type {
  ButtonHTMLAttributes,
  ChangeEventHandler,
  HTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react"
import { useRef } from "react"

type ClassValue = string | false | null | undefined

export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ")
}

const buttonBaseClass = cx(
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border font-normal leading-[1.2] transition-colors",
  "disabled:cursor-not-allowed"
)

const buttonSizeClass = {
  sm: "min-h-[34px] px-3 py-2 text-sm",
  md: "h-[30px] min-h-[30px] px-3 py-0 text-ui-control",
} as const

const actionVariantClass = {
  solid:
    "w-full border-transparent bg-accent-primary text-accent-foreground hover:bg-accent-primary-hover active:bg-accent-primary-hover disabled:bg-accent-primary-disabled disabled:text-[color:var(--color-accent-foreground-disabled)] disabled:hover:bg-accent-primary-disabled",
  outline:
    "border-border-default bg-transparent text-text-secondary hover:bg-surface-panel active:bg-surface-panel disabled:border-border-muted disabled:text-text-muted disabled:hover:bg-transparent",
  danger:
    "border-transparent bg-status-error text-white hover:opacity-90 active:opacity-100 disabled:opacity-40",
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
type ButtonSize = keyof typeof buttonSizeClass

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  variant?: ActionButtonVariant
}

export function ActionButton({ className, size = "sm", type = "button", variant = "solid", ...buttonProps }: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonBaseClass, buttonSizeClass[size], actionVariantClass[variant], className)}
      {...buttonProps}
    />
  )
}

interface FileButtonProps {
  accept: string
  children: ReactNode
  className?: string
  onChange: ChangeEventHandler<HTMLInputElement>
  size?: ButtonSize
}

export function FileButton({ accept, children, className, onChange, size = "sm" }: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <span className="inline-flex">
      <button
        type="button"
        className={cx(
          "inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full",
          "border border-border-default bg-transparent font-normal leading-[1.2] text-text-secondary transition-colors hover:bg-surface-panel active:bg-surface-panel",
          buttonSizeClass[size],
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
