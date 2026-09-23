// amanat-design-system.md 2/4-bo'limidagi status ranglari bilan bir xil:
// maqsadli -> forest, kundalik/avtomatik -> bronze, kutilmagan -> alert.
export const EXPENSE_TYPE_STYLES = {
  planned: {
    label: 'Maqsadli xarajat',
    border: 'border-forest',
    bg: 'bg-forest-soft',
    text: 'text-forest',
    dot: 'bg-forest',
  },
  recurring: {
    label: 'Kundalik xarajat',
    border: 'border-bronze',
    bg: 'bg-bronze-soft',
    text: 'text-bronze-dark',
    dot: 'bg-bronze',
  },
  unplanned: {
    label: 'Kutilmagan xarajat',
    border: 'border-alert',
    bg: 'bg-alert-soft',
    text: 'text-alert',
    dot: 'bg-alert',
  },
}
