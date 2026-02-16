import * as React from "react"
import { ApiDocs } from "@/components/developer-docs/api-docs"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocsBreadcrumbs } from "@/components/developer-docs/docs-breadcrumbs"

export default function ApiDocsPage() {
  return (
    <DashboardLayout title="Documentation">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
        <DocsBreadcrumbs />
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
          <p className="text-sm text-muted-foreground">Comprehensive documentation for PayerOne Checkout API.</p>
        </div>
        <ApiDocs />
      </div>
    </DashboardLayout>
  )
}
