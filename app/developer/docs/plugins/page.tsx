import * as React from "react"
import { PluginDownloads } from "@/components/developer-docs/plugin-downloads"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DocsBreadcrumbs } from "@/components/developer-docs/docs-breadcrumbs"

export default function PluginsPage() {
  return (
    <DashboardLayout title="Documentation">
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
        <DocsBreadcrumbs />
        <PluginDownloads />
      </div>
    </DashboardLayout>
  )
}
