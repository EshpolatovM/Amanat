# Amanat — Claude Code uchun loyiha skill fayli

Bu fayl Claude Code Amanat loyihasi ustida ishlaganda doimiy kontekst sifatida ishlatiladi (masalan `CLAUDE.md` sifatida loyiha ildizida saqlang). U TZ'ni va dizayn yo'nalishini birlashtiradi.

---

## 1. Loyiha haqida

**Amanat** — ota-onalar farzandlariga ma'lum maqsad uchun (kurs puli, telefon puli va h.k.) bergan pulini kuzatib borish va shaffof qilish uchun web platforma.

**Muammo:** Ota-ona bergan pul haqiqatan maqsadga sarflanganini bilmaydi; bola pulni boshqa narsaga ishlatib, keyin aldashi mumkin; kundalik va kutilmagan xarajatlar hisobga olinmay chalkashib ketadi.

**Yechim:** Ota-ona har bir pulni maqsad bilan bog'lab kiritadi, tizim buni kuzatadi va statistikasini ko'rsatadi. Bola faqat **ko'ra oladi** (read-only) — bu ishonch va shaffoflikni ta'minlaydi.

---

## 2. Foydalanuvchi rollari

| Rol | Huquqlar |
|---|---|
| **Ota-ona** | To'liq kirish: xarajat/maqsad kiritish, statistikani ko'rish, bolalar profilini boshqarish |
| **Bola** | Faqat ko'rish: o'ziga tegishli pul/xarajat/statistikani ko'radi, tahrirlay olmaydi |

Har ikkala rolda alohida login mavjud; bola akkaunti ota-onaga bog'langan (bitta ota-ona — bir nechta bola).

---

## 3. Sahifalar

