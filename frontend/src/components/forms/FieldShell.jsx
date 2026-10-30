// Label + maydon + izoh/xato matni. Xato matni input bilan aria-describedby
// orqali bog'lanadi — ekran o'quvchi xatoni maydon bilan birga o'qiydi.
export default function FieldShell({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm font-semibold text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-base font-semibold text-alert">
          {error}
        </p>
      )}
    </div>
  )
}
