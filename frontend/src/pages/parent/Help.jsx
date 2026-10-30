import { EXPENSE_TYPE_STYLES } from '../../components/dashboard/expenseTypeStyles'
import PageHeader from '../../components/ui/PageHeader'

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2 border-b-2 border-line pb-6 last:border-b-0 last:pb-0">
      <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      <div className="flex flex-col gap-2 text-base font-semibold text-ink-soft">{children}</div>
    </section>
  )
}

function TypeBadge({ type, children }) {
  const style = EXPENSE_TYPE_STYLES[type]
  return (
    <div className={`rounded-2xl border-2 ${style.border} ${style.bg} p-4`}>
      <p className={`text-base font-bold ${style.text}`}>{style.label}</p>
      <p className="mt-1 text-base font-semibold text-ink-soft">{children}</p>
    </div>
  )
}

export default function Help() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Yordam" subtitle="Amanat qanday ishlashi va har bir bo'lim nima uchun kerakligi — shu yerda." />

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
          Joriy oyda jami qancha pul ketgani va eng muhimi — <strong>qayerga ketgani</strong>: har bir maqsad (kurs,
          telefon…), kundalik va kutilmagan xarajatlar ulushi. Pastda so'nggi yozuvlar. Bir nechta farzandingiz
          bo'lsa, yuqoridagi tugmalar orqali "Barchasi" yoki bittasini tanlaysiz.
        </p>
      </Section>

      <Section title="Xarajatlar — 3 turi">
        <p>Har bir xarajat quyidagi uch turdan biriga kiradi — ular rangi bilan ham ajralib turadi:</p>
        <TypeBadge type="planned">
          Ma'lum bir maqsadga (masalan "Kurs puli") bog'langan xarajat. Bir martalik qo'lda kiritasiz, yoki
          avtomatik qoida sozlab, maqsadni tanlaysiz — masalan "har oyning 5-sanasida 500 000 so'm".
        </TypeBadge>
        <TypeBadge type="recurring">
          Maqsadga bog'lanmagan, muntazam pul (masalan "dushanbadan jumagacha har kuni 10 000 so'm"). Bir marta
          sozlaysiz, tizim har kuni o'zi hisoblab qo'shadi.
        </TypeBadge>
        <TypeBadge type="unplanned">
          Rejalashtirilmagan xarajatlar (telefon ta'mirlash, kiyim yirtilishi, jarima va h.k.). Alohida hisoblanadi,
          lekin umumiy oylik hisobotga qo'shiladi.
        </TypeBadge>
        <p className="mt-1">
          Yangi xarajat qo'shish uchun pastdagi (yoki chap tomondagi) yashil <strong>"+"</strong> tugmani bosing.
          Yozuvni tuzatish yoki o'chirish uchun "Xarajatlar" sahifasida uning ustiga bosing — o'chirishdan oldin
          tasdiq so'raladi.
        </p>
      </Section>

      <Section title="Avtomatik qoidalar">
        <p>
          <strong>To'xtatish</strong> — qoida vaqtincha ishlamaydi, oldingi yozuvlar saqlanib qoladi. Qayta yoqilsa,
          bugundan davom etadi: to'xtab turgan kunlar uchun pul qo'shilmaydi.
        </p>
        <p>
          <strong>Tahrirlash</strong> (summa, kunlar, maqsad) — faqat bundan keyingi yozuvlarga ta'sir qiladi,
          o'tgan yozuvlar o'zgarmaydi.
        </p>
        <p>
          <strong>O'chirish</strong> — qoida bilan birga u orqali qo'shilgan barcha yozuvlar ham o'chadi. Tarixni
          saqlash kerak bo'lsa, o'chirish o'rniga to'xtating.
        </p>
      </Section>

      <Section title="Maqsadlar">
        <p>
          Maqsadlar xarajat qo'shayotganda yaratiladi. Nomini tuzatish uchun "Xarajatlar" sahifasidagi{' '}
          <strong>"Maqsadlar"</strong> tugmasidan foydalaning. Xarajat bog'langan maqsadni o'chirib bo'lmaydi — tarix
          buzilmasligi uchun.
        </p>
      </Section>

      <Section title="Statistika">
        <p>
          Yuqorida — bugun, shu hafta va shu oy qancha pul ketgani. Pastda Hafta/Oy/Yil tanlab, strelkalar bilan
          oldingi davrlarga o'tasiz: <strong>xarajat dinamikasi</strong> ("qachon ko'p sarflandi?") va{' '}
          <strong>pul qayerga ketdi</strong> ("nimaga ko'p sarflandi?"). Aniq raqamlar "Jadval ko'rinishida"
          bo'limida.
        </p>
      </Section>

      <Section title="Profil">
        <p>
          O'z ism-familiyangiz, telefon raqamingiz va parolingizni shu yerdan boshqarasiz. Farzand profillarini ham
          shu yerdan qo'shasiz, tahrirlaysiz, o'chirasiz yoki yangi parol berasiz. Farzand paroli faqat bir marta
          ko'rsatiladi — uni nusxalab oling yoki "Farzandga yuborish" tugmasi bilan yuboring.
        </p>
        <p>
          Parolingizni unutsangiz, kirish sahifasidagi "Parolni unutdingizmi?" orqali Telegram bot yordamida
          tiklaysiz — buning uchun ro'yxatdan o'tgan raqamingiz Telegram'ga ulangan bo'lishi kerak.
        </p>
      </Section>

      <Section title="Farzandingiz nimani ko'radi?">
        <p>
          Farzandingiz kirish sahifasida <strong>"Bola"</strong> bo'limini tanlab, o'z kirish ID va paroli bilan
          kiradi va faqat o'ziga tegishli xarajatlarni ko'radi — hech narsani qo'sha yoki o'zgartira olmaydi. Bu —
          ishonch va shaffoflikni ta'minlash uchun ataylab shunday qilingan.
        </p>
      </Section>
    </div>
  )
}
