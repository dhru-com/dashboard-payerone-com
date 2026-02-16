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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle2,
  Lock,
  Copy,
  ShoppingCart,
  Wallet,
  WebhookIcon,
  Shield,
  ChevronRight,
  Info
} from "lucide-react"
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

const STANDARD_CHECKOUT_NODE = `const axios = require('axios');

async function createOrder() {
  const url = 'https://api.payerone.com/checkout/v1/orders_v2';
  const apiKey = 'YOUR_API_KEY';

  const data = {
    amount: 105.50,
    currency_code: 'USD',
    description: 'Premium Subscription - 1 Year',
    customer_name: 'John Doe',
    customer_email: 'john.doe@example.com',
    custom_id: 'ORD-9921',
    ipn_url: 'https://your-api.com/webhooks/payerone',
    success_url: 'https://your-site.com/payment/success',
    fail_url: 'https://your-site.com/payment/failed'
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      console.log('Redirect URL:', response.data.data.order_url);
    }
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

createOrder();`

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
    print(f"Redirect URL: {result['data']['order_url']}")
else:
    print(f"Error: {result.get('message')}")`

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
    // List of crypto addresses for networks
    print_r($result['data']['networks']);
    // Or redirect to PayerOne hosted wallet page
    echo "Checkout URL: " . $result['data']['order_url'];
}
?>`

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
    // Signature is valid
    console.log('Event received:', req.body);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});`

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.success("Copied to clipboard")
}

export function ApiDocs() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-12">
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
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                <TabsTrigger value="php" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">PHP (cURL)</TabsTrigger>
                <TabsTrigger value="node" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">Node.js</TabsTrigger>
                <TabsTrigger value="python" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">Python</TabsTrigger>
              </TabsList>
              {[
                { lang: "php", code: STANDARD_CHECKOUT_PHP },
                { lang: "node", code: STANDARD_CHECKOUT_NODE },
                { lang: "python", code: STANDARD_CHECKOUT_PYTHON }
              ].map(({ lang, code }) => (
                <TabsContent key={lang} value={lang} className="relative group m-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        </section>

        {/* 3. Express Wallet */}
        <section id="express-wallet" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">3. Express Wallet</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Allow customers to pay instantly using their PayerOne wallet balance or by generating one-time deposit addresses.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">POST</Badge>
              <code className="text-sm font-mono font-bold">/checkout/v1/express_wallet</code>
            </div>

            <Tabs defaultValue="php">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                <TabsTrigger value="php" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">PHP</TabsTrigger>
                <TabsTrigger value="python" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">Python</TabsTrigger>
              </TabsList>
              {[
                { lang: "php", code: EXPRESS_WALLET_PHP },
                { lang: "python", code: EXPRESS_WALLET_PYTHON }
              ].map(({ lang, code }) => (
                <TabsContent key={lang} value={lang} className="relative group m-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        </section>

        {/* 4. Order Details */}
        <section id="order-details" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">4. Order Details</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Retrieve detailed information about a specific order using its <code className="bg-muted px-1 rounded">order_id</code>.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">GET</Badge>
              <code className="text-sm font-mono font-bold">/checkout/v1/orders?order_id=ORD-9921</code>
            </div>

            <Tabs defaultValue="php">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                <TabsTrigger value="php" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">PHP</TabsTrigger>
                <TabsTrigger value="node" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">Node.js</TabsTrigger>
                <TabsTrigger value="python" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">Python</TabsTrigger>
              </TabsList>
              {[
                { lang: "php", code: ORDER_DETAILS_PHP },
                { lang: "node", code: ORDER_DETAILS_NODE },
                { lang: "python", code: ORDER_DETAILS_PYTHON }
              ].map(({ lang, code }) => (
                <TabsContent key={lang} value={lang} className="relative group m-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        </section>

        {/* 5. Webhooks */}
        <section id="webhooks" className="space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2">
            <WebhookIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">5. Webhooks (IPN)</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                PayerOne sends HTTP POST requests to your <code className="bg-muted px-1 rounded">ipn_url</code> when an order status changes. You should always return a <code className="font-bold">200 OK</code> response.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Standard Statuses</h4>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                    <li><span className="font-semibold text-foreground">success</span>: Payment received</li>
                    <li><span className="font-semibold text-foreground">failed</span>: Payment rejected or cancelled</li>
                    <li><span className="font-semibold text-foreground">processing</span>: Payment in progress</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">Retry Logic</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If your server returns anything other than 200, we retry up to 5 times over 24 hours.
                  </p>
                </div>
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            To ensure webhooks are genuine, verify the <code className="bg-muted px-1 rounded">X-PayerOne-Signature</code> header using your Merchant Private Key.
          </p>

          <Tabs defaultValue="php">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
              <TabsTrigger value="php" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">PHP</TabsTrigger>
              <TabsTrigger value="node" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs font-semibold">Node.js</TabsTrigger>
            </TabsList>
            {[
              { lang: "php", code: SIGNATURE_PHP },
              { lang: "node", code: SIGNATURE_NODE }
            ].map(({ lang, code }) => (
              <TabsContent key={lang} value={lang} className="relative group m-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Sidebar Navigation */}
      <div className="hidden lg:block">
        <div className="sticky top-20 space-y-6">
          <Card>
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">On this page</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
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
  )
}
