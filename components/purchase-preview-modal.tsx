"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InvoicePreviewData } from "@/types/subscription"
import { Loader2, AlertCircle, CheckCircle2, RefreshCcw, ArrowUpCircle, Wallet } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PurchasePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  previewData: InvoicePreviewData | null
  onConfirm: () => void
  autoRenew?: boolean
  onAutoRenewChange?: (checked: boolean) => void
  useWallet?: boolean
  onUseWalletChange?: (checked: boolean) => void
  title?: string
}

export function PurchasePreviewModal({
  open,
  onOpenChange,
  loading,
  previewData,
  onConfirm,
  autoRenew,
  onAutoRenewChange,
  useWallet,
  onUseWalletChange,
  title = "Confirm Purchase"
}: PurchasePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{title}</DialogTitle>
            {previewData?.purchase_type === "upgrade" && (
              <Badge variant="success" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider">
                <ArrowUpCircle className="h-2.5 w-2.5 mr-1" />
                Upgrade
              </Badge>
            )}
          </div>
          <DialogDescription>
            {previewData?.purchase_type === "upgrade"
              ? "Review your plan upgrade details. Credits from your current plan will be applied."
              : "Please review the details below before proceeding to payment."
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Calculating preview...</p>
          </div>
        ) : previewData ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product</span>
                <span className="font-bold">{previewData.plan_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing Cycle</span>
                <span className="capitalize font-medium">{previewData.billing_cycle}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${previewData.amount.toFixed(2)}</span>
              </div>
              {previewData.credit_applied > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Credit Applied</span>
                  <span>-${previewData.credit_applied.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total to Pay</span>
                <span className="text-primary">${previewData.final_amount.toFixed(2)}</span>
              </div>
            </div>

            {onAutoRenewChange && (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <RefreshCcw className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-renew" className="text-sm font-bold cursor-pointer">Auto Renew</Label>
                    <p className="text-[10px] text-muted-foreground">Automatically renew plan at end of period.</p>
                  </div>
                </div>
                <Switch
                  id="auto-renew"
                  checked={autoRenew}
                  onCheckedChange={onAutoRenewChange}
                />
              </div>
            )}

            {previewData.can_use_wallet && onUseWalletChange && (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="use-wallet" className="text-sm font-bold cursor-pointer">Use Wallet Balance</Label>
                    <p className="text-[10px] text-muted-foreground">Apply your wallet balance to this purchase.</p>
                  </div>
                </div>
                <Switch
                  id="use-wallet"
                  checked={useWallet}
                  onCheckedChange={onUseWalletChange}
                />
              </div>
            )}

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
              <AlertCircle className="h-3 w-3 mt-0.5 text-primary shrink-0" />
              <p>You will be redirected to our secure payment gateway to complete the transaction. Your plan will be updated immediately after successful payment.</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Failed to load preview. Please try again.
          </div>
        )}

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading || !previewData} className="font-bold">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Confirm & Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
