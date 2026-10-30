import { apiClient } from '../lib/apiClient'

export async function fetchStatistics({ period, childId, from, to } = {}) {
  const params = {}
  if (period) params.period = period
  if (childId) params.childId = childId
  if (from) params.from = from
  if (to) params.to = to

  const { data } = await apiClient.get('/statistics', { params })
  return data.data
}

// Bugun / shu hafta / shu oy jamlari — bitta so'rovda
export async function fetchStatisticsSummary(childId) {
  const { data } = await apiClient.get('/statistics/summary', childId ? { params: { childId } } : undefined)
  return data.data
}

export const statisticsKeys = {
  detail: (params) => ['statistics', params.period ?? null, params.childId ?? 'all', params.from ?? null, params.to ?? null],
  summary: (childId) => ['statistics', 'summary', childId ?? 'all'],
}
