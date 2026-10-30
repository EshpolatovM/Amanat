import { forwardRef, useCallback, useId, useLayoutEffect, useRef } from 'react'
import FieldShell from './FieldShell'
import { describedBy, inputClassName } from './fieldStyles'
import { groupDigits, sanitizeMoneyInput } from '../../lib/money'

// Summa maydoni: yozish davomida minglik bo'shliqlar bilan ko'rsatiladi
// ("1 500 000"), qiymat esa faqat raqamli satr ("1500000") sifatida saqlanadi —
// ko'p nolli summada xato qilish ehtimoli kamayadi. Telefonda raqamli klaviatura.
// react-hook-form'ning <Controller> bilan ishlatiladi (value/onChange).
const MoneyField = forwardRef(function MoneyField(
  { label, error, hint, value, onChange, onBlur, name, className = '', ...props },
  ref,
) {
  const id = useId()
  const inputRef = useRef(null)
  const caretDigitsRef = useRef(null)

  const setRefs = useCallback(
    (node) => {
      inputRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  // Formatlashdan keyin kursor oxiriga sakrab ketmasin: kursordan oldingi
  // raqamlar sonini eslab qolib, yangi matnda o'sha joyga qaytaramiz.
  useLayoutEffect(() => {
    const input = inputRef.current
    const digitsBeforeCaret = caretDigitsRef.current
    if (!input || digitsBeforeCaret === null || document.activeElement !== input) return
    caretDigitsRef.current = null
    let position = 0
    let seen = 0
    while (position < input.value.length && seen < digitsBeforeCaret) {
      if (/\d/.test(input.value[position])) seen += 1
      position += 1
    }
    input.setSelectionRange(position, position)
  })

  function handleChange(event) {
    const raw = event.target.value
    const caret = event.target.selectionStart ?? raw.length
    caretDigitsRef.current = raw.slice(0, caret).replace(/\D/g, '').length
    onChange(sanitizeMoneyInput(raw))
  }

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          ref={setRefs}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value ? groupDigits(value) : ''}
          onChange={handleChange}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          className={inputClassName({ error, className: `pr-16 font-semibold tabular-nums ${className}` })}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-base font-semibold text-ink-soft">
          so'm
        </span>
      </div>
    </FieldShell>
  )
})

export default MoneyField
