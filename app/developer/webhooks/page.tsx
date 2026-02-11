import * as React from "react"
import { WebhookManagement } from "@/components/webhook-management"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getWebhooks } from "@/lib/webhook-actions"

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const initialWebhooks = await getWebhooks()

  return (
    <DashboardLayout title="Webhooks">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <WebhookManagement initialWebhooks={initialWebhooks} />
      </div>
    </DashboardLayout>
  )
}
