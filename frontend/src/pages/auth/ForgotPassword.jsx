import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import {
  startPasswordReset,
  fetchPasswordResetStatus,
  verifyPasswordResetOtp,
  confirmPasswordReset,
  passwordResetKeys,
} from '../../api/passwordReset'
import { extractErrorMessage } from '../../lib/apiClient'
import { newPasswordSchema, phoneSchema } from '../../lib/validation'
import { formatPhone } from '../../lib/phone'
import TextField from '../../components/forms/TextField'
import Button from '../../components/ui/Button'
import { buttonClassName } from '../../components/ui/buttonStyles'
import AuthCard from '../../components/auth/AuthCard'

const phoneFormSchema = z.object({ phone: phoneSchema })

const otpSchema = z.object({
  otp: z
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{6}$/, 'Kod 6 xonali raqamdan iborat bo\'lishi kerak')),
})

const passwordSchema = z
  .object({
    newPassword: newPasswordSchema(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Parollar mos emas',
    path: ['confirmPassword'],
  })

const STEPS = ['phone', 'telegram', 'otp', 'password']

function StepIndicator({ step }) {
  const index = STEPS.indexOf(step)
  if (index < 0) return null
  return (
    <p className="mt-4 text-center text-sm font-bold text-ink-soft" aria-live="polite">
      {index + 1}-qadam / {STEPS.length}
    </p>
  )
}

function FormError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
      {message}
    </p>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('phone')
  const [request, setRequest] = useState(null) // { requestId, botDeepLink, phone }
  const [resetToken, setResetToken] = useState(null)

  function restart() {
    setStep('phone')
    setRequest(null)
    setResetToken(null)
  }

  return (
    <AuthCard
      subtitle="Parolni tiklash"
      footer={
        step !== 'done' && (
          <Link to="/login" className="font-bold text-forest underline underline-offset-4">
            Kirish sahifasiga qaytish
          </Link>
        )
      }
    >
      <StepIndicator step={step} />

      {step === 'phone' && (
        <PhoneStep
          onSuccess={(data, phone) => {
            setRequest({ ...data, phone })
            setStep('telegram')
          }}
        />
      )}

      {step === 'telegram' && (
        <TelegramStep request={request} onVerified={() => setStep('otp')} onRestart={restart} />
      )}

      {step === 'otp' && (
        <OtpStep
          requestId={request.requestId}
          onSuccess={(data) => {
            setResetToken(data.resetToken)
            setStep('password')
          }}
          onRestart={restart}
        />
      )}

      {step === 'password' && (
        <PasswordStep
          requestId={request.requestId}
          resetToken={resetToken}
          onSuccess={() => setStep('done')}
          onRestart={restart}
        />
      )}

      {step === 'done' && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="rounded-2xl border-2 border-forest bg-forest-soft p-4 text-base font-semibold text-forest-dark">
            Parolingiz yangilandi. Xavfsizlik uchun barcha qurilmalardan chiqarildingiz — endi yangi parol bilan kiring.
          </p>
          <Button onClick={() => navigate('/login', { replace: true })} fullWidth>
            Kirish sahifasiga o'tish
          </Button>
        </div>
      )}
    </AuthCard>
  )
}

function PhoneStep({ onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(phoneFormSchema) })

  const mutation = useMutation({
    mutationFn: (values) => startPasswordReset(values.phone),
    onSuccess: (data, values) => onSuccess(data, values.phone),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-4 flex flex-col gap-4" noValidate>
      <p className="text-base font-semibold text-ink-soft">
        Ro'yxatdan o'tgan telefon raqamingizni kiriting. Keyin shu raqam ulangan Telegram orqali tasdiqlaysiz.
      </p>
      <TextField
        label="Telefon raqami"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+998 90 123 45 67"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <FormError message={mutation.isError ? extractErrorMessage(mutation.error) : null} />
      <Button type="submit" loading={mutation.isPending} fullWidth>
        Davom etish
      </Button>
    </form>
  )
}

const isTerminalError = (error) => [404, 410].includes(error?.response?.status)

