"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ExternalLink,
  Search,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation"
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { SafeImage } from "@/components/safe-image"
import { Badge } from "@/components/ui/badge"
import { ExpressWalletCustomer, ExpressWalletCustomerAddress } from "@/types/express-wallet-customer"
import { NETWORK_METADATA, NetworkMetadata } from "@/lib/networks"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

interface ExpressWalletCustomersTableProps {
  data: ExpressWalletCustomer[]
  pageCount: number
  networks?: Record<string, NetworkMetadata>
}

export function ExpressWalletCustomersTable({
  data,
  pageCount,
  networks = NETWORK_METADATA
}: ExpressWalletCustomersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const page = parseInt(searchParams.get("page") || "1")
  const merchant_client_id = searchParams.get("merchant_client_id") || ""
  const merchant_client_email = searchParams.get("merchant_client_email") || ""
  const merchant_client_name = searchParams.get("merchant_client_name") || ""
  const receive_address = searchParams.get("receive_address") || ""

  const [clientIdValue, setClientIdValue] = React.useState(merchant_client_id)
  const [clientEmailValue, setClientEmailValue] = React.useState(merchant_client_email)
  const [clientNameValue, setClientNameValue] = React.useState(merchant_client_name)
  const [receiveAddressValue, setReceiveAddressValue] = React.useState(receive_address)

  const [isPending, startTransition] = React.useTransition()

  const updateQueryParams = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })
      startTransition(() => {
        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  const handlePageChange = (pageIndex: number) => {
    updateQueryParams({ page: pageIndex + 1 })
  }

  const handleFilterChange = (id: string, value: string) => {
    updateQueryParams({ [id]: value, page: 1 })
  }

  React.useEffect(() => {
    setClientIdValue(merchant_client_id)
    setClientEmailValue(merchant_client_email)
    setClientNameValue(merchant_client_name)
    setReceiveAddressValue(receive_address)
  }, [merchant_client_id, merchant_client_email, merchant_client_name, receive_address])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (clientIdValue !== merchant_client_id) handleFilterChange("merchant_client_id", clientIdValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [clientIdValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (clientEmailValue !== merchant_client_email) handleFilterChange("merchant_client_email", clientEmailValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [clientEmailValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (clientNameValue !== merchant_client_name) handleFilterChange("merchant_client_name", clientNameValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [clientNameValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (receiveAddressValue !== receive_address) handleFilterChange("receive_address", receiveAddressValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [receiveAddressValue])

  const columns = React.useMemo<ColumnDef<ExpressWalletCustomer>[]>(
    () => [
      {
        accessorKey: "merchant_client_id",
        header: "Client ID",
        cell: ({ row }) => (
          <div className="font-medium">#{row.getValue("merchant_client_id")}</div>
        ),
      },
      {
        accessorKey: "merchant_client_name",
        header: "Customer",
        cell: ({ row }) => {
          const name = row.getValue("merchant_client_name") as string
          const email = row.original.merchant_client_email
          return (
            <div className="flex flex-col">
              <span className="font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "addresses",
        header: "Addresses",
        cell: ({ row }) => {
          const addresses = row.getValue("addresses") as ExpressWalletCustomerAddress[]
          return (
            <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
              {addresses.map((addr, i) => {
                const networkId = addr.network.toLowerCase()
                const networkInfo = (networks as Record<string, NetworkMetadata>)[networkId]
                const logoPath = `/logos/${networkId}.svg`
                const blockchainUrl = networkInfo?.blockchain_url
                  ? networkInfo.blockchain_url.replace('/tx/', '/address/').replace('/transaction/', '/address/') + addr.address
                  : null

                return (
                  <HoverCard key={i} openDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/50 overflow-hidden border border-background cursor-help transition-colors hover:border-primary/50">
                        <SafeImage
                          src={logoPath}
                          alt={networkInfo?.name || networkId}
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-3 shadow-xl border-primary/10" side="top">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-muted/50 p-0.5 relative overflow-hidden">
                              <SafeImage src={logoPath} alt={networkId} fill className="object-contain p-0.5" />
                            </div>
                            <span className="text-xs font-bold">{networkInfo?.name || networkId}</span>
                          </div>
                          {blockchainUrl && (
                            <a
                              href={blockchainUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-medium text-primary hover:underline flex items-center gap-1"
                            >
                              View on Explorer
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 border border-border/50">
                          <code className="text-[10px] font-mono break-all flex-1 text-muted-foreground">
                            {addr.address}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 hover:bg-background shadow-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              navigator.clipboard.writeText(addr.address)
                              toast.success("Address copied to clipboard")
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )
              })}
            </div>
          )
        },
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
          const website = row.getValue("website") as string
          if (!website) return <span className="text-muted-foreground">N/A</span>
          return (
            <div className="flex items-center gap-1">
              <span className="max-w-[150px] truncate">{website}</span>
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )
        },
      },
      {
        accessorKey: "last_activity",
        header: "Last Activity",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">
            {row.getValue("last_activity")}
          </div>
        ),
      },
    ],
    [networks]
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: 20, // Default limit from API is 20
      },
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  })

  return (
    <div className={`space-y-4 ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[150px]">
          <Input
            placeholder="Client ID"
            value={clientIdValue}
            onChange={(event) => setClientIdValue(event.target.value)}
          />
        </div>
        <div className="relative w-full max-w-[200px]">
          <Input
            placeholder="Customer Name"
            value={clientNameValue}
            onChange={(event) => setClientNameValue(event.target.value)}
          />
        </div>
        <div className="relative w-full max-w-[200px]">
          <Input
            placeholder="Customer Email"
            value={clientEmailValue}
            onChange={(event) => setClientEmailValue(event.target.value)}
          />
        </div>
        <div className="relative w-full max-w-[250px]">
          <Input
            placeholder="Receive Address"
            value={receiveAddressValue}
            onChange={(event) => setReceiveAddressValue(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                    <Empty className="border-0 bg-transparent py-12">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Users className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No customers found</EmptyTitle>
                        <EmptyDescription>
                          We couldn&apos;t find any customers matching your search.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4 overflow-x-auto scrollbar-none">
        <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
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
  )
}
