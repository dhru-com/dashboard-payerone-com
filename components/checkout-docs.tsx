"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Shield,
  Zap,
  Info,
  Lock,
  Key,
  Code2,
  Copy,
  ExternalLink,
  Play,
  Terminal,
  Loader2,
  ChevronRight,
  Wallet,
  ShoppingCart,
  WebhookIcon,
  SearchIcon,
  Settings2,
  History,
  Eye,
  Trash2,
  Plus,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const AUTH_SNIPPET = `Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`

const STANDARD_CHECKOUT_PHP = `<?php
$apiKey = 'YOUR_API_KEY';
$url = 'https://api.payerone.com/checkout/v1/orders_v2';

$data = [
    "amount" => 105.50,
    "currency_code" => "USD",
    "description" => "Premium Subscription - 1 Year",
    "customer_name" => "John Doe",
    "customer_email" => "john.doe@example.com",
    "custom_id" => "ORD-9921",
    "ipn_url" => "https://your-api.com/webhooks/payerone",
    "success_url" => "https://your-site.com/payment/success",
    "fail_url" => "https://your-site.com/payment/failed"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

if ($result['status'] === 'success') {
    // Redirect customer to PayerOne Checkout page
    header('Location: ' . $result['data']['order_url']);
} else {
    echo "Error: " . $result['message'];
}
?>`

const STANDARD_CHECKOUT_PYTHON = `import requests

url = "https://api.payerone.com/checkout/v1/orders_v2"
api_key = "YOUR_API_KEY"

payload = {
    "amount": 105.50,
    "currency_code": "USD",
    "description": "Premium Subscription - 1 Year",
    "customer_name": "John Doe",
    "customer_email": "john.doe@example.com",
    "custom_id": "ORD-9921",
    "ipn_url": "https://your-api.com/webhooks/payerone",
    "success_url": "https://your-site.com/payment/success",
    "fail_url": "https://your-site.com/payment/failed"
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

if result.get("status") == "success":
    print(f"Redirect to: {result['data']['order_url']}")
else:
    print(f"Error: {result.get('message')}")`

const STANDARD_CHECKOUT_GO = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "https://api.payerone.com/checkout/v1/orders_v2"
	apiKey := "YOUR_API_KEY"

	payload := map[string]interface{}{
		"amount":         105.50,
		"currency_code":  "USD",
		"description":    "Premium Subscription - 1 Year",
		"customer_name":  "John Doe",
		"customer_email": "john.doe@example.com",
		"custom_id":      "ORD-9921",
		"ipn_url":        "https://your-api.com/webhooks/payerone",
		"success_url":    "https://your-site.com/payment/success",
		"fail_url":       "https://your-site.com/payment/failed",
	}

	jsonPayload, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if result["status"] == "success" {
		data := result["data"].(map[string]interface{})
		fmt.Println("Redirect to:", data["order_url"])
	} else {
		fmt.Println("Error:", result["message"])
	}
}`

const EXPRESS_WALLET_PHP = `<?php
$apiKey = 'YOUR_API_KEY';
$url = 'https://api.payerone.com/checkout/v1/express_wallet';

