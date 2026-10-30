import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { fetchPlannedExpenses, plannedExpensesKeys } from '../../api/plannedExpenses'
import { fetchRecurringRules, recurringRulesKeys } from '../../api/recurringRules'
import { fetchUnplannedExpenses, unplannedExpensesKeys } from '../../api/unplannedExpenses'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import ExpenseTypeTabs from '../../components/expenses/ExpenseTypeTabs'
import ExpenseList from '../../components/expenses/ExpenseList'
import RecurringRuleList from '../../components/expenses/RecurringRuleList'
import ExpenseDetailsModal from '../../components/expenses/ExpenseDetailsModal'
import { EXPENSE_TYPE_STYLES } from '../../components/dashboard/expenseTypeStyles'
import PageHeader from '../../components/ui/PageHeader'

const TYPES = ['planned', 'recurring', 'unplanned']

const EMPTY = {
  planned: "Hali maqsadli xarajat yo'q.",
  recurring: "Avtomatik (kundalik) pul sozlanmagan.",
  unplanned: "Kutilmagan xarajat yo'q.",
}

// Bola uchun faqat ko'rish (read-only): qator bosilsa tafsilotlar ochiladi,
// tahrirlash/o'chirish tugmalari yo'q.
export default function ChildExpenses() {
  const childId = useAuthStore((state) => state.user?.id)
  const isDesktop = useIsDesktop()
  const [viewType, setViewType] = useState('planned')
  const [selected, setSelected] = useState(null)

  const queries = {
    planned: useQuery({
      queryKey: plannedExpensesKeys.list(childId),
      queryFn: () => fetchPlannedExpenses(childId),
      enabled: !!childId,
    }),
    recurring: useQuery({
      queryKey: recurringRulesKeys.list(childId),
      queryFn: () => fetchRecurringRules(childId),
      enabled: !!childId,
    }),
    unplanned: useQuery({
      queryKey: unplannedExpensesKeys.list(childId),
      queryFn: () => fetchUnplannedExpenses(childId),
      enabled: !!childId,
    }),
  }

  const select = (type) => (item) => setSelected({ type, item })

  function renderList(type) {
    if (type === 'recurring') {
      return <RecurringRuleList query={queries.recurring} onSelect={select('recurring')} readOnlyEmptyMessage={EMPTY.recurring} />
    }
    return <ExpenseList type={type} query={queries[type]} onSelect={select(type)} readOnlyEmptyMessage={EMPTY[type]} />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Xarajatlarim" subtitle="Ota-onang sen uchun yozib borgan barcha pullar" />

      {isDesktop ? (
        <div className="flex flex-col gap-8">
          {TYPES.map((type) => {
            const style = EXPENSE_TYPE_STYLES[type]
            return (
              <section key={type} className="flex flex-col gap-3" aria-labelledby={`child-section-${type}`}>
                <h2 id={`child-section-${type}`} className={`flex items-center gap-2 text-xl font-bold ${style.text}`}>
                  <span className={`h-3 w-3 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                  {style.label}
                </h2>
                {renderList(type)}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ExpenseTypeTabs value={viewType} onChange={setViewType} label="Qaysi xarajatlarni ko'rsatish" />
          {renderList(viewType)}
        </div>
      )}

      {selected && (
        <ExpenseDetailsModal
          key={selected.item.id}
          type={selected.type}
          item={selected.item}
          childId={childId}
          readOnly
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
