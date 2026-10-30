import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { nameSchema, newPasswordSchema, phoneSchema } from '../../lib/validation'
import TextField from '../../components/forms/TextField'
import Button from '../../components/ui/Button'
import AuthCard from '../../components/auth/AuthCard'

const registerSchema = z
  .object({
    firstName: nameSchema('Ism'),
    lastName: nameSchema('Familiya'),
    phone: phoneSchema,
    password: newPasswordSchema(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parollar mos emas',
    path: ['confirmPassword'],
  })

export default function Register() {
  const registerParent = useAuthStore((state) => state.registerParent)
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  // Muvaffaqiyatli ro'yxatdan o'tilgach yo'naltirishni <GuestOnly> bajaradi.
  async function onSubmit(values) {
    setFormError(null)
    const { confirmPassword: _confirmPassword, ...payload } = values
    const result = await registerParent(payload)
    if (!result.ok) setFormError(result.error)
  }

  return (
    <AuthCard
      subtitle="Ota-ona sifatida ro'yxatdan o'ting"
      footer={
        <>
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-bold text-forest underline underline-offset-4">
            Kirish
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
        <TextField label="Ism" autoComplete="given-name" maxLength={50} error={errors.firstName?.message} {...register('firstName')} />
        <TextField label="Familiya" autoComplete="family-name" maxLength={50} error={errors.lastName?.message} {...register('lastName')} />
        <TextField
          label="Telefon raqami"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          hint="Parolni unutsangiz, shu raqamga bog'langan Telegram orqali tiklaysiz."
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextField
          label="Parol"
          type="password"
          autoComplete="new-password"
          hint="Kamida 6 ta belgi"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Parolni takrorlang"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {formError && (
          <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
            {formError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} fullWidth className="mt-2">
          Ro'yxatdan o'tish
        </Button>
      </form>
    </AuthCard>
  )
}
