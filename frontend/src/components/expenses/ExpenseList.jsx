import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { formatDayLabel } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'
import { EmptyState, ErrorState, LoadingState } from '../ui/States'
import { groupByMonth } from './ledger'

const EMPTY_MESSAGES = {
  planned: "Hali maqsadli xarajat kiritilmagan — birinchi yozuvni qo'shing.",
  unplanned: "Kutilmagan xarajatlar yo'q. Telefon ta'mirlash, jarima kabi rejadan tashqari xarajat bo'lsa, shu yerga yozing.",
}

function describe(type, item) {
  if (type === 'planned') {
    return { title: item.goal?.name ?? 'Maqsadli xarajat', meta: item.comment }
  }
  return { title: item.reason, meta: null }
}

// Maqsadli va kutilmagan xarajatlar ro'yxati — oylar bo'yicha guruhlangan
// "daftar" (CLAUDE.md §7: kartalar emas, varaq/ro'yxat uslubi). `onSelect`
// berilsa qatorlar bosiladigan bo'ladi (tafsilot/tahrirlash oynasi uchun).
export default function ExpenseList({ type, query, onSelect, emptyAction, readOnlyEmptyMessage }) {
  const style = EXPENSE_TYPE_STYLES[type]
  const groups = useMemo(() => (query.data ? groupByMonth(query.data) : []), [query.data])

  if (query.isPending) return <LoadingState />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  if (groups.length === 0) {
    return <EmptyState action={emptyAction}>{readOnlyEmptyMessage ?? EMPTY_MESSAGES[type]}</EmptyState>
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.label}>
          <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
            <h3 className="text-base font-bold text-ink">{group.label}</h3>
            <p className="text-sm font-bold text-ink-soft">Jami: {formatMoney(group.total)}</p>
          </div>
          <ul className="flex flex-col divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
            {group.items.map((item) => {
              const { title, meta } = describe(type, item)
              const content = (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-base font-bold ${style.text}`}>{title}</span>
                      <span className="shrink-0 text-lg font-bold text-ink">{formatMoney(item.amount)}</span>
                    </div>
                    <p className="truncate text-sm font-semibold text-ink-soft">
                      {formatDayLabel(item.date)}
                      {meta ? ` · ${meta}` : ''}
                    </p>
                  </div>
                  {onSelect && <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />}
                </>
              )

              return (
                <li key={item.id} className={`border-l-4 ${style.border} bg-paper`}>
                  {onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="flex w-full items-center gap-2 py-3 pl-4 pr-3 text-left transition-colors hover:bg-card"
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 py-3 pl-4 pr-3">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
