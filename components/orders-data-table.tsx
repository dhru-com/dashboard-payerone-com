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
  getFilteredRowModel,
  getPaginationRowModel,
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
  Search,
  X,
  Wallet,
  ExternalLink,
  Zap,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
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
    payment_handle?: string | null
  }
}

export interface Order {
  display_order_id: string
  amount: string
  currency_code: string
  status: string
  custom_id: string
  type: string
  network: string
  payment_address: string
  payment_amount: string
  received_amount: string
  dynamic_amount: string | null
  dt: string
  description: string
  customer_name: string
  customer_email: string
  website: string
  note?: string
  payment_status: string
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

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "display_order_id",
    header: "Order ID",
    cell: ({ row }) => {
      const orderId = row.getValue("display_order_id") as string
      if (!orderId || orderId === "null") {
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
                <p>This order is not yet settled.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
      return <OrderIDCell orderId={orderId} />
    },
  },
  {
    accessorKey: "custom_id",
    header: ({ table }) => {
      const paymentHandle = table.options.meta?.payment_handle
      return paymentHandle === "payment_handle" ? "Payerone.me Link" : "Custom ID"
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website = row.getValue("website") as string
      if (!website) return <span className="text-muted-foreground">N/A</span>

      return (
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="max-w-[150px] truncate">{website}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
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
        case "Paid":
          variant = "default"
          break
        case "Cancel":
          variant = "destructive"
          break
        case "Pending":
        case "Partially-Paid":
          variant = "secondary"
          break
        case "New":
          variant = "secondary"
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
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("payment_status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

      switch (status) {
        case "Paid":
          variant = "default"
          break
        case "UnPaid":
          variant = "destructive"
          break
        case "Partially Paid":
          variant = "secondary"
          break
      }

      return (
        <Badge variant={variant}>
          {status || "N/A"}
        </Badge>
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
      const note = row.original.note

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

      const content = (
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 overflow-hidden">
            {!networkId ? (
              <Wallet className="h-3 w-3 text-muted-foreground" />
            ) : (
              <SafeImage
                src={logoPath}
                alt={networkName}
                width={20}
                height={20}
                className="h-full w-full object-contain"
                fallbackIcon={<Wallet className="h-3 w-3 text-muted-foreground" />}
              />
            )}
          </div>
          <span className="uppercase text-xs font-medium whitespace-nowrap">{networkName}</span>
        </div>
      )

      if (note) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  {content}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-words">{note}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }

      return content
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
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
            {row.getValue("amount")} {row.original.currency_code}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.getValue("customer_name")}</span>
        <span className="text-xs text-muted-foreground">{row.original.customer_email}</span>
      </div>
    ),
  },
  {
    accessorKey: "dt",
    header: "Date",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("dt")}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const isExpress = type?.toLowerCase().includes('evm') ||
                        type?.toLowerCase().includes('solana') ||
                        type?.toLowerCase().includes('tron') ||
                        type?.toLowerCase().includes('express')

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex w-fit items-center justify-center">
                <Badge
                  variant={!isExpress ? "outline" : "secondary"}
                  className={cn(
                    "h-6 w-6 rounded-full p-0 flex items-center justify-center",
                    !isExpress && "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  {isExpress ? (
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
    accessorKey: "payment_address",
    header: "Payment Address",
    cell: ({ row, table }) => {
      const address = row.getValue("payment_address") as string
      const networkId = row.original.network
      const networks = table.options.meta?.networks || {}
      const blockchainUrl = networkId ? networks[networkId]?.blockchain_url : null

      // If it's an address, we might want to link to an address explorer if the URL format allows it.
      // However, blockchain_url in metadata usually ends with /tx/
      // Some explorers use /address/ for addresses.
      // The requirement only mentioned "before txid".

      return <div className="max-w-[150px] truncate" title={address}>{address}</div>
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "payment_amount",
    header: "Payment Amt",
  },
  {
    accessorKey: "received_amount",
    header: "Received Amt",
  },
]

interface OrdersDataTableProps {
  data: Order[]
  pageCount: number
  networks?: Record<string, { name: string }>
  payment_gateways?: Record<string, { type: string; display_name: string }>
  payment_handle?: string | null
  showFilters?: boolean
  showPagination?: boolean
  viewAllHref?: string
}

export function OrdersDataTable({
  data = [],
  pageCount,
  networks = {},
  payment_gateways = {},
  payment_handle = null,
  showFilters = true,
  showPagination = true,
  viewAllHref
}: OrdersDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status") || ""
  const payment_status = searchParams.get("payment_status") || ""
  const network = searchParams.get("network") || ""
  const search = searchParams.get("search") || ""

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "status", value: status },
    { id: "payment_status", value: payment_status },
    { id: "network", value: network },
    { id: "search", value: search },
  ])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    custom_id: false,
    type: false,
    payment_address: false,
    description: false,
    payment_amount: false,
    received_amount: false,
  })
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
    // We don't need getPaginationRowModel if we're doing server-side pagination
    // But TanStack Table might need it or manual pagination logic
    manualPagination: true,
    manualFiltering: true,
    getSortedRowModel: getSortedRowModel(),
    meta: {
      networks,
      payment_gateways,
      payment_handle
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

  const [searchValue, setSearchValue] = React.useState(search)

  React.useEffect(() => {
    setSearchValue(search)
  }, [search])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== search) {
        handleFilterChange("search", searchValue)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchValue])

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className={`w-full space-y-4 ${isPending ? 'opacity-50' : ''}`}>
      {(showFilters || viewAllHref) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            {showFilters && (
              <>
                <Select
                  value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) =>
                    handleFilterChange("status", value)
                  }
                >
                  <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancel">Cancel</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={(table.getColumn("payment_status")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) =>
                    handleFilterChange("payment_status", value)
                  }
                >
                  <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Statuses</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="UnPaid">UnPaid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={(table.getColumn("network")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) =>
                    handleFilterChange("network", value)
                  }
                >
                  <SelectTrigger className="w-[140px] md:w-[150px] shrink-0">
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
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showFilters && (
              <>
                <div className="relative flex-1 md:w-[250px] md:flex-none">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(event) =>
                      setSearchValue(event.target.value)
                    }
                    className="pl-9 pr-9"
                  />
                  {searchValue && (
                    <button
                      onClick={() => setSearchValue("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isPending}
                  title="Refresh"
                  className="shrink-0"
                >
                  <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                </Button>
              </>
            )}
            <div className="flex items-center gap-2">
              {viewAllHref ? (
                <Button variant="outline" asChild className="shrink-0">
                  <Link href={viewAllHref}>
                    View All
                  </Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0" title="Columns">
                      <Settings2 className="h-4 w-4" />
                      <span className="sr-only">Toggle columns</span>
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
          </div>
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
