import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { childrenKeys, fetchChildren } from '../../api/children'
import Modal from '../ui/Modal'
import SelectField from '../forms/SelectField'
import { EmptyState, ErrorState, LoadingState } from '../ui/States'
import ExpenseTypeTabs from '../expenses/ExpenseTypeTabs'
import PlannedExpenseForm from '../expenses/PlannedExpenseForm'
import RecurringRuleForm from '../expenses/RecurringRuleForm'
import UnplannedExpenseForm from '../expenses/UnplannedExpenseForm'

const FORMS = { planned: PlannedExpenseForm, recurring: RecurringRuleForm, unplanned: UnplannedExpenseForm }

const TYPE_HINTS = {
  planned: 'Maqsad uchun berilgan pul: kurs, telefon, kiyim va h.k.',
  recurring: "Bir marta sozlang — tizim har kuni/oy o'zi qo'shib boradi.",
  unplanned: "Rejada yo'q xarajat: ta'mirlash, jarima va h.k.",
}

// Har ochilishda yangidan mount qiling (`{open && <QuickAddExpenseModal .../>}`),
// shunda boshlang'ich bola/tur har safar to'g'ri tanlanadi.
export default function QuickAddExpenseModal({ onClose, initialChildId = null, initialType = 'planned' }) {
  const childrenQuery = useQuery({ queryKey: childrenKeys.list, queryFn: fetchChildren })
  const [selectedChildId, setSelectedChildId] = useState(initialChildId)
  const [type, setType] = useState(initialType)

  const children = childrenQuery.data ?? []
  const childId = children.some((child) => child.id === selectedChildId) ? selectedChildId : (children[0]?.id ?? null)
  const Form = FORMS[type]

  let content
  if (childrenQuery.isPending) {
    content = <LoadingState />
  } else if (childrenQuery.isError) {
    content = <ErrorState error={childrenQuery.error} onRetry={() => childrenQuery.refetch()} />
  } else if (children.length === 0) {
    content = (
      <EmptyState
        action={
          <Link to="/profile" onClick={onClose} className="text-base font-bold text-forest underline underline-offset-4">
            Farzand profilini qo'shish
          </Link>
        }
      >
        Xarajat yozish uchun avval farzandingiz profilini qo'shing.
      </EmptyState>
    )
  } else {
    content = (
      <div className="flex flex-col gap-4">
        {children.length > 1 && (
          <SelectField label="Kim uchun" value={childId ?? ''} onChange={(event) => setSelectedChildId(event.target.value)}>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </SelectField>
        )}

        <div className="flex flex-col gap-2">
          <ExpenseTypeTabs value={type} onChange={setType} />
          <p className="text-sm font-semibold text-ink-soft">{TYPE_HINTS[type]}</p>
        </div>

        <Form key={`${type}-${childId}`} childId={childId} onSuccess={onClose} />
      </div>
    )
  }

  return (
    <Modal open onClose={onClose} title="Xarajat qo'shish">
      {content}
    </Modal>
  )
}
