import * as React from "react"
import { DeveloperHub } from "@/components/developer/developer-hub"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocsBreadcrumbs } from "@/components/developer-docs/docs-breadcrumbs"

export default function DeveloperPage() {
  return (
    <DashboardLayout title="Developer">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
        <DocsBreadcrumbs />
        <DeveloperHub />
      </div>
    </DashboardLayout>
  )
}
