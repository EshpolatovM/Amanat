import { EXPENSE_TYPE_STYLES } from '../../components/dashboard/expenseTypeStyles'

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2 border-b-2 border-slate-200 pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="flex flex-col gap-2 text-base font-semibold text-slate-700">{children}</div>
    </section>
  )
}

function TypeBadge({ type, children }) {
  const style = EXPENSE_TYPE_STYLES[type]
  return (
    <div className={`rounded-2xl border-2 ${style.border} ${style.bg} p-4`}>
      <p className={`text-base font-bold ${style.text}`}>{style.label}</p>
      <p className="mt-1 text-base font-semibold text-slate-700">{children}</p>
    </div>
  )
}

export default function Help() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Yordam</h1>
        <p className="mt-2 text-base font-semibold text-slate-700">
          Amanat qanday ishlashi va har bir bo'lim nima uchun kerakligi — shu yerda.
        </p>
      </div>

      <Section title="Amanat nima uchun kerak?">
        <p>
          Farzandingizga ma'lum maqsad uchun (kurs puli, telefon puli va h.k.) bergan pulingizni kuzatib borish va
          shaffof qilish uchun platforma.
        </p>
        <p>
          Siz har bir pulni maqsad bilan bog'lab kiritasiz, tizim buni avtomatik hisoblab, statistikasini ko'rsatadi.
          Farzandingiz esa faqat <strong>ko'ra oladi</strong> — hech narsani o'zgartira olmaydi. Shu orqali ikkalangiz
          ham bir xil ma'lumotni ko'rasiz va nizolar kamayadi.
        </p>
      </Section>

      <Section title="Bosh sahifa">
        <p>
          Joriy oy uchun umumiy ko'rinish: qancha pul berilgani, qaysi turga qancha ketgani va so'nggi harakatlar
          ro'yxati. Bir nechta farzandingiz bo'lsa, yuqoridagi tugmalar orqali "Barchasi" yoki bittasini tanlab
          ko'rishingiz mumkin.
        </p>
      </Section>

      <Section title="Xarajatlar — 3 turi">
        <p>Har bir xarajat quyidagi uch turdan biriga kiradi — ular rangi bilan ham ajralib turadi:</p>
        <TypeBadge type="planned">
          Ma'lum bir maqsadga (masalan "Kurs puli") bog'langan xarajat. Bir martalik qo'lda kiritishingiz mumkin, yoki
          "Kundalik" bo'limida maqsad tanlab, <strong>har oy</strong> yoki <strong>har hafta</strong> avtomatik
          qo'shiladigan qoida sozlashingiz mumkin (masalan "har oyning 5-sanasida 500 000 so'm").
        </TypeBadge>
        <TypeBadge type="recurring">
          Maqsadga bog'lanmagan, muntazam kunlik pul (masalan "dushanbadan jumagacha har kuni 10 000 so'm"). Bir marta
          sozlaysiz, tizim har kuni o'zi hisoblab qo'shadi. Istalgan vaqt to'xtatishingiz mumkin.
        </TypeBadge>
        <TypeBadge type="unplanned">
          Rejalashtirilmagan, kutilmagan xarajatlar (telefon ta'mirlash, kiyim yirtilishi va h.k.). Alohida
          hisoblanadi, lekin umumiy oylik hisobotga qo'shiladi.
        </TypeBadge>
        <p className="mt-1">
          Yangi xarajat qo'shish uchun pastdagi (yoki chap tomondagi) yashil <strong>"+"</strong> tugmani bosing —
          yoki "Xarajatlar" sahifasidagi "Qo'shish" tugmasidan foydalaning.
        </p>
      </Section>

      <Section title="Statistika">
        <p>
          <strong>Xarajat dinamikasi</strong> (katta diagramma) — vaqt o'tishi bilan xarajat qanday o'zgarganini
          ko'rsatadi (Hafta/Oy/Yil bo'yicha, kunma-kun yoki oyma-oy). Savoli: "qachon ko'p sarflandi?"
        </p>
        <p>
          <strong>Xarajatlar taqsimoti</strong> (ustunli diagramma) — shu oyda pul qaysi turga (Maqsadli/Kundalik/
          Kutilmagan) qancha ketganini ko'rsatadi. Savoli: "nimaga ko'p sarflandi?"
        </p>
        <p>
          Ular ustida "Bugun", "Bu hafta", "Bu oy" va "Eng katta xarajat" ko'rsatkichlari ham bor — tezkor umumiy
          holat uchun.
        </p>
      </Section>

      <Section title="Profil">
        <p>
          O'z ism-familiyangiz, telefon raqamingiz va parolingizni shu yerdan boshqarasiz. Farzand profillarini ham
          shu yerdan qo'shasiz, o'chirasiz yoki parolini yangilaysiz — farzand kirish ID va paroli faqat bir marta
          ko'rsatiladi, shuning uchun uni saqlab qo'ying.
        </p>
      </Section>

      <Section title="Farzandingiz nimani ko'radi?">
        <p>
          Farzandingiz o'z akkaunti bilan kirib, faqat o'ziga tegishli xarajatlar va statistikani ko'ra oladi —
          hech narsani qo'sha yoki o'zgartira olmaydi. Bu — ishonch va shaffoflikni ta'minlash uchun ataylab shunday
          qilingan.
        </p>
      </Section>
    </div>
  )
}
