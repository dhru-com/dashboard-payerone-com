import * as React from "react"
import { MerchantApiAccess } from "@/components/merchant-api-access"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getMerchantApiKey } from "@/lib/auth-actions"

export default async function ApiKeysPage() {
  return (
    <DashboardLayout title="API Keys">
      <div className="flex flex-1 flex-col gap-8 p-4 lg:gap-10 lg:p-6">
        <MerchantApiAccess />
      </div>
    </DashboardLayout>
  )
}
