import { apiClient } from '../lib/apiClient'

export async function fetchPlannedExpenses(childId) {
  if (!childId) return []
  const { data } = await apiClient.get(`/children/${childId}/planned-expenses`)
  return data.data
}

export async function createPlannedExpense(childId, payload) {
  const { data } = await apiClient.post(`/children/${childId}/planned-expenses`, payload)
  return data.data
}

export async function deletePlannedExpense(id) {
  await apiClient.delete(`/planned-expenses/${id}`)
}

export const plannedExpensesKeys = {
  list: (childId) => ['planned-expenses', childId],
}
