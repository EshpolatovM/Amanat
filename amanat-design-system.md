# Amanat — Design System Reference Manual

Bu fayl Claude Code uchun Amanat loyihasining **rasmiy dizayn tizimi** hisoblanadi va `CLAUDE.md` (`amanat-claude-skill.md`) faylidagi 7-bo'lim (Dizayn yo'nalishi)ni **to'ldiradi**, uni o'rnini bosmaydi. Rang palitrasi va tipografika manbasi CLAUDE.md §7 hisoblanadi (iliq "amanat" palitrasi — pastdagi 2-bo'lim shu palitraning Tailwind token'lari); ushbu hujjat esa strukturaviy/tactile/accessibility naqshlarni (tugma bosilish effekti, status-karta qatlami, navigatsiya patterni) belgilaydi. Frontend komponentlari yozilganda ikkala hujjatga birga amal qilinsin.

---

## 1. Design Principles (Ota-onalar uchun UI Falsafasi)

* **Katta va Ravshan (Accessibility First):** Elementlar, matnlar va tugmalar kattalashtirilgan. Keksalar va ko'zi xira odamlar ham oson o'qiy oladi.
* **Jismoniy va Realist UI (Tactile UI):** Tugmalar bosilganda xuddi haqiqiy jismoniy knopka ichiga kirgandek (depth & active transform) bo'ladi.
* **Border & Color Feedback:** Standart xira kulrang kartalar o'rniga, holatga qarab qalin va aniq rangli borderlar hamda mos och fonlar ishlatiladi.
* **O'qishga Qulay Matnlar:** Kulrang, juda xira (muted) matnlar ishlatilmaydi. Har bir so'z dona-dona va to'q tusda ajralib turadi.

---

## 2. Color Tokens (Ranglar Tizimi)

Manba: CLAUDE.md §7. Tailwind v4 `@theme` orqali `frontend/src/index.css`da e'lon qilingan (`--color-*`), shuning uchun `bg-forest`, `text-ink-soft`, `border-line` kabi klasslar to'g'ridan-to'g'ri ishlaydi.

