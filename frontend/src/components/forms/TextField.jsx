import { forwardRef } from 'react'

const TextField = forwardRef(function TextField({ label, error, type = 'text', ...props }, ref) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-base font-semibold text-slate-900">{label}</span>
      <input
        ref={ref}
        type={type}
        className={
          error
            ? 'h-14 rounded-2xl border-2 border-red-500 bg-red-50 px-4 text-lg text-slate-900 outline-none'
            : 'h-14 rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none focus:border-green-600'
        }
        {...props}
      />
      {error && <span className="text-base font-semibold text-red-600">{error}</span>}
    </label>
  )
})

export default TextField
