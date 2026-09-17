# Amanat — Design System Reference Manual

Bu fayl Claude Code uchun Amanat loyihasining **rasmiy dizayn tizimi** hisoblanadi. `amanat-claude-skill.md` faylidagi 7-bo'lim (Dizayn yo'nalishi) o'rniga shu hujjatga amal qilinsin — frontend komponentlari yozilganda shu yerdagi ranglar, tugmalar va prinsiplardan chetga chiqmang.

---

## 1. Design Principles (Ota-onalar uchun UI Falsafasi)

* **Katta va Ravshan (Accessibility First):** Elementlar, matnlar va tugmalar kattalashtirilgan. Keksalar va ko'zi xira odamlar ham oson o'qiy oladi.
* **Jismoniy va Realist UI (Tactile UI):** Tugmalar bosilganda xuddi haqiqiy jismoniy knopka ichiga kirgandek (depth & active transform) bo'ladi.
* **Border & Color Feedback:** Standart xira kulrang kartalar o'rniga, holatga qarab qalin va aniq rangli borderlar hamda mos och fonlar ishlatiladi.
* **O'qishga Qulay Matnlar:** Kulrang, juda xira (muted) matnlar ishlatilmaydi. Har bir so'z dona-dona va to'q tusda ajralib turadi.

---

## 2. Color Tokens (Ranglar Tizimi)

| Element Name | Color Code / Tailwind Class | Purpose |
| :--- | :--- | :--- |
| **Primary Green (Ishonch)** | `#16A34A` (`bg-green-600`) | Ota-ona uchun eng asosiy ishonchli yashil rang. Bosh tugmalarda ishlatiladi. |
| **Primary Shadow (Tugma tagi)** | `#15803D` (`bg-green-700`) | Jismoniy tugmaga hajm beruvchi pastki qalin soya (3D border bottom). |
| **Background (Fon)** | `#FFFFFF` (`bg-white`) | Asosiy orqa fon — toza va minimal oq. |
| **Text Primary (Sarlavhalar)** | `#0F172A` (`text-slate-900`) | Dona-dona o'qiluvchi, o'ta to'q sarlavha va matnlar. |
| **Text Secondary (Kichik)** | `#334155` (`text-slate-700`) | Kichik matnlar uchun o'qishga qulay, yetarlicha to'q tus (xira gray emas). |
| **Border Normal** | `#CBD5E1` (`border-slate-300`) | Kartalarning standart holatdagi qalin, aniq ajralib turuvchi borderi. |
| **Status Success (Maqsadli)** | **Border:** `#22C55E` (`border-green-500`) · **Bg:** `#F0FDF4` (`bg-green-50`) | Maqsadli xarajatlar uchun yashil border va och yashil fon. |
| **Status Warning (Takroriy)** | **Border:** `#EAB308` (`border-yellow-500`) · **Bg:** `#FEFCE8` (`bg-yellow-50`) | Avtomatik va kundalik xarajatlar uchun sariq border va och sariq fon. |
| **Status Alert (Kutilmagan)** | **Border:** `#EF4444` (`border-red-500`) · **Bg:** `#FEF2F2` (`bg-red-50`) | Kutilmagan/qizil ogohlantirish xarajatlari uchun qalin qizil border va och qizil fon. |

---

## 3. Physical Tactile Buttons (Jismoniy Tugmalar)

### A. Primary Tactile Button (Asosiy Yashil Tugma)

* **Visual:** Katta balandlik (`h-14`), qalin matn, tagida 4px jismoniy soya borderi.
* **Hover:** Tugma biroz pastga tushadi (sal bosiladi).
* **Active (Bosilganda):** Tugma to'liq ichiga kiradi va pastki soya yo'qoladi.

```html
<!-- Primary Green Physical Button -->
<button class="
  h-14 px-8 
  bg-green-600 text-white 
  text-lg font-bold tracking-wide
  rounded-2xl 
  border-b-4 border-green-800 
  shadow-lg 
  transition-all duration-100 ease-in-out
  hover:translate-y-[2px] hover:border-b-[2px]
  active:translate-y-[4px] active:border-b-0 active:shadow-none
">
  Xarajat Qo'shish
</button>
```

Bu naqsh (baland tugma + pastki qalin border + active holatda pasayish) loyihadagi **barcha asosiy amal tugmalari** uchun standart hisoblanadi — faqat rang statusga qarab o'zgaradi (masalan, o'chirish tugmasi uchun qizil, tasdiqlash uchun yashil).

---

## 4. Status Cards (Holat Kartalari)

Xarajat turlariga qarab kartalar 2-bo'limdagi status ranglariga mos border va fon oladi:

* **Maqsadli xarajat karta** → yashil border + och yashil fon (`border-green-500 bg-green-50`)
* **Kundalik/avtomatik xarajat karta** → sariq border + och sariq fon (`border-yellow-500 bg-yellow-50`)
* **Kutilmagan xarajat karta** → qizil border + och qizil fon (`border-red-500 bg-red-50`)

