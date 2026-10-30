import { apiClient } from '../lib/apiClient'

export async function fetchUnplannedExpenses(childId) {
  if (!childId) return []
  const { data } = await apiClient.get(`/children/${childId}/unplanned-expenses`)
  return data.data
}

export async function createUnplannedExpense(childId, payload) {
  const { data } = await apiClient.post(`/children/${childId}/unplanned-expenses`, payload)
  return data.data
}

export async function updateUnplannedExpense(id, payload) {
  const { data } = await apiClient.patch(`/unplanned-expenses/${id}`, payload)
  return data.data
}

export async function deleteUnplannedExpense(id) {
  await apiClient.delete(`/unplanned-expenses/${id}`)
}

export const unplannedExpensesKeys = {
  list: (childId) => ['unplanned-expenses', childId],
}
