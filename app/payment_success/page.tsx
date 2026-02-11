import * as React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowRight, Receipt, Calendar, CreditCard, Check } from "lucide-react"
import Link from "next/link"
import { getInvoiceDetails } from "@/lib/subscription-actions"
import { format } from "date-fns"
import { LottieAnimation } from "@/components/lottie-animation"
import successAnimation from "@/public/success_lottie.json"

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { invoice_uuid } = await searchParams;

  let invoice = null;
  if (typeof invoice_uuid === "string") {
    const result = await getInvoiceDetails(invoice_uuid);
    if (result && result.status === "success") {
      invoice = result.data;
    }
  }

  return (
    <DashboardLayout title="Payment Successful" hideUpgrade={true}>
      <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-lg flex flex-col items-center text-center space-y-8">

          <div className="relative w-64 h-64 flex items-center justify-center">
             <LottieAnimation
               animationData={successAnimation}
               className="w-full h-full"
               loop={false}
             />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Your transaction has been completed successfully and your account has been updated.
            </p>
          </div>

          {invoice ? (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 px-4 md:px-8 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                <div className="space-y-1 md:text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Invoice No.</p>
                  <p className="font-bold text-sm">{invoice.invoice_no}</p>
                </div>
                <div className="space-y-1 md:text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Date</p>
                  <p className="font-bold text-sm">
                    {invoice.paid_at ? format(new Date(invoice.paid_at), "MMM d, yyyy") : format(new Date(invoice.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="space-y-1 md:text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Amount Paid</p>
                  <p className="font-black text-primary text-lg">${invoice.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50/50 py-2 px-4 rounded-full w-fit mx-auto">
                <Check className="h-4 w-4" />
                <span>{invoice.description} activated</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-muted-foreground">
              <p className="font-medium">Payment processed successfully.</p>
              {invoice_uuid && <p className="text-xs mt-2 opacity-50">Transaction ID: {invoice_uuid}</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
            <Button asChild size="lg" className="flex-1 font-bold">
              <Link href="/billing">
                Manage Subscription <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="flex-1 font-bold">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            A confirmation receipt has been sent to your email.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
