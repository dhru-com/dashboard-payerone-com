import * as React from "react"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SettingsTabs } from "@/components/settings-tabs"
import { ApiResponse, User, NotificationPreferences } from "@/types/auth"
import { getLoginInitData, getNotificationPreferences } from "@/lib/auth-actions"
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton"

async function SettingsContent({ userProfile, notificationPreferences }: {
  userProfile: User | null,
  notificationPreferences: ApiResponse<NotificationPreferences> | null
}) {
  return (
    <SettingsTabs userProfile={userProfile} notificationPreferences={notificationPreferences} />
  )
}

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const loginInit = await getLoginInitData();
  const userProfile = loginInit?.profile;
  const notificationPreferences = await getNotificationPreferences();

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  const userData = userProfile ? {
    name: userProfile.full_name,
    email: userProfile.email,
    avatar: (userProfile.avatar_url as string) || "/avatars/shadcn.jpg",
    branding: userProfile.branding as { icon?: string },
    subscription: userProfile.subscription_v2?.package,
    subscription_info: userProfile.subscription_info,
    wallet_balance: userProfile.subscription_v2?.wallet_balance,
    payment_handle: userProfile.payment_handle
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
        <SiteHeader title="Settings" hideUpgrade={true} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Separator />
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsContent userProfile={userProfile || null} notificationPreferences={notificationPreferences} />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
