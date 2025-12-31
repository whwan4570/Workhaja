"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, getStoreId } from '@/lib/api'

/**
 * Hook for authentication and store context
 */
export function useAuth() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [storeId, setStoreIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tokenValue = getAuthToken()
    const storeIdValue = getStoreId()

    setToken(tokenValue)
    setStoreIdState(storeIdValue)
    setIsLoading(false)

    // Redirect to login if no token
    if (!tokenValue) {
      router.replace('/login')
      return
    }
  }, [router])

  return {
    token,
    storeId,
    isLoading,
    isAuthenticated: !!token,
  }
}

