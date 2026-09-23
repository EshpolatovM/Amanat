import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  startPasswordReset,
  fetchPasswordResetStatus,
  verifyPasswordResetOtp,
  confirmPasswordReset,
  passwordResetKeys,
} from '../../api/passwordReset'
import { extractErrorMessage } from '../../lib/apiClient'
import TextField from '../../components/forms/TextField'

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{9,15}$/, "Telefon raqami noto'g'ri formatda"),
})

const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kod 6 xonali raqamdan iborat bo'lishi kerak"),
})

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Parollar mos emas',
    path: ['confirmPassword'],
  })

function Card({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border-2 border-line bg-card p-8 shadow-lg">{children}</div>
    </div>
  )
}

function SubmitButton({ children, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="
        mt-2 h-14 rounded-2xl border-b-2 border-forest-dark bg-forest text-lg font-bold text-white
        shadow-lg transition-all duration-100 ease-in-out
        hover:translate-y-px hover:border-b-px
        active:translate-y-0.5 active:border-b-0 active:shadow-none
        disabled:opacity-70
      "
    >
      {children}
    </button>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('phone')
  const [requestId, setRequestId] = useState(null)
  const [botDeepLink, setBotDeepLink] = useState(null)
  const [resetToken, setResetToken] = useState(null)

  function restart() {
    setStep('phone')
    setRequestId(null)
    setBotDeepLink(null)
    setResetToken(null)
  }

  return (
    <Card>
      <h1 className="text-center text-3xl font-serif font-semibold text-ink">Amanat</h1>
      <p className="mt-1 text-center text-base font-semibold text-ink-soft">Parolni tiklash</p>

      {step === 'phone' && (
        <PhoneStep
          onSuccess={(data) => {
            setRequestId(data.requestId)
            setBotDeepLink(data.botDeepLink)
            setStep('telegram')
          }}
        />
      )}

      {step === 'telegram' && (
        <TelegramStep requestId={requestId} botDeepLink={botDeepLink} onVerified={() => setStep('otp')} onRestart={restart} />
      )}

      {step === 'otp' && (
        <OtpStep
          requestId={requestId}
          onSuccess={(data) => {
            setResetToken(data.resetToken)
            setStep('password')
          }}
          onRestart={restart}
        />
      )}

      {step === 'password' && (
        <PasswordStep
          requestId={requestId}
          resetToken={resetToken}
          onSuccess={() => setStep('done')}
          onRestart={restart}
        />
      )}

      {step === 'done' && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-center text-base font-semibold text-ink-soft underline transition-colors hover:text-ink">
            Parolingiz muvaffaqiyatli yangilandi. Endi yangi parol bilan tizimga kirishingiz mumkin.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="
              h-14 rounded-2xl border-b-2 border-forest-dark bg-forest text-lg font-bold text-white
              shadow-lg transition-all duration-100 ease-in-out
              hover:translate-y-px hover:border-b-px
              active:translate-y-0.5 active:border-b-0 active:shadow-none
            "
          >
            Kirish sahifasiga o'tish
          </button>
        </div>
      )}

      {step !== 'done' && (
        <p className="mt-6 text-center text-base font-semibold text-ink-soft">
          <Link to="/login" className="text-forest underline transition-colors hover:text-forest">
            Kirish sahifasiga qaytish
          </Link>
        </p>
      )}
    </Card>
  )
}

function PhoneStep({ onSuccess }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(phoneSchema) })

  const mutation = useMutation({
    mutationFn: (values) => startPasswordReset(values.phone),
    onSuccess,
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 flex flex-col gap-4" noValidate>
      <p className="text-base font-semibold text-ink-soft">
        Ro'yxatdan o'tgan telefon raqamingizni kiriting. Parolni tiklash uchun Telegram bot orqali tasdiqlaysiz.
      </p>
      <TextField
        label="Telefon raqami"
        placeholder="+998901234567"
        error={errors.phone?.message}
        {...register('phone')}
      />
      {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}
      <SubmitButton disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Kuting...' : 'Davom etish'}
      </SubmitButton>
    </form>
  )
}

function TelegramStep({ requestId, botDeepLink, onVerified, onRestart }) {
  const statusQuery = useQuery({
    queryKey: passwordResetKeys.status(requestId),
    queryFn: () => fetchPasswordResetStatus(requestId),
    enabled: !!requestId,
    refetchInterval: 2000,
    retry: false,
  })

  useEffect(() => {
    if (statusQuery.data?.status === 'otp_sent') onVerified()
  }, [statusQuery.data, onVerified])

  const expired = statusQuery.isError

  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="text-base font-semibold text-ink-soft">
        1. Quyidagi tugma orqali Telegram botni oching va <strong>Start</strong> bosing.
        <br />
        2. Bot so'ragan tugma orqali telefon raqamingizni ulashing.
        <br />
        3. Bu sahifa o'zi davom etadi.
      </p>

      {expired ? (
        <>
          <p className="text-base font-semibold text-alert">
            So'rov muddati tugagan yoki topilmadi. Qaytadan boshlang.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="h-14 rounded-2xl border-2 border-line text-lg font-bold text-ink transition-colors hover:bg-paper"
          >
            Qaytadan boshlash
          </button>
        </>
      ) : (
        <>
          <a
            href={botDeepLink}
            target="_blank"
            rel="noreferrer"
            className="
              flex h-14 items-center justify-center rounded-2xl border-b-2 border-forest-dark bg-forest
              text-lg font-bold text-white shadow-lg transition-all duration-100 ease-in-out
              hover:translate-y-px hover:border-b-px
              active:translate-y-0.5 active:border-b-0 active:shadow-none
            "
          >
            Telegram botni ochish
          </a>
          <p className="text-center text-sm font-semibold text-ink-soft">Tasdiqlanishini kutmoqda...</p>
        </>
      )}
    </div>
  )
}

function OtpStep({ requestId, onSuccess, onRestart }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(otpSchema) })

  const mutation = useMutation({
    mutationFn: (values) => verifyPasswordResetOtp(requestId, values.otp),
    onSuccess,
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 flex flex-col gap-4" noValidate>
      <p className="text-base font-semibold text-ink-soft">Telegram botga yuborilgan 6 xonali kodni kiriting.</p>
      <TextField
        label="Tasdiqlash kodi"
        placeholder="123456"
        inputMode="numeric"
        error={errors.otp?.message}
        {...register('otp')}
      />
      {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}
      <SubmitButton disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
      </SubmitButton>
      <button type="button" onClick={onRestart} className="text-center text-base font-semibold text-ink-soft underline transition-colors hover:text-ink">
        Boshidan boshlash
      </button>
    </form>
  )
}

function PasswordStep({ requestId, resetToken, onSuccess, onRestart }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  const mutation = useMutation({
    mutationFn: (values) =>
      confirmPasswordReset({ requestId, resetToken, newPassword: values.newPassword }),
    onSuccess,
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 flex flex-col gap-4" noValidate>
      <TextField label="Yangi parol" type="password" error={errors.newPassword?.message} {...register('newPassword')} />
      <TextField
        label="Yangi parolni tasdiqlang"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}
      <SubmitButton disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Saqlanmoqda...' : 'Parolni yangilash'}
      </SubmitButton>
      <button type="button" onClick={onRestart} className="text-center text-base font-semibold text-ink-soft underline transition-colors hover:text-ink">
        Boshidan boshlash
      </button>
    </form>
  )
}
