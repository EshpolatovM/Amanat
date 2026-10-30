import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { BUTTON_SIZES, BUTTON_VARIANTS } from './buttonStyles'

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'lg', loading = false, fullWidth = false, className = '', type = 'button', disabled, children, ...props },
  ref,
) {
  const style = BUTTON_VARIANTS[variant]
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex shrink-0 items-center justify-center gap-2 font-bold transition-all duration-100 ease-in-out select-none',
        style.base,
        isDisabled ? 'opacity-60' : style.interactive,
        BUTTON_SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})

export default Button
