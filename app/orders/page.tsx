import * as React from "react"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { apiFetch } from "@/lib/api-client"
import { ApiResponse } from "@/types/auth"
import { getLoginInitData } from "@/lib/auth-actions"
import { DataTableSkeleton } from "@/components/skeletons/data-table-skeleton"
import { OrdersDataTable, Order } from "@/components/orders-data-table"

async function OrdersContent({ searchParams, networks, payment_gateways, payment_handle }: { searchParams: { [key: string]: string | string[] | undefined }, networks?: Record<string, { name: string }>, payment_gateways?: Record<string, { type: string; display_name: string }>, payment_handle?: string | null }) {
  let orders: Order[] = []
  let pageCount = 0

  const page = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const limit = typeof searchParams.limit === 'string' ? searchParams.limit : '10'
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all'
  const payment_status = typeof searchParams.payment_status === 'string' ? searchParams.payment_status : 'all'
  const network = typeof searchParams.network === 'string' ? searchParams.network : 'all'
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''

  try {
    const query = new URLSearchParams({
      page,
      limit,
    })

    if (status !== 'all') {
      query.append('status', status)
    }

    if (payment_status !== 'all') {
      query.append('payment_status', payment_status)
    }

    if (network !== 'all') {
      query.append('network', network)
    }

    if (search) {
      query.append('search', search)
    }

    const result = await apiFetch<ApiResponse<Order[]>>(`orders?${query.toString()}`)

    if (result && result.status === "success") {
      orders = result.data
      pageCount = result.info?.pagination?.total_pages || 1
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Network error')) throw error
    console.error("Failed to fetch orders:", error)
  }

  return (
    <OrdersDataTable
      data={orders}
      pageCount={pageCount}
      networks={networks || {}}
      payment_gateways={payment_gateways || {}}
      payment_handle={payment_handle}
    />
  )
}

export const dynamic = "force-dynamic";

export default async function OrdersPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const loginInit = await getLoginInitData();
  const userProfile = loginInit?.profile;
  const networks = loginInit?.static?.networks || {};
  const payment_gateways = userProfile?.payment_gateways || {};
  const payment_handle = userProfile?.payment_handle;

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  const userData = userProfile ? {
    name: userProfile.full_name,
    email: userProfile.email,
    avatar: (userProfile.avatar_url as string) || "/avatars/shadcn.jpg",
    branding: userProfile.branding as { icon?: string },
    subscription: userProfile.subscription_v2?.package,
    subscription_info: userProfile.subscription_info,
    wallet_balance: userProfile.subscription_v2?.wallet_balance
  } : undefined;

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
      <AppSidebar variant="inset" user={userData} />
      <SidebarInset className="min-w-0 flex flex-col overflow-hidden">
        <SiteHeader title="Orders" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto overflow-x-hidden">
            <Suspense key={JSON.stringify(searchParams)} fallback={<DataTableSkeleton />}>
              <OrdersContent
                searchParams={searchParams}
                networks={networks as Record<string, { name: string }>}
                payment_gateways={payment_gateways as Record<string, { type: string; display_name: string }>}
                payment_handle={payment_handle}
              />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
