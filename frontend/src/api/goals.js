import { apiClient } from '../lib/apiClient'

export async function fetchGoals(childId) {
  if (!childId) return []
  const { data } = await apiClient.get(`/children/${childId}/goals`)
  return data.data
}

export async function createGoal(childId, name) {
  const { data } = await apiClient.post(`/children/${childId}/goals`, { name })
  return data.data
}

export async function renameGoal(goalId, name) {
  const { data } = await apiClient.patch(`/goals/${goalId}`, { name })
  return data.data
}

export async function deleteGoal(goalId) {
  await apiClient.delete(`/goals/${goalId}`)
}

// Formadagi "+ Yangi maqsad" uchun: shu nomdagi maqsad (katta-kichik harfsiz)
// allaqachon bo'lsa, yangisini yaratmay o'shani ishlatamiz — takroriy
// "Kurs"/"kurs" maqsadlari statistikani ikkiga bo'lib yubormasin.
function findByName(goals, name) {
  const needle = name.toLocaleLowerCase('uz')
  return goals?.find((goal) => goal.name.toLocaleLowerCase('uz') === needle)
}

export async function resolveGoalId(childId, goals, name) {
  const trimmed = name.trim()
  const existing = findByName(goals, trimmed)
  if (existing) return existing.id
  try {
    const goal = await createGoal(childId, trimmed)
    return goal.id
  } catch (error) {
    // Ro'yxat eskirgan bo'lsa (masalan oldingi urinishda maqsad yaratilib,
    // xarajat saqlanmay qolgan) — server "allaqachon mavjud" deydi: o'shani olamiz.
    if (error.response?.status !== 409) throw error
    const fresh = findByName(await fetchGoals(childId), trimmed)
    if (!fresh) throw error
    return fresh.id
  }
}

export const goalsKeys = {
  list: (childId) => ['goals', childId],
}
