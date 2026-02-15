import * as React from "react"
import { Suspense } from "react"
import { CheckoutDocs } from "@/components/checkout-docs"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getMerchantApiKey } from "@/lib/auth-actions"

export default async function DocumentationPage() {
  const apiKeyData = await getMerchantApiKey();
  const apiToken = apiKeyData?.authorization_token || "";

  return (
    <DashboardLayout title="Documentation">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading documentation...</div>}>
          <CheckoutDocs apiToken={apiToken} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
