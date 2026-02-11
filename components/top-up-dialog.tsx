"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSubscriptionData, createInvoice } from "@/lib/subscription-actions"
import { SubscriptionResponse, InvoicePurchaseData } from "@/types/subscription"
import { RedirectingModal } from "./redirecting-modal"
import { Loader2, Info, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TopUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TopUpDialog({ open, onOpenChange }: TopUpDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<SubscriptionResponse | null>(null)
  const [purchasing, setPurchasing] = React.useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  React.useEffect(() => {
    if (open && !data) {
      const fetchData = async () => {
        setLoading(true)
        const result = await getSubscriptionData()
        if (result) {
          setData(result)
          const packages = Object.keys(result.wallet_packages)
          if (packages.length > 0) {
            setSelectedPackage(packages[0])
          }
        }
        setLoading(false)
      }
      fetchData()
    } else if (open && data && !selectedPackage) {
      const packages = Object.keys(data.wallet_packages)
      if (packages.length > 0) {
        setSelectedPackage(packages[0])
      }
    }
  }, [open, data, selectedPackage])

  const handleBuyCredits = async () => {
    if (!selectedPackage) return

    setPurchasing(selectedPackage)
    try {
      const result = await createInvoice({
        preview: false,
        order_type: "WALLET_TOPUP",
        product_id: selectedPackage,
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
      setPurchasing(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RedirectingModal open={isRedirecting} />
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Wallet Top-up</DialogTitle>
          <DialogDescription>
            Purchase credits to cover transaction fees. Credits are added instantly to your wallet.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading packages...</p>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Data unavailable</h3>
            <p className="text-muted-foreground mb-6">We couldn&apos;t load top-up packages right now.</p>
            <Button onClick={() => setData(null)}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data.wallet_packages).map(([id, pkg]) => (
                <Card
                  key={id}
                  className={cn(
                    "flex flex-col relative overflow-hidden transition-all duration-300 cursor-pointer border-2",
                    selectedPackage === id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedPackage(id)}
                >
                  {selectedPackage === id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-5 w-5 text-primary fill-background" />
                    </div>
                  )}
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                      {pkg.badge && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold uppercase bg-green-50 text-green-600 border-green-200">
                          {pkg.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[11px] line-clamp-2 min-h-[32px]">{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 px-4 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black">${pkg.amount}</span>
                      <span className="text-muted-foreground text-[10px] font-medium">for ${pkg.credits} credits</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                {selectedPackage && data.wallet_packages[selectedPackage] && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Selected: </span>
                    <span className="font-bold">{data.wallet_packages[selectedPackage].name}</span>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span className="text-muted-foreground">Amount: </span>
                    <span className="font-bold text-primary">${data.wallet_packages[selectedPackage].amount}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 sm:flex-none font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 sm:flex-none min-w-[150px] font-bold"
                    onClick={handleBuyCredits}
                    disabled={purchasing !== null || !selectedPackage}
                  >
                    {purchasing !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm and Pay
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
