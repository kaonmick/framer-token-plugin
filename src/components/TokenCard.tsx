import { Moon, Sun } from "lucide-react"
import { cx } from "./ui.tsx"

type TokenRowMode = "light" | "dark"

interface TokenBadgeColor {
  color: string
  borderColor?: string
}

export interface TokenCardRow {
  badge?: TokenBadgeColor
  mode?: TokenRowMode
  modeLabel?: string
  value: string
  name: string
}

interface TokenCardProps {
  rows: TokenCardRow[]
  label?: string
  radioName?: string
  radioValue?: string
  checked?: boolean
  onChange?: () => void
  className?: string
}

export function TokenCard({
  rows,
  label,
  radioName,
  radioValue,
  checked = false,
  onChange,
  className,
}: TokenCardProps) {
  const hasRadio = radioName !== undefined

  const inner = (
    <div
      className={cx(
        "flex gap-3 rounded-[4px] p-2",
        hasRadio ? "items-center" : "items-start",
        checked ? "bg-[color:color-mix(in_srgb,var(--color-surface-brand)_30%,transparent)]" : "",
        className
      )}
    >
      {hasRadio ? (
        <span className="flex h-9 shrink-0 items-center">
          <input
            type="radio"
            name={radioName}
            value={radioValue}
            checked={checked}
            onChange={onChange}
            readOnly={onChange === undefined}
            className="m-0 size-4 shrink-0 appearance-none rounded-full border box-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [outline-color:var(--color-border-focus)]"
            style={{
              backgroundColor: "inherit",
              borderColor: checked ? "var(--color-control-radio-selected)" : "var(--color-border-default)",
              borderWidth: checked ? 3 : 1,
            }}
          />
        </span>
      ) : null}
      <TokenRows rows={rows} />
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <span className="inline-flex self-start rounded-[11px] bg-surface-muted px-2 py-1 text-[11px] leading-none text-text-subtle">
          {label}
        </span>
      ) : null}
      {hasRadio ? (
        <label className="block cursor-pointer">{inner}</label>
      ) : (
        inner
      )}
    </div>
  )
}

function TokenRows({ rows }: { rows: TokenCardRow[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {rows.map((row, index) => (
        <div
          key={`${row.mode ?? "default"}:${row.name}:${index}`}
          className={cx("flex min-w-0 items-center gap-3", row.mode ? "min-h-[34px]" : "min-h-[30px]")}
        >
          <ColorBadge color={row.badge?.color ?? row.value} borderColor={row.badge?.borderColor} />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <div className={cx("flex min-w-0 items-center", row.mode ? "gap-2" : "")}>
              {row.mode ? (
                <>
                  <ModeIcon mode={row.mode} />
                  <span className="sr-only">{row.modeLabel ?? (row.mode === "light" ? "Light" : "Dark")}</span>
                </>
              ) : null}
              <span
                className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-none text-text-default"
                lang="en"
              >
                {row.value}
              </span>
            </div>
            <span
              className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-none text-text-subtle"
              lang="en"
            >
              {row.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ColorBadge({ color, borderColor }: { color: string; borderColor?: string }) {
  return (
    <span
      className="block size-[18px] shrink-0 rounded-full border"
      style={{
        backgroundColor: color,
        borderColor: borderColor ?? "var(--color-border-default)",
      }}
      aria-hidden="true"
    />
  )
}

function ModeIcon({ mode }: { mode: TokenRowMode }) {
  const Icon = mode === "light" ? Sun : Moon

  return (
    <Icon
      aria-hidden="true"
      className="block size-4 shrink-0 text-text-subtle"
      strokeWidth={2}
    />
  )
}
