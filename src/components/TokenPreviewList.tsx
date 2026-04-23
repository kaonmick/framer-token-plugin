import type { ParsedColorToken } from "../lib/types/tokens.ts"
import { cx, tokenTextClass } from "./ui.tsx"

interface TokenPreviewLabels {
  alias: string
  dark: string
  emptyState: string
  light: string
}

interface TokenPreviewListProps {
  labels: TokenPreviewLabels
  tokens: ParsedColorToken[]
}

export function TokenPreviewList({ labels, tokens }: TokenPreviewListProps) {
  if (tokens.length === 0) {
    return (
      <p className="m-0 rounded border border-dashed border-neutral-500 p-3.5 text-center text-xs text-neutral-300">
        {labels.emptyState}
      </p>
    )
  }

  return (
    <div className="flex max-h-[210px] flex-col gap-2 overflow-auto pr-0.5">
      {tokens.map(token => (
        <TokenPreviewRow key={token.id} labels={labels} token={token} />
      ))}
    </div>
  )
}

function TokenPreviewRow({ labels, token }: { labels: TokenPreviewLabels; token: ParsedColorToken }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-2.5 overflow-visible rounded border border-neutral-600 bg-neutral-700 p-[9px]">
      <TokenSwatch darkValue={token.darkValue} value={token.value} />
      <div className="flex min-w-0 max-w-full flex-col gap-[3px] overflow-hidden">
        <strong className={cx(tokenTextClass, "text-xs leading-[1.35] text-neutral-100")}>{token.styleName}</strong>
        {token.darkSourcePath ? (
          <>
            <span className={cx(tokenTextClass, "text-[11px] leading-[1.35] text-neutral-300")}>
              {`${labels.light}: ${token.sourcePath}`}
            </span>
            <span className={cx(tokenTextClass, "text-[11px] leading-[1.35] text-neutral-300")}>
              {`${labels.dark}: ${token.darkSourcePath}`}
            </span>
          </>
        ) : (
          <span className={cx(tokenTextClass, "text-[11px] leading-[1.35] text-neutral-300")}>
            {token.sourcePath}
          </span>
        )}
        {token.aliasPath || token.darkAliasPath ? (
          <div className="flex w-full min-w-0 flex-col gap-0.5 overflow-hidden">
            {token.aliasPath ? (
              <span className={cx(tokenTextClass, "text-[11px] leading-[1.35] text-neutral-300")}>
                {token.darkValue ? `${labels.light} ${labels.alias}: ` : `${labels.alias}: `}
                {token.aliasPath}
              </span>
            ) : null}
            {token.darkAliasPath ? (
              <span className={cx(tokenTextClass, "text-[11px] leading-[1.35] text-neutral-300")}>
                {`${labels.dark} ${labels.alias}: ${token.darkAliasPath}`}
              </span>
            ) : null}
          </div>
        ) : null}
        <code className="mt-0.5 flex w-full min-w-0 flex-col gap-0.5 overflow-hidden text-[11px] leading-[1.35] text-neutral-100">
          <span className={cx(tokenTextClass, "text-neutral-100")}>
            {token.darkValue ? `${labels.light}: ` : ""}
            {token.value}
          </span>
          {token.darkValue ? (
            <span className={cx(tokenTextClass, "text-neutral-100")}>
              {labels.dark}: {token.darkValue}
            </span>
          ) : null}
        </code>
      </div>
    </div>
  )
}

function TokenSwatch({ darkValue, value }: { darkValue?: string; value: string }) {
  return (
    <span className={darkValue ? "relative block h-8 w-9" : "relative block size-7"} aria-hidden="true">
      <span
        className={cx("block size-7 rounded border border-white/20", darkValue && "absolute left-0 top-0")}
        style={{ backgroundColor: value }}
      />
      {darkValue ? (
        <span
          className="absolute bottom-0 right-0 block size-7 rounded border border-white/20"
          style={{ backgroundColor: darkValue }}
        />
      ) : null}
    </span>
  )
}
