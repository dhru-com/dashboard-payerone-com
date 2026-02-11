"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export function ExpressWalletTabs({
  addressContent,
  customersContent,
}: {
  addressContent: React.ReactNode
  customersContent: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get("tab") || "address"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="address">
          Address
        </TabsTrigger>
        <TabsTrigger value="customers">
          Customers
        </TabsTrigger>
      </TabsList>
      <TabsContent value="address" className="space-y-4">
        {addressContent}
      </TabsContent>
      <TabsContent value="customers" className="space-y-4">
        {customersContent}
      </TabsContent>
    </Tabs>
  )
}
