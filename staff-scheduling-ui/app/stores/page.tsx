"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StoreList } from "@/components/store-list"
import { MemberTable } from "@/components/member-table"
import { CreateStoreModal } from "@/components/modals/create-store-modal"
import { InviteMemberModal } from "@/components/modals/invite-member-modal"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { Plus } from "lucide-react"
import { storesApi, membershipsApi, getAuthToken } from "@/lib/api"
import type { Store, Member } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StoresPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [createStoreOpen, setCreateStoreOpen] = useState(false)
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Check authentication
  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login")
      return
    }
    loadStores()
  }, [router])

  const loadStores = async () => {
    try {
      setIsLoading(true)
      const data = await storesApi.getStores()
      const formattedStores: Store[] = data.map((store) => ({
        id: store.id,
        name: store.name,
        timezone: store.timezone,
        myRole: (store.role || "WORKER") as "OWNER" | "MANAGER" | "WORKER",
      }))
      setStores(formattedStores)
      if (formattedStores.length > 0 && !selectedStoreId) {
        setSelectedStoreId(formattedStores[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores")
      if (err instanceof Error && err.message.includes("401")) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadMembers = async (storeId: string) => {
    try {
      const data = await membershipsApi.getStoreMembers(storeId)
      const formattedMembers: Member[] = data.map((membership) => ({
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
        role: membership.role,
        status: "ACTIVE" as const,
      }))
      setMembers(formattedMembers)
    } catch (err) {
      console.error("Failed to load members:", err)
      setMembers([])
    }
  }

  useEffect(() => {
    if (selectedStoreId) {
      loadMembers(selectedStoreId)
    }
  }, [selectedStoreId])

  const handleCreateStore = async (data: { name: string; timezone: string }) => {
    try {
      await storesApi.createStore(data)
      await loadStores()
      setCreateStoreOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store")
    }
  }

  const handleInviteMember = async (data: { email: string; role: "OWNER" | "MANAGER" | "WORKER" }) => {
    if (!selectedStoreId) return
    try {
      await membershipsApi.createMembership(selectedStoreId, data)
      await loadMembers(selectedStoreId)
      setInviteMemberOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member")
    }
  }

  const selectedStore = stores.find((s) => s.id === selectedStoreId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 pl-64">
          <Topbar />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading stores...</p>
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
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Stores</h1>
            <Button onClick={() => setCreateStoreOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Store
            </Button>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Store list */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Stores</CardTitle>
                </CardHeader>
                <CardContent>
                  <StoreList stores={stores} selectedStoreId={selectedStoreId} onSelectStore={setSelectedStoreId} />
                </CardContent>
              </Card>
            </div>

            {/* Right: Store detail */}
            <div className="lg:col-span-2">
              {selectedStore ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedStore.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline">{selectedStore.timezone}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="members">
                      <TabsList>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="rules">Labor Rules</TabsTrigger>
                        <TabsTrigger value="integrations">Integrations</TabsTrigger>
                      </TabsList>
                      <TabsContent value="members" className="space-y-4">
                        <div className="flex justify-end">
                          <Button onClick={() => setInviteMemberOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Invite Member
                          </Button>
                        </div>
                        <MemberTable members={members} />
                      </TabsContent>
                      <TabsContent value="rules">
                        <div className="rounded-lg border border-dashed p-12 text-center">
                          <p className="text-sm text-muted-foreground">Labor rules configuration coming soon.</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="integrations">
                        <div className="rounded-lg border border-dashed p-12 text-center">
                          <p className="text-sm text-muted-foreground">Integrations configuration coming soon.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">Select a store to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateStoreModal open={createStoreOpen} onOpenChange={setCreateStoreOpen} onSubmit={handleCreateStore} />
      <InviteMemberModal open={inviteMemberOpen} onOpenChange={setInviteMemberOpen} onSubmit={handleInviteMember} />
    </div>
  )
}
