import * as React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCcw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getInvoiceDetails } from "@/lib/subscription-actions"

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PaymentFailPage({ searchParams }: PageProps) {
  const { invoice_uuid } = await searchParams;

  let invoice = null;
  if (typeof invoice_uuid === "string") {
    const result = await getInvoiceDetails(invoice_uuid);
    if (result && result.status === "success") {
      invoice = result.data;
    }
  }

  return (
    <DashboardLayout title="Payment Failed" hideUpgrade={true}>
      <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-12 text-center">
        <div className="w-full max-w-lg flex flex-col items-center space-y-8">
          
          <div className="rounded-full bg-red-50 p-6">
            <XCircle className="h-20 w-20 text-red-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-red-600">
              Payment Failed
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We couldn&apos;t complete your transaction. No funds were charged from your account.
            </p>
          </div>

          <div className="w-full bg-red-50/50 border border-red-100 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-start gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">What went wrong?</p>
                <p className="text-xs opacity-80 mt-1 leading-relaxed">
                  The payment was declined by your bank or the payment gateway. This can happen due to insufficient funds, incorrect card details, or network issues.
                </p>
              </div>
            </div>

            {invoice && (
              <div className="pt-4 border-t border-red-100 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Attempted for</p>
                  <p className="font-bold text-sm text-red-900">{invoice.description}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Amount</p>
                  <p className="font-black text-red-600 text-lg">${invoice.amount.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
            <Button asChild size="lg" variant="destructive" className="flex-1 font-bold">
              <Link href="/billing">
                Try Again <RefreshCcw className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="flex-1 font-bold">
              <Link href="/billing">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Billing
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            If you continue to experience issues, please contact our support team.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
