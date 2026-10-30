import { create } from 'zustand'
import { apiClient, extractErrorMessage, setSessionExpiredHandler } from '../lib/apiClient'
import { queryClient } from '../lib/queryClient'

// Oilada bitta qurilmadan ota-ona ham, bola ham kirishi mumkin — keshda oldingi
// foydalanuvchining ma'lumoti (masalan ['dashboard','all']) qolib ketmasligi
// uchun har kirish/chiqishda React Query keshi tozalanadi.
function resetClientCache() {
  queryClient.clear()
}

async function authenticate(set, request) {
  try {
    const { data } = await request()
    resetClientCache()
    set({ user: data.data.user, status: 'authenticated', notice: null })
    return { ok: true }
  } catch (error) {
    return { ok: false, error: extractErrorMessage(error) }
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  // Login sahifasida bir marta ko'rsatiladigan xabar (masalan sessiya tugaganda)
  notice: null,

  async bootstrap() {
    set({ status: 'loading' })
    try {
      const { data } = await apiClient.get('/auth/me')
      set({ user: data.data, status: 'authenticated' })
    } catch {
      set({ user: null, status: 'unauthenticated' })
    }
  },

  loginParent(phone, password) {
    return authenticate(set, () => apiClient.post('/auth/parent/login', { phone, password }))
  },

  loginChild(phone, password) {
    return authenticate(set, () => apiClient.post('/auth/child/login', { phone, password }))
  },

  registerParent(payload) {
    return authenticate(set, () => apiClient.post('/auth/parent/register', payload))
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // server javob bermasa ham qurilmadan chiqamiz
    } finally {
      resetClientCache()
      set({ user: null, status: 'unauthenticated', notice: null })
    }
  },

  sessionExpired() {
    if (get().status !== 'authenticated') return
    resetClientCache()
    set({ user: null, status: 'unauthenticated', notice: 'Sessiya muddati tugadi — iltimos, qaytadan kiring.' })
  },

  clearNotice() {
    set({ notice: null })
  },

  updateUser(patch) {
    set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user }))
  },
}))

setSessionExpiredHandler(() => useAuthStore.getState().sessionExpired())
