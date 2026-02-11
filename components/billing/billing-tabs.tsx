"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Check, Loader2, Wallet, Info, Zap, Star, Plus, FileText, Calendar, ArrowRight, LayoutDashboard, History, Settings2, Clock } from "lucide-react"
import { getSubscriptionData, updateSubscription, getInvoices } from "@/lib/subscription-actions"
import { SubscriptionResponse, InvoiceV2 } from "@/types/subscription"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { TopUpDialog } from "../top-up-dialog"
import { PurchasePreviewModal } from "../purchase-preview-modal"
import { InvoiceDetailsDialog } from "./invoice-details-dialog"
import { createInvoice } from "@/lib/subscription-actions"
import { InvoicePreviewData, InvoicePurchaseData } from "@/types/subscription"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RedirectingModal } from "../redirecting-modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function BillingTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<SubscriptionResponse | null>(null)
  const [invoices, setInvoices] = React.useState<InvoiceV2[]>([])
  const [invoicesLoading, setInvoicesLoading] = React.useState(false)
  const [purchasing, setPurchasing] = React.useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'annually'>('monthly')
  const [showTopUp, setShowTopUp] = React.useState(false)

  const [showPreview, setShowPreview] = React.useState(false)
  const [previewLoading, setPreviewLoading] = React.useState(false)
  const [previewData, setPreviewData] = React.useState<InvoicePreviewData | null>(null)
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null)
  const [autoRenew, setAutoRenew] = React.useState(true)
  const [useWallet, setUseWallet] = React.useState(false)
  const [updatingAutoRenew, setUpdatingAutoRenew] = React.useState(false)

  const [selectedInvoiceUuid, setSelectedInvoiceUuid] = React.useState<string | null>(null)
  const [showInvoiceDetails, setShowInvoiceDetails] = React.useState(false)
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    const [subResult, invResult] = await Promise.all([
      getSubscriptionData(),
      getInvoices()
    ])
    if (subResult) {
      setData(subResult)
    }
    if (invResult) {
      setInvoices(invResult)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchPreview = React.useCallback(async (planId: string, renew: boolean, wallet: boolean) => {
    setPreviewLoading(true)
    try {
      const result = await createInvoice({
        preview: true,
        order_type: "SUBSCRIPTION",
        product_id: planId,
        billing_cycle: billingPeriod,
        auto_renew: renew,
        use_wallet: wallet
      })

      if (result.status === "success" && result.data) {
        setPreviewData(result.data as InvoicePreviewData)
      } else {
        toast.error(result.message || "Failed to get plan preview")
        setShowPreview(false)
      }
    } catch (error) {
      toast.error("An error occurred while fetching preview")
      setShowPreview(false)
    } finally {
      setPreviewLoading(false)
    }
  }, [billingPeriod])

  const handlePurchase = async (planId: string) => {
    setSelectedPlan(planId)
    setShowPreview(true)
    fetchPreview(planId, autoRenew, useWallet)
  }

  const handleAutoRenewChange = (checked: boolean) => {
    setAutoRenew(checked)
    if (selectedPlan) {
      fetchPreview(selectedPlan, checked, useWallet)
    }
  }

  const handleUseWalletChange = (checked: boolean) => {
    setUseWallet(checked)
    if (selectedPlan) {
      fetchPreview(selectedPlan, autoRenew, checked)
    }
  }

  const handleToggleAutoRenew = async (checked: boolean) => {
    setUpdatingAutoRenew(true)
    try {
      const result = await updateSubscription({ auto_renew: checked })
      if (result.status === "success") {
        toast.success(`Auto-renew ${checked ? "enabled" : "disabled"} successfully`)
        await fetchData()
      } else {
        toast.error(result.message || "Failed to update auto-renew status")
      }
    } catch (error) {
      toast.error("An error occurred while updating auto-renew status")
    } finally {
      setUpdatingAutoRenew(false)
    }
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return

    setPurchasing(selectedPlan)
    try {
      const result = await createInvoice({
        preview: false,
        order_type: "SUBSCRIPTION",
        product_id: selectedPlan,
        billing_cycle: billingPeriod,
        auto_renew: autoRenew,
        use_wallet: useWallet
      })

      if (result.status === "success" && result.data) {
        const purchaseData = result.data as InvoicePurchaseData
        if (purchaseData.order_url) {
          setIsRedirecting(true)
          toast.success("Redirecting to payment...")
          window.location.href = purchaseData.order_url
        } else {
          toast.success(result.message || "Plan activated successfully")
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        toast.error(result.message || "Failed to process purchase")
      }
    } catch (error) {
      toast.error("An error occurred during purchase")
    } finally {
      setPurchasing(null)
      setShowPreview(false)
    }
  }

  const handleViewInvoice = (uuid: string) => {
    setSelectedInvoiceUuid(uuid)
    setShowInvoiceDetails(true)
  }

  const activeTab = searchParams.get("tab") || "subscription"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="overflow-x-auto pb-1">
          <Skeleton className="h-10 w-[400px]" />
        </div>
        <Card className="w-full">
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px] mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Info className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Subscription data unavailable</h3>
      <p className="text-muted-foreground mb-6">We couldn&apos;t load your subscription details right now.</p>
      <Button onClick={fetchData}>Try Again</Button>
    </div>
  )

  const currentPlan = data.current_subscription
  const isFreePlan = currentPlan.package === 'FREE'

  // Calculate cycle progress
  const startDate = currentPlan.start_date ? new Date(currentPlan.start_date) : null
  const endDate = currentPlan.end_date ? new Date(currentPlan.end_date) : null
  const now = new Date()

  let cycleProgress = 0
  let daysRemaining = 0

  if (startDate && endDate) {
    const total = endDate.getTime() - startDate.getTime()
    const elapsed = now.getTime() - startDate.getTime()
    cycleProgress = Math.min(100, Math.max(0, (elapsed / total) * 100))
    daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
      <div className="space-y-8 px-4 md:px-0">
      <RedirectingModal open={isRedirecting} />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        <div className="mx-auto w-full overflow-x-auto pb-1">
          <TabsList className="w-full justify-start md:w-auto">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="manage">Manage Subscription</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="subscription" className="w-full space-y-8 max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-12">
            {/* Main Plan Widget */}
            <Card className="md:col-span-12 lg:col-span-8 overflow-hidden border-none shadow-none ring-1 ring-border">
              <CardHeader className="bg-muted/30 border-b">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      Overview of your active subscription
                    </CardDescription>
                  </div>
                  <Badge variant={currentPlan.status === "Active" ? "success" : "destructive"} className="capitalize">
                    {currentPlan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black tracking-tight flex items-baseline gap-2">
                        {currentPlan.package}
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Plan</span>
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {isFreePlan
                          ? "You are currently using our permanent free plan. Upgrade anytime to unlock premium features."
                          : `Your ${currentPlan.package} plan gives you full access to all features and optimized fee structures.`}
                      </p>
                    </div>

                    {!isFreePlan && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-muted-foreground">Cycle Progress</span>
                            <span className="text-primary">{Math.round(cycleProgress)}% complete</span>
                          </div>
                          <Progress value={cycleProgress} className="h-2" />
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Expires:</span>
                            <span className="font-semibold">{currentPlan.end_date ? currentPlan.end_date.split(' ')[0] : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold text-primary">{daysRemaining} days left</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button
                      onClick={() => handleTabChange("manage")}
                      className="w-full gap-2 font-bold"
                    >
                      {isFreePlan ? "Upgrade Plan" : "Manage Plan"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    {!isFreePlan && (
                      <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Auto Renew</p>
                          <p className="text-xs font-semibold">{currentPlan.auto_renew ? "Enabled" : "Disabled"}</p>
                        </div>
                        <Switch
                          checked={currentPlan.auto_renew}
                          onCheckedChange={handleToggleAutoRenew}
                          disabled={updatingAutoRenew}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Widget */}
            <Card className="md:col-span-6 lg:col-span-4 flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Balance
                </CardTitle>
                <CardDescription>Available credits for billing</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6 pt-0">
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-primary/5 border border-primary/10 items-center justify-center text-center">
                  <p className="text-sm font-medium text-primary/60 uppercase tracking-tighter">Current Balance</p>
                  <p className="text-4xl font-black text-primary">${currentPlan.wallet_balance.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Quick Top Up</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="font-bold border-muted-foreground/20 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                        onClick={() => setShowTopUp(true)}
                      >
                        +${amount}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full gap-2 font-bold mt-2"
                    onClick={() => setShowTopUp(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Top Up Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Invoices Widget */}
            <Card className="md:col-span-12 lg:col-span-12">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4 text-primary" />
                    Recent Invoices
                  </CardTitle>
                  <CardDescription className="text-xs">Your latest transactions</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="gap-1 font-bold text-primary"
                  onClick={() => handleTabChange("invoices")}
                >
                  View All Invoices
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length > 0 ? (
                  <div className="border-t">
                    <Table>
                      <TableBody>
                        {invoices.slice(0, 3).map((invoice) => (
                          <TableRow
                            key={invoice.invoice_uuid}
                            className="cursor-pointer group"
                            onClick={() => handleViewInvoice(invoice.invoice_uuid)}
                          >
                            <TableCell className="pl-6 font-medium group-hover:text-primary transition-colors">
                              {invoice.invoice_no}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {invoice.created_at.split(' ')[0]}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={invoice.status.toLowerCase() === 'paid' ? 'success' : 'secondary'}
                                className="text-[10px] h-5 px-1.5"
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <FileText className="h-4 w-4 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center border-t">
                    <p className="text-sm text-muted-foreground">No recent invoices</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="w-full space-y-8 max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center mb-2">
              <Tabs
                  value={billingPeriod}
                  onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'annually')}
                  className="w-full max-w-[400px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly" className="font-bold">Monthly</TabsTrigger>
                  <TabsTrigger value="annually" className="font-bold">Annually</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.subscription_plans).map(([id, plan]) => {
                const isExactCurrent = currentPlan.package === id && (id === 'FREE' || currentPlan.billing_cycle === billingPeriod || (!currentPlan.billing_cycle && billingPeriod === 'monthly'))
                const isSamePackage = currentPlan.package === id
                const price = billingPeriod === 'monthly' ? plan.pricing.monthly : plan.pricing.annually
                const isPopular = plan.popular

                const planHierarchy: Record<string, number> = {
                  'FREE': 1,
                  'STARTER': 2,
                  'PRO': 3
                }

                const currentTier = planHierarchy[currentPlan.package] || 0
                const targetTier = planHierarchy[id] || 0

                let buttonText = `Upgrade to ${plan.name}`
                if (isExactCurrent) {
                  buttonText = 'Current Plan'
                } else if (isSamePackage) {
                  buttonText = billingPeriod === 'annually' ? 'Switch to Annual' : 'Switch to Monthly'
                } else if (targetTier < currentTier) {
                  buttonText = `Downgrade to ${plan.name}`
                }

                return (
                    <Card
                        key={id}
                        className={cn(
                            "flex flex-col relative overflow-hidden transition-all duration-300",
                            isExactCurrent ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50",
                            isPopular && !isExactCurrent ? "border-[#e6e2fb] bg-[#e6e2fb]/10" : ""
                        )}
                    >
                      {isPopular && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-[#e6e2fb] text-[#5e4db2] text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 uppercase tracking-wider">
                              <Star className="h-3 w-3 fill-current" />
                              Popular
                            </div>
                          </div>
                      )}

                      <CardHeader className="pb-4 p-4 md:p-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            {plan.badge && (
                                <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold uppercase bg-primary/5 text-primary border-primary/20">
                                  {plan.badge}
                                </Badge>
                            )}
                          </div>
                          <CardDescription className="min-h-[40px] text-sm">{plan.short_description}</CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col gap-6 p-4 md:p-6 pt-0 md:pt-0">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black tracking-tight">${price}</span>
                            <span className="text-muted-foreground font-medium">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                          </div>
                          {billingPeriod === 'annually' && price > 0 && (
                              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide">
                                Save ${ (plan.pricing.monthly * 12 - plan.pricing.annually).toFixed(0) } per year
                              </p>
                          )}
                        </div>

                        <Separator className="opacity-50" />

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <h4 className="text-xs font-bold uppercase tracking-wider">Fee Structure</h4>
                          </div>

                          <div className="rounded-xl border bg-muted/30 overflow-hidden">
                            <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
                              <span className="text-xs font-semibold text-muted-foreground">Transaction Fee</span>
                              <span className="text-sm font-bold">
                              {plan.fees.default.label || `$${plan.fees.default.fixed.toFixed(2)} + ${plan.fees.default.percent}%`}
                            </span>
                            </div>

                            <div className="p-3 space-y-2">
                              {/*<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Gateway Specific Fees</p>*/}
                              <ScrollArea className="h-[100px] pr-4">
                                <div className="space-y-2">
                                  {Object.entries(plan.fees.gateways).map(([gw, fee]) => (
                                      <div key={gw} className="flex justify-between items-center text-[11px] group">
                                        <span className="capitalize text-muted-foreground group-hover:text-foreground transition-colors">{gw.replace(/_/g, ' ')}</span>
                                        <span className="font-semibold">{fee.label || `$${fee.fixed.toFixed(2)} + ${fee.percent}%`}</span>
                                      </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Included Features</h4>
                          <ul className="space-y-2.5">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2.5 text-sm">
                                  <div className="mt-1 rounded-full bg-primary/10 p-0.5">
                                    <Check className="h-3 w-3 text-primary" />
                                  </div>
                                  <span className="leading-tight">{feature}</span>
                                </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 md:p-6 pt-6 md:pt-6 bg-transparent border-t-0">
                        <Button
                            className={cn(
                                "w-full h-11 font-bold transition-all duration-300",
                                isExactCurrent
                                    ? "bg-muted text-muted-foreground hover:bg-muted cursor-default"
                                    : isPopular
                                        ? "bg-[#e6e2fb] hover:bg-[#dcd7f7] text-[#5e4db2]"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                            )}
                            variant={isExactCurrent ? "secondary" : "default"}
                            disabled={isExactCurrent || purchasing !== null}
                            onClick={() => handlePurchase(id)}
                        >
                          {purchasing === id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : isExactCurrent ? (
                              <Check className="mr-2 h-4 w-4" />
                          ) : null}
                          {buttonText}
                        </Button>
                      </CardFooter>
                    </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="invoices" className="w-full space-y-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>Invoices</CardTitle>
                <CardDescription>View and download your past invoices.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow
                        key={invoice.invoice_uuid}
                        className="cursor-pointer"
                        onClick={() => handleViewInvoice(invoice.invoice_uuid)}
                      >
                        <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                        <TableCell>{invoice.created_at.split(' ')[0]}</TableCell>
                        <TableCell>
                          <Badge
                            variant={invoice.status.toLowerCase() === 'paid' ? 'success' : 'secondary'}
                            className="capitalize"
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewInvoice(invoice.invoice_uuid)
                            }}
                          >
                            <FileText className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Empty className="min-h-[350px]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No Invoices Found</EmptyTitle>
                    <EmptyDescription>
                      You don&apos;t have any invoices yet. Once you make a purchase, they will appear here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TopUpDialog open={showTopUp} onOpenChange={setShowTopUp} />
      <PurchasePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        loading={previewLoading}
        previewData={previewData}
        autoRenew={autoRenew}
        onAutoRenewChange={handleAutoRenewChange}
        useWallet={useWallet}
        onUseWalletChange={handleUseWalletChange}
        onConfirm={handleConfirmPurchase}
      />
      <InvoiceDetailsDialog
        open={showInvoiceDetails}
        onOpenChange={setShowInvoiceDetails}
        invoiceUuid={selectedInvoiceUuid}
      />
    </div>
  )
}
