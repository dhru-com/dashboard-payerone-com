"use client"

import * as React from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, Check, Plus, ShieldCheck, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Image from "next/image"
import { NETWORK_METADATA, NetworkMetadata } from "@/lib/networks"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ForwardingAddress } from "@/types/forwarding-address"
import { ExpressWalletDialog } from "./express-wallet-dialog"

export function ExpressWallets({
  initialData = [],
  networkMetadata = NETWORK_METADATA
}: {
  initialData?: ForwardingAddress[],
  networkMetadata?: Record<string, NetworkMetadata>
}) {
  const [copiedUuid, setCopiedUuid] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingWallet, setEditingWallet] = React.useState<ForwardingAddress | null>(null)
  const wallets = initialData

  const allowedTypes = ['evm', 'solana']
  const existingTypes = wallets.map(w => {
    if (w.network.length === 0) return ""
    const firstNet = w.network[0]
    return networkMetadata[firstNet]?.type || ""
  }).filter(Boolean)

  const allTypesAdded = allowedTypes.every(type => existingTypes.includes(type))

  const handleAdd = () => {
    setEditingWallet(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (wallet: ForwardingAddress) => {
    setEditingWallet(wallet)
    setIsDialogOpen(true)
  }

  const getNetworkName = (net: string) => {
    return networkMetadata[net]?.name || net
  }

  const copyToClipboard = (text: string, uuid: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUuid(uuid)
    toast.success("Address copied to clipboard")
    setTimeout(() => setCopiedUuid(null), 2000)
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle>Express Wallet</CardTitle>
              <CardDescription>
                Manage your express settlement wallets.
              </CardDescription>
            </div>
            {wallets.length > 0 && (
              <CardAction>
                <Button size="sm" className="gap-2" onClick={handleAdd} disabled={allTypesAdded}>
                  <Plus className="h-4 w-4" />
                  Add Wallet
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
                <Empty className="min-h-[350px]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Wallet className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No Express Wallet Registered</EmptyTitle>
                    <EmptyDescription>
                      Add your first express wallet to enable fast settlement to your preferred address.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button className="gap-2" onClick={handleAdd}>
                      <Plus className="h-4 w-4" />
                      Add Wallet
                    </Button>
                  </EmptyContent>
                </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Networks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.uuid}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 8)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(wallet.address, wallet.uuid)}
                          >
                            {copiedUuid === wallet.uuid ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {wallet.network.map((net) => (
                            <Tooltip key={net}>
                              <TooltipTrigger asChild>
                                <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border bg-background p-0.5">
                                  <Image
                                    src={`/logos/${net}.svg`}
                                    alt={net}
                                    fill
                                    className="object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {getNetworkName(net)}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleEdit(wallet)}
                        >
                          <Settings2 className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <CardTitle>Express Wallet — Instant Credits, Zero Checkout Friction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground pb-6">
            <p>
              Express Wallet enables fast and seamless fund additions directly on your website using a fully non-custodial, smart contract–based system. Each user is assigned a unique virtual address for sending payments, removing the need for traditional checkout flows or payment forms.
            </p>
            <p>
              These virtual addresses are contract-controlled and purpose-built to securely forward funds only to your configured receiving wallet. At no point does PayerOne hold, custody, or control user funds.
            </p>
            <p>
              When a user sends any supported amount to their assigned virtual address, the entire amount is credited instantly to their account as soon as the transaction is confirmed on the blockchain. There are no fixed amounts, no partial credits, and no checkout redirections.
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="font-medium text-foreground text-base">Key Characteristics</h4>
              <ul className="grid gap-2 px-1">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Non-custodial by design — PayerOne never stores funds or private keys</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Contract-based virtual addresses — funds are forwarded securely and automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Instant crediting — full amount credited on confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>No checkout friction — send funds directly, no forms or approvals</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Secure and transparent — fully on-chain, verifiable transactions</span>
                </li>
              </ul>
            </div>

            <p className="pt-2">
              Express Wallet is built for speed, security, and scale—providing users with a simple “send & credit” experience while ensuring merchants retain full ownership and control of all received funds.
            </p>
          </CardContent>
        </Card>
      </div>

      <ExpressWalletDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingWallet}
        existingTypes={existingTypes}
        networkMetadata={networkMetadata}
      />
    </TooltipProvider>
  )
}
