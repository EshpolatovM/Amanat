function randomDigits(length) {
  let result = ''
  for (let i = 0; i < length; i += 1) {
    result += Math.floor(Math.random() * 10)
  }
  return result
}

// Bola login qiladigan `phone` maydoni sifatida ishlatiladi (backend uni
// oddiy 9-15 xonali raqam sifatida qabul qiladi, haqiqiy telefon shart emas).
export function generateChildCredentials() {
  return {
    loginId: randomDigits(9),
    password: randomDigits(6),
  }
}

export function generateChildPassword() {
  return randomDigits(6)
}