| Element Name | Color Code / Tailwind Class | Purpose |
| :--- | :--- | :--- |
| **Paper (Fon)** | `#F7F3EC` (`bg-paper`) | Sahifa darajasidagi asosiy fon — iliq, qog'oz hissi. |
| **Card (Yuzaki sirt)** | `#FCFAF4` (`bg-card`) | Sidebar, modal, input, tooltip kabi ko'tarilgan sirtlar uchun — faqat kerak joyda. |
| **Ink (Sarlavhalar)** | `#2B2620` (`text-ink`) | Dona-dona o'qiluvchi, issiq to'q sarlavha va asosiy matnlar. |
| **Ink Soft (Kichik matn)** | `#6B5E4F` (`text-ink-soft`) | Kichik matnlar uchun — iliq jigarrang-kulrang, hech qachon sovuq gray emas. |
| **Line (Border)** | `#E3D6C3` (`border-line`) | Kartalarning standart holatdagi border va ajratuvchi chiziqlari. |
| **Forest (Asosiy urg'u)** | `#3E5C4E` (`bg-forest` / `border-forest`) · soya: `#2C463A` (`-dark`) · fon: `#E7EEE7` (`-soft`) | Ota-ona paneli, asosiy tugmalar, maqsadli xarajat statusi. |
| **Bronze (Ikkinchi urg'u)** | `#B8895B` (`bg-bronze` / `border-bronze`) · soya: `#966B44` (`-dark`) · fon: `#F3E9DA` (`-soft`) · matn: `#7A5636` (`text-bronze-ink`) | Bola paneli urg'usi, kundalik/avtomatik xarajat statusi. Bronza yuzadagi **matn** doim `text-bronze-ink` (bronze-dark bronze-soft ustida 3.9:1 — WCAG AA'dan past); bronza tugma: `bg-bronze-dark border-bronze-ink` (oq matn `bg-bronze` ustida 3.1:1). |
| **Alert (Ogohlantirish)** | `#A44A3F` (`bg-alert` / `border-alert`) · soya: `#82372E` (`-dark`) · fon: `#F5E4DF` (`-soft`) | Kutilmagan xarajat statusi, destruktiv amallar (o'chirish, chiqish). |
| **Success** | `#5C7A5A` (`bg-success` / `text-success`) | Maqsadga yetish holati — Forest'dan ataylab farqlanadi. |

Sarlavhalar (h1, ba'zi h2) — serif `font-serif` (Fraunces); qolgan barcha matn, raqamlar, tugmalar — `font-sans` (Inter).

---

## 3. Physical Tactile Buttons (Jismoniy Tugmalar)

### A. Primary Tactile Button (Asosiy Forest Tugma)

* **Visual:** Katta balandlik (`h-14`), qalin matn, tagida 2px jismoniy soya borderi (jiddiy, o'yin-elementga o'xshamaydigan darajada yupqalashtirilgan).
* **Hover:** Tugma bir piksel pastga tushadi (sal bosiladi).
* **Active (Bosilganda):** Tugma ichiga kiradi va pastki soya yo'qoladi.

```html
<!-- Primary Forest Physical Button -->
<button class="
  h-14 px-8 
  bg-forest text-white 
  text-lg font-bold tracking-wide
  rounded-2xl 
  border-b-2 border-forest-dark 
  shadow-lg 
  transition-all duration-100 ease-in-out
  hover:translate-y-px hover:border-b
  active:translate-y-0.5 active:border-b-0 active:shadow-none
">
  Xarajat Qo'shish
</button>
```

Diqqat: Tailwind v4'da `border-b-px` klassi yo'q (CSS hosil qilmaydi) — 1px pastki border uchun `border-b` ishlatiladi. Kodda bu naqsh `frontend/src/components/ui/Button.jsx` (`buttonStyles.js`) komponentida jamlangan — yangi tugma yozishda class'larni ko'chirmasdan shu komponentdan foydalaning.

Bu naqsh (baland tugma + pastki soya + active holatda pasayish) loyihadagi **barcha asosiy amal tugmalari** uchun standart hisoblanadi — faqat rang statusga qarab o'zgaradi (masalan, o'chirish/chiqish tugmasi uchun `bg-alert border-alert-dark`, tasdiqlash uchun `bg-forest border-forest-dark`).

---

## 4. Status Cards (Holat Kartalari)

Xarajat turlariga qarab kartalar 2-bo'limdagi status ranglariga mos border va fon oladi:

* **Maqsadli xarajat karta** → forest border + forest-soft fon (`border-forest bg-forest-soft`)
* **Kundalik/avtomatik xarajat karta** → bronze border + bronze-soft fon (`border-bronze bg-bronze-soft`)
* **Kutilmagan xarajat karta** → alert border + alert-soft fon (`border-alert bg-alert-soft`)

Har bir karta kamida `border-2` qalinlikda bo'lishi kerak — standart xira border yetarli emas, aniq ajralib turishi shart.

**Ro'yxat qatorlari (ledger) istisnosi:** faqat statik karta emas, balki ro'yxat sifatida ko'rinadigan joylarda (masalan "So'nggi harakatlar", xarajatlar ro'yxati) to'rt tomonlama border+fon o'rniga **chap tomonda `border-l-4` status rangi + `bg-paper` + `divide-y divide-line`** qatorlar orasidagi ajratuvchi chiziq ishlatiladi — CLAUDE.md §7'dagi "kartalar emas, varaq/ro'yxat uslubi" talabiga mos, lekin status ranglari hamon bir qarashda ajralib turadi.

---

## 5. Navigation — Bottom Tab Bar (mobil/tablet) va Sidebar (desktop)

Amanat mobil-birinchi ilova bo'lgani uchun navigatsiya asosan **pastki tab-bar** (Instagram/banking app uslubida) ko'rinishida bo'ladi — mobil telefon va planshet (iPad)da shu naqsh saqlanadi. Kenglik `lg` breakpoint'idan (1024px) past bo'lgan barcha ekranlarda pastki tab-bar ishlatiladi.

**Desktop**da (`lg` va undan katta, ≥1024px) navigatsiya **chap tomonlama sidebar**ga aylanadi — bitta doimiy vertikal panel, sahifa balandligi bo'yicha, tab-bar bilan bir xil ikonka/label va faol-holat ranglaridan foydalanadi. Sidebar kengligi `w-64` (16rem), asosiy kontent shuncha joydan boshlab suriladi. Ota-ona sidebarida markaziy "+" tugma o'rniga sidebar yuqorisida to'liq enli "Xarajat qo'shish" tactile tugmasi joylashadi. Bir xil route/label to'plami, faqat joylashuv va yo'nalish (gorizontal → vertikal) o'zgaradi — ikkita alohida navigatsiya tizimi emas, bitta naqshning ikki responsive holati.

### A. Ota-ona paneli — Tab Bar

4 ta asosiy bo'lim + markazdagi katta "+" tugma (tezkor xarajat qo'shish uchun). Kundalik va Kutilmagan xarajatlar alohida tab emas — Xarajatlar bo'limi ichida filtr/tab sifatida ochiladi (5-6 tabga sig'dirish o'rniga).

| Tab | Ikonka g'oyasi | Sahifa |
|---|---|---|
| Bosh sahifa | Uy | Dashboard |
| Xarajatlar | Hamyon | Xarajatlar (+ ichida Kundalik/Kutilmagan filtri) |
| **+ (markaziy, ko'tarilgan tugma)** | Plus, doira ichida | Tezkor xarajat qo'shish (modal) |
| Statistika | Grafik/diagram | Statistika |
| Profil | Odam siluetı | Profil/Sozlamalar |

```html
<!-- Ota-ona uchun Bottom Tab Bar -->
<nav class="
  fixed bottom-0 left-0 right-0 
  bg-card border-t-2 border-line 
  flex items-center justify-around 
  h-20 px-2
  safe-area-bottom
">
  <button class="flex flex-col items-center gap-1 text-ink-soft">
    <!-- Uy ikonka -->
    <span class="text-xs font-semibold">Bosh sahifa</span>
  </button>

  <button class="flex flex-col items-center gap-1 text-ink-soft">
    <!-- Hamyon ikonka -->
    <span class="text-xs font-semibold">Xarajatlar</span>
  </button>

  <!-- Markaziy ko'tarilgan "+" tugma -->
  <button class="
    -mt-8 h-16 w-16 rounded-full
    bg-forest text-white
    flex items-center justify-center
    border-b-2 border-forest-dark shadow-lg
    transition-all duration-100
    active:translate-y-0.5 active:border-b-0
  ">
    <span class="text-3xl font-bold">+</span>
  </button>

  <button class="flex flex-col items-center gap-1 text-ink-soft">
    <!-- Grafik ikonka -->
    <span class="text-xs font-semibold">Statistika</span>
  </button>

  <button class="flex flex-col items-center gap-1 text-ink-soft">
    <!-- Profil ikonka -->
    <span class="text-xs font-semibold">Profil</span>
  </button>
</nav>
```

Faol tab holati: ikonka va matn `text-forest` rangga o'tadi, ustida ingichka forest chiziq (indikator) chiqadi — ortiqcha fon rangi yoki katta o'zgarish shart emas.

### B. Bola paneli — Tab Bar (o'yinqaroqroq versiya)

Bola bu ilovada faqat kuzatuvchi (read-only) bo'lgani uchun tab soni kamroq (3 ta), lekin vizual jihatdan bolalarga mos — yumaloqroq shakllar, rangliroq ikonkalar, biroz kattaroq o'lcham.

| Tab | Sahifa |
|---|---|
| Bosh sahifa | Dashboard (bolaning o'zi uchun) |
| Xarajatlarim | O'ziga tegishli xarajatlar tarixi |
| Men | Profil (soddalashtirilgan) |

```html
<!-- Bola uchun Bottom Tab Bar — bronza urg'uli versiya -->
<nav class="
  fixed bottom-0 left-0 right-0 
  bg-card border-t-4 border-bronze/30 
  rounded-t-3xl
  flex items-center justify-around 
  h-24 px-4
  safe-area-bottom
">
  <button class="flex flex-col items-center gap-1">
    <div class="h-12 w-12 rounded-2xl bg-forest-soft border-2 border-forest flex items-center justify-center">
      <!-- Uy ikonka — Bosh sahifa hamon forest, qolgan ikkitasi bronza -->
    </div>
    <span class="text-xs font-bold text-ink">Bosh sahifa</span>
  </button>

  <button class="flex flex-col items-center gap-1">
    <div class="h-12 w-12 rounded-2xl bg-bronze-soft border-2 border-bronze flex items-center justify-center">
      <!-- Hamyon ikonka -->
    </div>
    <span class="text-xs font-bold text-ink">Xarajatlarim</span>
  </button>

  <button class="flex flex-col items-center gap-1">
    <div class="h-12 w-12 rounded-2xl bg-bronze-soft border-2 border-bronze flex items-center justify-center">
      <!-- Profil ikonka -->
    </div>
    <span class="text-xs font-bold text-ink">Men</span>
  </button>
</nav>
```

Farq: bola paneli tab-bar'i yumaloqroq burchaklar (`rounded-t-3xl`), tashqi border bronza (`border-bronze/30`) — bu ota-ona panelining forest urg'usidan panelni butunlay vizual ajratadi (CLAUDE.md §7 4-prinsipi: "bola paneli va ota-ona paneli rang urg'usi orqali farqlanadi"). Har bir ikonka o'z rangli "quti" ichida (kattaroq), umumiy balandlik ham kattaroq (`h-24`) — lekin to'yingan "o'yin" ranglari emas, brend palitrasining bronza tusi ishlatiladi. Ota-ona paneli esa jiddiyroq, tekis `bg-card` fon va forest urg'usi bilan qoladi.

---

## 6. Claude Code uchun qo'llash qoidalari

* Har bir asosiy amal tugmasi (qo'shish, tasdiqlash, saqlash) **Physical Tactile Button** naqshida yoziladi — oddiy tekis Tailwind tugma emas.
* Matnlarda hech qachon xira/sovuq gray ranglar ishlatilmaydi — faqat `text-ink` / `text-ink-soft` (iliq token'lar).
* Har bir status karta (maqsadli / kundalik / kutilmagan) o'zining rangli borderi va fonini saqlashi shart, aralashtirilmaydi.
* Komponent o'lchamlari (tugma, input, ikonka) katta va bosish/o'qish uchun qulay bo'lishi kerak — kichik, zich elementlardan qoching.
* Bu fayl `amanat-claude-skill.md` bilan birga o'qilishi kerak: funksional TZ o'sha faylda, vizual qoidalar shu faylda.
* Navigatsiya mobil/tabletda (`<lg`, 1024px) pastki tab-bar, desktopda (`lg+`) chap sidebar ko'rinishida bo'ladi (yuqori header hech qachon qo'shilmaydi) — ota-ona uchun jiddiy/tekis, bola uchun rangli/yumaloq versiya, ikkala breakpoint'da ham saqlanadi.