export default function ChildPicker({ childOptions, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={
          value === null
            ? 'rounded-full bg-green-600 px-4 py-2 text-base font-bold text-white'
            : 'rounded-full border-2 border-slate-300 px-4 py-2 text-base font-semibold text-slate-700'
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
              ? 'rounded-full bg-green-600 px-4 py-2 text-base font-bold text-white'
              : 'rounded-full border-2 border-slate-300 px-4 py-2 text-base font-semibold text-slate-700'
          }
        >
          {child.firstName}
        </button>
      ))}
    </div>
  )
}
