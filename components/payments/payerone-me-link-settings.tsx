"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Copy } from "lucide-react"
import { toast } from "sonner"
import { updatePaymentHandle } from "@/lib/auth-actions"
import { User } from "@/types/auth"

interface PayerOneMeLinkSettingsProps {
  userProfile: User | null
}

export function PayerOneMeLinkSettings({ userProfile }: PayerOneMeLinkSettingsProps) {
  const router = useRouter()
  const [isUpdatingHandle, setIsUpdatingHandle] = React.useState(false)
  const [handle, setHandle] = React.useState(userProfile?.payment_handle || "")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z-]/g, "")
    if (value.length <= 40) {
      setHandle(value)
    }
  }

  const isValid = handle.length >= 5 && handle.length <= 40

  const handleUpdatePaymentHandle = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!handle) {
      toast.error("Payment handle is required")
      return
    }

    // Validation: 5-40 characters, a-z, -
    const handleRegex = /^[a-z-]{5,40}$/
    if (!handleRegex.test(handle)) {
      toast.error("Payment handle must be 5-40 characters and only contain lowercase letters and hyphens")
      return
    }

    try {
      setIsUpdatingHandle(true)
      const result = await updatePaymentHandle(handle)
      if (result.status === "success") {
        toast.success(result.message || "Payment handle updated successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to update payment handle")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while updating payment handle")
    } finally {
      setIsUpdatingHandle(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PayerOne.me Link</CardTitle>
        <CardDescription>
          Configure your unique payment handle to receive payments easily.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdatePaymentHandle}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 max-w-md">
            <Label htmlFor="payment_handle" className="text-xs font-medium">Payment Handle <span className="text-destructive">*</span></Label>
            <div className="flex h-9 w-full items-stretch rounded-lg border border-input bg-transparent overflow-hidden focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring transition-all">
              <div className="flex items-center justify-center bg-muted px-3 border-r border-input text-muted-foreground text-sm font-medium select-none">
                payerone.me/@
              </div>
              <input
                id="payment_handle"
                value={handle}
                onChange={handleInputChange}
                placeholder={userProfile?.company_name
                  ? userProfile.company_name.toLowerCase().replace(/[^a-z-]/g, "").substring(0, 40)
                  : "your-name"
                }
                className="flex-1 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 min-w-0"
                required
                minLength={5}
                maxLength={40}
              />
              <div className="flex items-center p-1">
                <Button
                  type="submit"
                  disabled={isUpdatingHandle || !isValid}
                  size="sm"
                  className="h-7"
                >
                  {isUpdatingHandle ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Handle"
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-muted-foreground">
                Your payment handle must be 5-40 characters long and can only contain lowercase letters and hyphens (-).
              </p>
              <span className={`text-[10px] font-medium ${handle.length > 0 && handle.length < 5 ? "text-destructive" : "text-muted-foreground"}`}>
                {handle.length}/40
              </span>
            </div>
          </div>

          {userProfile?.payment_handle && (
            <div className="pt-2 max-w-md">
              <Label className="text-xs font-medium">Your Public Link</Label>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 flex items-center p-2 rounded-md bg-muted text-sm font-mono break-all">
                  https://payerone.me/@{userProfile.payment_handle}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => {
                    const url = `https://payerone.me/@${userProfile.payment_handle}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied to clipboard");
                  }}
                  title="Copy link"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </form>
    </Card>
  )
}
