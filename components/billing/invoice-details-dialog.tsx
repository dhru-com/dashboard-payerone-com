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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InvoiceDetailsV2 } from "@/types/subscription"
import { getInvoiceDetails } from "@/lib/subscription-actions"
import { cn } from "@/lib/utils"
import { Loader2, Calendar, Receipt, Info, CheckCircle2 } from "lucide-react"

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
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">Invoice Details</DialogTitle>
              <DialogDescription className="text-xs">
                {details ? `Invoice #${details.invoice_no}` : "View details of your invoice"}
              </DialogDescription>
            </div>
            {details && (
              <Badge
                variant={details.status.toLowerCase() === 'paid' ? 'success' : 'secondary'}
                className="capitalize h-6 px-3 text-[10px] font-bold"
              >
                {details.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : details ? (
          <>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/20">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Date
                  </span>
                  <p className="text-xs font-bold">{details.created_at.split(' ')[0]}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                    <Receipt className="h-3 w-3" />
                    Type
                  </span>
                  <p className="text-xs font-bold capitalize">{details.order_type.toLowerCase().replace('_', ' ')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-4 w-1 rounded-full bg-primary" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Invoice Items</h4>
                </div>
                <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Description</span>
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Amount</span>
                  </div>
                  {details.invoice_items.map((item, index) => (
                    <div key={index} className={cn("p-4 flex justify-between items-start gap-4 transition-colors hover:bg-muted/20", index !== 0 && "border-t")}>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">{item.description}</p>
                        {item.credit > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="success" className="h-4 px-1 text-[8px] font-bold uppercase">Credit</Badge>
                            <p className="text-[10px] text-muted-foreground">Applied: ${item.credit.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs font-bold">${item.total.toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground font-medium">Tax: ${item.tax.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 bg-primary/5 rounded-xl p-4 border border-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Subtotal</span>
                  <span className="text-xs font-bold">${(details.amount + details.credits).toFixed(2)}</span>
                </div>
                {details.credits > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Credits Applied</span>
                    <span className="text-xs font-bold text-success">-${details.credits.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="bg-primary/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-wider">Total</span>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary leading-none">
                      {details.currency} ${details.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {details.paid_at && (
                <div className="rounded-xl bg-success/5 border border-success/20 p-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Payment Received</p>
                    <p className="text-[10px] text-muted-foreground">
                      Successfully paid on {details.paid_at.split(' ')[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="font-bold text-[11px] uppercase tracking-wider">
              Close
            </Button>
          </div>
          </>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            Failed to load invoice details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
