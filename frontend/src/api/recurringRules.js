import { apiClient } from '../lib/apiClient'

export async function fetchRecurringRules(childId) {
  if (!childId) return []
  const { data } = await apiClient.get(`/children/${childId}/recurring-rules`)
  return data.data
}

export async function createRecurringRule(childId, payload) {
  const { data } = await apiClient.post(`/children/${childId}/recurring-rules`, payload)
  return data.data
}

export async function updateRecurringRule(id, payload) {
  const { data } = await apiClient.patch(`/recurring-rules/${id}`, payload)
  return data.data
}

export async function deleteRecurringRule(id) {
  await apiClient.delete(`/recurring-rules/${id}`)
}

export const recurringRulesKeys = {
  list: (childId) => ['recurring-rules', childId],
}
