"use client"

import * as React from "react"
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Wallet,
  Copy,
  Check,
  Clock,
  X,
  RefreshCw,
  Settings2,
} from "lucide-react"

import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation"
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { VirtualAddress } from "@/types/merchant"
import { SafeImage } from "@/components/safe-image"
import { NETWORK_METADATA, NetworkMetadata } from "@/lib/networks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VirtualAddressesDataTableProps {
  data: VirtualAddress[]
  pageCount: number
  networkMetadata?: Record<string, NetworkMetadata>
}

export function VirtualAddressesDataTable({
  data,
  pageCount,
  networkMetadata = NETWORK_METADATA
}: VirtualAddressesDataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle pagination
  const page = searchParams.get("page") ?? "1"
  const limit = searchParams.get("limit") ?? "20"
  const search = searchParams.get("search") ?? ""

  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null)
  const [searchValue, setSearchValue] = React.useState(search)
  const [isPending, startTransition] = React.useTransition()
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  React.useEffect(() => {
    setSearchValue(search)
  }, [search])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== search) {
        handleSearch(searchValue)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchValue, search])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    toast.success("Address copied to clipboard")
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const createQueryString = React.useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ page: newPage.toString() })}`)
    })
  }

  const handleLimitChange = (newLimit: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ limit: newLimit, page: "1" })}`)
    })
  }

  const handleSearch = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ search: value || null, page: "1" })}`)
    })
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const renderNetworkIcons = (type: string) => {
    const isWc = type.startsWith("wc_");
    const baseType = isWc ? type.substring(3) : type;

    const icons: React.ReactNode[] = [];

    if (baseType === "evm") {
      // Show all EVM networks
      const evmNetworks = Object.entries(networkMetadata).filter(([_, meta]) => meta.type === "evm");
      evmNetworks.forEach(([key, meta]) => {
        icons.push(
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border bg-background p-0.5">
                <SafeImage
                  src={`/logos/${key}.svg`}
                  alt={meta.name}
                  fill
                  className="object-contain"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{meta.name}</TooltipContent>
          </Tooltip>
        );
      });
    } else {
      // Show specific network if it exists in metadata
      const meta = networkMetadata[baseType];
      if (meta) {
        icons.push(
          <Tooltip key={baseType}>
            <TooltipTrigger asChild>
              <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border bg-background p-0.5">
                <SafeImage
                  src={`/logos/${baseType}.svg`}
                  alt={meta.name}
                  fill
                  className="object-contain"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{meta.name}</TooltipContent>
          </Tooltip>
        );
      }
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {icons}
        </div>
      </div>
    );
  };

  const columns: ColumnDef<VirtualAddress>[] = [
    {
      id: "method",
      header: "Method",
      cell: ({ row }) => {
        const type = row.original.type;
        const isWc = type.startsWith("wc_");
        return isWc ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border bg-background p-0.5">
                <SafeImage
                  src="/logos/wallet_connect.svg"
                  alt="WalletConnect"
                  fill
                  className="object-contain"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>WalletConnect</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-5 w-5 items-center justify-center text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Direct</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "receive_address",
      header: "Receive Address",
      cell: ({ row }) => {
        const address = row.getValue("receive_address") as string
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">
              {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => copyToClipboard(address)}
            >
              {copiedAddress === address ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Networks",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return renderNetworkIcons(type)
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as number
        return (
          <Badge variant={status === 1 ? "success" : "secondary"}>
            {status === 1 ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "last_accessed_date",
      header: "Last Accessed",
      cell: ({ row }) => {
        const date = row.getValue("last_accessed_date") as string
        return (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            {date}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
    manualPagination: true,
    pageCount: pageCount,
  })

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", isPending && "opacity-50 transition-opacity")}>
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 pb-2">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px] md:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={header.id === "method" ? "w-[70px]" : ""}
                  >
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={cell.column.id === "method" ? "w-[70px]" : ""}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Wallet className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No virtual addresses found</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
          Page {page} of {pageCount}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={limit}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {["10", "20", "30", "40", "50"].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={page === "1" || isPending}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(parseInt(page) - 1)}
              disabled={page === "1" || isPending}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(parseInt(page) + 1)}
              disabled={parseInt(page) >= pageCount || isPending}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(pageCount)}
              disabled={parseInt(page) >= pageCount || isPending}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}
