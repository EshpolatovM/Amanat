import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Tags } from 'lucide-react'
import { childrenKeys, fetchChildren } from '../../api/children'
import { fetchPlannedExpenses, plannedExpensesKeys } from '../../api/plannedExpenses'
import { fetchRecurringRules, recurringRulesKeys } from '../../api/recurringRules'
import { fetchUnplannedExpenses, unplannedExpensesKeys } from '../../api/unplannedExpenses'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import ExpenseTypeTabs from '../../components/expenses/ExpenseTypeTabs'
import ExpenseList from '../../components/expenses/ExpenseList'
import RecurringRuleList from '../../components/expenses/RecurringRuleList'
import ExpenseDetailsModal from '../../components/expenses/ExpenseDetailsModal'
import QuickAddExpenseModal from '../../components/navigation/QuickAddExpenseModal'
import GoalsManagerModal from '../../components/goals/GoalsManagerModal'
import ChildPicker from '../../components/dashboard/ChildPicker'
import { EXPENSE_TYPE_STYLES } from '../../components/dashboard/expenseTypeStyles'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { buttonClassName } from '../../components/ui/buttonStyles'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'

const TYPES = ['planned', 'recurring', 'unplanned']

const SECTION_HINTS = {
  planned: "Maqsad uchun qo'lda kiritilgan pullar (kurs, telefon va h.k.)",
  recurring: 'Bir marta sozlanadi — tizim o\'zi qo\'shib boradi',
  unplanned: "Rejadan tashqari: ta'mirlash, jarima va h.k.",
}

export default function Expenses() {
  const isDesktop = useIsDesktop()
  const [childId, setChildId] = useState(null)
  // Mobil/planshetda (<lg) faqat bitta tur ko'rsatiladi; desktopda uchalasi birga.
  const [viewType, setViewType] = useState('planned')
  const [addType, setAddType] = useState(null)
  const [selected, setSelected] = useState(null)
  const [goalsOpen, setGoalsOpen] = useState(false)

  const childrenQuery = useQuery({ queryKey: childrenKeys.list, queryFn: fetchChildren })
  const children = childrenQuery.data ?? []
  const effectiveChildId = children.some((child) => child.id === childId) ? childId : (children[0]?.id ?? null)
  const activeChild = children.find((child) => child.id === effectiveChildId)

  const queries = {
    planned: useQuery({
      queryKey: plannedExpensesKeys.list(effectiveChildId),
      queryFn: () => fetchPlannedExpenses(effectiveChildId),
      enabled: !!effectiveChildId,
    }),
    recurring: useQuery({
      queryKey: recurringRulesKeys.list(effectiveChildId),
      queryFn: () => fetchRecurringRules(effectiveChildId),
      enabled: !!effectiveChildId,
    }),
    unplanned: useQuery({
      queryKey: unplannedExpensesKeys.list(effectiveChildId),
      queryFn: () => fetchUnplannedExpenses(effectiveChildId),
      enabled: !!effectiveChildId,
    }),
  }

  if (childrenQuery.isPending || childrenQuery.isError || children.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Xarajatlar" />
        {childrenQuery.isPending ? (
          <LoadingState />
        ) : childrenQuery.isError ? (
          <ErrorState error={childrenQuery.error} onRetry={() => childrenQuery.refetch()} />
        ) : (
          <EmptyState
            action={
              <Link to="/profile" className={buttonClassName({ size: 'md' })}>
                Farzand profilini qo'shish
              </Link>
            }
          >
            Xarajatlarni yozib borish uchun avval farzandingiz profilini qo'shing.
          </EmptyState>
        )}
      </div>
    )
  }

  const select = (type) => (item) => setSelected({ type, item })
  const addButton = (type) => (
    <Button variant="secondary" size="sm" onClick={() => setAddType(type)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Qo'shish
    </Button>
  )

  function renderList(type) {
    if (type === 'recurring') {
      return <RecurringRuleList query={queries.recurring} onSelect={select('recurring')} emptyAction={addButton('recurring')} />
    }
    return <ExpenseList type={type} query={queries[type]} onSelect={select(type)} emptyAction={addButton(type)} />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Xarajatlar"
        subtitle={activeChild ? `${activeChild.firstName} ${activeChild.lastName} uchun` : undefined}
        actions={
          <Button size="md" onClick={() => setAddType(isDesktop ? 'planned' : viewType)}>
            <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            Qo'shish
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {children.length > 1 ? (
          <ChildPicker childOptions={children} value={effectiveChildId} onChange={setChildId} allowAll={false} />
        ) : (
          <span />
        )}
        <Button variant="ghost" size="sm" onClick={() => setGoalsOpen(true)}>
          <Tags className="h-5 w-5" aria-hidden="true" />
          Maqsadlar
        </Button>
      </div>

      {isDesktop ? (
        <div className="flex flex-col gap-8">
          {TYPES.map((type) => {
            const style = EXPENSE_TYPE_STYLES[type]
            return (
              <section key={type} className="flex flex-col gap-3" aria-labelledby={`section-${type}`}>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 id={`section-${type}`} className={`flex items-center gap-2 text-lg font-bold ${style.text}`}>
                      <span className={`h-3 w-3 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                      {type === 'recurring' ? 'Kundalik va avtomatik xarajatlar' : style.label}
                    </h2>
                    <p className="text-sm font-semibold text-ink-soft">{SECTION_HINTS[type]}</p>
                  </div>
                  {addButton(type)}
                </div>
                {renderList(type)}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ExpenseTypeTabs value={viewType} onChange={setViewType} label="Qaysi xarajatlarni ko'rsatish" />
          <p className="-mt-1 text-sm font-semibold text-ink-soft">{SECTION_HINTS[viewType]}</p>
          {renderList(viewType)}
        </div>
      )}

      {addType && (
        <QuickAddExpenseModal onClose={() => setAddType(null)} initialChildId={effectiveChildId} initialType={addType} />
      )}
      {selected && (
        <ExpenseDetailsModal
          key={selected.item.id}
          type={selected.type}
          item={selected.item}
          childId={effectiveChildId}
          onClose={() => setSelected(null)}
        />
      )}
      {goalsOpen && activeChild && (
        <GoalsManagerModal childId={activeChild.id} childName={activeChild.firstName} onClose={() => setGoalsOpen(false)} />
      )}
    </div>
  )
}
