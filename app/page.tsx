import * as React from "react"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { UpgradePromotion } from "@/components/upgrade-promotion"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getLoginInitData } from "@/lib/auth-actions"
import { getRecentOrders, getRecentTransactions } from "@/lib/dashboard-actions"
import { SectionCardsSkeleton } from "@/components/skeletons/section-cards-skeleton"
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { DataTableSkeleton } from "@/components/skeletons/data-table-skeleton"

export const dynamic = "force-dynamic";

export default async function Page() {
  console.log("[Page] Fetching login init data...");
  const loginInit = await getLoginInitData();
  console.log(`[Page] Login init data result: ${loginInit ? "Success" : "Failed/Null"}`);

  if (!loginInit) {
    console.log("[Page] No login data, user might be unauthenticated or API failed");
  }

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

  const networks = loginInit?.static?.networks || {};
  const payment_gateways = userProfile?.payment_gateways || {};

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
        <SiteHeader title="Dashboard" hideUpgrade={true} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <Suspense fallback={<SectionCardsSkeleton />}>
                <SectionCards />
              </Suspense> */}
              <div className="px-4 lg:px-6">
                <Suspense fallback={<ChartSkeleton />}>
                  <ChartAreaInteractive />
                </Suspense>
              </div>
              <UpgradePromotion currentPlan={userProfile?.subscription_v2?.package} />
              <Suspense fallback={<DataTableSkeleton />}>
                <DashboardTabsWrapper networks={networks} payment_gateways={payment_gateways} />
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function DashboardTabsWrapper({
  networks,
  payment_gateways
}: {
  networks: Record<string, { name: string }>,
  payment_gateways: Record<string, { type: string; display_name: string }>
}) {
  const [ordersData, transactionsData] = await Promise.all([
    getRecentOrders(),
    getRecentTransactions()
  ]);

  return (
    <DashboardTabs
      ordersData={ordersData}
      transactionsData={transactionsData}
      networks={networks}
      payment_gateways={payment_gateways}
    />
  );
}
