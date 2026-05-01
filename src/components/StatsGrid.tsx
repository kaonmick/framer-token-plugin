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
          className="flex min-h-[54px] flex-col justify-center gap-1 rounded border border-neutral-600 bg-neutral-700 p-2.5"
          key={item.label}
        >
          <span className="text-[11px] text-neutral-300">{item.label}</span>
          <span className="text-base font-normal leading-tight text-neutral-100 [overflow-wrap:anywhere]">
            {item.value}
          </span>
        </div>
      ))}
    </section>
  )
}
