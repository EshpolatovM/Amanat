import { Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRecurringRule, updateRecurringRule, recurringRulesKeys } from '../../api/recurringRules'
import { dashboardKeys } from '../../api/dashboard'
import { formatMoney } from '../../lib/money'
import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

const DAY_LABELS = { 0: 'Yak', 1: 'Dush', 2: 'Sesh', 3: 'Chor', 4: 'Pay', 5: 'Juma', 6: 'Shan' }

export default function RecurringRuleList({ items, childId, readOnly = false }) {
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: recurringRulesKeys.list(childId) })
    queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(childId) })
    queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(undefined) })
  }

  const deleteMutation = useMutation({ mutationFn: deleteRecurringRule, onSuccess: invalidate })
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => updateRecurringRule(id, { active }),
    onSuccess: invalidate,
  })

  if (!items?.length) {
    return <p className="text-base font-semibold text-slate-700">Hali takrorlanuvchi xarajat qoidasi sozlanmagan.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        // Maqsadga bog'langan qoida "Maqsadli xarajat" (yashil), maqsadsizi
        // klassik "Kundalik xarajat" (sariq) sifatida ko'rsatiladi.
        const style = item.goal ? EXPENSE_TYPE_STYLES.planned : EXPENSE_TYPE_STYLES.recurring
        const scheduleLabel =
          item.frequency === 'monthly'
            ? `Har oy, ${item.dayOfMonth}-sana`
            : `Har hafta: ${item.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ')}`

        return (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-2xl border-2 ${style.border} ${style.bg} px-4 py-3`}
          >
            <div>
              <p className={`text-base font-bold ${style.text}`}>{item.goal ? item.goal.name : 'Kundalik xarajat'}</p>
              <p className="text-sm font-semibold text-slate-700">
                {scheduleLabel} — {item.active ? 'Faol' : "To'xtatilgan"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-lg font-bold text-slate-900">{formatMoney(item.amount)}</p>
              {!readOnly && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate({ id: item.id, active: !item.active })}
                    className={`text-sm font-semibold underline ${style.text}`}
                  >
                    {item.active ? "To'xtatish" : 'Faollashtirish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    aria-label="O'chirish"
                    className="text-slate-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
