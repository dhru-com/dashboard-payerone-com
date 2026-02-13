import * as React from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { getLoginInitData } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { LinkIcon, CheckCircle2, Globe, Shield } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic";

export default async function PayerOneMeIntroductionPage() {
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
        <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-8">
          <div className="max-w-3xl w-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Personalize Your Payment Experience
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Create your unique PayerOne.me link to receive payments easily, professionally, and securely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-lg border bg-card">
                <Globe className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-base mb-2">Custom Handle</h3>
                <p className="text-sm text-muted-foreground">
                  Get a unique URL like payerone.me/@yourname that's easy to share.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-base mb-2">Instant Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your payment link in seconds and start receiving funds.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <Shield className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-base mb-2">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Built on PayerOne's robust infrastructure for safe transactions.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button size="default" className="rounded-full" asChild>
                <Link href="/payments/payerone-me-link">
                  Create My PayerOne.me Link
                </Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Set up your handle to unlock this feature.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
