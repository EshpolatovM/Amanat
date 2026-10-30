// Kirish/ro'yxatdan o'tish/parolni tiklash sahifalari uchun umumiy "varaq".
export default function AuthCard({ subtitle, children, footer }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border-2 border-line bg-card p-6 shadow-lg sm:p-8">
          <h1 className="text-center font-serif text-3xl font-semibold text-ink">Amanat</h1>
          {subtitle && <p className="mt-1 text-center text-base font-semibold text-ink-soft">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-base font-semibold text-ink-soft">{footer}</div>}
      </div>
    </main>
  )
}
