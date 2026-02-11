"use client"

import * as React from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersDataTable, Order } from "@/components/orders-data-table"
import { TransactionsDataTable, Transaction } from "@/components/transactions-data-table"
import { Button } from "@/components/ui/button"
import { ListIcon, ArrowUpCircleIcon, ArrowRight } from "lucide-react"

interface DashboardTabsProps {
  ordersData: {
    orders: Order[]
    pageCount: number
  } | null
  transactionsData: {
    transactions: Transaction[]
    pageCount: number
  } | null
  networks: Record<string, { name: string }>
  payment_gateways: Record<string, { type: string; display_name: string }>
}

export function DashboardTabs({
  ordersData,
  transactionsData,
  networks,
  payment_gateways
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = React.useState("orders")

  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="orders" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="mb-0">
            <TabsTrigger value="orders">
              <ListIcon className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <ArrowUpCircleIcon className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" asChild size="sm">
            <Link href={activeTab === "orders" ? "/orders" : "/transactions"}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <TabsContent value="orders" className="mt-0 border-0 p-0">
          <OrdersDataTable
            data={ordersData?.orders || []}
            pageCount={ordersData?.pageCount || 1}
            networks={networks}
            payment_gateways={payment_gateways}
            showFilters={false}
            showPagination={false}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0 border-0 p-0">
          <TransactionsDataTable
            data={transactionsData?.transactions || []}
            pageCount={transactionsData?.pageCount || 1}
            networks={networks}
            payment_gateways={payment_gateways}
            showFilters={false}
            showPagination={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
