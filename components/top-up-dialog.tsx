"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSubscriptionData, createInvoice } from "@/lib/subscription-actions"
import { SubscriptionResponse, InvoicePurchaseData } from "@/types/subscription"
import { RedirectingModal } from "./redirecting-modal"
import { Loader2, Info, CheckCircle2, Gift, Wallet, Zap } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TopUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAmount?: string
}

export function TopUpDialog({ open, onOpenChange, initialAmount }: TopUpDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<SubscriptionResponse | null>(null)
  const [purchasing, setPurchasing] = React.useState(false)
  const [amount, setAmount] = React.useState<string>("50")
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  React.useEffect(() => {
    if (open && initialAmount) {
      setAmount(initialAmount)
    }
  }, [open, initialAmount])

  const bonus = React.useMemo(() => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || !data?.wallet_bonus_tiers) return 0
    const tiers = [...(data.wallet_bonus_tiers || [])].sort((a, b) => b.min_amount - a.min_amount)
    const tier = tiers.find(t => numAmount >= t.min_amount)
    return tier ? (numAmount * tier.bonus_percent) / 100 : 0
  }, [amount, data])

  const currentTier = React.useMemo(() => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || !data?.wallet_bonus_tiers) return null
    const tiers = [...(data.wallet_bonus_tiers || [])].sort((a, b) => b.min_amount - a.min_amount)
    return tiers.find(t => numAmount >= t.min_amount) || null
  }, [amount, data])

  const allowedValues = React.useMemo(() => {
    const values = [10]
    for (let i = 50; i <= 1000; i += 50) {
      values.push(i)
    }
    for (let i = 1100; i <= 10000; i += 100) {
      values.push(i)
    }
    return values
  }, [])

  const sliderIndex = React.useMemo(() => {
    const numAmount = parseFloat(amount) || 0
    const index = allowedValues.findIndex(v => v >= numAmount)
    return index === -1 ? allowedValues.length - 1 : index
  }, [amount, allowedValues])

  const planInfo = React.useMemo(() => {
    if (!data?.current_subscription || !data?.subscription_plans) return null
    const plan = data.subscription_plans[data.current_subscription.package]
    if (!plan) return null

    const fee = plan.fees.default
    const totalCredits = (parseFloat(amount) || 0) + bonus
    const estTx = fee.fixed > 0 ? Math.floor(totalCredits / fee.fixed) : 0

    return {
      cost: fee.label || `$${fee.fixed.toFixed(2)}`,
      estTx: estTx
    }
  }, [data, amount, bonus])

  React.useEffect(() => {
    if (open && !data) {
      const fetchData = async () => {
        setLoading(true)
        const result = await getSubscriptionData()
        if (result) {
          setData(result)
        }
        setLoading(false)
      }
      fetchData()
    }
  }, [open, data])

  const handleBuyCredits = async () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setPurchasing(true)
    try {
      const result = await createInvoice({
        preview: false,
        order_type: "WALLET_TOPUP",
        amount: numAmount,
        use_wallet: false
      })

      if (result.status === "success" && result.data) {
        const purchaseData = result.data as InvoicePurchaseData
        if (purchaseData.order_url) {
          setIsRedirecting(true)
          toast.success("Redirecting to payment...")
          window.location.href = purchaseData.order_url
        } else {
          toast.success(result.message || "Purchase completed successfully")
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
      setPurchasing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RedirectingModal open={isRedirecting} />
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden flex flex-col max-h-[95vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Top up prepaid balance
              </DialogTitle>
              <DialogDescription className="text-xs">
                Add credits to your wallet for seamless transaction processing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading top-up information...</p>
              </div>
            ) : !data ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Data unavailable</h3>
                <p className="text-muted-foreground mb-6">We couldn&apos;t load top-up information right now.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setData(null)}
                  className="font-bold text-[11px] uppercase tracking-wider"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        How much would you like to add?
                      </h3>

                      <div className="px-2 pt-6 pb-2">
                        <Slider
                          value={[sliderIndex]}
                          min={0}
                          max={allowedValues.length - 1}
                          step={1}
                          onValueChange={(val) => setAmount(allowedValues[val[0]].toString())}
                          formatValue={(val) => `$${allowedValues[val]}`}
                          className="py-4 relative z-0"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          Bonus Tiers
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {(data?.wallet_bonus_tiers || []).map((tier, index) => {
                          const isActive = currentTier?.min_amount === tier.min_amount;
                          return (
                            <div
                              key={index}
                              onClick={() => setAmount(tier.min_amount.toString())}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer",
                                isActive
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
                              )}
                            >
                              <span className="text-sm font-bold">${tier.min_amount}+</span>
                              <div className={cn(
                                "w-px h-3",
                                isActive ? "bg-primary-foreground/30" : "bg-border"
                              )} />
                              <span className={cn(
                                "text-sm font-black",
                                isActive ? "text-primary-foreground" : "text-primary"
                              )}>
                                {tier.bonus_percent}%
                              </span>
                              {isActive && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap className="h-24 w-24 text-primary" />
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Amount</p>
                        <p className="text-2xl font-bold">${parseFloat(amount) || 0}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bonus Credits</p>
                          {currentTier && (
                            <Badge variant="success" className="text-[10px] h-4 px-1 font-bold">
                              {currentTier.bonus_percent}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          +${bonus.toFixed(2)}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-border/50">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Credits</p>
                          <p className="text-3xl font-bold text-primary">
                            ${((parseFloat(amount) || 0) + bonus).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {data && !loading && (
          <div className="p-4 border-t bg-muted/20 flex items-center gap-4 justify-between">
            {planInfo && (
              <div className="text-[10px] font-medium text-muted-foreground leading-relaxed max-w-[60%]">
                Total cost <span className="font-bold text-foreground">{planInfo.cost}</span> per transaction &nbsp;
                Estimated <span className="font-bold text-foreground">{planInfo.estTx}</span> transactions
              </div>
            )}
            <Button
              variant="default"
              className="min-w-[180px] h-10 font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ml-auto"
              onClick={handleBuyCredits}
              disabled={purchasing || !amount || parseFloat(amount) <= 0}
            >
              {purchasing ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-3.5 w-3.5 fill-current" />
              )}
              Confirm & Pay
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
