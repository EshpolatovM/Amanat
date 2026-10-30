import { ChevronRight } from 'lucide-react'
import { formatMoney, formatMoneyCompact } from '../../lib/money'

// "Barchasi" ko'rinishida har bir farzandga qancha ketgani. Qator bosilsa —
// o'sha farzandning bosh sahifasiga o'tiladi.
export default function ByChildBreakdown({ byChild, onSelectChild }) {
  if (!byChild?.length) return null

  return (
    <section className="flex flex-col gap-3" aria-labelledby="by-child-title">
      <h2 id="by-child-title" className="font-serif text-xl font-semibold text-ink">
        Farzandlar bo'yicha
      </h2>
      <ul className="flex flex-col divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
        {byChild.map((child) => (
          <li key={child.childId}>
            <button
              type="button"
              onClick={() => onSelectChild?.(child.childId)}
              className="flex w-full items-center gap-2 bg-paper px-4 py-3 text-left transition-colors hover:bg-card"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-ink">
                  {child.firstName} {child.lastName}
                </p>
                <p className="text-lg font-bold text-ink">{formatMoney(child.total)}</p>
                <p className="text-sm font-semibold text-ink-soft">
                  Maqsadli {formatMoneyCompact(child.plannedTotal, { suffix: '' })} · Kundalik{' '}
                  {formatMoneyCompact(child.recurringTotal, { suffix: '' })} · Kutilmagan{' '}
                  {formatMoneyCompact(child.unplannedTotal, { suffix: '' })}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
