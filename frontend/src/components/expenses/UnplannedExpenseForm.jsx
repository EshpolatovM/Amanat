import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUnplannedExpense, updateUnplannedExpense } from '../../api/unplannedExpenses'
import { extractErrorMessage } from '../../lib/apiClient'
import { invalidateChildData } from '../../lib/invalidate'
import { todayIso, toIsoDate } from '../../lib/date'
import { dateSchema, moneySchema } from '../../lib/validation'
import { toast } from '../../store/toastStore'
import TextField from '../forms/TextField'
import MoneyField from '../forms/MoneyField'
import Button from '../ui/Button'

const schema = z.object({
  amount: moneySchema,
  reason: z.string().trim().min(1, 'Sababni kiriting').max(500, 'Sabab 500 belgidan oshmasligi kerak'),
  date: dateSchema(),
})

function defaultValues(expense) {
  return {
    amount: expense?.amount ?? '',
    reason: expense?.reason ?? '',
    date: expense ? toIsoDate(expense.date) : todayIso(),
  }
}

// `expense` berilsa — tahrirlash rejimi (PATCH), aks holda yangi yozuv.
export default function UnplannedExpenseForm({ childId, expense, onSuccess }) {
  const isEdit = Boolean(expense)
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaultValues(expense) })

  const mutation = useMutation({
    mutationFn: (values) =>
      isEdit ? updateUnplannedExpense(expense.id, values) : createUnplannedExpense(childId, values),
    onSuccess: () => {
      invalidateChildData(queryClient, childId)
      toast.success(isEdit ? 'Xarajat yangilandi' : "Kutilmagan xarajat qo'shildi")
      if (!isEdit) reset(defaultValues())
      onSuccess?.()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <MoneyField label="Summa" placeholder="Masalan: 150 000" error={fieldState.error?.message} {...field} />
        )}
      />
      <TextField
        label="Sabab"
        placeholder="Masalan: Telefon ta'mirlash"
        maxLength={500}
        error={errors.reason?.message}
        {...register('reason')}
      />
      <TextField label="Sana" type="date" error={errors.date?.message} {...register('date')} />

      {errors.root?.message && (
        <p role="alert" className="text-base font-semibold text-alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" variant="danger" loading={mutation.isPending} fullWidth>
        {isEdit ? "O'zgarishlarni saqlash" : "Xarajatni qo'shish"}
      </Button>
    </form>
  )
}
