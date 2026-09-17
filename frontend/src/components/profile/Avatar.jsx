export default function Avatar({ firstName, lastName, className = '' }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold ${className}`}
    >
      {initials}
    </div>
  )
}