$data = [
    "merchant_client_id" => "123-456",
    "merchant_client_email" => "user@example.com",
    "merchant_client_name" => "Jane Smith",
    "ipn_url" => "https://your-api.com/webhooks/payerone",
    "success_url" => "https://your-site.com/wallet/success",
    "fail_url" => "https://your-site.com/wallet/fail",
    "amount" => 50.00
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

if ($result['status'] === 'success') {
    echo "Deposit Addresses: " . print_r($result['data']['networks'], true);
    echo "Checkout URL: " . $result['data']['order_url'];
} else {
    echo "Error: " . $result['message'];
}
?>`

const EXPRESS_WALLET_NODE = `const axios = require('axios');

async function createExpressWallet() {
  const url = 'https://api.payerone.com/checkout/v1/express_wallet';
  const apiKey = 'YOUR_API_KEY';

  const payload = {
    merchant_client_id: "123-456",
    merchant_client_email: "user@example.com",
    merchant_client_name: "Jane Smith",
    ipn_url: "https://your-api.com/webhooks/payerone",
    success_url: "https://your-site.com/wallet/success",
    fail_url: "https://your-site.com/wallet/fail",
    amount: 50.00
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Deposit Addresses:', response.data.data.networks);
    console.log('Checkout URL:', response.data.data.order_url);
  } catch (error) {
    console.error('Error creating express wallet:', error.response.data);
  }
}

createExpressWallet();`

const EXPRESS_WALLET_PYTHON = `import requests

url = "https://api.payerone.com/checkout/v1/express_wallet"
api_key = "YOUR_API_KEY"

payload = {
    "merchant_client_id": "123-456",
    "merchant_client_email": "user@example.com",
    "merchant_client_name": "Jane Smith",
    "ipn_url": "https://your-api.com/webhooks/payerone",
    "success_url": "https://your-site.com/wallet/success",
    "fail_url": "https://your-site.com/wallet/fail",
    "amount": 50.00
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

if result.get("status") == "success":
    print(f"Deposit Addresses: {result['data']['networks']}")
    print(f"Checkout URL: {result['data']['order_url']}")
else:
    print(f"Error: {result.get('message')}")`

const ORDER_DETAILS_PHP = `<?php
$apiKey = 'YOUR_API_KEY';
$orderId = 'ORD-9921';
$url = "https://api.payerone.com/checkout/v1/orders?order_id={$orderId}";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

if ($result['status'] === 'success') {
    print_r($result['data']);
} else {
    echo "Error: " . $result['message'];
}
?>`

const ORDER_DETAILS_NODE = `const axios = require('axios');

async function getOrderDetails() {
  const orderId = 'ORD-9921';
  const url = \`https://api.payerone.com/checkout/v1/orders?order_id=\${orderId}\`;
  const apiKey = 'YOUR_API_KEY';

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Accept': 'application/json'
      }
    });

    console.log('Order Details:', response.data.data);
  } catch (error) {
    console.error('Error fetching order details:', error.response.data);
  }
}

getOrderDetails();`

const ORDER_DETAILS_PYTHON = `import requests

order_id = "ORD-9921"
url = f"https://api.payerone.com/checkout/v1/orders?order_id={order_id}"
api_key = "YOUR_API_KEY"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
result = response.json()

if result.get("status") == "success":
    print(f"Order Data: {result['data']}")
else:
    print(f"Error: {result.get('message')}")`

const SIGNATURE_PHP = `<?php
$privateKey = 'YOUR_PRIVATE_KEY';
$payload = file_get_contents('php://input');
$signatureHeader = $_SERVER['HTTP_X_PAYERONE_SIGNATURE'] ?? '';

$computedSignature = hash_hmac('sha256', $payload, $privateKey);

if (hash_equals($computedSignature, $signatureHeader)) {
    // Signature is valid
    $event = json_decode($payload, true);
    // Process the event...
    http_response_code(200);
} else {
    // Invalid signature
    http_response_code(401);
}
?>`

const SIGNATURE_NODE = `const crypto = require('crypto');

app.post('/webhooks/payerone', (req, res) => {
  const privateKey = 'YOUR_PRIVATE_KEY';
  const signature = req.headers['x-payerone-signature'];
  const payload = JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', privateKey);
  const digest = hmac.update(payload).digest('hex');

  if (signature === digest) {
    console.log('Valid Webhook:', req.body.type);
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});`

const SIGNATURE_PYTHON = `import hmac
import hashlib
import json

def verify_webhook(payload, signature_header, private_key):
    # payload should be raw bytes
    computed_signature = hmac.new(
        private_key.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(computed_signature, signature_header)`

const SIGNATURE_GO = `package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
)

func verifyWebhook(payload []byte, signatureHeader string, privateKey string) bool {
	h := hmac.New(sha256.New, []byte(privateKey))
	h.Write(payload)
	computedSignature := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(computedSignature), []byte(signatureHeader))
}`

const WEBHOOK_SAMPLE = `{
  "id": "evt_abc123XYZ789",
  "type": "payment.paid",
  "created_at": "2026-02-14T12:00:00+00:00",
  "data": {
    "order_id": "ORD-7592-KLA",
    "custom_id": "merchant_ref_9921",
    "amount": 105.50,
    "currency": "USD",
    "status": "Paid",
    "network_transaction_id": "0xabc...def"
  }
}`

export function CheckoutDocs({ apiToken }: { apiToken?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = searchParams.get("tab") || "docs"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

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
      setSimParams(`{}`)
      setRequestTab("body")
    } else if (simType === "express") {
      setSimUrl("https://api.payerone.com/checkout/v1/express_wallet")
      setSimMethod("POST")
      setSimHeaders(`{\n  "Authorization": "Bearer ${token}",\n  "Content-Type": "application/json"\n}`)
      setSimBody(`{\n  "merchant_client_id": "123-456",\n  "merchant_client_email": "user@example.com",\n  "merchant_client_name": "Jane Smith",\n  "ipn_url": "https://your-api.com/webhooks/payerone",\n  "success_url": "https://your-site.com/wallet/success",\n  "fail_url": "https://your-site.com/wallet/fail",\n  "amount": 50.00\n}`)
      setSimParams(`{}`)
      setRequestTab("body")
    } else if (simType === "order-details") {
      setSimUrl("https://api.payerone.com/checkout/v1/orders")
      setSimMethod("GET")
      setSimHeaders(`{\n  "Authorization": "Bearer ${token}",\n  "Accept": "application/json"\n}`)
      setSimBody(`{}`)
      setSimParams(`{\n  "order_id": "ORD-9921"\n}`)
      setRequestTab("params")
    }
  }, [simType, apiToken])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const runSimulation = async () => {
    const currentCooldown = cooldowns[simType] || 0
    if (currentCooldown > 0) {
      toast.error(`Please wait ${currentCooldown} seconds before calling this endpoint again.`)
      return
    }

    setIsSimulating(true)
    setSimResponse(null)
    try {
      const headers = JSON.parse(simHeaders)

      // Check if API key is still placeholder
      if (headers.Authorization?.includes("YOUR_API_KEY")) {
         toast.error("Please replace YOUR_API_KEY with your actual API key")
         setIsSimulating(false)
         return
      }

      const url = getFullUrl();
      const body = simMethod === "GET" ? undefined : simBody;

      const response = await fetch(url, {
        method: simMethod,
        headers: headers,
        body: body
      })

      const data = await response.json()

      // Apply 60-second cooldown for the specific endpoint ONLY if status is success
      if (data && data.status === "success") {
        const cooldownSeconds = 60
        setCooldowns(prev => ({
          ...prev,
          [simType]: cooldownSeconds
        }))
        localStorage.setItem(`payerone_sim_cooldown_${simType}`, (Date.now() + cooldownSeconds * 1000).toString())
      }

      setSimResponse({
        status: response.status,
        statusText: response.statusText,
        data: data
      })
    } catch (error: any) {
      setSimResponse({
        status: "Error",
        message: error.message || "Failed to call API. This might be due to CORS if calling directly from browser. In production, use your backend or PayerOne's proxy."
      })
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checkout Integration</h1>
          <p className="text-sm text-muted-foreground">Comprehensive documentation for PayerOne Checkout API.</p>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
          <TabsList>
            <TabsTrigger value="docs" className="gap-2">
              <Code2 className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2">
              <Terminal className="h-4 w-4" />
              API Simulator
            </TabsTrigger>
            <TabsTrigger value="webhooks-docs" className="gap-2" asChild>
              <Link href="/developer/webhooks/docs">
                <WebhookIcon className="h-4 w-4" />
                Webhooks
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "docs" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-10">
            {/* 1. Authentication */}
            <section id="authentication" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">1. Authentication</h2>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    All API requests must be authenticated using a Bearer Token in the <code className="bg-muted px-1 rounded font-mono">Authorization</code> header.
                  </p>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 text-muted-foreground"
                      onClick={() => copyToClipboard(AUTH_SNIPPET)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                      {AUTH_SNIPPET}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 2. Standard Checkout */}
            <section id="standard-checkout" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">2. Standard Checkout</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Create an order on your server, redirect the customer to PayerOne to pay, and receive a webhook notification when complete.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">POST</Badge>
                  <code className="text-sm font-mono font-bold">/checkout/v1/orders_v2</code>
                </div>

                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm">Request Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Parameter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Req.</TableHead>
                          <TableHead className="pr-6">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { p: "amount", t: "float", r: "Yes", d: "Amount to charge (e.g., 10.50). Min: 0.50 USD." },
                          { p: "currency_code", t: "enum", r: "Yes", d: "USD, EUR, GBP, USDT." },
                          { p: "customer_name", t: "string", r: "Yes", d: "Full name of the customer." },
                          { p: "customer_email", t: "email", r: "Yes", d: "Email address of the customer." },
                          { p: "ipn_url", t: "url", r: "Yes", d: "HTTPS URL for webhook notifications." },
                        ].map((row) => (
                          <TableRow key={row.p}>
                            <TableCell className="pl-6 font-mono text-xs">{row.p}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{row.t}</TableCell>
                            <TableCell className="text-xs">{row.r === "Yes" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : "No"}</TableCell>
                            <TableCell className="pr-6 text-xs text-muted-foreground">{row.d}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Tabs defaultValue="php">
                  <TabsList>
                    <TabsTrigger value="php">PHP (cURL)</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="go">Go</TabsTrigger>
                  </TabsList>
                  <TabsContent value="php" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(STANDARD_CHECKOUT_PHP)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {STANDARD_CHECKOUT_PHP}
                    </pre>
                  </TabsContent>
                  <TabsContent value="python" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(STANDARD_CHECKOUT_PYTHON)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {STANDARD_CHECKOUT_PYTHON}
                    </pre>
                  </TabsContent>
                  <TabsContent value="go" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(STANDARD_CHECKOUT_GO)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {STANDARD_CHECKOUT_GO}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* 3. Express Wallet Checkout */}
            <section id="express-wallet" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">3. Express Wallet Checkout</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate permanent or semi-permanent deposit addresses for your users. Ideal for funding user balances.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">POST</Badge>
                  <code className="text-sm font-mono font-bold">/checkout/v1/express_wallet</code>
                </div>

                <Tabs defaultValue="php">
                  <TabsList>
                    <TabsTrigger value="php">PHP (cURL)</TabsTrigger>
                    <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="php" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(EXPRESS_WALLET_PHP)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {EXPRESS_WALLET_PHP}
                    </pre>
                  </TabsContent>
                  <TabsContent value="nodejs" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(EXPRESS_WALLET_NODE)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {EXPRESS_WALLET_NODE}
                    </pre>
                  </TabsContent>
                  <TabsContent value="python" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(EXPRESS_WALLET_PYTHON)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {EXPRESS_WALLET_PYTHON}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* 4. Order Details */}
            <section id="order-details" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <SearchIcon className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">4. Order Details</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Retrieve details and status for a specific order using its order ID.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">GET</Badge>
                  <code className="text-sm font-mono font-bold">/checkout/v1/orders?order_id={"{order_id}"}</code>
                </div>

                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm">Query Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Parameter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Req.</TableHead>
                          <TableHead className="pr-6">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="pl-6 font-mono text-xs">order_id</TableCell>
                          <TableCell className="text-xs text-muted-foreground">string</TableCell>
                          <TableCell className="text-xs"><CheckCircle2 className="h-3 w-3 text-green-500" /></TableCell>
                          <TableCell className="pr-6 text-xs text-muted-foreground">The unique ID of the order.</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Tabs defaultValue="php">
                  <TabsList>
                    <TabsTrigger value="php">PHP (cURL)</TabsTrigger>
                    <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="php" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(ORDER_DETAILS_PHP)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {ORDER_DETAILS_PHP}
                    </pre>
                  </TabsContent>
                  <TabsContent value="nodejs" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(ORDER_DETAILS_NODE)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {ORDER_DETAILS_NODE}
                    </pre>
                  </TabsContent>
                  <TabsContent value="python" className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(ORDER_DETAILS_PYTHON)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {ORDER_DETAILS_PYTHON}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* 5. Webhooks (IPN) */}
            <section id="webhooks" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">5. Webhooks (IPN)</h2>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Event Types</h4>
                    <Table>
                      <TableBody>
                        {[
                          { e: "payment.paid", d: "Standard Order (V2) fully paid." },
                          { e: "express_wallet.paid", d: "Express Wallet payment received." },
                          { e: "payment.partially_paid", d: "Partial payment received." },
                          { e: "order.expired", d: "Payment window expired." },
                        ].map((row) => (
                          <TableRow key={row.e}>
                            <TableCell className="font-mono text-xs w-1/3"><Badge variant="secondary">{row.e}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{row.d}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Example Payload</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono border">
                      {WEBHOOK_SAMPLE}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 6. Signature Verification */}
            <section id="signature-verification" className="space-y-4 scroll-mt-20">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">6. Signature Verification</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Verify the <code className="bg-muted px-1 rounded font-mono">X-PayerOne-Signature</code> using your <strong>Private Key</strong>.
              </p>

              <Tabs defaultValue="php">
                <TabsList>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="go">Go</TabsTrigger>
                </TabsList>
                {Object.entries({
                  php: SIGNATURE_PHP,
                  nodejs: SIGNATURE_NODE,
                  python: SIGNATURE_PYTHON,
                  go: SIGNATURE_GO
                }).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang} className="relative mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 h-8 w-8 text-slate-400"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                      {code}
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">On this page</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="flex flex-col gap-2">
                    {[
                      { id: "authentication", label: "1. Authentication" },
                      { id: "standard-checkout", label: "2. Standard Checkout" },
                      { id: "express-wallet", label: "3. Express Wallet" },
                      { id: "order-details", label: "4. Order Details" },
                      { id: "webhooks", label: "5. Webhooks (IPN)" },
                      { id: "signature-verification", label: "6. Signature Verification" },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                      >
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Base API URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-[10px] font-mono break-all text-primary">https://api.payerone.com/</code>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* API Simulator Tab */
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/5 pb-4 px-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        API Explorer
                      </CardTitle>
                      <CardDescription className="text-xs">Test our endpoints with live data.</CardDescription>
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
                    <div className="px-6 border-b bg-muted/5" style={{marginBottom:"-7px"}} >
                      <TabsList variant="line" className="h-10 gap-4">
                        <TabsTrigger value="params" className="text-xs font-semibold px-2">PARAMS</TabsTrigger>
                        <TabsTrigger value="body" className="text-xs font-semibold px-2">BODY</TabsTrigger>
                        <TabsTrigger value="headers" className="text-xs font-semibold px-2">HEADERS</TabsTrigger>
                        <TabsTrigger value="curl" className="text-xs font-semibold px-2">CURL PREVIEW</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="params" className="m-0" style={{marginBottom:"-15px"}} >
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

                    <TabsContent value="body" className="m-0" style={{marginBottom:"-15px"}}>
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

                    <TabsContent value="headers" className="m-0" style={{marginBottom:"-15px"}}>
                      <div className="p-0">
                        <Textarea
                          className="font-mono text-xs h-[350px] rounded-none border-0 focus-visible:ring-0 bg-transparent p-6"
                          value={simHeaders}
                          onChange={(e) => setSimHeaders(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="curl" className="m-0" style={{marginBottom:"-15px"}}>
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
                <CardContent className="flex-1 overflow-auto bg-[#0d1117] p-0 min-h-[400px] border-t relative" style={{marginBottom:"-15px", marginTop:"-18px"}}>
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
      )}
    </div>
  )
}
