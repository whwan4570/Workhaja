"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { authApi, getAuthToken } from "@/lib/api"
import { getWeekStartsOn, setWeekStartsOn } from "@/lib/settingsApi"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getStoreId } from "@/lib/api"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{
    id: string
    email: string
    name: string
  } | null>(null)
  const [weekStartsOn, setWeekStartsOnValue] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [storeId, setStoreId] = useState<string | null>(null)

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login")
      return
    }
    loadUserData()
    loadSettings()
  }, [router])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const userData = await authApi.getMe()
      setUser(userData)
      const currentStoreId = getStoreId()
      setStoreId(currentStoreId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user data")
      if (err instanceof Error && err.message.includes("401")) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const currentStoreId = getStoreId()
      if (currentStoreId) {
        const weekStart = await getWeekStartsOn(currentStoreId)
        setWeekStartsOnValue(weekStart)
      }
    } catch (err) {
      console.error("Failed to load settings:", err)
    }
  }

  const handleWeekStartsOnChange = async (value: string) => {
    const newValue = Number.parseInt(value, 10)
    setWeekStartsOnValue(newValue)
    
    try {
      setIsSaving(true)
      setError("")
      setSuccess("")
      
      const currentStoreId = getStoreId()
      if (currentStoreId) {
        // Save to localStorage (backend PUT endpoint not implemented yet)
        setWeekStartsOn(newValue)
        setSuccess("Week start day saved successfully")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 pl-64">
          <Topbar />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Topbar />
        <main className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={user?.name || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Name cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={user?.id || ""}
                      disabled
                      className="bg-muted font-mono text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekStartsOn">Week Starts On</Label>
                    <Select
                      value={weekStartsOn.toString()}
                      onValueChange={handleWeekStartsOnChange}
                      disabled={isSaving || !storeId}
                    >
                      <SelectTrigger id="weekStartsOn">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose which day your work week starts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

