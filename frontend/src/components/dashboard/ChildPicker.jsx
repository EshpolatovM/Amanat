export default function ChildPicker({ childOptions, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={
          value === null
            ? 'rounded-full bg-forest px-4 py-2 text-base font-bold text-white transition-colors hover:bg-forest-dark'
            : 'rounded-full border-2 border-line px-4 py-2 text-base font-semibold text-ink-soft transition-colors hover:bg-paper'
        }
      >
        Barchasi
      </button>
      {childOptions.map((child) => (
        <button
          key={child.id}
          type="button"
          onClick={() => onChange(child.id)}
          className={
            value === child.id
              ? 'rounded-full bg-forest px-4 py-2 text-base font-bold text-white transition-colors hover:bg-forest-dark'
              : 'rounded-full border-2 border-line px-4 py-2 text-base font-semibold text-ink-soft transition-colors hover:bg-paper'
          }
        >
          {child.firstName}
        </button>
      ))}
    </div>
  )
}
