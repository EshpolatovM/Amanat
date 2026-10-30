# Amanat

Ota-onalar farzandlariga ma'lum maqsad uchun bergan pulini kuzatib borish va shaffof qilish uchun web platforma.
Funksional talablar — [`amanat-tz.md`](amanat-tz.md), dizayn tizimi — [`amanat-design-system.md`](amanat-design-system.md),
Claude Code uchun loyiha qoidalari — [`CLAUDE.md`](CLAUDE.md).

## Tuzilma

| Papka | Stack |
|---|---|
| `backend/` | Node.js 20+, Express 5, Prisma + PostgreSQL 16, Telegraf (parolni tiklash boti) |
| `frontend/` | React 18 + Vite, TanStack Query, Zustand, react-hook-form + zod, Recharts, Tailwind CSS v4 |

## Ishga tushirish

### 1. Backend

```bash
cd backend
cp .env.example .env        # qiymatlarni to'ldiring (DATABASE_URL, JWT sirlari, Telegram bot tokeni)
npm install
npm run db:status           # PostgreSQL 5432-portda ishlayotganini tekshiradi
npm run db:setup            # bazani yaratadi + migratsiyalarni qo'llaydi + Prisma Client'ni generatsiya qiladi
npm run dev                 # http://localhost:4000, Swagger: http://localhost:4000/api-docs
```

`DATABASE_URL` standart holatda `postgresql://postgres:1234@127.0.0.1:5432/amanat?schema=public`.
Agar PostgreSQL boshqa manzil/parolda bo'lsa, faqat shu qatorni o'zgartiring. `npm run db:start` /
`npm run db:stop` tizim PostgreSQL xizmatini boshqaradi (sudo talab qiladi).

Muhim `.env` sozlamalari:

- `APP_TIMEZONE` (default `Asia/Tashkent`) — "bugun", joriy oy va kundalik xarajatlar shu mintaqa bo'yicha hisoblanadi.
- `TRUST_PROXY=true` — nginx kabi reverse-proxy ortida ishlaganda (rate-limit mijozning haqiqiy IP'sini ko'rishi uchun).
- `COOKIE_SECURE=true` — production'da (HTTPS).
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` — bo'lmasa, parolni tiklash 503 qaytaradi.

### 2. Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

## Tekshiruvlar

```bash
cd backend && npm test      # unit testlar (node --test): sana/summa validatsiyasi, telefon normalizatsiyasi, davrlar
cd frontend && npm run lint && npm run build
```

## Asosiy qoidalar (qisqacha)

- Pul summalari DB'da `BigInt` (so'm), API'da `string`; har bir javob `{ success, data }` formatida.
- Bola roli faqat o'qiy oladi (GET); ota-ona faqat o'z farzandlari ma'lumotiga kira oladi.
- Kundalik/avtomatik qoidalar `generatedUntil` kursori bilan ishlaydi: to'xtatilgan davr qayta yoqilganda
  to'ldirilmaydi, summa/jadval o'zgarishi faqat kelajakka ta'sir qiladi.
- Login, ro'yxatdan o'tish va parolni tiklash endpoint'lari rate-limit bilan himoyalangan.
