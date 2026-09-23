import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

const NO_RETRY_PATHS = ['/auth/refresh', '/auth/parent/login', '/auth/child/login', '/auth/parent/register']

let refreshPromise = null

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
      return apiClient(config)
    } catch {
      return Promise.reject(error)
    }
  },
)

export function extractErrorMessage(error) {
  return error?.response?.data?.error?.message || "Xatolik yuz berdi, qayta urinib ko'ring"
}
