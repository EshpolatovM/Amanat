// amanat-design-system.md 2/4-bo'limidagi status ranglari bilan bir xil:
// maqsadli -> yashil, kundalik/avtomatik -> sariq, kutilmagan -> qizil.
export const EXPENSE_TYPE_STYLES = {
  planned: {
    label: 'Maqsadli xarajat',
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  recurring: {
    label: 'Kundalik xarajat',
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  unplanned: {
    label: 'Kutilmagan xarajat',
    border: 'border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
}
