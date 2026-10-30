import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { createGoal, deleteGoal, fetchGoals, goalsKeys, renameGoal } from '../../api/goals'
import { extractErrorMessage } from '../../lib/apiClient'
import { invalidateChildData } from '../../lib/invalidate'
import { toast } from '../../store/toastStore'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import IconButton from '../ui/IconButton'
import TextField from '../forms/TextField'
import { EmptyState, ErrorState, LoadingState } from '../ui/States'

const nameFormSchema = z.object({
  name: z.string().trim().min(1, 'Maqsad nomini kiriting').max(60, 'Maqsad nomi 60 belgidan oshmasligi kerak'),
})

function GoalNameForm({ defaultName = '', submitLabel, onSubmit, onCancel, pending }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(nameFormSchema), defaultValues: { name: defaultName } })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values.name))} className="flex flex-col gap-3" noValidate>
      <TextField label="Maqsad nomi" placeholder="Masalan: Kurs puli" maxLength={60} error={errors.name?.message} {...register('name')} />
      <div className="flex gap-3">
        <Button type="submit" size="md" loading={pending} className="flex-1">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" size="md" onClick={onCancel} disabled={pending} className="flex-1">
            Bekor qilish
          </Button>
        )}
      </div>
    </form>
  )
}

// Maqsadlar (kurs, telefon va h.k.) ro'yxatini boshqarish: nomini tuzatish,
// ishlatilmaganini o'chirish, yangisini qo'shish.
export default function GoalsManagerModal({ childId, childName, onClose }) {
  const queryClient = useQueryClient()
  const goalsQuery = useQuery({ queryKey: goalsKeys.list(childId), queryFn: () => fetchGoals(childId) })
  const [editingId, setEditingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)

  const onDone = (message) => {
    invalidateChildData(queryClient, childId)
    toast.success(message)
    setError(null)
  }

  const renameMutation = useMutation({
    mutationFn: ({ id, name }) => renameGoal(id, name),
    onSuccess: () => {
      onDone("Maqsad nomi o'zgartirildi")
      setEditingId(null)
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      onDone("Maqsad o'chirildi")
      setConfirmDeleteId(null)
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  })
  const createMutation = useMutation({
    mutationFn: (name) => createGoal(childId, name),
    onSuccess: () => {
      onDone("Maqsad qo'shildi")
      setAdding(false)
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  })

  const goals = goalsQuery.data ?? []

  return (
    <Modal open onClose={onClose} title={`${childName} — maqsadlar`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-ink-soft">
          Xarajatlar bog'langan maqsadni o'chirib bo'lmaydi (tarix saqlanishi uchun), lekin nomini tuzatish mumkin.
        </p>

        {error && (
          <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
            {error}
          </p>
        )}

        {goalsQuery.isPending ? (
          <LoadingState />
        ) : goalsQuery.isError ? (
          <ErrorState error={goalsQuery.error} onRetry={() => goalsQuery.refetch()} />
        ) : goals.length === 0 ? (
          <EmptyState>Hali maqsad yo'q. Maqsadlar xarajat qo'shayotganda yoki shu yerda yaratiladi.</EmptyState>
        ) : (
          <ul className="flex flex-col divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
            {goals.map((goal) => (
              <li key={goal.id} className="bg-paper px-4 py-3">
                {editingId === goal.id ? (
                  <GoalNameForm
                    defaultName={goal.name}
                    submitLabel="Saqlash"
                    pending={renameMutation.isPending}
                    onSubmit={(name) => renameMutation.mutate({ id: goal.id, name })}
                    onCancel={() => setEditingId(null)}
                  />
                ) : confirmDeleteId === goal.id ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-base font-semibold text-ink">"{goal.name}" maqsadi o'chirilsinmi?</p>
                    <div className="flex gap-3">
                      <Button variant="danger" size="sm" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(goal.id)} className="flex-1">
                        Ha, o'chirish
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteId(null)} disabled={deleteMutation.isPending} className="flex-1">
                        Yo'q
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-forest">{goal.name}</p>
                      <p className="text-sm font-semibold text-ink-soft">
                        {goal.usageCount ? `${goal.usageCount} ta yozuvda ishlatilgan` : 'Hali ishlatilmagan'}
                      </p>
                    </div>
                    <IconButton label={`"${goal.name}" nomini o'zgartirish`} icon={Pencil} onClick={() => { setError(null); setEditingId(goal.id) }} />
                    <IconButton
                      label={goal.usageCount ? "Xarajat bog'langan maqsadni o'chirib bo'lmaydi" : `"${goal.name}"ni o'chirish`}
                      icon={Trash2}
                      tone="danger"
                      disabled={goal.usageCount > 0}
                      onClick={() => { setError(null); setConfirmDeleteId(goal.id) }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {adding ? (
          <GoalNameForm
            submitLabel="Qo'shish"
            pending={createMutation.isPending}
            onSubmit={(name) => createMutation.mutate(name)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <Button variant="secondary" size="md" onClick={() => { setError(null); setAdding(true) }}>
            + Yangi maqsad
          </Button>
        )}
      </div>
    </Modal>
  )
}
