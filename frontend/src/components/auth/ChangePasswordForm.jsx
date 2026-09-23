import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { changeParentPassword } from '../../api/parents'
import { extractErrorMessage } from '../../lib/apiClient'
import TextField from '../forms/TextField'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Joriy parol kiritilishi shart'),
    newPassword: z.string().min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Parollar mos emas',
    path: ['confirmNewPassword'],
  })

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

  const mutation = useMutation({
    mutationFn: (values) =>
      changeParentPassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      setSuccess(true)
      reset()
      setIsOpen(false)
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  async function onSubmit(values) {
    mutation.mutate(values)
  }

  return (
    <div>
      {success && !isOpen && (
        <div className="rounded-2xl border-2 border-forest bg-forest-soft p-3">
          <p className="text-base font-semibold text-ink-soft">Parol muvaffaqiyatli o'zgartirildi.</p>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setSuccess(false)
            setIsOpen(true)
          }}
          className="h-14 rounded-2xl border-2 border-line px-4 text-base font-bold text-ink-soft transition-colors hover:bg-paper"
        >
          Parolni o'zgartirish
        </button>
      )}

      {isOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <TextField
            label="Joriy parol"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <TextField
            label="Yangi parol"
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <TextField
            label="Yangi parolni tasdiqlang"
            type="password"
            error={errors.confirmNewPassword?.message}
            {...register('confirmNewPassword')}
          />

          {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                h-14 flex-1 rounded-2xl border-b-2 border-forest-dark bg-forest text-base font-bold text-white
                shadow-lg transition-all duration-100 ease-in-out
                hover:translate-y-px hover:border-b-px
                active:translate-y-0.5 active:border-b-0 active:shadow-none
                disabled:opacity-70
              "
            >
              {isSubmitting ? 'Kuting...' : 'Saqlash'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-14 flex-1 rounded-2xl border-2 border-line text-base font-bold text-ink-soft transition-colors hover:bg-paper"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
