import * as React from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getLoginInitData } from "@/lib/auth-actions"
import { PayerOneMeLinkSettings } from "@/components/payments/payerone-me-link-settings"

import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function PayerOneMeLinkPage() {
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
        <SiteHeader title="PayerOne.me Link" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">PayerOne.me Link</h2>
            <p className="text-muted-foreground">
              Manage your personal payment link and handle.
            </p>
          </div>
          <PayerOneMeLinkSettings userProfile={userProfile || null} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
