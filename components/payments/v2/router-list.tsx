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
import { Plus, Settings2, Route, Info, ShieldCheck, Zap, Activity, Globe, Clock, CircleDollarSign, Ban, RefreshCw, ArrowDown10, Scale, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Router, GatewayInventoryItem, PaymentGatewayV2Metadata } from "@/types/payment-gateway-v2"
import { RouterDialogV2 } from "./router-dialog-v2"
import { cn } from "@/lib/utils"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface RouterListProps {
  routers: Record<string, Router>
  inventory: Record<string, GatewayInventoryItem>
  metadata?: PaymentGatewayV2Metadata
  inventoryMetadata?: PaymentGatewayV2Metadata
}

export function RouterList({ routers, inventory, metadata, inventoryMetadata }: RouterListProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<Router | null>(null)
  const [isInfoOpen, setIsInfoOpen] = React.useState(false)
  const routerList = React.useMemo(() => Object.entries(routers).map(([uuid, router]) => ({
    ...router,
    uuid: router.uuid || uuid
  })), [routers])

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (router: Router) => {
    setEditingItem(router)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Routing Policies</CardTitle>
          <CardDescription>
            Create intelligent rules to group gateways and define precisely how and when they appear during checkout.
          </CardDescription>
        </div>
        <CardAction>
          <Button size="sm" className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Policy
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {routerList.length === 0 ? (
          <Empty className="min-h-[350px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Route className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No Routing Policies Defined</EmptyTitle>
              <EmptyDescription>
                Create your first routing policy to define how payments should be processed.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routerList.map((router, index) => (
                <TableRow key={router.uuid || index}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{router.label}</span>
                      <span className="text-xs text-muted-foreground">{router.mask_name}</span>
                      {router.narration && (
                        <div 
                          className="mt-1 text-[10px] text-muted-foreground leading-relaxed italic"
                          dangerouslySetInnerHTML={{ __html: router.narration }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {router.strategy.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {router.members.map((gwUuid) => (
                        <div
                          key={gwUuid}
                          className="h-6 w-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold"
                          title={inventoryMetadata?.inventory_config[inventory[gwUuid]?.type]?.name || inventory[gwUuid]?.type || gwUuid}
                        >
                          {inventory[gwUuid]?.type?.[0]?.toUpperCase() || 'G'}
                        </div>
                      ))}
                      {router.members.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No members</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {router.visibility?.priority ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={router.visibility?.enabled ? "success" : "secondary"} className="gap-1.5">
                      {router.visibility?.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-8"
                      onClick={() => handleEdit(router)}
                    >
                      <Settings2 className="h-3.5 w-3.5" />
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

      {/* Educational Section: Understanding Payment Routers */}
      <Collapsible
        open={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        className="w-full"
      >
        <Card className={cn(
          "border-primary/10 bg-primary/[0.02] overflow-hidden transition-all duration-300",
          !isInfoOpen && "hover:bg-primary/[0.04]"
        )}>
          <CollapsibleTrigger asChild>
            <CardHeader className="py-4 px-5 cursor-pointer select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold">Understanding Payment Routers</CardTitle>
                    {!isInfoOpen && (
                      <CardDescription className="text-[11px] text-primary/70 font-medium">
                        The intelligent &quot;Logic Layer&quot; for your payment ecosystem.
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="h-7 w-7 rounded-full flex items-center justify-center bg-background border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  {isInfoOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent className="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
            <CardContent className="space-y-6 pt-0 px-5 pb-6">
              {isInfoOpen && (
                <div className="space-y-1 mb-4">
                  <CardDescription className="text-[11px] text-primary/70 font-medium">
                    The intelligent &quot;Logic Layer&quot; for your payment ecosystem.
                  </CardDescription>
                </div>
              )}
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            <p>
              A <strong className="text-foreground">Payment Router</strong> is an intelligent traffic controller for your payments.
              Instead of showing a simple, fixed list of payment accounts to every customer, a Router decides
              <strong className="text-primary italic"> which</strong> account to show,
              <strong className="text-primary italic"> when</strong> to show it, and
              <strong className="text-primary italic"> to whom</strong> it should be visible based on your specific business rules.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border text-[13px] text-foreground font-medium italic">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span>Think of <strong>Inventory</strong> as your technical connections (API keys) and <strong>Routers</strong> as the business rules that manage them.</span>
            </div>
          </div>

          <Separator className="bg-primary/10" />

          {/* Step-by-Step Process */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h3 className="text-base font-bold text-foreground">1. How Routers Work (The 3-Step Process)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="space-y-3 p-4 rounded-xl border bg-background hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shadow-inner">1</div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Visibility Check</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The &quot;Gatekeeper&quot; checks if the router applies to the order based on targeting and status.
                </p>
                <ul className="space-y-2 text-[11px]">
                  <li className="flex items-start gap-2">
                    <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong>Targeting</strong>: Allowed countries and supported currencies.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong>Scheduling</strong>: Active days and business hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CircleDollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong>Limits</strong>: Min/Max transaction amount rules.</span>
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="space-y-3 p-4 rounded-xl border bg-background hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shadow-inner">2</div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Quota & Health Check</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The &quot;Failover&quot; layer automatically skips accounts that are not ready for use.
                </p>
                <ul className="space-y-2 text-[11px]">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                    <span><strong>Revenue Caps</strong>: Skips if Daily/Monthly limits are hit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-3.5 w-3.5 text-success shrink-0" />
                    <span><strong>Order Counts</strong>: Skips if transaction frequency is too high.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span><strong>Status</strong>: Bypasses disabled or technical failure accounts.</span>
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="space-y-3 p-4 rounded-xl border bg-background hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shadow-inner">3</div>
                  <h4 className="font-bold text-sm group-hover:text-primary transition-colors">Selection Strategy</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The &quot;Traffic Controller&quot; picks the best healthy member using your preferred logic.
                </p>
                <ul className="space-y-2 text-[11px]">
                  <li className="flex items-start gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong>Round-Robin</strong>: Takes turns equally to balance volume.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowDown10 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong>Priority</strong>: Always uses the &quot;Top&quot; account first.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><strong>Weighted</strong>: Distributes traffic by custom percentages.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="bg-primary/10" />

          {/* Concepts & Terms Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h3 className="text-base font-bold text-foreground">2. Key Concepts & Terms</h3>
            </div>

            <div className="rounded-xl border bg-background overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[200px] text-xs font-bold uppercase tracking-wider py-3">Term</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider py-3">What it means in the UI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-primary/[0.01]">
                    <TableCell className="font-bold text-xs py-4">Mask Name</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground leading-relaxed">
                      A customer-friendly name (e.g. &quot;Pay via Credit Card&quot;) that hides the fact that you might be rotating between multiple accounts behind the scenes.
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/[0.01]">
                    <TableCell className="font-bold text-xs py-4">Priority (Router)</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground leading-relaxed">
                      A ranking system. If a customer matches two different rules, the one with the higher <strong className="text-foreground">Priority Number</strong> will be shown first.
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/[0.01]">
                    <TableCell className="font-bold text-xs py-4">Usage Progress</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground leading-relaxed">
                      Real-time bars in your dashboard showing exactly how much revenue a gateway or group has processed against its limits.
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-primary/[0.01]">
                    <TableCell className="font-bold text-xs py-4 border-b-0">Standalone Gateway</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground leading-relaxed border-b-0">
                      A gateway account that is NOT part of any router. It appears at checkout simply as itself without any advanced rotation or geo-fencing logic.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Real-World Examples */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h3 className="text-base font-bold text-foreground">3. Real-World Examples</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border-l-4 border-l-primary bg-primary/[0.03] border-border space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-tight italic">&quot;Geo-Specific&quot; Rule</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  You create a Router called &quot;Europe Cards&quot; that only shows to customers in the EU. You add 3 local merchant accounts to it and set them to Round-Robin.
                </p>
              </div>
              <div className="p-4 rounded-xl border-l-4 border-l-primary bg-primary/[0.03] border-border space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-tight italic">&quot;High-Ticket&quot; Rule</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  You create a Router with <strong className="text-foreground">Priority 100</strong> that only triggers for orders over $5,000 to route them to specific designation.
                </p>
              </div>
              <div className="p-4 rounded-xl border-l-4 border-l-primary bg-primary/[0.03] border-border space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-tight italic">&quot;Safety&quot; Rule</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  You set a <strong className="text-foreground">$200/day limit</strong> on an account. Once reached, the Router automatically hides it and shifts traffic to other accounts.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-primary/5 text-center space-y-2">
            <h4 className="font-bold text-sm text-primary uppercase tracking-widest">Summary</h4>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed italic">
              Routers transform your payment setup from a static list into a <strong>Smart Orchestration System</strong>. They protect your accounts, ensure customers always see a working method, and automate your logic.
            </p>
          </div>
        </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <RouterDialogV2
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        metadata={metadata}
        inventoryMetadata={inventoryMetadata}
        inventory={inventory}
        initialData={editingItem}
      />
    </div>
  )
}
