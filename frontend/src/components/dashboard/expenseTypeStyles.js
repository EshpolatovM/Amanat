// amanat-design-system.md 2/4-bo'limidagi status ranglari bilan bir xil:
// maqsadli -> forest, kundalik/avtomatik -> bronze, kutilmagan -> alert.
// Bronza yuzadagi matn uchun bronze-ink (bronze-dark bronze-soft ustida AA'dan past).
//
// `chart` — diagramma belgilari (ustun, nuqta, rang namunasi) uchun: dataviz
// validatori bilan tekshirilgan (card fonida CVD ΔE ≥ 8.8, kontrast ≥ 3:1).
// Bu ranglar faqat belgilarda ishlatiladi, matn doim ink token'larida qoladi.
export const EXPENSE_TYPE_STYLES = {
  planned: {
    label: 'Maqsadli xarajat',
    shortLabel: 'Maqsadli',
    border: 'border-forest',
    bg: 'bg-forest-soft',
    text: 'text-forest',
    dot: 'bg-forest',
    chart: '#1c7c53',
  },
  recurring: {
    label: 'Kundalik xarajat',
    shortLabel: 'Kundalik',
    border: 'border-bronze',
    bg: 'bg-bronze-soft',
    text: 'text-bronze-ink',
    dot: 'bg-bronze',
    chart: '#c68039',
  },
  unplanned: {
    label: 'Kutilmagan xarajat',
    shortLabel: 'Kutilmagan',
    border: 'border-alert',
    bg: 'bg-alert-soft',
    text: 'text-alert',
    dot: 'bg-alert',
    chart: '#A44A3F',
  },
}
