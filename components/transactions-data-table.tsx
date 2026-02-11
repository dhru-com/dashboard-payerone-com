"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  Wallet,
  ExternalLink,
  ShoppingCart,
  Zap,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react"

import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { SafeImage } from "@/components/safe-image"
import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SearchIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    networks?: Record<string, { name: string; blockchain_url?: string }>
    payment_gateways?: Record<string, { type: string; display_name: string }>
  }
}

export interface Transaction {
  txtype: string
  network_transaction_id: string
  order_id: string
  amount: string
  network: string
  status: string
  dt: string
  merchant_client_email: string | null
  currency_code?: string // Kept for compatibility with logo logic, though not in sample
}

const OrderIDCell = ({ orderId }: { orderId: string }) => {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    toast.success("Order ID copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5 font-medium group">
      <Link
        href={`/orders/${orderId}`}
        className="cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
        title="View Order Details"
      >
        <span className="font-mono text-xs">
          {orderId.substring(0, 8)}...{orderId.substring(orderId.length - 4)}
        </span>
      </Link>
      <button
        onClick={copyToClipboard}
        title="Click to copy Order ID"
        className="inline-flex items-center justify-center"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  )
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "txtype",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("txtype") as string
      const isOrder = type?.toLowerCase().includes('order')
      const isExpress = type?.toLowerCase().includes('express')

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex w-fit items-center justify-center">
                <Badge
                  variant={isOrder ? "outline" : isExpress ? "secondary" : "outline"}
                  className={cn(
                    "h-6 w-6 rounded-full p-0 flex items-center justify-center",
                    isOrder && "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  {isOrder ? (
                    <ShoppingCart className="h-3.5 w-3.5" />
                  ) : isExpress ? (
                    <Zap className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase">{type?.substring(0, 2)}</span>
                  )}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="capitalize">{type?.replace(/_/g, " ")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "network",
    header: "Network",
    cell: ({ row, table }) => {
      const networkId = row.getValue("network") as string
      const networks = table.options.meta?.networks || {}
      const paymentGateways = table.options.meta?.payment_gateways || {}

      let networkName = "N/A"
      let logoPath = ""
      let type = ""

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(networkId)

      if (isUuid && paymentGateways[networkId]) {
        networkName = paymentGateways[networkId].display_name
        type = paymentGateways[networkId].type
        logoPath = `/logos/${type.toLowerCase()}.svg`
      } else if (networkId) {
        networkName = networks[networkId]?.name || networkId
        type = networkId
        const logoMap: Record<string, string> = {
          'bsc': 'bsc.svg',
          'ethereum': 'ethereum.svg',
          'polygon': 'polygon.svg',
          'tron': 'tron.svg',
          'solana': 'solana.svg',
          'arbitrum': 'arbitrum.svg',
          'optimism': 'optimism.svg',
          'base': 'base.svg',
          'opbnb': 'opbnb.svg',
          'btc': 'btc.svg'
        }
        const logoFile = logoMap[networkId.toLowerCase()] || `${networkId.toLowerCase()}.svg`
        logoPath = `/logos/${logoFile}`
      }

      if (!networkId) {
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 overflow-hidden">
              <Wallet className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="uppercase text-xs font-medium whitespace-nowrap">{networkName}</span>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 overflow-hidden">
            <SafeImage
              src={logoPath}
              alt={networkName}
              width={20}
              height={20}
              className="h-full w-full object-contain"
              fallbackIcon={<Wallet className="h-3 w-3 text-muted-foreground" />}
            />
          </div>
          <span className="uppercase text-xs font-medium whitespace-nowrap">{networkName}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

      switch (status) {
        case "Verified":
          variant = "default"
          break
        case "Failed":
        case "Canceled":
          variant = "destructive"
          break
        case "Verifying":
          variant = "outline"
          break
      }

      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "network_transaction_id",
    header: "TXID",
    cell: ({ row, table }) => {
      const txid = row.getValue("network_transaction_id") as string
      const networkId = row.original.network
      const networks = table.options.meta?.networks || {}
      const blockchainUrl = networkId ? networks[networkId]?.blockchain_url : null

      if (blockchainUrl && txid) {
        return (
          <div className="flex items-center gap-1.5">
            <a
              href={`${blockchainUrl}${txid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <div className="max-w-[150px] truncate" title={txid}>
                {txid}
              </div>
            </a>
          </div>
        )
      }

      return <div className="max-w-[150px] truncate" title={txid}>{txid}</div>
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      // Note: Sample data doesn't have currency_code, but we'll keep the logic if it's provided
      const currencyCode = row.original.currency_code?.toLowerCase()
      const logoPath = currencyCode ? `/logos/${currencyCode}.svg` : null

      return (
        <div className="flex items-center gap-2">
          {logoPath && (
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full overflow-hidden">
              <SafeImage
                src={logoPath}
                alt={row.original.currency_code || "Currency"}
                width={16}
                height={16}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <span className="font-medium whitespace-nowrap">
            {row.getValue("amount")} {row.original.currency_code || ""}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "order_id",
    header: "Order ID",
    cell: ({ row }) => {
      const orderId = row.getValue("order_id") as string
      const txtype = row.original.txtype
      const isOrder = txtype?.toLowerCase().includes('order')

      if (isOrder && (!orderId || orderId === "null")) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium text-amber-600 dark:text-amber-500 italic cursor-help flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Not settled
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>This transaction is not yet settled against any order.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      if (!orderId || orderId === "null") {
        return <div className="font-medium">N/A</div>
      }

      return <OrderIDCell orderId={orderId} />
    },
  },
  {
    accessorKey: "merchant_client_email",
    header: "Merchant Client",
    cell: ({ row }) => <div className="max-w-[150px] truncate" title={row.getValue("merchant_client_email") || ""}>{row.getValue("merchant_client_email") || "N/A"}</div>,
  },
  {
    accessorKey: "dt",
    header: "Date",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("dt")}</div>,
  },
]

interface TransactionsDataTableProps {
  data: Transaction[]
  pageCount: number
  networks?: Record<string, { name: string }>
  payment_gateways?: Record<string, { type: string; display_name: string }>
  showFilters?: boolean
  showPagination?: boolean
  viewAllHref?: string
}

export function TransactionsDataTable({ 
  data = [], 
  pageCount, 
  networks = {}, 
  payment_gateways = {},
  showFilters = true,
  showPagination = true,
  viewAllHref
}: TransactionsDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const status = searchParams.get("status") || ""
  const network = searchParams.get("network") || ""
  const merchantClientEmail = searchParams.get("merchant_client_email") || ""
  const networkTransactionId = searchParams.get("network_transaction_id") || ""

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "status", value: status },
    { id: "network", value: network },
    { id: "merchant_client_email", value: merchantClientEmail },
    { id: "network_transaction_id", value: networkTransactionId },
  ])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: data || [],
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    getSortedRowModel: getSortedRowModel(),
    meta: {
      networks,
      payment_gateways
    }
  })

  const [isPending, startTransition] = React.useTransition()

  const updateQueryParams = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })
      startTransition(() => {
        router.push(`${pathname}?${newSearchParams.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const handlePageChange = (pageIndex: number) => {
    updateQueryParams({ page: pageIndex + 1 })
  }

  const handleLimitChange = (pageSize: number) => {
    updateQueryParams({ limit: pageSize, page: 1 })
  }

  const handleFilterChange = (id: string, value: string) => {
    updateQueryParams({ [id]: value, page: 1 })
  }

  const [merchantClientEmailValue, setMerchantClientEmailValue] = React.useState(merchantClientEmail)
  const [networkTransactionIdValue, setNetworkTransactionIdValue] = React.useState(networkTransactionId)

  React.useEffect(() => {
    setMerchantClientEmailValue(merchantClientEmail)
  }, [merchantClientEmail])

  React.useEffect(() => {
    setNetworkTransactionIdValue(networkTransactionId)
  }, [networkTransactionId])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (merchantClientEmailValue !== merchantClientEmail) {
        handleFilterChange("merchant_client_email", merchantClientEmailValue)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [merchantClientEmailValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (networkTransactionIdValue !== networkTransactionId) {
        handleFilterChange("network_transaction_id", networkTransactionIdValue)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [networkTransactionIdValue])

  return (
    <div className={`w-full space-y-4 ${isPending ? 'opacity-50' : ''}`}>
      {(showFilters || viewAllHref) && (
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          {showFilters ? (
            <div className="flex flex-1 items-center gap-2">
              <Select
                value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value)
                }
              >
                <SelectTrigger className="w-[150px] shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Verifying">Verifying</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={(table.getColumn("network")?.getFilterValue() as string) ?? "all"}
                onValueChange={(value) =>
                  handleFilterChange("network", value)
                }
              >
                <SelectTrigger className="w-[150px] shrink-0">
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  {Object.entries(networks).map(([id, network]) => (
                    <SelectItem key={id} value={id}>
                      {network.name}
                    </SelectItem>
                  ))}
                  {Object.keys(payment_gateways).length > 0 && Object.keys(networks).length > 0 && (
                    <div className="h-px bg-muted my-1" />
                  )}
                  {Object.entries(payment_gateways).map(([id, gateway]) => (
                    <SelectItem key={id} value={id}>
                      {gateway.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-[100px] shrink-0">
                <Input
                  placeholder="Merchant Email..."
                  value={merchantClientEmailValue}
                  onChange={(event) =>
                    setMerchantClientEmailValue(event.target.value)
                  }
                />
              </div>
              <div className="relative w-[100px] shrink-0">
                <Input
                  placeholder="TXID..."
                  value={networkTransactionIdValue}
                  onChange={(event) =>
                    setNetworkTransactionIdValue(event.target.value)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {viewAllHref ? (
            <Button variant="outline" asChild className="shrink-0">
              <Link href={viewAllHref}>
                View All
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto shrink-0">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel()?.rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <Empty className="border-0 bg-transparent" style={{ minHeight: '150px' }}>
                      <EmptyHeader>
                        <EmptyMedia>
                          <SearchIcon className="h-6 w-6 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No results found.</EmptyTitle>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4 overflow-x-auto scrollbar-none">
          <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
            {table.getFilteredSelectedRowModel()?.rows?.length ?? 0} of{" "}
            {table.getFilteredRowModel()?.rows?.length ?? 0} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  handleLimitChange(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center px-2 text-sm font-medium whitespace-nowrap">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
