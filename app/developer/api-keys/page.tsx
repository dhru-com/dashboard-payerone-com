import * as React from "react"
import { MerchantApiAccess } from "@/components/merchant-api-access"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function ApiKeysPage() {
  return (
    <DashboardLayout title="API Keys">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <MerchantApiAccess />
      </div>
    </DashboardLayout>
  )
}
