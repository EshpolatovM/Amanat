function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'min-h-11 rounded-full border-2 border-forest bg-forest px-4 py-2 text-base font-bold text-white transition-colors hover:bg-forest-dark'
          : 'min-h-11 rounded-full border-2 border-line bg-card px-4 py-2 text-base font-semibold text-ink-soft transition-colors hover:bg-paper'
      }
    >
      {children}
    </button>
  )
}

// Bir nechta farzand bo'lsa — kimning ma'lumotini ko'rishni tanlash.
// `allowAll` — "Barchasi" (umumlashtirilgan) varianti (Xarajatlar sahifasida yo'q).
export default function ChildPicker({ childOptions, value, onChange, allowAll = true }) {
  // Bir xil ismli farzandlar bo'lsa, familiya bilan ajratamiz
  const firstNames = childOptions.map((child) => child.firstName)
  const labelOf = (child) =>
    firstNames.filter((name) => name === child.firstName).length > 1 ? `${child.firstName} ${child.lastName}` : child.firstName

  return (
    <div role="group" aria-label="Farzandni tanlash" className="flex flex-wrap gap-2">
      {allowAll && (
        <Chip active={value === null} onClick={() => onChange(null)}>
          Barchasi
        </Chip>
      )}
      {childOptions.map((child) => (
        <Chip key={child.id} active={value === child.id} onClick={() => onChange(child.id)}>
          {labelOf(child)}
        </Chip>
      ))}
    </div>
  )
}
