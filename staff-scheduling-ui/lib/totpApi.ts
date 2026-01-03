import { apiRequest } from './api'

export interface QRCodeResponse {
  qrCodeDataUrl: string
  token: string
  expiresAt: string
}

/**
 * Get QR code for check-in/check-out (for managers/owners)
 */
export async function getQRCode(storeId: string): Promise<QRCodeResponse> {
  return apiRequest<QRCodeResponse>(`/stores/${storeId}/totp/qrcode`)
}

/**
 * Check-in or check-out using TOTP token
 */
export async function checkinWithTotp(
  storeId: string,
  token: string,
  type: 'CHECK_IN' | 'CHECK_OUT'
): Promise<any> {
  return apiRequest<any>(`/stores/${storeId}/totp/checkin`, {
    method: 'POST',
    body: JSON.stringify({ token, type }),
  })
}

/**
 * Reset TOTP secret (OWNER only)
 */
export async function resetTotpSecret(storeId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/stores/${storeId}/totp/reset`, {
    method: 'POST',
  })
}

