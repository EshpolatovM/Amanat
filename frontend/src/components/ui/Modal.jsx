import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import IconButton from './IconButton'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function trapFocus(event, container) {
  const focusable = [...container.querySelectorAll(FOCUSABLE)]
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// Mobil'da pastdan chiquvchi varaq, kattaroq ekranda markazda. Esc bilan
// yopiladi, fokus oyna ichida aylanadi va yopilganda avvalgi joyiga qaytadi.
export default function Modal({ open, onClose, title, children }) {
  const titleId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current?.()
      } else if (event.key === 'Tab' && panelRef.current) {
        trapFocus(event, panelRef.current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-b-0 border-line bg-card px-6 pt-5 shadow-lg outline-none sm:rounded-3xl sm:border-b-2"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-line pb-3">
          <h2 id={titleId} className="font-serif text-xl font-semibold text-ink">
            {title}
          </h2>
          <IconButton label="Yopish" icon={X} onClick={onClose} />
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
