// Sahifa sarlavhasi: serif h1 (CLAUDE.md §7 tipografika) + ixtiyoriy izoh va amallar.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-serif text-3xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-base font-semibold text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