Har bir karta kamida `border-2` qalinlikda bo'lishi kerak — standart xira `border-slate-200` yetarli emas, aniq ajralib turishi shart.

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
  bg-white border-t-2 border-slate-300 
  flex items-center justify-around 
  h-20 px-2
  safe-area-bottom
">
  <button class="flex flex-col items-center gap-1 text-slate-700">
    <!-- Uy ikonka -->
    <span class="text-xs font-semibold">Bosh sahifa</span>
  </button>

  <button class="flex flex-col items-center gap-1 text-slate-700">
    <!-- Hamyon ikonka -->
    <span class="text-xs font-semibold">Xarajatlar</span>
  </button>

  <!-- Markaziy ko'tarilgan "+" tugma -->
  <button class="
    -mt-8 h-16 w-16 rounded-full
    bg-green-600 text-white
    flex items-center justify-center
    border-b-4 border-green-800 shadow-lg
    transition-all duration-100
    active:translate-y-[4px] active:border-b-0
  ">
    <span class="text-3xl font-bold">+</span>
  </button>

  <button class="flex flex-col items-center gap-1 text-slate-700">
    <!-- Grafik ikonka -->
    <span class="text-xs font-semibold">Statistika</span>
  </button>

  <button class="flex flex-col items-center gap-1 text-slate-700">
    <!-- Profil ikonka -->
    <span class="text-xs font-semibold">Profil</span>
  </button>
</nav>
```

Faol tab holati: ikonka va matn `text-green-600` rangga o'tadi, ustida ingichka yashil chiziq (indikator) chiqadi — ortiqcha fon rangi yoki katta o'zgarish shart emas.

### B. Bola paneli — Tab Bar (o'yinqaroqroq versiya)

Bola bu ilovada faqat kuzatuvchi (read-only) bo'lgani uchun tab soni kamroq (3 ta), lekin vizual jihatdan bolalarga mos — yumaloqroq shakllar, rangliroq ikonkalar, biroz kattaroq o'lcham.

| Tab | Sahifa |
|---|---|
| Bosh sahifa | Dashboard (bolaning o'zi uchun) |
| Xarajatlarim | O'ziga tegishli xarajatlar tarixi |
| Men | Profil (soddalashtirilgan) |

```html
<!-- Bola uchun Bottom Tab Bar — o'yinqaroqroq versiya -->
<nav class="
  fixed bottom-0 left-0 right-0 
  bg-white border-t-4 border-green-200 
  rounded-t-3xl
  flex items-center justify-around 
  h-24 px-4
  safe-area-bottom
">
  <button class="flex flex-col items-center gap-1">
    <div class="h-12 w-12 rounded-2xl bg-green-50 border-2 border-green-500 flex items-center justify-center">
      <!-- Uy ikonka, rangli -->
    </div>
    <span class="text-xs font-bold text-slate-900">Bosh sahifa</span>
  </button>

  <button class="flex flex-col items-center gap-1">
    <div class="h-12 w-12 rounded-2xl bg-yellow-50 border-2 border-yellow-500 flex items-center justify-center">
      <!-- Hamyon ikonka, rangli -->
    </div>
    <span class="text-xs font-bold text-slate-900">Xarajatlarim</span>
  </button>

  <button class="flex flex-col items-center gap-1">
    <div class="h-12 w-12 rounded-2xl bg-blue-50 border-2 border-blue-400 flex items-center justify-center">
      <!-- Profil ikonka, rangli -->
    </div>
    <span class="text-xs font-bold text-slate-900">Men</span>
  </button>
</nav>
```

Farq: bola paneli tab-bar'i yumaloqroq burchaklar (`rounded-t-3xl`), har bir ikonka o'z rangli "quti" ichida (kattaroq, o'yin-elementga o'xshash), umumiy balandlik ham kattaroq (`h-24`). Ota-ona paneli esa jiddiyroq, tekis oq fon bilan qoladi.

---

## 6. Claude Code uchun qo'llash qoidalari

* Har bir asosiy amal tugmasi (qo'shish, tasdiqlash, saqlash) **Physical Tactile Button** naqshida yoziladi — oddiy tekis Tailwind tugma emas.
* Matnlarda hech qachon `text-gray-400` yoki shunga o'xshash xira ranglar ishlatilmaydi — faqat `text-slate-900` / `text-slate-700`.
* Har bir status karta (maqsadli / kundalik / kutilmagan) o'zining rangli borderi va fonini saqlashi shart, aralashtirilmaydi.
* Komponent o'lchamlari (tugma, input, ikonka) katta va bosish/o'qish uchun qulay bo'lishi kerak — kichik, zich elementlardan qoching.
* Bu fayl `amanat-claude-skill.md` bilan birga o'qilishi kerak: funksional TZ o'sha faylda, vizual qoidalar shu faylda.
* Navigatsiya mobil/tabletda (`<lg`, 1024px) pastki tab-bar, desktopda (`lg+`) chap sidebar ko'rinishida bo'ladi (yuqori header hech qachon qo'shilmaydi) — ota-ona uchun jiddiy/tekis, bola uchun rangli/yumaloq versiya, ikkala breakpoint'da ham saqlanadi.