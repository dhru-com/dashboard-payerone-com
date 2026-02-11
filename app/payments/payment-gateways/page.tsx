/**
 * @deprecated Legacy Payment Gateway V1 page.
 * The primary Payment Gateways management is now in /app/payments/payment-gateways-v2/page.tsx
 */
import * as React from "react"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getLoginInitData } from "@/lib/auth-actions"
import { DataTableSkeleton } from "@/components/skeletons/data-table-skeleton"
import { PaymentGateways } from "@/components/payments/payment-gateways"
import { getPaymentGateways } from "@/lib/payment-gateway-actions"

async function PaymentGatewaysContent() {
  const result = await getPaymentGateways();

  return (
    <PaymentGateways
      initialData={result?.data?.activated_gateways || {}}
      metadata={result?.info?.metadata?.payment_gateways || {}}
    />
  )
}

export const dynamic = "force-dynamic";

export default async function PaymentGatewaysPage() {
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
        <SiteHeader title="Payment Gateways" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Suspense fallback={<DataTableSkeleton />}>
            <PaymentGatewaysContent />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
