import { create } from 'zustand'

const TOAST_DURATION_MS = 3500
let nextId = 1

// Amal natijasi haqida qisqa tasdiq ("Xarajat qo'shildi") — faqat foydalanuvchi
// amaliga javoban paydo bo'ladi (CLAUDE.md §7, 2-prinsip).
export const useToastStore = create((set) => ({
  toasts: [],
  push(message, tone = 'success') {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone }] }))
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), TOAST_DURATION_MS)
  },
  dismiss(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export const toast = {
  success: (message) => useToastStore.getState().push(message, 'success'),
  error: (message) => useToastStore.getState().push(message, 'error'),
}
