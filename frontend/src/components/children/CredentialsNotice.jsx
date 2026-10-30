import { Share2 } from 'lucide-react'
import { formatLoginId } from '../../lib/phone'
import CredentialChip from '../profile/CredentialChip'
import Button from '../ui/Button'

function shareText({ childName, loginId, password }) {
  return [
    `Amanat — ${childName} uchun kirish ma'lumotlari`,
    `Sayt: ${window.location.origin}/login ("Bola" bo'limi)`,
    loginId ? `Kirish ID: ${loginId}` : null,
    `Parol: ${password}`,
  ]
    .filter(Boolean)
    .join('\n')
}

// Yangi yaratilgan (yoki yangilangan) bola ID/parolini ko'rsatadi. Parol faqat
// bir marta ko'rinadi — shuning uchun nusxalash va (telefonda) ulashish tugmalari.
export default function CredentialsNotice({ childName, loginId, password }) {
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="flex flex-col gap-3">
      {loginId && <CredentialChip label="Kirish ID" value={loginId} display={formatLoginId(loginId)} tone="forest" copyable />}
      <CredentialChip label="Parol" value={password} tone="forest" copyable />
      <p className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
        Parolni hozir saqlab qo'ying yoki farzandingizga yuboring — u boshqa ko'rsatilmaydi.
      </p>
      {canShare && (
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigator.share({ text: shareText({ childName, loginId, password }) }).catch(() => {})}
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
          Farzandga yuborish
        </Button>
      )}
    </div>
  )
}
