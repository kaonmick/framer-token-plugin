import { useEffect, useState } from "react"
import { cx } from "./ui.tsx"
import defaultDarkModeIcon from "../assets/icons/dark-mode.svg"
import defaultLightModeIcon from "../assets/icons/light-mode.svg"
import darkModeIconOnLight from "../assets/icons/dark-mode--black.svg"
import lightModeIconOnLight from "../assets/icons/light-mode--black.svg"

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
  const themeMode = useDocumentThemeMode()

  const inner = (
    <div
      className={cx(
        "flex gap-3 rounded-[4px] p-2",
        hasRadio ? "items-center" : "items-start",
        checked ? "bg-status-warning-ghost" : "",
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
              borderColor: checked ? "var(--color-control-radio-selected)" : "var(--preview-radio-border)",
              borderWidth: checked ? 3 : 1,
            }}
          />
        </span>
      ) : null}
      <TokenRows rows={rows} themeMode={themeMode} />
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <span className="inline-flex self-start rounded-[11px] bg-[var(--preview-label-bg)] px-2 py-1 text-[11px] leading-none text-[var(--preview-label-text)]">
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

function TokenRows({
  rows,
  themeMode,
}: {
  rows: TokenCardRow[]
  themeMode: ThemeMode
}) {
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
                  <ModeIcon mode={row.mode} themeMode={themeMode} />
                  <span className="sr-only">{row.modeLabel ?? (row.mode === "light" ? "Light" : "Dark")}</span>
                </>
              ) : null}
              <span
                className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-none text-text-primary"
                lang="en"
              >
                {row.value}
              </span>
            </div>
            <span
              className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] leading-none text-text-secondary"
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
        borderColor: borderColor ?? "var(--preview-badge-border)",
      }}
      aria-hidden="true"
    />
  )
}

function ModeIcon({
  mode,
  themeMode,
}: {
  mode: TokenRowMode
  themeMode: ThemeMode
}) {
  const iconSrc =
    themeMode === "light"
      ? mode === "light"
        ? lightModeIconOnLight
        : darkModeIconOnLight
      : mode === "light"
        ? defaultLightModeIcon
        : defaultDarkModeIcon

  return (
    <img
      aria-hidden="true"
      alt=""
      className="block size-4 shrink-0"
      src={iconSrc}
    />
  )
}

type ThemeMode = "light" | "dark"

function useDocumentThemeMode(): ThemeMode {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getCurrentThemeMode())

  useEffect(() => {
    if (typeof document === "undefined") return

    const updateThemeMode = () => {
      setThemeMode(getCurrentThemeMode())
    }

    updateThemeMode()

    const observer = new MutationObserver(updateThemeMode)
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
      attributes: true,
    })

    return () => observer.disconnect()
  }, [])

  return themeMode
}

function getCurrentThemeMode(): ThemeMode {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}
