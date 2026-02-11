/**
 * @deprecated This component is part of the legacy Payment Gateways V1.
 * All future development should be done in the V2 components located in /components/payments/v2/
 */
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
import { CreditCard, Plus, Settings2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/safe-image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ActivatedGateway, PaymentGatewayMetadata } from "@/types/payment-gateway"
import { GatewayDialog } from "./gateway-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface PaymentGatewaysProps {
  initialData: Record<string, ActivatedGateway>
  metadata: Record<string, PaymentGatewayMetadata>
  readOnly?: boolean
}

export function PaymentGateways({ initialData, metadata, readOnly = false }: PaymentGatewaysProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingGateway, setEditingGateway] = React.useState<{ uuid: string; gateway: ActivatedGateway } | null>(null)

  const activatedList = Object.entries(initialData)

  const handleAdd = () => {
    setEditingGateway(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (uuid: string, gateway: ActivatedGateway) => {
    setEditingGateway({ uuid, gateway })
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Payment Gateways</CardTitle>
            <CardDescription>
              Configure and manage your payment gateway integrations.
            </CardDescription>
          </div>
        {!readOnly && (
          <CardAction>
            <Button size="sm" className="gap-2" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Add Gateway
            </Button>
          </CardAction>
        )}
        </CardHeader>
        <CardContent>
          {activatedList.length === 0 ? (
            <Empty className="min-h-[350px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CreditCard className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Gateways Activated</EmptyTitle>
                <EmptyDescription>
                  Activate your first payment gateway to start accepting payments.
                </EmptyDescription>
              </EmptyHeader>
            {!readOnly && (
              <EmptyContent>
                <Button className="gap-2" onClick={handleAdd}>
                  <Plus className="h-4 w-4" />
                  Add Gateway
                </Button>
              </EmptyContent>
            )}
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activatedList.map(([uuid, gateway]) => {
                  const meta = metadata[gateway.type]
                  return (
                    <TableRow key={uuid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50 p-1">
                            <SafeImage
                              src={`/logos/${gateway.type}.svg`}
                              alt={gateway.type}
                              fill
                              className="object-contain"
                              fallbackIcon={<HelpCircle className="h-4 w-4 text-muted-foreground" />}
                            />
                          </div>
                          <span className="font-medium">
                            {(gateway.config.display_name as string) || meta?.name || gateway.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {gateway.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={gateway.config.disable ? "secondary" : "success"}>
                          {gateway.config.disable ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleEdit(uuid, gateway)}
                        >
                          <Settings2 className="h-4 w-4" />
                          {readOnly ? "View" : "Edit"}
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

      <GatewayDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        metadata={metadata}
        initialData={editingGateway}
        readOnly={readOnly}
      />
    </div>
  )
}
