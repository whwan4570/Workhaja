/**
 * Notifications API client
 */

import { apiRequest } from "./api"
import type { Notification, NotificationListResponse, NotificationStatus } from "@/types/notifications"

export interface ListNotificationsParams {
  status?: NotificationStatus
  unread?: boolean
  limit?: number
  cursor?: string
}

/**
 * List my notifications
 * @param storeId - Store ID
 * @param params - Query parameters
 * @returns Notification list response
 */
export async function listMy(
  storeId: string,
  params?: ListNotificationsParams
): Promise<NotificationListResponse> {
  const queryParams = new URLSearchParams()
  if (params?.status) {
    queryParams.append("status", params.status)
  }
  if (params?.unread !== undefined) {
    queryParams.append("unread", params.unread ? "true" : "false")
  }
  if (params?.limit) {
    queryParams.append("limit", String(params.limit))
  }
  if (params?.cursor) {
    queryParams.append("cursor", params.cursor)
  }

  const queryString = queryParams.toString()
  const url = `/stores/${storeId}/me/notifications${queryString ? `?${queryString}` : ""}`

  return apiRequest<NotificationListResponse>(url)
}

/**
 * Mark a notification as read
 * @param storeId - Store ID
 * @param notificationId - Notification ID
 * @returns Success response
 */
export async function markRead(storeId: string, notificationId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/stores/${storeId}/me/notifications/${notificationId}/read`, {
    method: "POST",
  })
}

/**
 * Mark all notifications as read
 * @param storeId - Store ID
 * @returns Success response
 */
export async function markAllRead(storeId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/stores/${storeId}/me/notifications/read-all`, {
    method: "POST",
  })
}

/**
 * Get unread count (fallback: fetch and count)
 * @param storeId - Store ID
 * @returns Unread count
 */
export async function getUnreadCount(storeId: string): Promise<number> {
  try {
    // Try to get unread count from a minimal request
    const response = await listMy(storeId, { unread: true, limit: 1 })
    // If server provides count in response, use it
    // Otherwise, we'll need to fetch more to count
    // For now, fetch a reasonable limit to count
    const fullResponse = await listMy(storeId, { unread: true, limit: 100 })
    return fullResponse.items.length
  } catch (err) {
    console.error("Failed to get unread count:", err)
    return 0
  }
}

/**
 * Trigger internal notification job (admin only)
 * @param endpoint - Internal endpoint path
 * @param internalKey - Internal API key
 * @returns Success response
 */
export async function triggerInternalJob(endpoint: string, internalKey: string): Promise<{ ok: boolean }> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": internalKey,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Endpoint not available")
      }
      throw new Error(`Failed to trigger job: ${response.statusText}`)
    }

    return await response.json()
  } catch (err: any) {
    if (err?.message?.includes("404") || err?.message?.includes("not available")) {
      throw new Error("Debug endpoints not enabled on this server")
    }
    throw err
  }
}

