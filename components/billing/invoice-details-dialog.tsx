"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InvoiceDetailsV2 } from "@/types/subscription"
import { getInvoiceDetails } from "@/lib/subscription-actions"
import { Loader2, Calendar, Hash, CreditCard, Receipt, Info } from "lucide-react"

interface InvoiceDetailsDialogProps {
  invoiceUuid: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceDetailsDialog({
  invoiceUuid,
  open,
  onOpenChange,
}: InvoiceDetailsDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [details, setDetails] = React.useState<InvoiceDetailsV2 | null>(null)

  React.useEffect(() => {
    if (open && invoiceUuid) {
      setLoading(true)
      getInvoiceDetails(invoiceUuid).then((result) => {
        if (result.status === "success" && result.data) {
          setDetails(result.data)
        }
        setLoading(false)
      })
    } else if (!open) {
      setDetails(null)
    }
  }, [open, invoiceUuid])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details</span>
            {details && (
              <Badge variant={details.status.toLowerCase() === 'paid' ? 'success' : 'secondary'} className="capitalize">
                {details.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {details ? `Invoice ${details.invoice_no}` : "View details of your invoice"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : details ? (
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Invoice No</span>
                  </div>
                  <p className="text-sm font-bold">{details.invoice_no}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-sm font-bold">{details.created_at}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Order Type</span>
                  </div>
                  <p className="text-sm font-bold capitalize">{details.order_type.toLowerCase().replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium uppercase tracking-wider">Payment ID</span>
                  </div>
                  <p className="text-sm font-bold">{details.payment_order_id || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Invoice Items</h4>
                </div>
                <div className="rounded-xl border bg-muted/30 overflow-hidden">
                  {details.invoice_items.map((item, index) => (
                    <div key={index} className={index !== 0 ? "border-t" : ""}>
                      <div className="p-4 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{item.description}</p>
                          {item.credit > 0 && (
                            <p className="text-xs text-muted-foreground">Credit applied: ${item.credit.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${item.total.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">Tax: ${item.tax.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-bold">${(details.amount + details.credits).toFixed(2)}</span>
                </div>
                {details.credits > 0 && (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-medium text-muted-foreground">Credits Applied</span>
                    <span className="text-sm font-bold text-green-600">-${details.credits.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center px-1">
                  <span className="text-base font-black">Total</span>
                  <span className="text-xl font-black text-primary">
                    {details.currency} ${details.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {details.paid_at && (
                <div className="rounded-lg bg-success/5 border border-success/20 p-3 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <p className="text-xs text-success-foreground font-medium">
                    Paid on {details.paid_at}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            Failed to load invoice details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
