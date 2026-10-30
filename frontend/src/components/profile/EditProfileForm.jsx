import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { updateParentProfile } from '../../api/parents'
import { extractErrorMessage } from '../../lib/apiClient'
import { nameSchema, phoneSchema } from '../../lib/validation'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../store/toastStore'
import TextField from '../forms/TextField'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const editProfileSchema = z.object({
  firstName: nameSchema('Ism'),
  lastName: nameSchema('Familiya'),
  phone: phoneSchema,
})

function EditProfileFields({ user, onDone }) {
  const updateUser = useAuthStore((state) => state.updateUser)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { firstName: user.firstName, lastName: user.lastName, phone: user.phone },
  })

  const mutation = useMutation({
    mutationFn: updateParentProfile,
    onSuccess: (updated) => {
      updateUser(updated)
      toast.success("Ma'lumotlar saqlandi")
      onDone()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <TextField label="Ism" autoComplete="given-name" maxLength={50} error={errors.firstName?.message} {...register('firstName')} />
      <TextField label="Familiya" autoComplete="family-name" maxLength={50} error={errors.lastName?.message} {...register('lastName')} />
      <TextField
        label="Telefon raqami"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+998 90 123 45 67"
        hint="Tizimga shu raqam bilan kirasiz. Parolni tiklash ham shu raqamga bog'langan Telegram orqali bo'ladi."
        error={errors.phone?.message}
        {...register('phone')}
      />

      {errors.root?.message && (
        <p role="alert" className="text-base font-semibold text-alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={mutation.isPending} fullWidth>
        Saqlash
      </Button>
    </form>
  )
}

export default function EditProfileForm() {
  const [isOpen, setIsOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setIsOpen(true)}>
        <Pencil className="h-5 w-5" aria-hidden="true" />
        Ma'lumotlarni tahrirlash
      </Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Mening ma'lumotlarim">
        {user && <EditProfileFields user={user} onDone={() => setIsOpen(false)} />}
      </Modal>
    </>
  )
}
