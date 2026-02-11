"use client"

import * as React from "react"
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getMerchantApiKey } from "@/lib/auth-actions"
import { MerchantApiKeyData } from "@/types/auth"

export function MerchantApiAccess() {
  const [mode, setMode] = React.useState<"live" | "sandbox">("live")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showKeys, setShowKeys] = React.useState(false)
  const [keyData, setKeyData] = React.useState<MerchantApiKeyData | null>(null)

  const fetchKeys = React.useCallback(async (targetMode: "live" | "sandbox") => {
    setIsLoading(true)
    try {
      const data = await getMerchantApiKey(targetMode === "sandbox")
      if (data) {
        setKeyData(data)
        setShowKeys(true)
      } else {
        toast.error("Failed to fetch API keys")
      }
    } catch (error) {
      toast.error("An error occurred while fetching API keys")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleModeChange = (value: string) => {
    const newMode = value as "live" | "sandbox"
    setMode(newMode)
    setShowKeys(false)
    setKeyData(null)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const maskValue = (value: string) => {
    return "•".repeat(20)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Use these keys to authenticate your integration with PayerOne.
          Keep your private keys secure and never share them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="live">Live Mode</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox Mode</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth_token">Merchant Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="auth_token"
                  readOnly
                  value={showKeys && keyData ? keyData.authorization_token : (keyData ? maskValue(keyData.authorization_token) : "******************************")}
                  className="font-mono pr-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={!showKeys || !keyData}
                onClick={() => keyData && copyToClipboard(keyData.authorization_token, "Merchant Token")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="private_key">Private Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="private_key"
                  readOnly
                  value={showKeys && keyData ? keyData.private_key : (keyData ? maskValue(keyData.private_key) : "******************************")}
                  className="font-mono pr-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={!showKeys || !keyData}
                onClick={() => keyData && copyToClipboard(keyData.private_key, "Private Key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!showKeys ? (
            <Button onClick={() => fetchKeys(mode)} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Keys...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show Keys
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setShowKeys(false)}>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Keys
            </Button>
          )}
          
          {showKeys && (
             <Button variant="secondary" onClick={() => fetchKeys(mode)} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
             </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
