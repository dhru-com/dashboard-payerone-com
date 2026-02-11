"use client"

import * as React from "react"
import { Wallet, Plus } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TopUpDialog } from "./top-up-dialog"

export function NavWallet({ balance }: { balance?: number }) {
  const [showTopUp, setShowTopUp] = React.useState(false)

  if (balance === undefined) return null

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10 mx-2 group-data-[collapsible=icon]:mx-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent">
            <div className="flex flex-col gap-0.5 flex-1 group-data-[collapsible=icon]:hidden">
              <span className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-tight">Wallet Balance</span>
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-black">${balance.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowTopUp(true)}
              className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto cursor-pointer"
              title={`Wallet Balance: $${balance.toFixed(2)} - Click to Top Up`}
            >
              <Plus className="h-3.5 w-3.5 group-data-[collapsible=icon]:hidden" />
              <Wallet className="h-4 w-4 hidden group-data-[collapsible=icon]:block" />
            </button>
            <TopUpDialog open={showTopUp} onOpenChange={setShowTopUp} />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
