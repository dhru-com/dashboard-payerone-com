import * as React from "react"
import { WebhookDocs } from "@/components/webhook-docs"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function WebhookDocsPage() {
  return (
    <DashboardLayout title="Webhook Documentation">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/developer/webhooks">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about integrating our webhooks.
            </p>
          </div>
        </div>
        <WebhookDocs />
      </div>
    </DashboardLayout>
  )
}
