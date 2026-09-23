import { apiClient } from '../lib/apiClient'

export async function updateParentProfile(payload) {
  const { data } = await apiClient.patch('/parents/me', payload)
  return data.data
}

export async function changeParentPassword(payload) {
  const { data } = await apiClient.patch('/parents/me/password', payload)
  return data.data
}
