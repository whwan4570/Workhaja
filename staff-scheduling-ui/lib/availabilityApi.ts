/**
 * Availability API client
 */

import { apiRequest } from './api'
import { extractYMD } from './date'
import type { Availability } from '@/types/availability'

/**
 * List availability for a month
 * @param storeId - Store ID
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns Array of availability records
 */
export async function listAvailability(
  storeId: string,
  year: number,
  month: number
): Promise<Availability[]> {
  try {
    const data = await apiRequest<Availability[]>(
      `/stores/${storeId}/months/${year}-${month}/availability`
    )
    // Normalize dates to YYYY-MM-DD
    return data.map((avail) => ({
      ...avail,
      date: extractYMD(avail.date),
    }))
  } catch (error: any) {
    // If 404, return empty array (month might not exist)
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      return []
    }
    throw error
  }
}

/**
 * Upsert (create or update) availability
 * @param storeId - Store ID
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 * @param payload - Availability data
 * @returns Created/updated availability
 */
export async function upsertAvailability(
  storeId: string,
  year: number,
  month: number,
  payload: {
    date: string // YYYY-MM-DD
    startTime?: string | null // HH:mm or null for all-day
    endTime?: string | null // HH:mm or null for all-day
  }
): Promise<Availability> {
  const data = await apiRequest<Availability>(
    `/stores/${storeId}/months/${year}-${month}/availability`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        date: extractYMD(payload.date), // Ensure YYYY-MM-DD format
      }),
    }
  )
  // Normalize date
  return {
    ...data,
    date: extractYMD(data.date),
  }
}

/**
 * Delete availability
 * @param storeId - Store ID
 * @param availabilityId - Availability ID
 * @returns Success response
 */
export async function deleteAvailability(
  storeId: string,
  availabilityId: string
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(
    `/stores/${storeId}/availability/${availabilityId}`,
    {
      method: 'DELETE',
    }
  )
}

