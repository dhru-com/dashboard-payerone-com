import * as React from "react"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { MerchantAddresses } from "@/components/merchant-addresses"
import { apiFetch } from "@/lib/api-client"
import { MerchantAddress, VirtualAddress } from "@/types/merchant"
import { ApiResponse } from "@/types/auth"
import { getLoginInitData } from "@/lib/auth-actions"
import { NetworkMetadata } from "@/lib/networks"
import { DataTableSkeleton } from "@/components/skeletons/data-table-skeleton"

async function ReceivingWalletContent({
  searchParams,
  networkMetadata
}: {
  searchParams: { [key: string]: string | string[] | undefined },
  networkMetadata?: Record<string, NetworkMetadata>
}) {
  const page = typeof searchParams.page === 'string' ? searchParams.page : '1'
  const limit = typeof searchParams.limit === 'string' ? searchParams.limit : '20'
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''

  const query = new URLSearchParams({
    page,
    limit,
  })

  if (search) {
    query.append('search', search)
  }

  const [merchantResult, virtualResult] = await Promise.all([
    apiFetch<ApiResponse<MerchantAddress[] | Record<string, MerchantAddress>>>("merchant_addresses"),
    apiFetch<ApiResponse<VirtualAddress[]>>(`receiving_addresses?${query.toString()}`)
  ])

  let merchantAddresses: MerchantAddress[] = []
  if (merchantResult && merchantResult.status === "success") {
    const data = merchantResult.data
    merchantAddresses = Array.isArray(data) ? data : Object.values(data || {})
  }

  let virtualAddresses: VirtualAddress[] = []
  let virtualPageCount = 0
  if (virtualResult && virtualResult.status === "success") {
    virtualAddresses = virtualResult.data
    virtualPageCount = virtualResult.info?.pagination?.total_pages || 1
  }

  return (
    <MerchantAddresses
      initialData={merchantAddresses}
      virtualAddresses={virtualAddresses}
      virtualPageCount={virtualPageCount}
      networkMetadata={networkMetadata}
    />
  )
}

export const dynamic = "force-dynamic";

export default async function ReceivingWalletPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const loginInit = await getLoginInitData();
  const userProfile = loginInit?.profile;

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
      <SidebarInset>
        <SiteHeader title="Payments" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Suspense key={JSON.stringify(searchParams)} fallback={<DataTableSkeleton />}>
            <ReceivingWalletContent
              searchParams={searchParams}
              networkMetadata={loginInit?.static?.networks}
            />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
