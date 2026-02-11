import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth-config"
import { Badge } from "@/components/ui/badge"
import { getLoginInitData } from "@/lib/auth-actions"
import Link from "next/link"
import { Zap, ArrowRight } from "lucide-react"

export async function SiteHeader({ 
  title = "Payments",
  hideUpgrade = false
}: { 
  title?: string
  hideUpgrade?: boolean
}) {
  const loginInit = await getLoginInitData();
  const userProfile = loginInit?.profile;
  const isFreePlan = userProfile?.subscription_v2?.package === "FREE";

  const cookieStore = await cookies();
  const apiOverride = cookieStore.get(AUTH_CONFIG.apiBaseUrlCookieKey)?.value;

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>

        <div className="ml-auto flex items-center gap-2 lg:gap-4">
          {isFreePlan && !hideUpgrade && (
            <Link 
              href="/billing?tab=manage"
              className="group/upgrade flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e6e2fb] hover:bg-[#dcd7f7] text-[#5e4db2] text-[11px] font-bold transition-all"
            >
              <Zap className="h-3 w-3 fill-current animate-pulse" />
              <span className="hidden sm:inline">Unlock More Features</span>
              <span className="sm:hidden">Upgrade</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover/upgrade:translate-x-0.5" />
            </Link>
          )}

          {apiOverride && (
            <Badge variant="destructive" className="h-6 rounded-full px-2 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              Debug: {apiOverride.includes('localhost') ? 'Local API' : 'Custom API'}
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}
