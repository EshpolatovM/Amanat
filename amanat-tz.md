# Amanat — Ota-Ona uchun Moliyaviy Nazorat Platformasi

## 1. Loyiha haqida

### Muammo
Ota-onalar farzandlariga ma'lum maqsad uchun pul beradi (kurs puli, telefon puli va h.k.), lekin bu pul haqiqatan o'sha maqsadga sarflanganini bila olmaydi. Bola pulni boshqa narsaga ishlatib qo'yib, "hali kursga pul beraman" deb aldashi mumkin. Ayni paytda, yangi telefon olib berish, oylik qancha pul ketayotgani kabi xarajatlar ham hisobga olinmay, chalkashib ketadi.

### Yechim
Ota-ona farzandiga bergan har bir pulni **maqsad bo'yicha** tizimga kiritadi (kurs, telefon va h.k.), tizim buni kuzatib boradi, statistikasini ko'rsatadi va kundalik/kutilmagan xarajatlarni ham hisobga oladi. Bola faqat o'ziga tegishli ma'lumotni **ko'ra oladi**, tahrirlay olmaydi — bu shaffoflikni ta'minlaydi va nizolarni kamaytiradi.

---

## 2. Foydalanuvchi rollari

| Rol | Huquqlar |
|---|---|
| **Ota-ona** | To'liq kirish: xarajat/maqsad kiritish, statistikani ko'rish, bolalar profilini boshqarish, sozlamalarni o'zgartirish |
| **Bola** | Faqat ko'rish (read-only): o'ziga ajratilgan pul, xarajatlar va statistikani ko'radi, hech narsani tahrirlay olmaydi |

- Har ikkala rol uchun alohida login (auth) mavjud.
- Bola akkaunti ota-ona akkauntiga bog'langan (parent-child relationship).
- Bitta ota-ona bir nechta bolani boshqara olishi kerak (ko'p farzandli oilalar uchun).

---

## 3. Sahifalar (Pages)

### 3.1. Dashboard
Umumiy ko'rinish: joriy oy uchun necha pul berilgani, qancha maqsadli xarajat qilingani, kutilmagan xarajatlar va tezkor statistika xulosasi. Ota-ona uchun — barcha bolalar bo'yicha umumlashtirilgan ko'rinish; bola uchun — faqat o'zining ma'lumoti.

### 3.2. Xarajatlar (maqsadli xarajat kiritish)
Ota-ona bu yerda bolaga bergan pulni **maqsad** bilan bog'lab kiritadi (masalan: "Kurs puli — 500 000 so'm", "Telefon puli — 2 000 000 so'm"). Har bir yozuv: summa, maqsad/kategoriya, sana, izoh (ixtiyoriy).

### 3.3. Statistika
Vaqt oralig'ida (hafta/oy/yil) qancha pul qanday maqsadlarga ketgani grafik va jadval ko'rinishida (Recharts orqali). Kategoriyalar bo'yicha taqsimot (pie/bar chart), vaqt bo'yicha trend (line chart).

### 3.4. Kundalik xarajat (avtomatik/takrorlanuvchi)
Ota-ona bir marta sozlaydi (masalan: "Dushanbadan Jumagacha, har kuni 10 000 so'm"), tizim shu qoidaga asosan har kuni avtomatik hisoblab, umumiy xarajatga qo'shib boradi. Qo'lda har kuni yozish shart emas. Ota-ona istalgan vaqtda bu qoidani o'zgartirishi yoki to'xtatishi mumkin.

### 3.5. Kutilmagan/favqulodda xarajatlar
Rejalashtirilmagan xarajatlar uchun alohida bo'lim — masalan: telefon ta'mirlash, kiyim yirtilib qolishi, maktabdan jarima. Ota-ona bu yerda summa, sabab va sanani kiritadi. Bu xarajatlar asosiy "maqsadli xarajat" statistikasidan alohida kategoriya sifatida hisoblanadi, lekin umumiy oylik hisobotga qo'shiladi.

### 3.6. Profil/Sozlamalar
Ism, familiya, yosh, parol, telefon raqami. Ota-ona o'z profilini va har bir bolaning profilini shu yerdan boshqaradi (bola qo'shish/o'chirish, ma'lumotlarni tahrirlash).

---

## 4. Texnik stack

