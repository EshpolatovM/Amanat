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

export const goalsKeys = {
  list: (childId) => ['goals', childId],
}
