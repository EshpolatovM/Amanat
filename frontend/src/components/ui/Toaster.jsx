import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const TONES = {
  success: { box: 'border-forest bg-forest-soft text-forest-dark', icon: CheckCircle2 },
  error: { box: 'border-alert bg-alert-soft text-alert-dark', icon: AlertCircle },
}

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] mx-auto flex max-w-md flex-col gap-2"
    >
      {toasts.map((item) => {
        const tone = TONES[item.tone] ?? TONES.success
        const Icon = tone.icon
        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border-2 px-4 py-3 shadow-lg ${tone.box}`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-base font-bold">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Yopish"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-card/60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
