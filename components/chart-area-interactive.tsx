"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDashboardData, getDashboardSummary } from "@/lib/dashboard-actions"
import { DashboardData, DashboardSummaryData } from "@/types/dashboard"
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { TrendingUp, TrendingDown, Minus, Calendar as CalendarIcon, BarChart } from "lucide-react"
import { cn, formatCompactNumber } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { format, parseISO } from "date-fns"

const statOptions = [
  { label: "Gross Volume", value: "gross_volume" },
  { label: "Net Volume", value: "net_volume" },
]

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null)
  const [summaryData, setSummaryData] = React.useState<DashboardSummaryData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedStat, setSelectedStat] = React.useState("gross_volume")
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [data, summary] = await Promise.all([
        getDashboardData(selectedDate, [selectedStat]),
        getDashboardSummary(selectedDate)
      ])
      setDashboardData(data)
      setSummaryData(summary)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, selectedStat])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const chartData = React.useMemo(() => {
    if (!dashboardData) return []

    const { intervals, datasets } = dashboardData.chart_data
    return intervals.map((interval, index) => {
      const point: Record<string, string | number> = { interval }
      datasets.forEach((dataset) => {
        const key = dataset.is_current ? "current" : "previous"
        point[key] = dataset.data[index]
      })
      return point
    })
  }, [dashboardData])

  const chartConfig = React.useMemo(() => {
    if (!dashboardData) return {} as ChartConfig

    const currentDataset = dashboardData.chart_data.datasets.find((d) => d.is_current)
    const previousDataset = dashboardData.chart_data.datasets.find((d) => !d.is_current)

    return {
      current: {
        label: currentDataset?.label || "Current",
        color: "hsl(var(--chart-1))",
      },
      previous: {
        label: previousDataset?.label || "Previous",
        color: "hsl(var(--chart-2))",
      },
    } satisfies ChartConfig
  }, [dashboardData])

  const hasChartData = React.useMemo(() => {
    if (!dashboardData) return false
    return dashboardData.chart_data.datasets.some((dataset) =>
      dataset.data.some((value) => value > 0)
    )
  }, [dashboardData])

  if (isLoading && !dashboardData) {
    return <ChartSkeleton />
  }

  if (!dashboardData) {
    return (
      <Card className="@container/card sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Today</CardTitle>
          <CardDescription>Failed to load dashboard data.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { stats } = dashboardData
  const isPositive = stats.change_percentage > 0
  const isNegative = stats.change_percentage < 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
      <Card className={cn("@container/card transition-opacity duration-200 lg:col-span-3 sm:py-6", isLoading && "opacity-60 pointer-events-none")}>
        <CardHeader className="relative flex flex-col items-start gap-4 px-4 pb-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Today</CardTitle>
              {isLoading && <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      {stats.label.toLowerCase().includes("volume") ? "$" : ""}{formatCompactNumber(stats.current_total)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {stats.label.toLowerCase().includes("volume") ? "$" : ""}{stats.current_total.toLocaleString()}
                  </TooltipContent>
                </Tooltip>
              </span>
              <div className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-muted-foreground"
              )}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : isNegative ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {Math.abs(stats.change_percentage)}%
              </div>
            </div>
            <CardDescription className="text-sm">
              vs <Tooltip>
                <TooltipTrigger asChild>
                  <span className="underline decoration-dotted cursor-help">
                    {stats.label.toLowerCase().includes("volume") ? "$" : ""}{formatCompactNumber(stats.previous_total)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {stats.label.toLowerCase().includes("volume") ? "$" : ""}{stats.previous_total.toLocaleString()}
                </TooltipContent>
              </Tooltip> {stats.label.toLowerCase()}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 self-end sm:flex-row sm:items-center sm:self-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(parseISO(selectedDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate ? parseISO(selectedDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(format(date, "yyyy-MM-dd"))
                    } else {
                      setSelectedDate(undefined)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select value={selectedStat} onValueChange={setSelectedStat}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select stat" />
              </SelectTrigger>
              <SelectContent align="end">
                {statOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {hasChartData ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-current)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-current)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-previous)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-previous)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="interval"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => value}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="previous"
                  type="monotone"
                  fill="url(#fillPrevious)"
                  stroke="var(--color-previous)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Area
                  dataKey="current"
                  type="monotone"
                  fill="url(#fillCurrent)"
                  stroke="var(--color-current)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center">
              <Empty className="border-0 bg-transparent">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BarChart className="h-6 w-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No activity found</EmptyTitle>
                  <EmptyDescription>
                    There is no {selectedStat.replace('_', ' ')} data recorded for {selectedDate ? format(parseISO(selectedDate), "PPP") : 'today'}.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </CardContent>
      </Card>

      <div className={cn("flex flex-col gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:gap-6", isLoading && "opacity-60 pointer-events-none")}>
        <Card className="@container/card flex flex-1 flex-col">
          <CardHeader className="relative pb-2 sm:px-6">
            <CardDescription>{summaryData?.total_gross_volume.label || "Total Gross Volume"}</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    ${formatCompactNumber(summaryData?.total_gross_volume.current_total || 0)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  ${(summaryData?.total_gross_volume.current_total || 0).toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant={(summaryData?.total_gross_volume.change_percentage ?? 0) >= 0 ? "success" : "destructive"} className="flex gap-1 rounded-lg text-xs">
                {(summaryData?.total_gross_volume.change_percentage ?? 0) >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {summaryData ? Math.abs(summaryData.total_gross_volume.change_percentage) : 0}%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm sm:px-6">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {(summaryData?.total_gross_volume.change_percentage ?? 0) >= 0 ? "Up" : "Down"} {summaryData ? Math.abs(summaryData.total_gross_volume.change_percentage) : 0}% this period {(summaryData?.total_gross_volume.change_percentage ?? 0) >= 0 ? <TrendingUp className="size-4 text-emerald-500" /> : <TrendingDown className="size-4 text-destructive" />}
            </div>
            <div className="text-muted-foreground">
              if compared with last 30 days ....
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card flex flex-1 flex-col">
          <CardHeader className="relative pb-2 sm:px-6">
            <CardDescription>{summaryData?.express_wallet.label || "Express Wallet"}</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    ${formatCompactNumber(summaryData?.express_wallet.current_total || 0)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  ${(summaryData?.express_wallet.current_total || 0).toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant={(summaryData?.express_wallet.change_percentage ?? 0) >= 0 ? "success" : "destructive"} className="flex gap-1 rounded-lg text-xs">
                {(summaryData?.express_wallet.change_percentage ?? 0) >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {summaryData ? Math.abs(summaryData.express_wallet.change_percentage) : 0}%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm sm:px-6">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {(summaryData?.express_wallet.change_percentage ?? 0) >= 0 ? "Up" : "Down"} {summaryData ? Math.abs(summaryData.express_wallet.change_percentage) : 0}% this period {(summaryData?.express_wallet.change_percentage ?? 0) >= 0 ? <TrendingUp className="size-4 text-emerald-500" /> : <TrendingDown className="size-4 text-destructive" />}
            </div>
            <div className="text-muted-foreground">
              if compared with last 30 days ....
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
