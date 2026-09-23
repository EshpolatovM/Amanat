import { Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUnplannedExpense, unplannedExpensesKeys } from '../../api/unplannedExpenses'
import { dashboardKeys } from '../../api/dashboard'
import { formatMoney } from '../../lib/money'
import { formatDayLabel } from '../../lib/date'

export default function UnplannedExpenseList({ items, childId, readOnly = false }) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteUnplannedExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unplannedExpensesKeys.list(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(undefined) })
    },
  })

  if (!items?.length) {
    return <p className="text-base font-semibold text-ink-soft">Hali kutilmagan xarajat kiritilmagan.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border-2 border-line">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border-l-4 border-alert bg-paper px-4 py-3"
        >
          <div>
            <p className="text-base font-bold text-alert">{item.reason}</p>
            <p className="text-sm font-semibold text-ink-soft">{formatDayLabel(item.date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-ink">{formatMoney(item.amount)}</p>
            {!readOnly && (
              <button
                type="button"
                onClick={() => deleteMutation.mutate(item.id)}
                aria-label="O'chirish"
                className="text-ink-soft transition-colors hover:text-alert"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
