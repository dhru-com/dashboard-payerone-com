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
import Link from "next/link"
import { CheckCircle2, Shield, Zap, Info, Lock, Key, Clock, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

const SAMPLE_PAYLOAD = `{
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

const VERIFICATION_SNIPPETS = {
  nodejs: `const crypto = require('crypto');

// Use your Private Key from API Keys section
const secret = 'your_private_key'; 
const signature = request.headers['x-payerone-signature'];
const payload = JSON.stringify(request.body);

const hmac = crypto.createHmac('sha256', secret);
const digest = Buffer.from(hmac.update(payload).digest('hex'), 'utf8');
const signatureBuffer = Buffer.from(signature, 'utf8');

if (crypto.timingSafeEqual(digest, signatureBuffer)) {
  console.log('Verified!');
} else {
  console.log('Invalid signature');
}`,
  python: `import hmac
import hashlib

# Use your Private Key from API Keys section
secret = 'your_private_key'
signature = request.headers.get('X-PayerOne-Signature')
payload = request.data # Raw request body

digest = hmac.new(
    secret.encode('utf-8'),
    payload,
    hashlib.sha256
).hexdigest()

if hmac.compare_digest(digest, signature):
    print("Verified!")
else:
    print("Invalid signature")`,
  php: `// Use your Private Key from API Keys section
$secret = 'your_private_key';
$signature = $_SERVER['HTTP_X_PAYERONE_SIGNATURE'];
$payload = file_get_contents('php://input');

$digest = hash_hmac('sha256', $payload, $secret);

if (hash_equals($digest, $signature)) {
    echo "Verified!";
} else {
    echo "Invalid signature";
}`
}

const EVENT_TYPES = [
  {
    event: "payment.paid",
    description: "Successfully received full payment for V2 Orders.",
  },
  {
    event: "express_wallet.paid",
    description: "Successfully received payment for Express Wallets.",
  },
  {
    event: "payment.partially_paid",
    description: "Received payment less than the expected amount.",
  },
  {
    event: "payment.failed",
    description: "A payment transaction failed to verify or was rejected by the gateway.",
  },
  {
    event: "order.expired",
    description: "The order was canceled because the payment timeout was reached.",
  }
]

const RESPONSE_CODES = [
  {
    code: "2xx",
    meaning: "Success",
    action: "PayerOne marks the event as delivered and stops retrying."
  },
  {
    code: "4xx",
    meaning: "Client Error",
    action: "PayerOne will retry delivery up to 3 times every 60 seconds."
  },
  {
    code: "5xx",
    meaning: "Server Error",
    action: "PayerOne will retry delivery up to 3 times every 60 seconds."
  },
  {
    code: "Timeout",
    meaning: "Request timed out (> 10s)",
    action: "PayerOne marks it as a failure and retries delivery up to 3 times."
  }
]

export function WebhookDocs() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section id="getting-started" className="space-y-4 scroll-mt-20">
            <h2 className="text-xl font-bold tracking-tight">Getting Started</h2>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Set up an endpoint</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a POST endpoint on your server that can receive JSON payloads. Ensure it is accessible from the public internet.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Verify the signature</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify the <code className="bg-muted px-1 rounded text-primary font-mono">X-PayerOne-Signature</code> header using your <Link href="/developer/api-keys" className="text-primary hover:underline inline-flex items-center gap-1 font-medium">Private Key <ExternalLink className="h-3 w-3" /></Link> to ensure the request came from us.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Respond with 2xx</h4>
                    <p className="text-sm text-muted-foreground">
                      Your server should return a 200 or 204 status code quickly to acknowledge receipt.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="signature-verification" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Signature Verification</h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  To ensure that webhooks were sent by PayerOne and not by a third party, you should verify the HMAC signature included in each request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    PayerOne signs each webhook request using an HMAC SHA-256 signature and includes it in the <code className="bg-muted px-1 rounded font-mono">X-PayerOne-Signature</code> header.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Key className="h-3 w-3" /> How it works
                    </h4>
                    <ul className="text-sm space-y-2 list-disc pl-4 text-muted-foreground">
                      <li>Generate an HMAC SHA-256 hash using your <Link href="/developer/api-keys" className="text-foreground font-medium hover:underline inline-flex items-center gap-1">Private Key <ExternalLink className="h-3 w-3" /></Link> (found in API Keys) and the <span className="text-foreground font-medium">raw JSON request body</span>.</li>
                      <li>Compare the generated hash with the signature in the header.</li>
                      <li>Use <span className="text-foreground font-medium">constant-time string comparison</span> to prevent timing attacks.</li>
                    </ul>
                  </div>
                </div>

                <Tabs defaultValue="nodejs" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="php">PHP</TabsTrigger>
                    </TabsList>
                  </div>
                  {Object.entries(VERIFICATION_SNIPPETS).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang} className="relative mt-0">
                      <div className="absolute right-4 top-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="bg-slate-950 text-slate-50 p-6 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                        {code}
                      </pre>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </section>

          <section id="event-types" className="space-y-4 scroll-mt-20">
            <h2 className="text-xl font-bold tracking-tight">Event Types</h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6">Event Name</TableHead>
                      <TableHead className="pr-6">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {EVENT_TYPES.map((item) => (
                      <TableRow key={item.event}>
                        <TableCell className="pl-6 font-mono text-xs py-4">
                          <Badge variant="secondary" className="font-mono">{item.event}</Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-sm text-muted-foreground py-4">{item.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section id="retry-policy" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Retry Policy</h2>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  If your server does not respond with a 2xx status code, PayerOne will attempt to redeliver the webhook event up to 3 times every 60 seconds.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Retry Schedule</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                      <li>1st retry: 60 seconds after failure</li>
                      <li>2nd retry: 60 seconds after 1st retry</li>
                      <li>3rd retry: 60 seconds after 2nd retry</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Manual Retries</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You can also manually trigger a test webhook from the dashboard to verify your endpoint is back online and correctly handling requests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="handling-responses" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Handling Responses</h2>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6">Response Code</TableHead>
                      <TableHead>Meaning</TableHead>
                      <TableHead className="pr-6">System Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RESPONSE_CODES.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell className="pl-6 font-mono text-xs py-4">{item.code}</TableCell>
                        <TableCell className="text-sm py-4">{item.meaning}</TableCell>
                        <TableCell className="pr-6 text-sm text-muted-foreground py-4">{item.action}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section id="sample-payload" className="space-y-4 scroll-mt-20">
            <h2 className="text-xl font-bold tracking-tight">Sample Payload</h2>
            <Card>
              <CardHeader className="pb-0">
                <CardDescription>All webhook requests send a POST request with a JSON body.</CardDescription>
              </CardHeader>
              <CardContent className="relative pt-4">
                <div className="absolute right-8 top-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(SAMPLE_PAYLOAD)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="bg-muted p-6 rounded-lg overflow-x-auto text-xs font-mono border">
                  {SAMPLE_PAYLOAD}
                </pre>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">On this page</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col gap-2">
                {[
                  { id: "getting-started", label: "Getting Started" },
                  { id: "signature-verification", label: "Signature Verification" },
                  { id: "event-types", label: "Event Types" },
                  { id: "retry-policy", label: "Retry Policy" },
                  { id: "handling-responses", label: "Handling Responses" },
                  { id: "sample-payload", label: "Sample Payload" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h3 className="font-bold">Request Headers</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1 border-b pb-2">
                    <span className="text-xs font-mono font-bold">Content-Type</span>
                    <span className="text-xs text-muted-foreground">application/json</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b pb-2">
                    <span className="text-xs font-mono font-bold">User-Agent</span>
                    <span className="text-xs text-muted-foreground">PayerOne-Webhook/1.0</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-bold text-primary">X-PayerOne-Signature</span>
                    <span className="text-xs text-muted-foreground">The HMAC SHA-256 signature of the payload.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold">Best Practices</h3>
            <div className="space-y-4">
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10">
                <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Handle Asynchronously</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
                    Respond with 2xx immediately and process the business logic in the background to avoid timeouts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 bg-orange-50/30 dark:bg-orange-900/10">
                <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Idempotency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-orange-700/80 dark:text-orange-300/80">
                    Always check the event ID before processing to handle potential duplicate deliveries gracefully.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-900/10">
                <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Secure Endpoint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-green-700/80 dark:text-green-300/80">
                    Always use HTTPS for your webhook endpoint to ensure data is encrypted in transit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
