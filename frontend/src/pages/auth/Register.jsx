import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import TextField from '../../components/forms/TextField'

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Ism kiritilishi shart'),
    lastName: z.string().trim().min(1, 'Familiya kiritilishi shart'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda"),
    password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Parollar mos emas',
    path: ['confirmPassword'],
  })

export default function Register() {
  const navigate = useNavigate()
  const registerParent = useAuthStore((state) => state.registerParent)
  const formError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values) {
    clearError()
    const { confirmPassword: _confirmPassword, ...payload } = values
    const success = await registerParent(payload)
    if (success) navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border-2 border-slate-300 bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-slate-900">Amanat</h1>
        <p className="mt-1 text-center text-base font-semibold text-slate-700">
          Ota-ona sifatida ro'yxatdan o'ting
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
          <TextField label="Ism" error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Familiya" error={errors.lastName?.message} {...register('lastName')} />
          <TextField
            label="Telefon raqami"
            placeholder="+998901234567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <TextField label="Parol" type="password" error={errors.password?.message} {...register('password')} />
          <TextField
            label="Parolni tasdiqlang"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

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
            {isSubmitting ? 'Kuting...' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="mt-6 text-center text-base font-semibold text-slate-700">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="text-green-600">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
