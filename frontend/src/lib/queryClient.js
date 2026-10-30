import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ma'lumot faqat shu foydalanuvchining o'z amallari bilan o'zgaradi va
      // har bir mutatsiyadan keyin tegishli so'rovlar invalidate qilinadi.
      staleTime: 30_000,
      // 4xx (ruxsat yo'q, topilmadi, validatsiya) qayta urinish bilan
      // tuzalmaydi — faqat tarmoq/server xatoliklarida 2 marta qayta urinamiz.
      retry: (failureCount, error) => {
        const status = error?.response?.status
        if (status && status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