### Frontend
| Texnologiya | Vazifasi |
|---|---|
| React 18 + Vite | UI |
| React Router DOM v6 (`createBrowserRouter`) | Routing |
| TanStack React Query v5 | Server state (API ma'lumotlari) |
| Zustand | Client state (auth user, UI holati) |
| Axios | HTTP so'rovlar |
| Recharts | Grafik va diagrammalar |
| Tailwind CSS | Styling |
| react-hook-form + zod | Formalar va validatsiya |
| date-fns | Sana bilan ishlash |

### Backend
| Texnologiya | Vazifasi |
|---|---|
| Node.js 20+ / Express.js | HTTP server, REST API |
| PostgreSQL 16 | Ma'lumotlar bazasi |
| Prisma ORM | Schema, migration, query |
| bcrypt (12 sikl) | Parolni hashlash |
| jsonwebtoken | JWT access/refresh token |
| zod | Kiruvchi ma'lumotni validatsiya qilish |
| cookie-parser | httpOnly cookie o'qish |
| cors | Frontend bilan bog'lanish |
| dotenv | Muhit o'zgaruvchilari (.env) |
| Swagger | API hujjatlashtirish |
| Telegraf (Telegram Bot API, long polling) | Parolni tiklash uchun Telegram orqali bir martalik kod (OTP) yuborish |

---

## 5. Ma'lumotlar bazasi — asosiy jadvallar (taxminiy)

- **Parents** — ota-ona hisobi (id, ism, familiya, telefon, parol_hash)
- **Children** — bolaning hisobi (id, parent_id, ism, familiya, yosh, parol_hash) — Parents bilan bog'langan
- **Goals** — maqsadli xarajat toifalari (id, child_id, nomi — masalan "Kurs", "Telefon")
- **PlannedExpenses** — maqsadli xarajatlar (id, child_id, goal_id, summa, sana, izoh)
- **RecurringRules** — kundalik avtomatik xarajat qoidalari (id, child_id, summa, kunlar — masalan dush-juma, boshlanish/tugash sanasi, faol/nofaol holati)
- **UnplannedExpenses** — kutilmagan xarajatlar (id, child_id, summa, sabab, sana)
- **RefreshTokens** — auth uchun
- **PasswordResetRequests** — Telegram orqali parol tiklash sessiyasi (id — bot deep-link uchun token sifatida ham ishlatiladi, phone, chat_id — Telegram'dan tasdiqlangandan keyin to'ldiriladi, otp_hash, status: `pending_telegram` / `otp_sent` / `verified` / `used` / `expired`, attempts, expires_at, created_at)

Pul summalari eng kichik valyuta birligida (so'm, BigInt) saqlanadi, API javoblarida string sifatida serialize qilinadi (FinTrack loyihasidagi konventsiyaga mos).

---

## 6. Autentifikatsiya (Auth)

- JWT access token + refresh token, ikkalasi ham **httpOnly cookie** orqali yuboriladi.
- Login/register javoblarida token ma'lumotlari response body'ga ham qo'shiladi.
- Parol **bcrypt**, 12 sikl bilan hashlanadi.
- Ikkita rol: `parent` va `child` — har bir endpoint role-based ruxsatga ega bo'lishi kerak (masalan, bola faqat GET so'rovlar yubora oladi).
- Barcha API'lar **Swagger**da ko'rinishi kerak.
- Maxfiy kalitlar (.env) orqali saqlanadi.

### 6.1. Parolni tiklash — Telegram bot orqali (faqat Ota-ona)

Ota-ona parolini unutgan taqdirda, Telegram bot (`@amanat_helpbot`) orqali o'zini tasdiqlab, yangi parol o'rnatishi mumkin. Bola uchun bu funksiya yo'q — bolaning parolini ota-ona Profil/Sozlamalar bo'limidan o'zgartiradi.

**Oqim:**

1. Login sahifasida **"Parolni unutdingizmi?"** havolasi — bosilganda telefon raqami so'raladi.
2. Tizim shu raqam bo'yicha `PasswordResetRequest` yozuvi yaratadi (holati: `pending_telegram`) va Telegram botga olib boruvchi bir martalik havola (`t.me/amanat_helpbot?start=<requestId>`) ko'rsatadi.
3. Foydalanuvchi botda **Start** bosadi. Bot javoban **"📱 Telefon raqamni ulashish"** tugmasini (Telegram'ning `request_contact` funksiyasi) yuboradi — bu tugma faqat foydalanuvchining o'z (Telegram akkauntiga bog'langan, soxtalashtirib bo'lmaydigan) raqamini yuboradi.
4. Ulashilgan raqam `PasswordResetRequest.phone` bilan mos kelsa — bu **raqam egasi ekanligining tasdig'i** hisoblanadi. Bot shu chatga 6 xonali OTP kod yuboradi, `chat_id` va `otp_hash` saqlanadi, holat `otp_sent` ga o'tadi. Mos kelmasa — bot xato xabari beradi va davom etilmaydi.
5. Foydalanuvchi saytga qaytib, OTP kodni kiritadi. To'g'ri bo'lsa — holat `verified` ga o'tadi va vaqtinchalik reset-token qaytariladi.
6. Foydalanuvchi yangi parol kiritadi (reset-token bilan birga yuboriladi). Backend `passwordHash`ni yangilaydi, so'rov holatini `used` ga o'tkazadi va shu ota-onaning barcha eski `RefreshToken`larini bekor qiladi (xavfsizlik uchun majburiy qayta login).

**Xavfsizlik talablari:**
- `requestId` — kriptografik jihatdan tasodifiy, taxmin qilib bo'lmaydigan qiymat.
- OTP `otp_hash` sifatida saqlanadi (ochiq matnda emas), amal qilish muddati ~5 daqiqa, urinishlar soni cheklangan (masalan 5 marta).
- Reset-token ham qisqa muddatli (~10 daqiqa) va bir martalik.
- Bitta telefon/IP uchun so'rovlar chastotasi cheklanadi (rate limit), spam/floodni oldini olish uchun.
- Telegram tokeni va bot bilan bog'liq maxfiy ma'lumotlar faqat `.env`da saqlanadi, hech qachon kodga yoki repo tarixiga yozilmaydi.

---

## 7. Keyingi qadamlar

1. Prisma schema'ni yakuniy shakllantirish (yuqoridagi jadvallar asosida).
2. API endpoint'lar ro'yxatini (kontraktlarini) tuzish — FinTrack'dagi kabi modul-modul bo'lib.
3. Auth flow (parent/child register, login, refresh) implementatsiyasi.
4. Frontend sahifalarini komponent darajasida rejalashtirish (Dashboard, Xarajatlar, Statistika, Kundalik, Kutilmagan xarajatlar, Profil).
5. MVP doirasini belgilash — birinchi versiyada qaysi funksiyalar shart, qaysilari keyinga qoldirilishi mumkin.
