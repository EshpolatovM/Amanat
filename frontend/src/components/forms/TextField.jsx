import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FieldShell from './FieldShell'
import { describedBy, inputClassName } from './fieldStyles'

const TextField = forwardRef(function TextField({ label, error, hint, type = 'text', className = '', ...props }, ref) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          className={inputClassName({ error, className: `${isPassword ? 'pr-14' : ''} ${className}` })}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Parolni yashirish' : "Parolni ko'rsatish"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-1.5 my-auto flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            {revealed ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}
      </div>
    </FieldShell>
  )
})

export default TextField
