// Pul summalari DB'da BigInt sifatida saqlanadi. JSON.stringify BigInt bilan
// ishlamaydi, shuning uchun API javoblarida avtomatik string'ga aylantiramiz.
Object.defineProperty(BigInt.prototype, "toJSON", {
  value() {
    return this.toString();
  },
});