function TelegramStep({ request, onVerified, onRestart }) {
  const statusQuery = useQuery({
    queryKey: passwordResetKeys.status(request.requestId),
    queryFn: () => fetchPasswordResetStatus(request.requestId),
    // Tarmoq uzilsa ham kutishda davom etamiz; faqat so'rov topilmasa/muddati o'tsa to'xtaymiz.
    refetchInterval: (query) => (isTerminalError(query.state.error) ? false : 2000),
    refetchIntervalInBackground: true,
    retry: false,
    staleTime: 0,
  })

  const status = statusQuery.data?.status
  useEffect(() => {
    if (status === 'otp_sent') onVerified()
  }, [status, onVerified])

  const expired = isTerminalError(statusQuery.error)

  if (expired) {
    return (
      <div className="mt-4 flex flex-col gap-4">
        <FormError message="So'rov muddati tugadi (15 daqiqa). Qaytadan boshlang." />
        <Button variant="secondary" onClick={onRestart} fullWidth>
          Qaytadan boshlash
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <p className="text-base font-semibold text-ink-soft">
        <strong className="text-ink">{formatPhone(request.phone)}</strong> raqamini tasdiqlash uchun:
      </p>
      <ol className="flex list-decimal flex-col gap-2 pl-6 text-base font-semibold text-ink">
        <li>Quyidagi tugma orqali Telegram botni oching va «Start»ni bosing.</li>
        <li>Botdagi «📱 Telefon raqamni ulashish» tugmasini bosing.</li>
        <li>Bot kod yuboradi — bu sahifa o'zi keyingi qadamga o'tadi.</li>
      </ol>

      <a href={request.botDeepLink} target="_blank" rel="noreferrer" className={buttonClassName({ fullWidth: true })}>
        <Send className="h-5 w-5" aria-hidden="true" />
        Telegram botni ochish
      </a>

      <p role="status" className="text-center text-sm font-semibold text-ink-soft">
        {statusQuery.isError ? 'Aloqa uzildi — qayta ulanmoqda…' : 'Telegram orqali tasdiqlanishi kutilmoqda…'}
      </p>

      <Button variant="ghost" size="md" onClick={onRestart}>
        Boshqa raqam kiritish
      </Button>
    </div>
  )
}

function OtpStep({ requestId, onSuccess, onRestart }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(otpSchema) })

  const mutation = useMutation({
    mutationFn: (values) => verifyPasswordResetOtp(requestId, values.otp),
    onSuccess,
  })
  const locked = [410, 429].includes(mutation.error?.response?.status)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-4 flex flex-col gap-4" noValidate>
      <p className="text-base font-semibold text-ink-soft">Telegram botga yuborilgan 6 xonali kodni kiriting.</p>
      <TextField
        label="Tasdiqlash kodi"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        placeholder="123456"
        className="text-center font-mono font-bold tracking-[0.4em]"
        error={errors.otp?.message}
        {...register('otp')}
      />
      <FormError message={mutation.isError ? extractErrorMessage(mutation.error) : null} />
      {locked ? (
        <Button onClick={onRestart} fullWidth>
          Qaytadan boshlash
        </Button>
      ) : (
        <Button type="submit" loading={mutation.isPending} fullWidth>
          Tasdiqlash
        </Button>
      )}
      {!locked && (
        <Button variant="ghost" size="md" onClick={onRestart}>
          Boshidan boshlash
        </Button>
      )}
    </form>
  )
}

function PasswordStep({ requestId, resetToken, onSuccess, onRestart }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(passwordSchema) })

  const mutation = useMutation({
    mutationFn: (values) => confirmPasswordReset({ requestId, resetToken, newPassword: values.newPassword }),
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-4 flex flex-col gap-4" noValidate>
      <p className="text-base font-semibold text-ink-soft">Raqamingiz tasdiqlandi. Yangi parol o'ylab toping.</p>
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
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <FormError message={mutation.isError ? extractErrorMessage(mutation.error) : null} />
      <Button type="submit" loading={mutation.isPending} fullWidth>
        Parolni yangilash
      </Button>
      <Button variant="ghost" size="md" onClick={onRestart}>
        Boshidan boshlash
      </Button>
    </form>
  )
}
