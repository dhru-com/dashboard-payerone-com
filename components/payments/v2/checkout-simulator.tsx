"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, AlertCircle } from "lucide-react"
import { getCheckoutSimulator } from "@/lib/payment-gateway-v2-actions"
import { Badge } from "@/components/ui/badge"

interface PaymentOption {
  id?: string
  uuid?: string
  name?: string
  type?: string
}

interface SimulatorResult {
  error?: string | unknown
  payment_options?: PaymentOption[]
}

export function CheckoutSimulator() {
  const [token, setToken] = React.useState("")
  const [amount, setAmount] = React.useState("100")
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<SimulatorResult | null>(null)

  const handleSimulate = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const at = Math.floor(Date.now() / 1000)
      const data = await getCheckoutSimulator(token, parseFloat(amount), at) as SimulatorResult
      setResult(data)
    } catch (error) {
      console.error(error)
      setResult({ error: "Failed to simulate" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Checkout Simulator</CardTitle>
          <CardDescription>
            Test your routing rules by simulating a checkout session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Checkout Token</Label>
            <Input
              id="token"
              placeholder="Enter your checkout token..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button
            className="w-full gap-2"
            onClick={handleSimulate}
            disabled={isLoading || !token}
          >
            <Play className="h-4 w-4" />
            {isLoading ? "Simulating..." : "Run Simulation"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Results</CardTitle>
          <CardDescription>
            See which payment options are available and why.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="flex h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
              <Play className="mb-2 h-8 w-8 opacity-20" />
              <p>Run a simulation to see results</p>
            </div>
          ) : result.error ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Options</span>
                <Badge variant="outline">
                  {result.payment_options?.length || 0} Available
                </Badge>
              </div>
              <div className="space-y-2">
                {result.payment_options?.map((option: PaymentOption, i: number) => (
                  <div key={option.id || option.uuid || i} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <span>{option.name || option.type}</span>
                  </div>
                ))}
                {(!result.payment_options || result.payment_options.length === 0) && (
                  <p className="text-center text-sm text-muted-foreground">No options available for this context.</p>
                )}
              </div>

              <div className="mt-4">
                <span className="text-sm font-medium">Raw Response</span>
                <pre className="mt-2 max-h-[200px] overflow-auto rounded-md bg-muted p-2 text-[10px]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
