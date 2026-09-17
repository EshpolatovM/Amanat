import { apiClient } from '../lib/apiClient'

export async function startPasswordReset(phone) {
  const { data } = await apiClient.post('/auth/parent/password-reset/start', { phone })
  return data.data
}

export async function fetchPasswordResetStatus(requestId) {
  const { data } = await apiClient.get(`/auth/parent/password-reset/${requestId}/status`)
  return data.data
}

export async function verifyPasswordResetOtp(requestId, otp) {
  const { data } = await apiClient.post(`/auth/parent/password-reset/${requestId}/verify`, { otp })
  return data.data
}

export async function confirmPasswordReset(payload) {
  const { data } = await apiClient.post('/auth/parent/password-reset/confirm', payload)
  return data.data
}

export const passwordResetKeys = {
  status: (requestId) => ['password-reset-status', requestId],
}
