import * as React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BillingTabs } from "@/components/billing/billing-tabs"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  return (
    <DashboardLayout title="Billing" hideUpgrade={true}>
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
          <p className="text-muted-foreground">
            Manage your subscription, plans, and view your invoices.
          </p>
        </div>
        <Separator />
        <BillingTabs />
      </div>
    </DashboardLayout>
  )
}
