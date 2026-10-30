import Modal from './Modal'
import Button from './Button'

// Qaytarib bo'lmaydigan amallar (o'chirish, parolni almashtirish) uchun
// tasdiqlash oynasi — telefonda tasodifan bosib yuborishdan himoya.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Ha, o'chirish",
  cancelLabel = 'Bekor qilish',
  tone = 'danger',
  loading = false,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title}>
      <div className="flex flex-col gap-5">
        <div className="text-base font-semibold text-ink-soft">{children}</div>
        {error && (
          <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading} className="sm:flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
            className="sm:flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
