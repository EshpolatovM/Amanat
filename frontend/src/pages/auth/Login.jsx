import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import TextField from '../../components/forms/TextField'

const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda"),
  password: z.string().min(1, 'Parol kiritilishi shart'),
})

export default function Login() {
  const [role, setRole] = useState('parent')
  const navigate = useNavigate()
  const loginParent = useAuthStore((state) => state.loginParent)
  const loginChild = useAuthStore((state) => state.loginChild)
  const formError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values) {
    clearError()
    const login = role === 'parent' ? loginParent : loginChild
    const success = await login(values.phone, values.password)
    if (success) navigate(role === 'parent' ? '/' : '/child', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border-2 border-slate-300 bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-slate-900">Amanat</h1>
        <p className="mt-1 text-center text-base font-semibold text-slate-700">Hisobingizga kiring</p>

        <div className="mt-6 flex rounded-2xl border-2 border-slate-300 p-1">
          <button
            type="button"
            onClick={() => setRole('parent')}
            className={
              role === 'parent'
                ? 'flex-1 rounded-xl bg-green-600 py-3 text-base font-bold text-white'
                : 'flex-1 rounded-xl py-3 text-base font-semibold text-slate-700'
            }
          >
            Ota-ona
          </button>
          <button
            type="button"
            onClick={() => setRole('child')}
            className={
              role === 'child'
                ? 'flex-1 rounded-xl bg-green-600 py-3 text-base font-bold text-white'
                : 'flex-1 rounded-xl py-3 text-base font-semibold text-slate-700'
            }
          >
            Bola
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
          <TextField
            label="Telefon raqami"
            placeholder="+998901234567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <TextField label="Parol" type="password" error={errors.password?.message} {...register('password')} />

          {role === 'parent' && (
            <Link to="/forgot-password" className="-mt-2 text-right text-base font-semibold text-green-600">
              Parolni unutdingizmi?
            </Link>
          )}

          {formError && <p className="text-base font-semibold text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              mt-2 h-14 rounded-2xl border-b-4 border-green-800 bg-green-600 text-lg font-bold text-white
              shadow-lg transition-all duration-100 ease-in-out
              hover:translate-y-0.5 hover:border-b-[3px]
              active:translate-y-1 active:border-b-0 active:shadow-none
              disabled:opacity-70
            "
          >
            {isSubmitting ? 'Kuting...' : 'Kirish'}
          </button>
        </form>

        {role === 'parent' && (
          <p className="mt-6 text-center text-base font-semibold text-slate-700">
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" className="text-green-600">
              Ro'yxatdan o'tish
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
