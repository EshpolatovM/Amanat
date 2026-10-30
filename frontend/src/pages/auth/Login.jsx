import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { phoneSchema } from '../../lib/validation'
import TextField from '../../components/forms/TextField'
import Button from '../../components/ui/Button'
import AuthCard from '../../components/auth/AuthCard'

const parentLoginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Parolni kiriting'),
})

const childLoginSchema = z.object({
  phone: z
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{9,15}$/, 'Kirish ID — ota-onang bergan 9 xonali raqam')),
  password: z.string().min(1, 'Parolni kiriting'),
})

const ROLES = [
  { value: 'parent', label: 'Ota-ona' },
  { value: 'child', label: 'Bola' },
]

function LoginForm({ role }) {
  const loginParent = useAuthStore((state) => state.loginParent)
  const loginChild = useAuthStore((state) => state.loginChild)
  const notice = useAuthStore((state) => state.notice)
  const clearNotice = useAuthStore((state) => state.clearNotice)
  const [formError, setFormError] = useState(null)
  const isParent = role === 'parent'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(isParent ? parentLoginSchema : childLoginSchema) })

  // Muvaffaqiyatli kirilgach yo'naltirishni <GuestOnly> bajaradi.
  async function onSubmit(values) {
    setFormError(null)
    clearNotice()
    const login = isParent ? loginParent : loginChild
    const result = await login(values.phone, values.password)
    if (!result.ok) setFormError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
      {notice && (
        <p role="status" className="rounded-2xl border-2 border-bronze bg-bronze-soft p-3 text-base font-semibold text-bronze-ink">
          {notice}
        </p>
      )}

      {isParent ? (
        <TextField
          label="Telefon raqami"
          type="tel"
          inputMode="tel"
          autoComplete="username"
          placeholder="+998 90 123 45 67"
          error={errors.phone?.message}
          {...register('phone')}
        />
      ) : (
        <TextField
          label="Kirish ID"
          inputMode="numeric"
          autoComplete="username"
          placeholder="123 456 789"
          hint="Ota-onang Profil bo'limida yaratgan raqam"
          error={errors.phone?.message}
          {...register('phone')}
        />
      )}
      <TextField
        label="Parol"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {isParent && (
        <Link to="/forgot-password" className="-mt-1 self-end text-base font-bold text-forest underline underline-offset-4">
          Parolni unutdingizmi?
        </Link>
      )}

      {formError && (
        <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
          {formError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} fullWidth className="mt-2">
        Kirish
      </Button>
    </form>
  )
}

export default function Login() {
  const [role, setRole] = useState('parent')

  return (
    <AuthCard
      subtitle="Hisobingizga kiring"
      footer={
        role === 'parent' ? (
          <>
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" className="font-bold text-forest underline underline-offset-4">
              Ro'yxatdan o'tish
            </Link>
          </>
        ) : (
          'Bola hisobini ota-ona Profil bo\'limida yaratadi.'
        )
      }
    >
      <div role="group" aria-label="Kim sifatida kirish" className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border-2 border-line p-1">
        {ROLES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            aria-pressed={role === option.value}
            className={
              role === option.value
                ? 'min-h-12 rounded-xl bg-forest text-base font-bold text-white'
                : 'min-h-12 rounded-xl text-base font-semibold text-ink-soft transition-colors hover:bg-paper'
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Rol almashganda forma (qiymatlar, xatolar) toza holatdan boshlanadi */}
      <LoginForm key={role} role={role} />
    </AuthCard>
  )
}
