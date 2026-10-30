// Kriptografik tasodifiy raqamlar — Math.random() taxmin qilinishi mumkin,
// bu esa bola parolini topishni osonlashtirardi.
function randomDigits(length, { nonZeroFirst = false } = {}) {
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (value, index) =>
    nonZeroFirst && index === 0 ? 1 + (value % 9) : value % 10,
  ).join('')
}

// Bola login qiladigan `phone` maydoni sifatida ishlatiladi (backend uni
// oddiy 9-15 xonali raqam sifatida qabul qiladi, haqiqiy telefon shart emas).
// Birinchi raqam 0 emas — "012..." ko'rinishidagi ID o'qishda chalkashtirardi.
export function generateChildCredentials() {
  return {
    loginId: randomDigits(9, { nonZeroFirst: true }),
    password: randomDigits(6),
  }
}

export function generateChildPassword() {
  return randomDigits(6)
}
