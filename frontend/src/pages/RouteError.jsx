import { useRouteError } from 'react-router-dom'
import Button from '../components/ui/Button'

// Render paytidagi kutilmagan xatolik (yoki yangi versiya chiqqanidan keyin
// eski sahifa bo'lagini yuklab bo'lmaslik) — oq ekran o'rniga tushunarli xabar.
export default function RouteError() {
  const error = useRouteError()
  const isChunkError = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(
    error?.message ?? '',
  )

  if (import.meta.env.DEV) console.error(error)

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-line bg-card p-8 text-center shadow-lg">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          {isChunkError ? 'Ilova yangilandi' : 'Nimadir noto\'g\'ri ketdi'}
        </h1>
        <p className="mt-2 text-base font-semibold text-ink-soft">
          {isChunkError
            ? "Amanat'ning yangi versiyasi chiqdi. Davom etish uchun sahifani yangilang."
            : "Sahifani ko'rsatishda xatolik yuz berdi. Sahifani yangilab ko'ring — ma'lumotlaringiz saqlangan."}
        </p>
        <Button onClick={() => window.location.reload()} fullWidth className="mt-6">
          Sahifani yangilash
        </Button>
      </div>
    </main>
  )
}
