import { apiClient } from '../lib/apiClient'

export async function changeParentPassword(payload) {
  const { data } = await apiClient.patch('/parents/me/password', payload)
  return data.data
}
