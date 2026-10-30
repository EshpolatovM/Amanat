import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 20_000,
})

const NO_RETRY_PATHS = ['/auth/refresh', '/auth/parent/login', '/auth/child/login', '/auth/parent/register']

let refreshPromise = null
let sessionExpiredHandler = null

// Refresh token ham rad etilsa (sessiya butunlay tugagan), auth store shu
// orqali xabar topadi — aks holda foydalanuvchi "kirgan" holatda qolib,
// har bir so'rov jimgina xato berib turardi.
export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (response?.status !== 401 || !config || config._retried || NO_RETRY_PATHS.includes(config.url)) {
      return Promise.reject(error)
    }

    config._retried = true
    refreshPromise ??= apiClient.post('/auth/refresh').finally(() => {
      refreshPromise = null
    })

    try {
      await refreshPromise
    } catch {
      sessionExpiredHandler?.()
      return Promise.reject(error)
    }

    // Qayta yuborilgan so'rovning o'z xatosi (masalan 400) asl 401 bilan
    // almashtirilmasligi uchun bu try/catch'dan tashqarida.
    return apiClient(config)
  },
)

export function extractErrorMessage(error) {
  if (error?.response) {
    const apiError = error.response.data?.error
    // Validatsiya xatosida umumiy "Kiritilgan ma'lumot noto'g'ri" o'rniga
    // aniq maydon xabarini ko'rsatamiz (masalan "Bunday sana mavjud emas").
    return apiError?.details?.[0]?.message || apiError?.message || "Xatolik yuz berdi, qayta urinib ko'ring"
  }
  if (error?.code === 'ECONNABORTED') {
    return "Server javob bermadi. Birozdan so'ng qayta urinib ko'ring"
  }
  if (error?.request) {
    return "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring"
  }
  return "Xatolik yuz berdi, qayta urinib ko'ring"
}
