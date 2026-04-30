import type {
  ButtonHTMLAttributes,
  ChangeEventHandler,
  HTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react"

type ClassValue = string | false | null | undefined

export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ")
}

const focusRingClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
const formFocusRingClass = "focus:outline-2 focus:outline-offset-2 focus:outline-yellow-300"
const buttonBaseClass = cx(
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border font-normal leading-[1.2] transition-colors",
  "disabled:cursor-not-allowed",
  focusRingClass
)

const buttonSizeClass = {
  sm: "min-h-[34px] px-3 py-2 text-sm",
  md: "h-[30px] min-h-[30px] px-3 py-0 text-ui-control",
} as const

const actionVariantClass = {
  solid:
    "w-full border-transparent bg-yellow-300 text-neutral-800 hover:bg-yellow-500 active:bg-yellow-500 disabled:bg-yellow-300/35 disabled:text-[rgba(26,26,26,0.5)] disabled:hover:bg-yellow-300/35",
  outline:
    "border-neutral-200 bg-transparent text-neutral-200 hover:bg-neutral-700 active:bg-neutral-700 disabled:border-neutral-600 disabled:text-neutral-500 disabled:hover:bg-transparent",
  danger:
    "border-transparent bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-600/35 disabled:text-white/50 disabled:hover:bg-red-600/35",
} as const

const selectWrapClass = cx(
  "relative inline-flex min-w-[116px]",
  "after:pointer-events-none after:absolute after:right-2.5 after:top-1/2 after:size-[7px]",
  "after:-translate-y-[65%] after:rotate-45 after:border-b-[1.5px] after:border-r-[1.5px]",
  "after:border-neutral-100 after:content-['']"
)
const selectClass = cx(
  "h-8 min-h-8 w-full cursor-pointer appearance-none rounded-full border border-neutral-200",
  "bg-neutral-800 px-2 pr-7 text-xs text-neutral-100",
  formFocusRingClass
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
  return (
    <label
      className={cx(
        "relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full",
        "border border-neutral-200 bg-transparent font-normal leading-[1.2] text-neutral-200 transition-colors hover:bg-neutral-700 active:bg-neutral-700",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-yellow-300",
        buttonSizeClass[size],
        className
      )}
    >
      {children}
      <input className="absolute inset-0 cursor-pointer opacity-0" type="file" accept={accept} onChange={onChange} />
    </label>
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
    <h2 className={cx("m-0 text-base font-normal leading-tight text-neutral-100", className)} {...headingProps}>
      {children}
    </h2>
  )
}

export function HelperText({ children, className, ...paragraphProps }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cx("m-0 text-xs leading-relaxed text-neutral-300", className)} {...paragraphProps}>
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
      ? "whitespace-pre-line border border-red-700 bg-red-950/60 text-red-100"
      : "border border-yellow-700 bg-yellow-950/50 text-yellow-100"

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
      className="fixed inset-0 z-10 flex items-center justify-center bg-neutral-950/60 p-4"
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
      className={cx("w-full max-w-[360px] rounded border border-neutral-600 bg-neutral-800 p-3.5 text-neutral-100 shadow-2xl", className)}
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
