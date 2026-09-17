import { formatMoney } from '../../lib/money'
import { formatDayLabel } from '../../lib/date'
import { EXPENSE_TYPE_STYLES } from './expenseTypeStyles'

export default function RecentActivityList({ items, childNameById, showChildName = false }) {
  if (!items?.length) {
    return <p className="text-base font-semibold text-slate-700">Bu oy hali xarajat kiritilmagan.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const style = EXPENSE_TYPE_STYLES[item.type]
        const childName = showChildName ? childNameById?.[item.childId] : null

        return (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-2xl border-2 ${style.border} ${style.bg} px-4 py-3`}
          >
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 shrink-0 rounded-full ${style.dot}`} />
              <div>
                <p className={`text-base font-bold ${style.text}`}>
                  {style.label}
                  {childName ? ` — ${childName}` : ''}
                </p>
                <p className="text-sm font-semibold text-slate-700">{formatDayLabel(item.date)}</p>
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900">{formatMoney(item.amount)}</p>
          </div>
        )
      })}
    </div>
  )
}
