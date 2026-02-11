"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface RedirectingModalProps {
  open: boolean
}

export function RedirectingModal({ open }: RedirectingModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center p-12 text-center" showCloseButton={false}>
        <div className="space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Redirecting to Payment</h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we securely redirect you to the payment gateway to complete your transaction.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
