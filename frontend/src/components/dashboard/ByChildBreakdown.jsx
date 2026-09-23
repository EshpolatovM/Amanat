import { formatMoney } from '../../lib/money'

export default function ByChildBreakdown({ byChild }) {
  if (!byChild?.length) return null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-serif font-semibold text-ink">Bolalar bo'yicha</h2>
      {byChild.map((child) => (
        <div key={child.childId} className="rounded-2xl border-2 border-line bg-card p-4">
          <p className="text-lg font-bold text-ink">
            {child.firstName} {child.lastName}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-base font-semibold text-ink-soft">
            <span>Maqsadli: {formatMoney(child.plannedTotal)}</span>
            <span>Kundalik: {formatMoney(child.recurringTotal)}</span>
            <span>Kutilmagan: {formatMoney(child.unplannedTotal)}</span>
          </div>
          <p className="mt-2 text-lg font-bold text-forest">Jami: {formatMoney(child.total)}</p>
        </div>
      ))}
    </div>
  )
}
