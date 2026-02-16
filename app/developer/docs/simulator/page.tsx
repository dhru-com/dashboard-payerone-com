import * as React from "react"
import { ApiSimulator } from "@/components/developer-docs/api-simulator"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocsBreadcrumbs } from "@/components/developer-docs/docs-breadcrumbs"
import { getMerchantApiKey } from "@/lib/auth-actions"

export default async function SimulatorPage() {
  const apiKeyData = await getMerchantApiKey();
  const apiToken = apiKeyData?.authorization_token || "";

  return (
    <DashboardLayout title="Documentation">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
        <DocsBreadcrumbs />
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">API Simulator</h1>
          <p className="text-sm text-muted-foreground">Test our endpoints in real-time with our interactive API explorer.</p>
        </div>
        <ApiSimulator apiToken={apiToken} />
      </div>
    </DashboardLayout>
  )
}
