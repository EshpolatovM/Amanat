import { apiClient } from '../lib/apiClient'

export async function fetchDashboard(childId) {
  const { data } = await apiClient.get('/dashboard', childId ? { params: { childId } } : undefined)
  return data.data
}

export const dashboardKeys = {
  detail: (childId) => ['dashboard', childId ?? 'all'],
}
