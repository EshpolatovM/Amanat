import bcrypt from "bcrypt";

// TZ 6: parol bcrypt bilan, 12 sikl.
const BCRYPT_ROUNDS = 12;

let dummyHash;

export function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// `hash` bo'lmasa (foydalanuvchi topilmagan) ham bcrypt.compare bajariladi —
// aks holda javob tezligidan qaysi raqam ro'yxatdan o'tganini bilib olish mumkin bo'lardi.
export async function verifyPassword(plain, hash) {
  if (!hash) {
    dummyHash ??= await bcrypt.hash("amanat-timing-guard", BCRYPT_ROUNDS);
    await bcrypt.compare(plain, dummyHash);
    return false;
  }
  return bcrypt.compare(plain, hash);
}
