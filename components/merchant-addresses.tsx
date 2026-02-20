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
import { Wallet, ShieldCheck, Copy, Check, Plus, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { SafeImage } from "@/components/safe-image"
import { NETWORK_METADATA, NetworkKey, NetworkMetadata } from "@/lib/networks"
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
import { MerchantAddress, VirtualAddress } from "@/types/merchant"
import { MerchantAddressDialog } from "./merchant-address-dialog"
import { VirtualAddressesDataTable } from "./virtual-addresses-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MerchantAddresses({
  initialData = [],
  virtualAddresses = [],
  virtualPageCount = 0,
  networkMetadata = NETWORK_METADATA
}: {
  initialData?: MerchantAddress[],
  virtualAddresses?: VirtualAddress[],
  virtualPageCount?: number,
  networkMetadata?: Record<string, NetworkMetadata>
}) {
  const [copiedUuid, setCopiedUuid] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingAddress, setEditingAddress] = React.useState<MerchantAddress | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const addresses = initialData
  const availableTypes = Array.from(new Set(Object.values(networkMetadata).map(n => n.type)))

  const activeTab = searchParams.get("tab") || "receiving-address"

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  
  const tronAddressesCount = addresses.filter(a => a.type === 'tron').length
  const otherTypesAdded = availableTypes
    .filter(t => t !== 'tron')
    .every(t => addresses.some(a => a.type === t))
  
  const allTypesAdded = otherTypesAdded && tronAddressesCount >= 10

  const handleAdd = () => {
    setEditingAddress(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (addr: MerchantAddress) => {
    setEditingAddress(addr)
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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'evm':
        return <SafeImage src="/logos/ethereum.svg" alt="EVM" width={16} height={16} className="h-4 w-4" />
      case 'solana':
        return <SafeImage src="/logos/solana.svg" alt="Solana" width={16} height={16} className="h-4 w-4" />
      case 'tron':
        return <SafeImage src="/logos/tron_mono.svg" alt="Tron" width={16} height={16} className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="receiving-address">Receiving Address</TabsTrigger>
            <TabsTrigger value="virtual-address">My Virtual Address</TabsTrigger>
          </TabsList>

          <TabsContent value="receiving-address" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle>Receiving Address</CardTitle>
                  <CardDescription>
                    Manage the addresses where you receive customer payments.
                  </CardDescription>
                </div>
                {addresses.length > 0 && (
                  <CardAction>
                    <Button size="sm" className="gap-2" onClick={handleAdd} disabled={allTypesAdded}>
                      <Plus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                    <Empty className="min-h-[350px]">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Wallet className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No Receiving Address Registered</EmptyTitle>
                        <EmptyDescription>
                          Add your first receiving address to start accepting payments directly to your wallet.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button className="gap-2" onClick={handleAdd}>
                          <Plus className="h-4 w-4" />
                          Add Address
                        </Button>
                      </EmptyContent>
                    </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[70px]">Type</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Networks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addresses.map((addr) => (
                        <TableRow key={addr.uuid}>
                          <TableCell className="w-[70px]">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(addr.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 font-mono text-xs">
                              {addr.address.substring(0, 6)}...{addr.address.substring(addr.address.length - 4)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(addr.address, addr.uuid)}
                              >
                                {copiedUuid === addr.uuid ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(addr.networks).map((net) => (
                                <Tooltip key={net}>
                                  <TooltipTrigger asChild>
                                    <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border bg-background p-0.5">
                                      <SafeImage
                                        src={`/logos/${net}.svg`}
                                        alt={net}
                                        fill
                                        className="object-contain"
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
                          <TableCell>
                            <Badge variant={addr.is_active ? "success" : "secondary"}>
                              {addr.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleEdit(addr)}
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
          </TabsContent>

          <TabsContent value="virtual-address" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <div className="space-y-1">
                  <CardTitle>My Virtual Address</CardTitle>
                  <CardDescription>
                    Manage your virtual addresses for secure and private transactions.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <VirtualAddressesDataTable 
                  data={virtualAddresses} 
                  pageCount={virtualPageCount} 
                  networkMetadata={networkMetadata}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <CardTitle>Secure Payments</CardTitle>
            </div>
            <CardDescription>
              All payments are processed directly to your wallet addresses. We do not hold your funds.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground pb-6">
            <p>
              Enter the wallet address that will be used to receive payments from your customers.
              Each payment is transferred immediately at the time an order is completed, ensuring real-time settlement without delays or holding periods.
            </p>
            <p>
              PayerOne operates on a strictly non-custodial model. We do not require access to your private keys, seed phrases, or wallet credentials at any time. Your wallet remains fully under your control, and all transactions are authorized and secured directly by the blockchain network.
            </p>
            <p>
              PayerOne never stores, holds, or controls your funds. Payments are sent directly from the customer to your designated wallet using secure, on-chain transactions, ensuring transparency, security, and full ownership of your assets.
            </p>
          </CardContent>
        </Card>
      </div>

      <MerchantAddressDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingAddress}
        existingTypes={addresses.map(a => a.type)}
      />
    </TooltipProvider>
  )
}
