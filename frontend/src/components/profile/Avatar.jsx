const SIZES = {
  sm: 'h-11 w-11 text-base',
  md: 'h-16 w-16 text-xl',
}

export default function Avatar({ firstName, lastName, size = 'md', className = '' }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toLocaleUpperCase('uz')

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${SIZES[size]} ${className}`}
    >
      {initials}
    </div>
  )
}
