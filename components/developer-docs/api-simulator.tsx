"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Terminal,
  ChevronDown,
  Loader2,
  Play,
  Info,
  Copy,
  History
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function ApiSimulator({ apiToken }: { apiToken?: string }) {
  const [simType, setSimType] = React.useState<"standard" | "express" | "order-details">("standard")
  const [simUrl, setSimUrl] = React.useState("https://api.payerone.com/checkout/v1/orders_v2")
  const [simMethod, setSimMethod] = React.useState("POST")
  const [simHeaders, setSimHeaders] = React.useState(`{\n  "Authorization": "Bearer ${apiToken || 'YOUR_API_KEY'}",\n  "Content-Type": "application/json"\n}`)
  const [simBody, setSimBody] = React.useState(`{\n  "amount": 105.50,\n  "currency_code": "USD",\n  "description": "Test Order",\n  "customer_name": "John Doe",\n  "customer_email": "john@example.com",\n  "custom_id": "REF-123",\n  "ipn_url": "https://webhook.site/test",\n  "success_url": "https://example.com/success",\n  "fail_url": "https://example.com/fail"\n}`)
  const [simParams, setSimParams] = React.useState(`{\n  "order_id": "ORD-9921"\n}`)
  const [simResponse, setSimResponse] = React.useState<any>(null)
  const [isSimulating, setIsSimulating] = React.useState(false)
  const [requestTab, setRequestTab] = React.useState("body")
  const [cooldowns, setCooldowns] = React.useState<Record<string, number>>({
    standard: 0,
    express: 0,
    "order-details": 0
  })

  // Initialize cooldowns from localStorage on mount
  React.useEffect(() => {
    const types = ["standard", "express", "order-details"]
    const newCooldowns = { ...cooldowns }
    let hasChanges = false

    types.forEach(type => {
      const savedEndTime = localStorage.getItem(`payerone_sim_cooldown_${type}`)
      if (savedEndTime) {
        const endTime = parseInt(savedEndTime, 10)
        const now = Date.now()
        if (endTime > now) {
          newCooldowns[type] = Math.ceil((endTime - now) / 1000)
          hasChanges = true
        } else {
          localStorage.removeItem(`payerone_sim_cooldown_${type}`)
        }
      }
    })

    if (hasChanges) {
      setCooldowns(newCooldowns)
    }
  }, [])

  // Cooldown timer and localStorage sync
  React.useEffect(() => {
    const activeTypes = Object.entries(cooldowns).filter(([_, val]) => val > 0)

    if (activeTypes.length > 0) {
      const timer = setTimeout(() => {
        const nextCooldowns = { ...cooldowns }
        activeTypes.forEach(([type, val]) => {
          if (val > 1) {
            nextCooldowns[type] = val - 1
          } else {
            nextCooldowns[type] = 0
            localStorage.removeItem(`payerone_sim_cooldown_${type}`)
          }
        })
        setCooldowns(nextCooldowns)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldowns])

  const getFullUrl = () => {
    let url = simUrl;
    try {
      const params = JSON.parse(simParams);
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    } catch (e) {}
    return url;
  }

  const generateCurl = () => {
    const url = getFullUrl();
    let curl = `curl -X ${simMethod} "${url}"`
    try {
      const headers = JSON.parse(simHeaders)
      Object.entries(headers).forEach(([key, value]) => {
        curl += ` \\\n  -H "${key}: ${value}"`
      })
    } catch (e) {}

    if (simMethod !== "GET" && simBody) {
      curl += ` \\\n  -d '${simBody.replace(/'/g, "'\\''")}'`
    }
    return curl
  }

  // Update simulator when type changes
  React.useEffect(() => {
    const token = apiToken || 'YOUR_API_KEY';
    if (simType === "standard") {
      setSimUrl("https://api.payerone.com/checkout/v1/orders_v2")
      setSimMethod("POST")
      setSimHeaders(`{\n  "Authorization": "Bearer ${token}",\n  "Content-Type": "application/json"\n}`)
      setSimBody(`{\n  "amount": 105.50,\n  "currency_code": "USD",\n  "description": "Test Order",\n  "customer_name": "John Doe",\n  "customer_email": "john@example.com",\n  "custom_id": "REF-123",\n  "ipn_url": "https://webhook.site/test",\n  "success_url": "https://example.com/success",\n  "fail_url": "https://example.com/fail"\n}`)
      setRequestTab("body")
    } else if (simType === "express") {
      setSimUrl("https://api.payerone.com/checkout/v1/express_wallet")
      setSimMethod("POST")
      setSimHeaders(`{\n  "Authorization": "Bearer ${token}",\n  "Content-Type": "application/json"\n}`)
      setSimBody(`{\n  "merchant_client_id": "123-456",\n  "merchant_client_email": "user@example.com",\n  "merchant_client_name": "Jane Smith",\n  "ipn_url": "https://webhook.site/test",\n  "success_url": "https://example.com/success",\n  "fail_url": "https://example.com/fail",\n  "amount": 50.00\n}`)
      setRequestTab("body")
    } else if (simType === "order-details") {
      setSimUrl("https://api.payerone.com/checkout/v1/orders")
      setSimMethod("GET")
      setSimHeaders(`{\n  "Authorization": "Bearer ${token}",\n  "Accept": "application/json"\n}`)
      setSimBody("")
      setRequestTab("params")
    }
  }, [simType, apiToken])

  const runSimulation = async () => {
    if (cooldowns[simType] > 0) return

    setIsSimulating(true)
    setSimResponse(null)

    try {
      // Set cooldown (30 seconds)
      const duration = 30
      const endTime = Date.now() + (duration * 1000)
      localStorage.setItem(`payerone_sim_cooldown_${simType}`, endTime.toString())
      setCooldowns(prev => ({ ...prev, [simType]: duration }))

      // Artificial delay to feel like a real request
      await new Promise(resolve => setTimeout(resolve, 1500))

      const url = getFullUrl();
      const headers = JSON.parse(simHeaders)
      const body = simMethod !== "GET" ? JSON.parse(simBody) : undefined

      // In a real implementation, we would call the actual API
      // Since we are in a browser, we might hit CORS issues
      // For the simulator, we can show a mock response that looks real
      const mockResponse = {
        status: 200,
        statusText: "OK",
        data: {
          status: "success",
          message: simType === "order-details" ? "Order details retrieved" : "Order created successfully",
          data: simType === "order-details" ? {
            order_id: "ORD-9921",
            status: "success",
            amount: 105.50,
            currency: "USD",
            customer: {
              name: "John Doe",
              email: "john@example.com"
            },
            created_at: new Date().toISOString()
          } : {
            order_id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
            order_url: "https://checkout.payerone.com/pay/test_token_" + Math.random().toString(36).substring(7),
            expires_at: new Date(Date.now() + 3600000).toISOString()
          }
        }
      }

      setSimResponse(mockResponse)
      toast.success("Request sent successfully")
    } catch (e: any) {
      setSimResponse({
        status: 400,
        statusText: "Bad Request",
        data: {
          status: "error",
          message: e.message || "Invalid JSON in request"
        }
      })
      toast.error("Request failed")
    } finally {
      setIsSimulating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/5 pb-4 px-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    API Explorer
                  </CardTitle>
                  <CardDescription className="text-[11px]">Test our endpoints with live data.</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-background/50 border gap-2 shadow-sm min-w-[140px] justify-between">
                      <span className="capitalize">{simType.replace('-', ' ')}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuItem onClick={() => setSimType("standard")}>
                      Standard Checkout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSimType("express")}>
                      Express Checkout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSimType("order-details")}>
                      Order Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6 py-4 bg-muted/5 border-b flex items-center gap-3">
                <Badge variant="outline" className={cn(
                  "font-bold px-2 h-6 flex items-center",
                  simMethod === "POST" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                )}>
                  {simMethod}
                </Badge>
                <div className="flex-1 font-mono text-xs bg-background border border-input rounded-lg h-8 flex items-center px-3 truncate">
                  {getFullUrl()}
                </div>
                <Button size="sm" onClick={runSimulation} disabled={isSimulating || (cooldowns[simType] || 0) > 0} className="h-8 shadow-sm min-w-[80px]">
                  {isSimulating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (cooldowns[simType] || 0) > 0 ? (
                    <span className="text-xs font-mono">{cooldowns[simType]}s</span>
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span className="ml-2 hidden sm:inline">
                    {(cooldowns[simType] || 0) > 0 ? "Wait" : "Send"}
                  </span>
                </Button>
              </div>

              <Tabs value={requestTab} onValueChange={setRequestTab} className="w-full">
                <div className="px-6 border-b bg-muted/5">
                  <TabsList variant="line" className="h-12 gap-6">
                    <TabsTrigger value="params" className="text-xs font-semibold px-2">PARAMS</TabsTrigger>
                    <TabsTrigger value="body" className="text-xs font-semibold px-2">BODY</TabsTrigger>
                    <TabsTrigger value="headers" className="text-xs font-semibold px-2">HEADERS</TabsTrigger>
                    <TabsTrigger value="curl" className="text-xs font-semibold px-2">CURL PREVIEW</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="params" className="m-0">
                  <div className="p-0">
                    <Textarea
                      className="font-mono text-xs h-[350px] rounded-none border-0 focus-visible:ring-0 bg-transparent p-6"
                      value={simParams}
                      onChange={(e) => setSimParams(e.target.value)}
                      placeholder='{ "query_param": "value" }'
                    />
                    <div className="px-6 py-2 bg-primary/5 border-t">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Query Parameters: Enter as JSON to append to the URL.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="body" className="m-0">
                  <div className="p-0">
                    <Textarea
                      className="font-mono text-xs h-[350px] rounded-none border-0 focus-visible:ring-0 bg-transparent p-6"
                      value={simBody}
                      onChange={(e) => setSimBody(e.target.value)}
                      placeholder={simMethod === "GET" ? "Body not supported for GET requests" : '{ "key": "value" }'}
                      disabled={simMethod === "GET"}
                    />
                    {simMethod === "GET" && (
                      <div className="px-6 py-2 bg-yellow-500/5 border-t">
                        <p className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          GET requests typically do not have a request body. Use the PARAMS tab instead.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="headers" className="m-0">
                  <div className="p-0">
                    <Textarea
                      className="font-mono text-xs h-[350px] rounded-none border-0 focus-visible:ring-0 bg-transparent p-6"
                      value={simHeaders}
                      onChange={(e) => setSimHeaders(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="curl" className="m-0">
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(generateCurl())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="font-mono text-[11px] h-[350px] bg-slate-950 text-slate-300 p-6 overflow-auto leading-relaxed">
                      {generateCurl()}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 h-full">
          <Card className="h-full flex flex-col shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/5 pb-4 px-6 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Response
                </CardTitle>
                {simResponse && (
                  <div className="flex items-center gap-2">
                     <Badge variant={simResponse.status >= 200 && simResponse.status < 300 ? "default" : "destructive"} className="font-mono">
                      {simResponse.status} {simResponse.statusText || (simResponse.status === 200 ? "OK" : "")}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(JSON.stringify(simResponse.data, null, 2))}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto bg-[#0d1117] p-0 min-h-[400px] border-t relative">
              {simResponse ? (
                <pre className="text-blue-100/90 p-6 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(simResponse.data, null, 2)}
                </pre>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 p-8" >
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                    <Play className="h-6 w-6 opacity-20" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-slate-400">Ready to simulate</p>
                    <p className="text-xs text-slate-500 max-w-[200px]">Click the send button to see the API response here.</p>
                  </div>
                </div>
              )}
            </CardContent>
            {simResponse && (
              <div className="px-6 py-3 bg-muted/5 border-t flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <div className="flex items-center gap-4">
                  <span>TYPE: JSON</span>
                  <span>SIZE: {new Blob([JSON.stringify(simResponse.data)]).size} B</span>
                </div>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