1. **Dashboard** — umumiy ko'rinish (joriy oy: berilgan pul, sarflangan, kutilmagan xarajatlar)
2. **Xarajatlar** — ota-ona maqsadli xarajat kiritadi (summa, maqsad/kategoriya, sana, izoh)
3. **Statistika** — vaqt oralig'ida (hafta/oy/yil) kategoriya va trend bo'yicha grafiklar (Recharts)
4. **Kundalik xarajat (avtomatik)** — ota-ona bir marta qoida sozlaydi (masalan dush-juma, 10 000 so'm/kun), tizim avtomatik hisoblab qo'shadi
5. **Kutilmagan xarajatlar** — rejalashtirilmagan xarajatlar (telefon ta'mirlash, kiyim yirtilishi, maktab jarimasi) — alohida kategoriya, lekin umumiy hisobotga qo'shiladi
6. **Profil/Sozlamalar** — ism, familiya, yosh, parol, telefon raqami; ota-ona bolalar profilini shu yerdan boshqaradi

---

## 4. Texnik stack

### Frontend
- React 18 + Vite
- React Router DOM v6 (`createBrowserRouter`)
- TanStack React Query v5 — server state
- Zustand — client state (auth user, UI holati)
- Axios
- Recharts — grafiklar
- Tailwind CSS
- react-hook-form + zod — formalar va validatsiya
- date-fns

### Backend
- Node.js 20+ / Express.js
- PostgreSQL 16 + Prisma ORM
- bcrypt (12 sikl) — parol hashlash
- jsonwebtoken — access/refresh token
- zod — validatsiya
- cookie-parser — httpOnly cookie
- cors, dotenv
- Swagger — API hujjatlashtirish
- Telegraf (Telegram Bot API, long polling) — parolni tiklash uchun OTP yuborish (bot: `@amanat_helpbot`)

---

## 5. Ma'lumotlar bazasi — asosiy jadvallar

- **Parents** (id, ism, familiya, telefon, parol_hash)
- **Children** (id, parent_id, ism, familiya, yosh, parol_hash)
- **Goals** (id, child_id, nomi)
- **PlannedExpenses** (id, child_id, goal_id, summa, sana, izoh)
- **RecurringRules** (id, child_id, summa, kunlar, boshlanish/tugash sanasi, faol holati)
- **UnplannedExpenses** (id, child_id, summa, sabab, sana)
- **RefreshTokens**
- **PasswordResetRequests** (id — bot deep-link token, phone, chat_id, otp_hash, status, attempts, expires_at) — Telegram orqali parol tiklash uchun

Pul summalari eng kichik valyuta birligida (so'm) **BigInt** sifatida saqlanadi, API javoblarida **string** sifatida serialize qilinadi. API javob formati: unified `{ success, data }`.

---

## 6. Auth

JWT access + refresh token, ikkalasi ham httpOnly cookie orqali; login/register javobida token ma'lumoti body'ga ham qo'shiladi. Parol bcrypt (12 sikl). Ikkita rol (`parent`, `child`) — har endpoint role-based ruxsatga ega (bola faqat GET so'rovlar yuborishi mumkin). Barcha API'lar Swagger'da ko'rinadi, maxfiy kalitlar `.env`da.

**Telefon raqami — MUHIM farq:** Ota-onaning `phone`si **haqiqiy telefon raqami** — `backend/src/utils/phone.js`dagi `phoneSchema`/`normalizePhone` orqali har doim `+998XXXXXXXXX` ko'rinishiga normalizatsiya qilinadi (kod ko'rsatilmagan 9 xonali yoki eski "8" terish prefiksli kiritish ham to'g'ri ishlaydi — bu ayniqsa Telegram parolni tiklash oqimida muhim, chunki Telegram kontakt raqamini har doim to'liq kod bilan qaytaradi). Bolaning `phone`si esa **haqiqiy telefon emas** — bu shunchaki tasodifiy generatsiya qilingan Kirish ID (`children.schema.js`), shuning uchun unga normalizatsiya **ataylab qo'llanilmaydi**. `loginSchema` (auth.schema.js) ikkalasi uchun ham umumiy va xom holicha qoladi — normalizatsiya faqat `authService.loginParent()` ichida qo'llanadi.

### 6.1. Parolni tiklash (faqat Ota-ona, Telegram bot orqali)

Login sahifasidagi "Parolni unutdingizmi?" → telefon kiritiladi → bot deep-link (`t.me/amanat_helpbot?start=<requestId>`) ko'rsatiladi → foydalanuvchi botda Start bosadi → bot `request_contact` tugmasi orqali raqamni so'raydi (Telegram tomonidan tasdiqlangan, soxtalashtirib bo'lmaydigan raqam — bu "raqam o'zinikimi" tekshiruvi) → mos kelsa OTP shu chatga yuboriladi → foydalanuvchi saytda OTP kiritadi → tasdiqlansa vaqtinchalik reset-token beriladi → shu token bilan yangi parol o'rnatiladi va ota-onaning barcha eski refresh tokenlari bekor qilinadi.

Talablar: `requestId` va OTP taxmin qilib bo'lmaydigan bo'lishi, OTP faqat hash holida saqlanishi, muddati ~5 daqiqa va urinishlar soni cheklangan bo'lishi, reset-token ~10 daqiqa/bir martalik bo'lishi, telefon/IP bo'yicha rate-limit qo'yilishi shart. Bola uchun bu funksiya yo'q — bolaning parolini ota-ona Profil bo'limidan o'zgartiradi. To'liq oqim: `amanat-tz.md`, 6.1-bo'lim.

---

## 7. Dizayn yo'nalishi

Bu bo'lim loyihaning vizual identifikatsiyasini belgilaydi — shablon (generic AI-generated) ko'rinishdan qochish uchun.

### Konsept
Amanat so'zi "ishonib topshirilgan narsa" degan ma'noni anglatadi — ilova **ishonch va mas'uliyat** hissini uyg'otishi kerak, sovuq korporativ fintex (moviy-oq SaaS) emas. Auditoriya — O'zbekistondagi ota-onalar (ko'pchiligi telefon orqali foydalanadi), shuning uchun dizayn iliq, tushunarli va mobil-birinchi bo'lishi kerak.

### Rang palitrasi
- Asosiy fon: `#F7F3EC` (iliq, oq bo'z — qog'oz/daftar hissi)
- Matn/qora: `#2B2620` (issiq to'q jigarrang-qora, sof qora emas)
- Asosiy urg'u: `#3E5C4E` (chuqur o'rmon-yashil — ishonch, barqarorlik)
- Ikkinchi urg'u: `#B8895B` (yumshoq bronza-sariq — iliqlik, an'anaviylik)
- Ogohlantirish/kutilmagan xarajat: `#A44A3F` (jigarrang-qizil, achchiq emas)
- Muvaffaqiyat/maqsadga yetdi: `#5C7A5A`

Diqqat: yuqoridagi "shablon" ranglardan (iliq krem fon + terracotta #D97757, yoki oq-moviy SaaS kartalar) qochish kerak — bu Amanat uchun o'ziga xos, lekin ortiqcha "AI-generated" hissi bermaydigan tanlov.

### Tipografika
- Sarlavhalar: bitta o'ziga xos serif (masalan, Lora yoki Fraunces) — "amanat", "ishonch" hissini beradi
- Matn: humanist sans-serif (masalan, Inter yoki Manrope) — o'qish qulayligi uchun
- ALL CAPS ey벨lardan, ortiqcha bitta so'zni bold/rangli qilishdan qochish

### Layout konsepsiyasi
- Dashboard: markazlashtirilgan, keng bo'sh joy bilan, kartalar emas — **ro'yxat/varaq** uslubida (daftar sahifasiga o'xshash metafora), chunki mavzu — moliyaviy "yozuv"
- Bolalar uchun View — soddalashtirilgan, katta shrift, kam elementlar (yosh foydalanuvchilar uchun)
- Bir xil border-radius'ni hamma joyga qo'llamaslik — ierarxiyaga qarab farqlash
- Grafiklar (Recharts) — yashil/bronza palitrada, ortiqcha gradient yo'q

### Prinsiplar
1. Har bir sahifa **bitta** asosiy fikrni ko'zga tashlantirishi kerak (masalan Dashboard'da — "bu oy qancha pul qayerga ketdi")
2. Harakat (animatsiya) faqat foydalanuvchi amaliga javoban (masalan forma yuborilganda tasdiqlash), avtomatik fade-in effektlar yo'q
3. Xatolik/bo'sh holatlar tizim ovozida, aniq va harakatga undovchi bo'lishi kerak ("Hali xarajat kiritilmagan — birinchi yozuvni qo'shing", uzr so'ramaydi)
4. Bola paneli va ota-ona paneli vizual jihatdan farqlanadi (masalan, rang urg'usi orqali), lekin bir xil dizayn tizimida qoladi

---

## 8. Ishlash konventsiyalari (Claude Code uchun)

- Kod yozishdan oldin har doim TZ'ning tegishli qismini tekshirib chiqing.
- Backend'da avval Prisma schema, keyin endpoint kontraktlari, keyin implementatsiya tartibida boring.
- Har bir API javobi `{ success, data }` formatida bo'lishi shart.
- Pul bilan ishlashda har doim BigInt + string serialize konventsiyasiga amal qiling.
- Frontend komponentlarini yozishda yuqoridagi dizayn bo'limiga qat'iy amal qiling — generic Tailwind/shadcn defaultlaridan qoching.
- Har bir yangi sahifa yoki modulni yozishdan oldin qaysi rol (`parent`/`child`) unga kira olishini aniqlashtiring.
