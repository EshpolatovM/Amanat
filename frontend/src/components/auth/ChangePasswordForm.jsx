import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { changeParentPassword } from '../../api/parents'
import { extractErrorMessage } from '../../lib/apiClient'
import { newPasswordSchema } from '../../lib/validation'
import { toast } from '../../store/toastStore'
import TextField from '../forms/TextField'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Joriy parolni kiriting'),
    newPassword: newPasswordSchema('Yangi parol'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Parollar mos emas',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Yangi parol joriy paroldan farq qilishi kerak',
    path: ['newPassword'],
  })

function ChangePasswordFields({ onDone }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

  const mutation = useMutation({
    mutationFn: (values) =>
      changeParentPassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success("Parol o'zgartirildi. Boshqa qurilmalardagi sessiyalar yopildi")
      onDone()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Joriy parol"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <TextField
        label="Yangi parol"
        type="password"
        autoComplete="new-password"
        hint="Kamida 6 ta belgi"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <TextField
        label="Yangi parolni takrorlang"
        type="password"
        autoComplete="new-password"
        error={errors.confirmNewPassword?.message}
        {...register('confirmNewPassword')}
      />

      {errors.root?.message && (
        <p role="alert" className="text-base font-semibold text-alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={mutation.isPending} fullWidth>
        Parolni saqlash
      </Button>
    </form>
  )
}

export default function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setIsOpen(true)}>
        <KeyRound className="h-5 w-5" aria-hidden="true" />
        Parolni o'zgartirish
      </Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Parolni o'zgartirish">
        {isOpen && <ChangePasswordFields onDone={() => setIsOpen(false)} />}
      </Modal>
    </>
  )
}
