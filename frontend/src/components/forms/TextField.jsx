import { forwardRef } from 'react'

const TextField = forwardRef(function TextField({ label, error, type = 'text', ...props }, ref) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-base font-semibold text-ink">{label}</span>
      <input
        ref={ref}
        type={type}
        className={
          error
            ? 'h-14 rounded-2xl border-2 border-alert bg-alert-soft px-4 text-lg text-ink outline-none'
            : 'h-14 rounded-2xl border-2 border-line bg-card px-4 text-lg text-ink outline-none focus:border-forest'
        }
        {...props}
      />
      {error && <span className="text-base font-semibold text-alert">{error}</span>}
    </label>
  )
})

export default TextField
