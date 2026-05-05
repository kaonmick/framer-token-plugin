interface StatItem {
  label: string
  value: number
}

interface StatsGridProps {
  items: StatItem[]
}

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <section className="grid grid-cols-4 gap-2" aria-label="Import stats">
      {items.map(item => (
        <div
          className="flex min-h-[54px] flex-col justify-center gap-1 rounded border border-border-muted bg-surface-panel p-2"
          key={item.label}
        >
          <span className="text-[11px] text-text-secondary">{item.label}</span>
          <span className="text-[14px] font-normal leading-tight text-text-primary [overflow-wrap:anywhere]">
            {item.value}
          </span>
        </div>
      ))}
    </section>
  )
}
