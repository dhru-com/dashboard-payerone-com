import * as React from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CopyButton } from "@/components/copy-button"
import { SafeImage } from "@/components/safe-image"
import {
  ArrowLeft,
  ExternalLink,
  ShoppingCart,
  Zap,
  Clock,
  User,
  Mail,
  Globe,
  ShieldCheck,
  AlertCircle,
  FileJson,
  Activity,
  Wallet
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { apiFetch } from "@/lib/api-client"
import { ApiResponse } from "@/types/auth"
import { getLoginInitData } from "@/lib/auth-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface OrderDetails {
  display_order_id: string
  amount: string
  currency_code: string
  status: string
  custom_id: string
  type: string
  network: string
  payment_address: string
  payment_amount: string
  received_amount: string
  dynamic_amount: string | null
  dt: string
  description: string
  customer_name: string
  customer_email: string
  website?: string
  note?: string
  payment_status: string
  ipn_log?: IPNLog[]
  transactions?: Transaction[]
  items?: OrderItem[]
}

interface IPNLog {
  display_order_id: string
  statuscode: number
  ipn: string | null
  ipn_raw: {
    url: string
    method: string
    statusCode: string
    responseData: string
    requestData: string
  }
  dt: string
}

interface Transaction {
  transaction_id: number
  order_id: number
  network_transaction_id: string
  amount: string
  confirmations: number | null
  status: string
  address: string
  address_from: string | null
  dt: string
}

interface OrderItem {
  description: string
  amount: string
}



