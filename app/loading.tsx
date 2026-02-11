import * as React from "react"
import { cookies } from "next/headers"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function Loading() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <div>
                  <div className="flex aspect-square size-5 items-center justify-center rounded-md overflow-hidden">
                    <Skeleton className="size-full" />
                  </div>
                  <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SidebarMenuSkeleton key={i} showIcon />
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SidebarMenuSkeleton key={i} showIcon />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="grid flex-1 gap-1 group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <Skeleton className="h-6 w-6" />
          <Separator orientation="vertical" className="h-4" />
          <Skeleton className="h-4 w-24" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
             {Array.from({ length: 4 }).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-xl" />
             ))}
          </div>
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
