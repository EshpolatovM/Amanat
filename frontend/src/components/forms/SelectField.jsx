import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import FieldShell from './FieldShell'
import { describedBy, inputClassName } from './fieldStyles'

const SelectField = forwardRef(function SelectField({ label, error, hint, className = '', children, ...props }, ref) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          className={inputClassName({ error, className: `appearance-none pr-12 ${className}` })}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 right-4 my-auto h-5 w-5 text-ink-soft"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  )
})

export default SelectField