function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

  switch (status) {
    case "Paid":
    case "Verified":
      variant = "default"
      break
    case "Cancel":
    case "Failed":
      variant = "destructive"
      break
    case "Pending":
    case "Partially-Paid":
    case "Partially Paid":
    case "Verifying":
      variant = "secondary"
      break
    default:
      variant = "secondary"
  }

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const orderId = params.id

  const loginInit = await getLoginInitData()
  const userProfile = loginInit?.profile
  const networks = loginInit?.static?.networks || {}

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  const userData = userProfile ? {
    name: userProfile.full_name,
    email: userProfile.email,
    avatar: (userProfile.avatar_url as string) || "/avatars/shadcn.jpg",
    branding: userProfile.branding as { icon?: string },
    subscription: userProfile.subscription_v2?.package,
    subscription_info: userProfile.subscription_info,
    wallet_balance: userProfile.subscription_v2?.wallet_balance
  } : undefined

  let order: OrderDetails | null = null

  try {
    const result = await apiFetch<ApiResponse<OrderDetails[]>>(`orders?display_order_id=${orderId}`)
    if (result && result.status === "success" && result.data.length > 0) {
      order = result.data[0]
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Network error')) throw error
    console.error("Failed to fetch order details:", error)
  }

  if (!order) {
    notFound()
  }

  const networkId = order.network
  const paymentGateways = userProfile?.payment_gateways || {}
  let networkName = "N/A"
  let logoPath = ""

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(networkId)
  const networkLabel = isUuid ? "Payment Gateway" : "Network"

  if (isUuid && paymentGateways[networkId]) {
    networkName = paymentGateways[networkId].display_name
    const type = paymentGateways[networkId].type
    logoPath = `/logos/${type.toLowerCase()}.svg`
  } else if (networkId) {
    networkName = networks[networkId]?.name || networkId
    const logoMap: Record<string, string> = {
      'bsc': 'bsc.svg',
      'ethereum': 'ethereum.svg',
      'polygon': 'polygon.svg',
      'tron': 'tron.svg',
      'solana': 'solana.svg',
      'arbitrum': 'arbitrum.svg',
      'optimism': 'optimism.svg',
      'base': 'base.svg',
      'opbnb': 'opbnb.svg',
      'btc': 'btc.svg'
    }
    const logoFile = logoMap[networkId.toLowerCase()] || `${networkId.toLowerCase()}.svg`
    logoPath = `/logos/${logoFile}`
  }

  const networkInfo = networks[order.network]
  const blockchainUrl = networkInfo?.blockchain_url

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={userData} />
      <SidebarInset className="min-w-0 flex flex-col overflow-hidden">
        <SiteHeader title="Order Details" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto overflow-x-hidden">

            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/orders" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {order.custom_id === "payment_handle" ? "Payerone.me Link" : `Order ${order.custom_id ? `#${order.custom_id}` : ""}`}
                      <StatusBadge status={order.status} />
                      {order.status !== order.payment_status && (
                        <StatusBadge status={order.payment_status} />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      PayerOne Order ID: <span className="font-mono text-xs">{order.display_order_id}</span>
                      <CopyButton text={order.display_order_id} />
                    </CardDescription>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {order.type?.toLowerCase().includes('express') || order.type?.toLowerCase().includes('evm') ? (
                      <Zap className="h-5 w-5 text-primary" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">
                        {order.amount} {order.currency_code}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Created Date</p>
                      <p className="text-lg font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {order.dt}
                      </p>
                    </div>
                    {order.network && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{networkLabel}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/50 overflow-hidden relative">
                            <SafeImage
                              src={logoPath}
                              alt={networkName}
                              width={24}
                              height={24}
                              className="object-contain"
                              fallbackIcon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                            />
                          </div>
                          <span className="font-medium uppercase">{networkName}</span>
                        </div>
                      </div>
                    )}
                    {order.payment_address && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Payment Address</p>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs truncate max-w-[150px] md:max-w-none" title={order.payment_address}>
                            {order.payment_address}
                          </span>
                          <CopyButton text={order.payment_address} />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Name
                    </p>
                    <p className="font-medium">{order.customer_name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      {order.customer_email || "N/A"}
                      {order.customer_email && <CopyButton text={order.customer_email} />}
                    </p>
                  </div>
                  {order.website && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Website
                      </p>
                      <a
                        href={order.website.startsWith('http') ? order.website : `https://${order.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline flex items-center gap-1 w-fit"
                      >
                        {order.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div className="pt-2 border-t text-xs text-muted-foreground italic">
                    {order.description}
                  </div>
                  {order.note && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">Note</p>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">{order.note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="items" className="w-full space-y-4">
              <TabsList>
                <TabsTrigger value="items" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Items
                </TabsTrigger>
                {order.ipn_log && order.ipn_log.length > 0 && (
                  <TabsTrigger value="ipn" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    IPN Logs
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell className="text-right">
                                {item.amount} {order.currency_code}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                              No items found.
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-right">
                            {order.amount} {order.currency_code}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {order.transactions && order.transactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>TXID</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.transactions.map((tx) => (
                              <TableRow key={tx.transaction_id}>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    {blockchainUrl ? (
                                      <a
                                        href={`${blockchainUrl}${tx.network_transaction_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="font-mono text-xs truncate max-w-[150px]" title={tx.network_transaction_id}>
                                          {tx.network_transaction_id}
                                        </span>
                                      </a>
                                    ) : (
                                      <span className="font-mono text-xs truncate max-w-[150px]" title={tx.network_transaction_id}>
                                        {tx.network_transaction_id}
                                      </span>
                                    )}
                                    <CopyButton text={tx.network_transaction_id} />
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {tx.amount} {order.currency_code}
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={tx.status} />
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {tx.dt}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {order.ipn_log && order.ipn_log.length > 0 && (
                <TabsContent value="ipn">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        IPN Delivery History
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ShieldCheck className="h-4 w-4 text-green-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Instant Payment Notifications sent to your webhook URL.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full space-y-4">
                        {order.ipn_log.map((log, index) => (
                          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 bg-muted/30 overflow-hidden">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex flex-1 items-center justify-between pr-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-muted-foreground mr-1">
                                    Attempt {index + 1}
                                  </span>
                                  <Badge variant={log.statuscode === 200 ? "default" : "destructive"} className="h-6">
                                    HTTP {log.statuscode}
                                  </Badge>
                                  <span className="text-xs font-medium text-foreground">{log.ipn_raw.method}</span>
                                  <span className="text-xs text-muted-foreground">{log.dt}</span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 text-xs space-y-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-muted-foreground uppercase font-bold text-[10px]">Webhook URL</p>
                                  <CopyButton text={log.ipn_raw.url} />
                                </div>
                                <p className="break-all font-mono p-2 bg-background rounded border text-[10px]" title={log.ipn_raw.url}>
                                  {log.ipn_raw.url}
                                </p>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground uppercase font-bold text-[10px]">Request Payload</p>
                                    <CopyButton text={log.ipn_raw.requestData} />
                                  </div>
                                  <pre className="p-2 bg-background rounded border overflow-x-auto max-h-64 font-mono text-[10px] leading-relaxed">
                                    {JSON.stringify(JSON.parse(log.ipn_raw.requestData), null, 2)}
                                  </pre>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground uppercase font-bold text-[10px]">Response Data</p>
                                    <CopyButton text={log.ipn_raw.responseData} />
                                  </div>
                                  <pre className="p-2 bg-background rounded border overflow-x-auto max-h-64 font-mono text-[10px] leading-relaxed">
                                    {log.ipn_raw.responseData.startsWith('{') || log.ipn_raw.responseData.startsWith('[')
                                      ? JSON.stringify(JSON.parse(log.ipn_raw.responseData), null, 2)
                                      : log.ipn_raw.responseData}
                                  </pre>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
