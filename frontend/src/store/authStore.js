import { create } from 'zustand'
import { apiClient, extractErrorMessage } from '../lib/apiClient'

export const useAuthStore = create((set) => ({
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,

  async bootstrap() {
    set({ status: 'loading' })
    try {
      const { data } = await apiClient.get('/auth/me')
      set({ user: data.data, status: 'authenticated' })
    } catch {
      set({ user: null, status: 'unauthenticated' })
    }
  },

  async loginParent(phone, password) {
    set({ error: null })
    try {
      const { data } = await apiClient.post('/auth/parent/login', { phone, password })
      set({ user: data.data.user, status: 'authenticated' })
      return true
    } catch (error) {
      set({ error: extractErrorMessage(error) })
      return false
    }
  },

  async loginChild(phone, password) {
    set({ error: null })
    try {
      const { data } = await apiClient.post('/auth/child/login', { phone, password })
      set({ user: data.data.user, status: 'authenticated' })
      return true
    } catch (error) {
      set({ error: extractErrorMessage(error) })
      return false
    }
  },

  async registerParent(payload) {
    set({ error: null })
    try {
      const { data } = await apiClient.post('/auth/parent/register', payload)
      set({ user: data.data.user, status: 'authenticated' })
      return true
    } catch (error) {
      set({ error: extractErrorMessage(error) })
      return false
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      set({ user: null, status: 'unauthenticated' })
    }
  },

  updateUser(patch) {
    set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user }))
  },

  clearError() {
    set({ error: null })
  },
}))
