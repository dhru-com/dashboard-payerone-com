"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentGatewayV2Data, PaymentGatewayV2Metadata } from "@/types/payment-gateway-v2"
import { PaymentGatewayData, PaymentGatewayMetadata } from "@/types/payment-gateway"
import { GatewayInventory } from "./gateway-inventory"
import { RouterList } from "./router-list"
import { PaymentGateways } from "@/components/payments/payment-gateways"
import { History } from "lucide-react"

interface PaymentGatewaysV2Props {
  inventoryData?: PaymentGatewayV2Data
  routersData?: PaymentGatewayV2Data
  inventoryMetadata?: PaymentGatewayV2Metadata
  routersMetadata?: PaymentGatewayV2Metadata
  deprecatedData?: PaymentGatewayData
  deprecatedMetadata?: Record<string, PaymentGatewayMetadata>
}

export function PaymentGatewaysV2({
  inventoryData,
  routersData,
  inventoryMetadata,
  routersMetadata,
  deprecatedData,
  deprecatedMetadata
}: PaymentGatewaysV2Props) {
  const inventory = React.useMemo(() => inventoryData?.inventory || {}, [inventoryData?.inventory])
  const routers = React.useMemo(() => routersData?.routers || {}, [routersData?.routers])
  const usage = React.useMemo(() => inventoryData?.usage || {}, [inventoryData?.usage])
  const deprecatedInventory = React.useMemo(() => deprecatedData?.activated_gateways || {}, [deprecatedData?.activated_gateways])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Payment Gateways</h1>
        <p className="text-muted-foreground">
          Manage your payment gateways and routing policies.
        </p>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="inventory">Payment Gateway</TabsTrigger>
            <TabsTrigger value="routers">Routing Policies</TabsTrigger>
          </TabsList>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="deprecated" className="gap-2 text-muted-foreground data-[state=active]:text-foreground">
              <History className="h-3.5 w-3.5" />
              Payment Gateways [Deprecated]
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inventory" className="mt-4">
          <GatewayInventory
            inventory={inventory}
            usage={usage}
            metadata={inventoryMetadata}
          />
        </TabsContent>
        <TabsContent value="routers" className="mt-4">
          <RouterList
            routers={routers}
            inventory={inventory}
            metadata={routersMetadata}
            inventoryMetadata={inventoryMetadata}
          />
        </TabsContent>
        <TabsContent value="deprecated" className="mt-4">
          <PaymentGateways
            initialData={deprecatedInventory}
            metadata={deprecatedMetadata || {}}
            readOnly={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
