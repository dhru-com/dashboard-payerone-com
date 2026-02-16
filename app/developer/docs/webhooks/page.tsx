import * as React from "react"
import { WebhookDocs } from "@/components/webhook-docs"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocsBreadcrumbs } from "@/components/developer-docs/docs-breadcrumbs"

export default function WebhooksDocsPage() {
  return (
    <DashboardLayout title="Documentation">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
        <DocsBreadcrumbs />
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground">Everything you need to know about integrating our real-time payment notifications.</p>
        </div>
        <WebhookDocs />
      </div>
    </DashboardLayout>
  )
}
