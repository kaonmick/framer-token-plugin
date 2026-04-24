import { cx } from "./ui.tsx"

export interface TokenCardRow {
  mode?: string
  value: string
  name: string
}

interface TokenCardProps {
  badge: { lightColor: string; darkColor?: string }
  rows: TokenCardRow[]
  label?: string
  radioName?: string
  radioValue?: string
  checked?: boolean
  onChange?: () => void
}

export function TokenCard({
  badge,
  rows,
  label,
  radioName,
  radioValue,
  checked = false,
  onChange,
}: TokenCardProps) {
  const hasRadio = radioName !== undefined

  const inner = (
    <div
      className={cx(
        "flex items-center gap-3 rounded border px-3 py-2.5",
        hasRadio && checked
          ? "border-yellow-700/60 bg-yellow-950/50"
          : "border-neutral-600 bg-neutral-700"
      )}
    >
      {hasRadio ? (
        <input
          type="radio"
          name={radioName}
          value={radioValue}
          checked={checked}
          onChange={onChange}
          className="size-[18px] shrink-0 cursor-pointer accent-yellow-300"
        />
      ) : null}
      <ColorBadge lightColor={badge.lightColor} darkColor={badge.darkColor} />
      <TokenRows rows={rows} />
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <span className="self-start rounded-full border border-neutral-500 px-2 py-0.5 text-[10px] leading-tight text-neutral-300">
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

function ColorBadge({ lightColor, darkColor }: { lightColor: string; darkColor?: string }) {
  if (!darkColor) {
    return (
      <span
        className="block size-5 shrink-0 rounded-full border border-white/20"
        style={{ backgroundColor: lightColor }}
        aria-hidden="true"
      />
    )
  }

  return (
    <span className="relative block h-[26px] w-[30px] shrink-0" aria-hidden="true">
      <span
        className="absolute left-0 top-0 size-5 rounded-full border border-white/20"
        style={{ backgroundColor: lightColor }}
      />
      <span
        className="absolute bottom-0 right-0 size-5 rounded-full border border-white/20"
        style={{ backgroundColor: darkColor }}
      />
    </span>
  )
}

function TokenRows({ rows }: { rows: TokenCardRow[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {rows.map((row, index) => (
        <div key={index} className="flex min-w-0 items-baseline gap-1.5 text-[11px] leading-[1.4]">
          {row.mode ? (
            <>
              <span className="w-[2.5ch] shrink-0 text-right text-neutral-400">{row.mode}</span>
              <span className="shrink-0 select-none text-neutral-500">|</span>
            </>
          ) : null}
          <span className="shrink-0 font-mono text-neutral-100">{row.value}</span>
          <span className="shrink-0 select-none text-neutral-500">|</span>
          <span className="min-w-0 truncate text-neutral-300">{row.name}</span>
        </div>
      ))}
    </div>
  )
}
