import { apiClient } from '../lib/apiClient'
import { generateChildCredentials, generateChildPassword } from '../lib/generateChildCredentials'

export async function fetchChildren() {
  const { data } = await apiClient.get('/children')
  return data.data
}

// Bola paroli hech qachon qayta o'qib bo'lmaydi (backend faqat hash saqlaydi),
// shuning uchun "yo'qolgan parol" muammosi eskisini ko'rsatish bilan emas,
// yangi 6 xonali parol generatsiya qilib qo'yish bilan hal qilinadi.
export async function regenerateChildPassword(childId) {
  const password = generateChildPassword()
  await apiClient.patch(`/children/${childId}/password`, { newPassword: password })
  return password
}

async function createChildRequest(payload) {
  const { data } = await apiClient.post('/children', payload)
  return data.data
}

// Generatsiya qilingan ID band bo'lib chiqsa (409), yangi ID bilan qayta
// urinadi — haqiqiy hayotda deyarli bo'lmaydi (9 xonali raqam ~1 milliardta
// variant), lekin nazariy to'qnashuvdan himoyalanish uchun.
const MAX_ID_COLLISION_ATTEMPTS = 5

// `mutationFn` sifatida to'g'ridan-to'g'ri berilganda TanStack Query bu
// funksiyani qo'shimcha (kontekst) argument bilan ham chaqiradi — shu sabab
// urinishlar soni parametr sifatida emas, ichkarida konstant sifatida ushlanadi.
export async function createChildWithGeneratedCredentials(basePayload) {
  let lastError
  for (let attempt = 0; attempt < MAX_ID_COLLISION_ATTEMPTS; attempt += 1) {
    const credentials = generateChildCredentials()
    try {
      const child = await createChildRequest({
        ...basePayload,
        phone: credentials.loginId,
        password: credentials.password,
      })
      return { child, credentials }
    } catch (error) {
      lastError = error
      if (error.response?.status !== 409) throw error
    }
  }
  throw lastError
}
