import { RotateCw } from 'lucide-react'
import { extractErrorMessage } from '../../lib/apiClient'
import Button from './Button'

// Harakatsiz (avtomatik animatsiyasiz) yuklanish holati — CLAUDE.md §7, 2-prinsip.
export function LoadingState({ label = 'Yuklanmoqda…', className = '' }) {
  return (
    <p role="status" className={`py-6 text-base font-semibold text-ink-soft ${className}`}>
      {label}
    </p>
  )
}

export function ErrorState({ error, onRetry, className = '' }) {
  return (
    <div role="alert" className={`flex flex-col items-start gap-3 rounded-2xl border-2 border-alert bg-alert-soft p-4 ${className}`}>
      <p className="text-base font-semibold text-alert">{extractErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Qayta urinish
        </Button>
      )}
    </div>
  )
}

// Bo'sh holat — uzr so'ramaydi, keyingi qadamni aytadi (CLAUDE.md §7, 3-prinsip).
export function EmptyState({ children, action, className = '' }) {
  return (
    <div className={`flex flex-col items-start gap-3 rounded-2xl border-2 border-dashed border-line p-5 ${className}`}>
      <p className="text-base font-semibold text-ink-soft">{children}</p>
      {action}
    </div>
  )
}
