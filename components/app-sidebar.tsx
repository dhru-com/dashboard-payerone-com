"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  Wallet,
  Zap,
  KeyIcon,
  BookOpenIcon,
  CreditCard,
  WebhookIcon,
  FolderTree,
  ShieldCheck,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { usePathname } from "next/navigation"

import { NavPayments } from "@/components/nav-payments"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavDevelopment } from "@/components/nav-development"
import { NavDeveloper } from "@/components/nav-developer"
import { NavUser } from "@/components/nav-user"
import { NavWallet } from "@/components/nav-wallet"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    subscription: "FREE",
    wallet_balance: 0,
    payment_handle: null,
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ListIcon,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ArrowUpCircleIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "https://account.dhru.com/contact-us",
      icon: HelpCircleIcon,
    },
  ],
  payments: [
    {
      name: "Receiving Address",
      url: "/payments/receiving-wallet-address",
      icon: Wallet,
    },
    {
      name: "Express Wallet",
      url: "/payments/express-wallet",
      icon: Zap,
    },
    {
      name: "Payment Gateways",
      url: "/payments/payment-gateways-v2",
      icon: CreditCard,
    },
    {
      name: "PayerOne.me Link",
      url: "/payments/payerone-me-link/introduction",
      icon: LinkIcon,
    },
  ],
  developer: [
    {
      title: "Overview",
      url: "/developer",
      icon: LayoutDashboardIcon,
    },
    {
      title: "API Keys",
      url: "/developer/api-keys",
      icon: KeyIcon,
    },
    {
      title: "Webhooks",
      url: "/developer/webhooks",
      icon: WebhookIcon,
    },
    {
      title: "Documentation",
      url: "/developer/docs",
      icon: BookOpenIcon,
      items: [
        {
          title: "API Reference",
          url: "/developer/docs/api",
        },
        {
          title: "API Simulator",
          url: "/developer/docs/simulator",
        },
        {
          title: "Download Plugins",
          url: "/developer/docs/plugins",
        },
        {
          title: "Webhooks Docs",
          url: "/developer/docs/webhooks",
        },
      ],
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string
    email: string
    avatar: string
    branding?: {
      icon?: string
    }
    subscription?: string
    subscription_info?: string
    wallet_balance?: number
    payment_handle?: string | null
  }
}) {
  const sidebarUser = user || data.user
  const { state } = useSidebar()
  const pathname = usePathname()
  const isCollapsed = state === "collapsed"
  const isFreePlan = sidebarUser.subscription === "FREE"
  const isDashboard = pathname === "/"

  const paymentsItems = React.useMemo(() => {
    return data.payments.map(item => {
      if (item.name === "PayerOne.me Link") {
        return {
          ...item,
          url: sidebarUser.payment_handle
            ? "/payments/payerone-me-link"
            : "/payments/payerone-me-link/introduction"
        }
      }
      return item
    })
  }, [sidebarUser.payment_handle])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <div className="flex aspect-square size-5 items-center justify-center rounded-sm overflow-hidden">
                  <Image
                    src="/logo_payerone.svg"
                    alt="PayerOne"
                    width={20}
                    height={20}
                    className="size-full object-contain"
                  />
                </div>
                <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">PayerOne</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavPayments items={paymentsItems} />
        <NavDeveloper items={data.developer} />

        {process.env.NODE_ENV !== "production" && <NavDevelopment />}
      </SidebarContent>
      <SidebarFooter>
        <NavWallet balance={sidebarUser.wallet_balance} />
        <NavSecondary items={data.navSecondary} />
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
