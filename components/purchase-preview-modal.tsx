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
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            {previewData?.purchase_type === "upgrade" && (
              <Badge variant="success" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider">
                <ArrowUpCircle className="h-2.5 w-2.5 mr-1" />
                Upgrade
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs">
            {previewData?.purchase_type === "upgrade"
              ? "Review your plan upgrade details. Credits from your current plan will be applied."
              : "Please review the details below before proceeding to payment."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Calculating preview...</p>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4 space-y-3 border border-border/50 shadow-inner">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Product</span>
                  <span className="font-bold">{previewData.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Billing Cycle</span>
                  <span className="capitalize font-bold">{previewData.billing_cycle}</span>
                </div>
                <Separator className="opacity-50" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Amount</span>
                  <span className="font-bold">${previewData.amount.toFixed(2)}</span>
                </div>
                {previewData.credit_applied > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">Credit Applied</span>
                    <span className="font-bold">-${previewData.credit_applied.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="opacity-50" />
                <div className="flex justify-between text-lg font-black pt-1">
                  <span className="uppercase tracking-wider text-xs mt-1.5">Total to Pay</span>
                  <span className="text-primary">${previewData.final_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {onAutoRenewChange && (
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-card transition-colors hover:bg-muted/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <RefreshCcw className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-renew" className="text-xs font-bold cursor-pointer uppercase tracking-wider">Auto Renew</Label>
                        <p className="text-[10px] text-muted-foreground">Renew automatically</p>
                      </div>
                    </div>
                    <Switch
                      id="auto-renew"
                      checked={autoRenew}
                      onCheckedChange={onAutoRenewChange}
                      size="sm"
                    />
                  </div>
                )}

                {previewData.can_use_wallet && onUseWalletChange && (
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-card transition-colors hover:bg-muted/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Wallet className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="use-wallet" className="text-xs font-bold cursor-pointer uppercase tracking-wider">Use Wallet</Label>
                        <p className="text-[10px] text-muted-foreground">Apply balance</p>
                      </div>
                    </div>
                    <Switch
                      id="use-wallet"
                      checked={useWallet}
                      onCheckedChange={onUseWalletChange}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/10 leading-relaxed">
                <AlertCircle className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                <p>Redirecting to secure payment. Plan updates immediately after successful payment.</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground italic">
              Failed to load preview. Please try again.
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 flex items-center gap-2 justify-end">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={loading} 
            className="font-bold text-[11px] uppercase tracking-wider h-10 px-4"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading || !previewData} 
            className="font-bold text-[11px] uppercase tracking-wider h-10 px-6 min-w-[140px]"
          >
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
            Confirm & Pay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
