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
import { Plus, Settings2, HelpCircle, Server, ShieldCheck, Zap, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/safe-image"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GatewayInventoryItem, GatewayUsage, PaymentGatewayV2Metadata } from "@/types/payment-gateway-v2"
import { GatewayDialogV2 } from "./gateway-dialog-v2"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface GatewayInventoryProps {
  inventory: Record<string, GatewayInventoryItem>
  usage: Record<string, GatewayUsage>
  metadata?: PaymentGatewayV2Metadata
}

export function GatewayInventory({ inventory, usage, metadata }: GatewayInventoryProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<GatewayInventoryItem | null>(null)
  const inventoryList = React.useMemo(() => Object.entries(inventory).map(([uuid, item]) => ({
    ...item,
    uuid: item.uuid || uuid
  })), [inventory])

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: GatewayInventoryItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>
            Direct API connections to payment providers.
          </CardDescription>
        </div>
        <CardAction>
          <Button size="sm" className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Gateway
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {inventoryList.length === 0 ? (
          <Empty className="min-h-[350px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Server className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No Gateways Found</EmptyTitle>
              <EmptyDescription>
                Add your first technical connection to start processing.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add Gateway
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gateway</TableHead>
                <TableHead>Routing</TableHead>
                <TableHead>Daily Usage</TableHead>
                <TableHead>Monthly Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryList.map((item, index) => {
                const itemUsage = usage[item.uuid] || {
                  daily_order_count: 0,
                  daily_total_amount: 0,
                  monthly_order_count: 0,
                  monthly_total_amount: 0,
                }

                return (
                  <TableRow key={item.uuid || index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50 p-1">
                          <SafeImage
                            src={`/logos/${item.type}.svg`}
                            alt={item.type}
                            fill
                            className="object-contain"
                            fallbackIcon={<HelpCircle className="h-4 w-4 text-muted-foreground" />}
                          />
                        </div>
                        <span className="font-medium">
                          {metadata?.inventory_config[item.type]?.name || item.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-1">
                          {item.is_standalone && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-black uppercase bg-primary/5 text-primary border-primary/20">
                              Standalone
                            </Badge>
                          )}
                          {item.used_in_routers && item.used_in_routers.length > 0 ? (
                            item.used_in_routers.map((router) => (
                              <Badge key={router.id} variant="secondary" className="h-5 px-1.5 text-[9px] font-medium">
                                {router.label}
                              </Badge>
                            ))
                          ) : !item.is_standalone && (
                            <span className="text-[10px] text-muted-foreground italic">Not used in any router</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${itemUsage.daily_total_amount.toLocaleString()}</span>
                          {item.limits?.daily_amount_limit !== undefined && item.limits.daily_amount_limit > 0 && (
                            <span className="text-[10px] text-muted-foreground">/ ${item.limits.daily_amount_limit.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>{itemUsage.daily_order_count} orders</span>
                          {item.limits?.daily_order_limit !== undefined && item.limits.daily_order_limit > 0 && (
                            <span className="text-[10px]">/ {item.limits.daily_order_limit}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${itemUsage.monthly_total_amount.toLocaleString()}</span>
                          {item.limits?.monthly_amount_limit !== undefined && item.limits.monthly_amount_limit > 0 && (
                            <span className="text-[10px] text-muted-foreground">/ ${item.limits.monthly_amount_limit.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="text-muted-foreground">{itemUsage.monthly_order_count} orders</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'active' || item.status === 'enabled' ? "success" : "secondary"} className="gap-1.5 capitalize">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 h-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      </Card>

      <GatewayDialogV2
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        metadata={metadata}
        initialData={editingItem}
      />

      {/* Educational Section: Understanding Payment Gateways */}
      <Card className="border-primary/10 bg-primary/[0.02] overflow-hidden mt-4">
        <CardHeader className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold">Unified Payment Orchestration</CardTitle>
              <CardDescription className="text-[11px] text-primary/70 font-medium">
                Direct, non-custodial gateway aggregation for global scale.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0 px-5 pb-6">
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            <p>
              PayerOne provides a <strong className="text-foreground">Unified Payment Gateway Aggregation Layer</strong> that allows merchants to connect their own payment gateways using existing credentials and authorizations. Developers integrate only once with PayerOne, removing the need to build and maintain multiple global or regional gateway integrations.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border text-[13px] text-foreground font-medium italic">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span>PayerOne standardizes all gateway interactions into a single, consistent API and webhook model.</span>
            </div>
          </div>

          <Separator className="bg-primary/10" />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Global Connectivity
              </h4>
              <p className="text-[12px] leading-relaxed">
                Connect your Stripe, Binance Pay, or other local providers. PayerOne acts as the orchestration layer, while payments are settled directly into your own accounts.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Non-Custodial Integrity
              </h4>
              <p className="text-[12px] leading-relaxed">
                PayerOne never holds, stores, or controls your funds. All transactions are processed and settled directly through your own gateway accounts, ensuring maximum security and regulatory clarity.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[12px] text-primary/90 font-medium leading-relaxed">
              The core design principle of PayerOne is security and financial ownership. By acting purely as an aggregator, we ensure merchants retain full control of their funds and direct relationships with their payment providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
