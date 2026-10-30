import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { deletePlannedExpense } from '../../api/plannedExpenses'
import { deleteUnplannedExpense } from '../../api/unplannedExpenses'
import { deleteRecurringRule, updateRecurringRule } from '../../api/recurringRules'
import { extractErrorMessage } from '../../lib/apiClient'
import { invalidateChildData } from '../../lib/invalidate'
import { formatDayLabel, todayIso } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { toast } from '../../store/toastStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import PlannedExpenseForm from './PlannedExpenseForm'
import UnplannedExpenseForm from './UnplannedExpenseForm'
import RecurringRuleForm from './RecurringRuleForm'
import { describeSchedule, ruleStatus } from './recurringSchedule'

const TITLES = {
  planned: 'Maqsadli xarajat',
  unplanned: 'Kutilmagan xarajat',
  recurring: 'Avtomatik xarajat qoidasi',
}

const DELETE_REQUESTS = {
  planned: deletePlannedExpense,
  unplanned: deleteUnplannedExpense,
  recurring: deleteRecurringRule,
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-base font-semibold text-ink-soft">{label}</dt>
      <dd className="text-right text-base font-bold break-words text-ink">{children}</dd>
    </div>
  )
}

function Details({ type, item }) {
  if (type === 'recurring') {
    return (
      <dl className="divide-y-2 divide-line">
        <DetailRow label="Summa">{formatMoney(item.amount)}</DetailRow>
        <DetailRow label="Jadval">{describeSchedule(item)}</DetailRow>
        <DetailRow label="Maqsad">{item.goal ? item.goal.name : 'Kundalik xarajat (maqsadsiz)'}</DetailRow>
        <DetailRow label="Boshlangan">{formatDayLabel(item.startDate, { withYear: true })}</DetailRow>
        <DetailRow label="Tugash">{item.endDate ? formatDayLabel(item.endDate, { withYear: true }) : 'Belgilanmagan'}</DetailRow>
        <DetailRow label="Holati">{ruleStatus(item, todayIso()).label}</DetailRow>
        {item.comment && <DetailRow label="Izoh">{item.comment}</DetailRow>}
      </dl>
    )
  }

  return (
    <dl className="divide-y-2 divide-line">
      <DetailRow label="Summa">{formatMoney(item.amount)}</DetailRow>
      <DetailRow label="Sana">{formatDayLabel(item.date, { withYear: true })}</DetailRow>
      {type === 'planned' ? (
        <DetailRow label="Maqsad">{item.goal?.name}</DetailRow>
      ) : (
        <DetailRow label="Sabab">{item.reason}</DetailRow>
      )}
      {item.comment && <DetailRow label="Izoh">{item.comment}</DetailRow>}
    </dl>
  )
}

function deleteWarning(type, item) {
  if (type === 'recurring') {
    return (
      <>
        <p>
          Qoida o'chirilsa, u orqali shu paytgacha avtomatik qo'shilgan <strong>barcha xarajatlar ham o'chadi</strong>{' '}
          va statistikadan chiqib ketadi.
        </p>
        {item.active && <p className="mt-2">Tarixni saqlab qolish uchun o'chirish o'rniga qoidani to'xtating.</p>}
      </>
    )
  }
  const label = type === 'planned' ? item.goal?.name : item.reason
  return (
    <p>
      <strong className="text-ink">{formatMoney(item.amount)}</strong> — {label}, {formatDayLabel(item.date)} yozuvi
      o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.
    </p>
  )
}

// Ro'yxatdagi qator bosilganda ochiladi: tafsilotlar + (ota-ona uchun)
// tahrirlash, o'chirish va qoidani to'xtatish. Mobil'da kichik ikonkalar
// o'rniga katta, aniq tugmalar. Har yozuv uchun `key={item.id}` bilan render qiling.
export default function ExpenseDetailsModal({ type, item, childId, readOnly = false, onClose }) {
  const [mode, setMode] = useState('view') // view | edit | delete
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => DELETE_REQUESTS[type](item.id),
    onSuccess: () => {
      invalidateChildData(queryClient, childId)
      toast.success(type === 'recurring' ? "Qoida o'chirildi" : "Xarajat o'chirildi")
      onClose()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: () => updateRecurringRule(item.id, { active: !item.active }),
    onSuccess: (updated) => {
      invalidateChildData(queryClient, childId)
      toast.success(updated.active ? 'Qoida qayta yoqildi — bugundan davom etadi' : "Qoida to'xtatildi")
      onClose()
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  if (!item) return null

  const busy = deleteMutation.isPending || toggleMutation.isPending
  const ended = type === 'recurring' && ruleStatus(item, todayIso()).key === 'ended'
  const title = mode === 'edit' ? `${TITLES[type]} — tahrirlash` : TITLES[type]

  return (
    <Modal open onClose={busy ? () => {} : onClose} title={title}>
      {mode === 'view' && (
        <div className="flex flex-col gap-5">
          <Details type={type} item={item} />
          {!readOnly && (
            <div className="flex flex-col gap-3">
              {type === 'recurring' && !ended && (
                <Button
                  variant={item.active ? 'secondary' : 'bronze'}
                  size="md"
                  loading={toggleMutation.isPending}
                  disabled={busy}
                  onClick={() => toggleMutation.mutate()}
                  fullWidth
                >
                  {item.active ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
                  {item.active ? "To'xtatish" : 'Qayta yoqish'}
                </Button>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={() => setMode('edit')} disabled={busy} className="flex-1">
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                  Tahrirlash
                </Button>
                <Button variant="dangerOutline" size="md" onClick={() => setMode('delete')} disabled={busy} className="flex-1">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                  O'chirish
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex flex-col gap-4">
          {type === 'planned' && <PlannedExpenseForm childId={childId} expense={item} onSuccess={onClose} />}
          {type === 'unplanned' && <UnplannedExpenseForm childId={childId} expense={item} onSuccess={onClose} />}
          {type === 'recurring' && <RecurringRuleForm childId={childId} rule={item} onSuccess={onClose} />}
          <Button variant="ghost" size="md" onClick={() => setMode('view')}>
            Orqaga
          </Button>
        </div>
      )}

      {mode === 'delete' && (
        <div className="flex flex-col gap-5">
          <div className="text-base font-semibold text-ink-soft">{deleteWarning(type, item)}</div>
          {deleteMutation.isError && (
            <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
              {extractErrorMessage(deleteMutation.error)}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {type === 'recurring' && item.active && (
              <Button variant="bronze" size="md" onClick={() => toggleMutation.mutate()} loading={toggleMutation.isPending} disabled={busy}>
                <Pause className="h-5 w-5" aria-hidden="true" />
                O'chirmasdan to'xtatish
              </Button>
            )}
            <Button variant="danger" size="md" onClick={() => deleteMutation.mutate()} loading={deleteMutation.isPending} disabled={busy}>
              Ha, o'chirish
            </Button>
            <Button variant="secondary" size="md" onClick={() => setMode('view')} disabled={busy}>
              Bekor qilish
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
