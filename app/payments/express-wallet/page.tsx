import * as React from "react"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ExpressWallets } from "@/components/express-wallets"
import { ExpressWalletTabs } from "@/components/express-wallet-tabs"
import { getLoginInitData } from "@/lib/auth-actions"
import { getForwardingAddresses, getExpressWalletCustomers } from "@/lib/forwarding-actions"
import { ExpressWalletCustomersTable } from "@/components/express-wallet-customers-table"
import { DataTableSkeleton } from "@/components/skeletons/data-table-skeleton"
import { NetworkMetadata } from "@/lib/networks"

async function ExpressWalletContent({ networkMetadata }: { networkMetadata?: Record<string, NetworkMetadata> }) {
  const forwardingAddresses = await getForwardingAddresses()

  return (
    <ExpressWallets
      initialData={forwardingAddresses}
      networkMetadata={networkMetadata}
    />
  )
}

async function ExpressWalletCustomersContent({ 
  networkMetadata,
  filters
}: { 
  networkMetadata?: Record<string, NetworkMetadata>,
  filters: {
    page?: number;
    merchant_client_id?: string;
    merchant_client_email?: string;
    merchant_client_name?: string;
    receive_address?: string;
  }
}) {
  const { customers, pagination } = await getExpressWalletCustomers(filters)

  return (
    <ExpressWalletCustomersTable
      data={customers}
      pageCount={pagination?.total_pages || 1}
      networks={networkMetadata}
    />
  )
}

export const dynamic = "force-dynamic";

export default async function ExpressWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const loginInit = await getLoginInitData();
  const userProfile = loginInit?.profile;

  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const merchant_client_id = typeof resolvedSearchParams.merchant_client_id === 'string' ? resolvedSearchParams.merchant_client_id : undefined;
  const merchant_client_email = typeof resolvedSearchParams.merchant_client_email === 'string' ? resolvedSearchParams.merchant_client_email : undefined;
  const merchant_client_name = typeof resolvedSearchParams.merchant_client_name === 'string' ? resolvedSearchParams.merchant_client_name : undefined;
  const receive_address = typeof resolvedSearchParams.receive_address === 'string' ? resolvedSearchParams.receive_address : undefined;

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
          <ExpressWalletTabs
            addressContent={
              <Suspense fallback={<DataTableSkeleton />}>
                <ExpressWalletContent networkMetadata={loginInit?.static?.networks} />
              </Suspense>
            }
            customersContent={
              <Suspense fallback={<DataTableSkeleton />}>
                <ExpressWalletCustomersContent 
                  networkMetadata={loginInit?.static?.networks} 
                  filters={{
                    page,
                    merchant_client_id,
                    merchant_client_email,
                    merchant_client_name,
                    receive_address
                  }}
                />
              </Suspense>
            }
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
