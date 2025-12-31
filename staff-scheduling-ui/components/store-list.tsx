"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Store } from "@/lib/types"
import { Search } from "lucide-react"

interface StoreListProps {
  stores: Store[]
  selectedStoreId: string | null
  onSelectStore: (storeId: string) => void
}

export function StoreList({ stores, selectedStoreId, onSelectStore }: StoreListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStores = stores.filter((store) => store.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search stores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Store cards */}
      <div className="space-y-2">
        {filteredStores.map((store) => (
          <Card
            key={store.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              selectedStoreId === store.id && "border-primary bg-accent",
            )}
            onClick={() => onSelectStore(store.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{store.name}</h3>
                  <p className="text-sm text-muted-foreground">{store.timezone}</p>
                </div>
                <Badge variant={store.myRole === "OWNER" ? "default" : "secondary"}>{store.myRole}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredStores.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No stores found</p>
        </div>
      )}
    </div>
  )
}
