import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { updateParentProfile } from '../../api/parents'
import { extractErrorMessage } from '../../lib/apiClient'
import { useAuthStore } from '../../store/authStore'
import TextField from '../forms/TextField'

const editProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'Ism kiritilishi shart'),
  lastName: z.string().trim().min(1, 'Familiya kiritilishi shart'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda"),
})

export default function EditProfileForm() {
  const [isOpen, setIsOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    values: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: user?.phone ?? '' },
  })

  const mutation = useMutation({
    mutationFn: updateParentProfile,
    onSuccess: (updated) => {
      updateUser(updated)
      setIsOpen(false)
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  async function onSubmit(values) {
    mutation.mutate(values)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 h-12 rounded-2xl border-2 border-line px-4 text-base font-bold text-ink-soft transition-colors hover:bg-paper"
      >
        Ma'lumotlarni tahrirlash
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
      <TextField label="Ism" error={errors.firstName?.message} {...register('firstName')} />
      <TextField label="Familiya" error={errors.lastName?.message} {...register('lastName')} />
      <TextField
        label="Telefon raqami"
        placeholder="+998901234567"
        error={errors.phone?.message}
        {...register('phone')}
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
  )
}
