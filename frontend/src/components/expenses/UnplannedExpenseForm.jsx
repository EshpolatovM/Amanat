import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUnplannedExpense, unplannedExpensesKeys } from '../../api/unplannedExpenses'
import { dashboardKeys } from '../../api/dashboard'
import { extractErrorMessage } from '../../lib/apiClient'
import TextField from '../forms/TextField'

const schema = z.object({
  amount: z.coerce.number().int().positive("Summa 0 dan katta bo'lishi kerak"),
  reason: z.string().trim().min(1, 'Sabab kiritilishi shart').max(500),
  date: z.string().min(1, 'Sana kiritilishi shart'),
})

const todayIso = () => new Date().toISOString().slice(0, 10)

export default function UnplannedExpenseForm({ childId, onSuccess }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', reason: '', date: todayIso() },
  })

  const mutation = useMutation({
    mutationFn: (values) => createUnplannedExpense(childId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unplannedExpensesKeys.list(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(undefined) })
      reset({ amount: '', reason: '', date: todayIso() })
      onSuccess?.()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <TextField label="Summa (so'm)" type="number" min="1" error={errors.amount?.message} {...register('amount')} />
      <TextField
        label="Sabab"
        placeholder="Masalan: Telefon ta'mirlash"
        error={errors.reason?.message}
        {...register('reason')}
      />
      <TextField label="Sana" type="date" error={errors.date?.message} {...register('date')} />

      {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          h-14 rounded-2xl border-b-2 border-alert-dark bg-alert text-lg font-bold text-white
          shadow-lg transition-all duration-100 ease-in-out
          hover:translate-y-px hover:border-b-px
          active:translate-y-0.5 active:border-b-0 active:shadow-none
          disabled:opacity-70
        "
      >
        {isSubmitting ? 'Saqlanmoqda...' : "Xarajatni qo'shish"}
      </button>
    </form>
  )
}
