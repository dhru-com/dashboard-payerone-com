"use client"

import * as React from "react"
import { BugIcon, CheckIcon, GlobeIcon, ServerIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setApiBaseUrl, getApiBaseUrlOverride } from "@/lib/auth-actions"

export function NavDevelopment() {
  const [currentOverride, setCurrentOverride] = React.useState<string | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    getApiBaseUrlOverride().then(setCurrentOverride)
  }, [])

  const handleSetUrl = async (url: string | null) => {
    await setApiBaseUrl(url)
    setCurrentOverride(url)
    // Reload to ensure all server components use the new URL
    window.location.reload()
  }

  if (!isMounted) return null

  const options = [
    { label: "Production (Default)", value: null, icon: GlobeIcon },
    { label: "Localhost (8080)", value: "http://localhost:8080/client/v1/", icon: ServerIcon },
    { label: "Live API", value: "https://api.payerone.com/client/v1/", icon: GlobeIcon },
  ]

  const getActiveLabel = () => {
    if (!currentOverride) return "Prod"
    if (currentOverride.includes("localhost")) return "Local"
    if (currentOverride.includes("api.payerone.com")) return "Live"
    return "Custom"
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Development</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="API Base URL" className="text-orange-500 dark:text-orange-400">
                  <BugIcon />
                  <span className="group-data-[collapsible=icon]:hidden">API: {getActiveLabel()}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>API Base URL Override</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.map((opt) => (
                  <DropdownMenuItem
                    key={opt.label}
                    onClick={() => handleSetUrl(opt.value)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <opt.icon className="h-4 w-4" />
                      <span>{opt.label}</span>
                    </div>
                    {currentOverride === opt.value && <CheckIcon className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
