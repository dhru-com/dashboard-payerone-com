"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RouterVisibility, PaymentGatewayV2Metadata } from "@/types/payment-gateway-v2"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, Globe, CircleDollarSign, Sliders, HelpCircle, X, Power, CalendarDays, Search, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { format, parse } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { COUNTRIES } from "@/lib/constants"

interface VisibilityRulesFormProps {
  value: RouterVisibility
  onChange: (value: RouterVisibility) => void
  metadata?: PaymentGatewayV2Metadata
}

const DAYS = [
  { label: "S", value: 0, full: "Sunday" },
  { label: "M", value: 1, full: "Monday" },
  { label: "T", value: 2, full: "Tuesday" },
  { label: "W", value: 3, full: "Wednesday" },
  { label: "T", value: 4, full: "Thursday" },
  { label: "F", value: 5, full: "Friday" },
  { label: "S", value: 6, full: "Saturday" },
]

export const VisibilityRulesForm = ({ value, onChange, metadata }: VisibilityRulesFormProps) => {
  // Use a stable onChange to prevent infinite loops during rapid updates
  const handleChange = React.useCallback((updates: Partial<RouterVisibility>) => {
    onChange({ ...value, ...updates })
  }, [value, onChange])

  const toggleDay = (day: number) => {
    const days_of_week = (value.days_of_week || []);
    handleChange({
      days_of_week: days_of_week.includes(day)
        ? days_of_week.filter((d) => d !== day)
        : [...days_of_week, day].sort()
    })
  }

  const selectAllDays = () => handleChange({ days_of_week: [0, 1, 2, 3, 4, 5, 6] })
  const selectNoDays = () => handleChange({ days_of_week: [] })

  const isScheduleEnabled = React.useMemo(() => {
    return !!(value.date_start || value.date_end || (value.time_start && value.time_start !== "none") || (value.time_end && value.time_end !== "none") || (value.days_of_week && value.days_of_week.length > 0));
  }, [value]);

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    handleChange({ priority: isNaN(val) ? undefined : val })
  }

  const handleTimezoneChange = (v: string) => {
    handleChange({ timezone: v })
  }

  const handleDateStartChange = (date: Date | undefined) => {
    handleChange({ date_start: date ? format(date, "yyyy-MM-dd") : undefined })
  }

  const handleDateEndChange = (date: Date | undefined) => {
    handleChange({ date_end: date ? format(date, "yyyy-MM-dd") : undefined })
  }

  const handleTimeStartChange = (v: string) => {
    handleChange({ time_start: v || undefined })
  }

  const handleTimeEndChange = (v: string) => {
    handleChange({ time_end: v || undefined })
  }

  const handleCountriesAllowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({ countries_allow: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })
  }

  const handleCountriesDenyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({ countries_deny: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })
  }

  const handleCurrenciesAllowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({ currencies_allow: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })
  }

  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    handleChange({ min_amount: isNaN(val) ? undefined : val })
  }

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    handleChange({ max_amount: isNaN(val) ? undefined : val })
  }

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.value === code)?.label || code
  }

  const [searchAllow, setSearchAllow] = React.useState("")
  const [searchDeny, setSearchDeny] = React.useState("")
  const [searchCurrency, setSearchCurrency] = React.useState("")

  const [openAllow, setOpenAllow] = React.useState(false)
  const [openDeny, setOpenDeny] = React.useState(false)
  const [openCurrency, setOpenCurrency] = React.useState(false)

  const filteredAllowCountries = React.useMemo(() => {
    const options = metadata?.visibility?.countries_allow?.enum_options || []
    if (!searchAllow) return options
    return options.filter(opt =>
      getCountryName(opt).toLowerCase().includes(searchAllow.toLowerCase()) ||
      opt.toLowerCase().includes(searchAllow.toLowerCase())
    )
  }, [metadata, searchAllow])

  const filteredDenyCountries = React.useMemo(() => {
    const options = metadata?.visibility?.countries_deny?.enum_options || []
    if (!searchDeny) return options
    return options.filter(opt =>
      getCountryName(opt).toLowerCase().includes(searchDeny.toLowerCase()) ||
      opt.toLowerCase().includes(searchDeny.toLowerCase())
    )
  }, [metadata, searchDeny])

  const filteredCurrencies = React.useMemo(() => {
    const options = metadata?.visibility?.currencies_allow?.enum_options || []
    if (!searchCurrency) return options
    return options.filter(opt =>
      opt.toLowerCase().includes(searchCurrency.toLowerCase())
    )
  }, [metadata, searchCurrency])

  const handleDailyAmountLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    handleChange({ daily_amount_limit: isNaN(val) ? undefined : val })
  }

  const handleMonthlyAmountLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    handleChange({ monthly_amount_limit: isNaN(val) ? undefined : val })
  }

  const handleDailyOrderLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    handleChange({ daily_order_limit: isNaN(val) ? undefined : val })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-2">
              <Sliders className="h-3 w-3" />
              Priority
            </Label>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="p-4 bg-popover text-popover-foreground shadow-xl border-primary/20 border-2 max-w-[320px]">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-bold text-primary text-xs uppercase tracking-wider">1. How it Works</p>
                      <p className="text-[11px] leading-relaxed">
                        When a checkout session is initiated, the system retrieves all active Routers. The <strong>priority</strong> field tells the system which rule to check first if multiple rules match.
                      </p>
                      <ul className="text-[10px] list-disc pl-4 space-y-1 mt-1 text-muted-foreground">
                        <li><strong>Higher Number = Higher Priority:</strong> Priority 100 is checked before Priority 10.</li>
                        <li><strong>Evaluation Order:</strong> Routers are sorted by priority (descending). The system picks the first one whose rules match.</li>
                      </ul>
                    </div>
                    <div className="space-y-1 border-t pt-2">
                      <p className="font-bold text-primary text-xs uppercase tracking-wider">2. Practical Use Case</p>
                      <div className="p-2 bg-muted rounded-md space-y-1.5 mt-1">
                        <p className="font-bold text-[10px] uppercase">The &quot;Override&quot; Rule:</p>
                        <div className="text-[10px] space-y-1 italic">
                          <p>• Router A (Priority 1): General pool for everyone.</p>
                          <p>• Router B (Priority 50): VIP rule for orders {">"} $10,000.</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground pt-1 border-t border-muted-foreground/10">
                          A $10,000 order matches both, but <strong>Router B</strong> wins because it has higher priority.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            type="number"
            value={value.priority ?? ""}
            onChange={handlePriorityChange}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Timezone
          </Label>
          <Select value={value.timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {metadata?.visibility?.timezone?.enum_options ? (
                metadata.visibility.timezone.enum_options.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="UTC">UTC (Universal)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  <SelectItem value="America/New_York">New York (EST/EDT)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-xl border bg-muted/5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold tracking-tight">Schedule & Timing</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date Range (Start)</Label>
            <div className="flex gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-9 justify-start text-left font-normal px-3 flex-1",
                      !value.date_start && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4 text-primary/70" />
                    {value.date_start ? format(parse(value.date_start, "yyyy-MM-dd", new Date()), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value.date_start ? parse(value.date_start, "yyyy-MM-dd", new Date()) : undefined}
                    onSelect={handleDateStartChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {value.date_start && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDateStartChange(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2 flex flex-col">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Date Range (End)</Label>
            <div className="flex gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "h-9 justify-start text-left font-normal px-3 flex-1",
                      !value.date_end && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4 text-primary/70" />
                    {value.date_end ? format(parse(value.date_end, "yyyy-MM-dd", new Date()), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value.date_end ? parse(value.date_end, "yyyy-MM-dd", new Date()) : undefined}
                    onSelect={handleDateEndChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {value.date_end && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDateEndChange(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Daily Time (From)
            </Label>
            <Select value={value.time_start || "none"} onValueChange={(v) => handleTimeStartChange(v === "none" ? "" : v)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                <SelectGroup>
                  <SelectItem value="none">None</SelectItem>
                  {Array.from({ length: 48 }).map((_, i) => {
                    const hour = Math.floor(i / 2).toString().padStart(2, '0')
                    const min = (i % 2 === 0 ? '00' : '30')
                    const t = `${hour}:${min}`
                    return <SelectItem key={t} value={t}>{t}</SelectItem>
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Daily Time (To)
            </Label>
            <Select value={value.time_end || "none"} onValueChange={(v) => handleTimeEndChange(v === "none" ? "" : v)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                <SelectGroup>
                  <SelectItem value="none">None</SelectItem>
                  {Array.from({ length: 48 }).map((_, i) => {
                    const hour = Math.floor(i / 2).toString().padStart(2, '0')
                    const min = (i % 2 === 0 ? '00' : '30')
                    const t = `${hour}:${min}`
                    return <SelectItem key={t} value={t}>{t}</SelectItem>
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Days</Label>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={selectAllDays}>All</Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={selectNoDays}>None</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              {DAYS.map((day) => {
                const isSelected = value.days_of_week?.includes(day.value)
                return (
                  <Tooltip key={day.value}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 w-9 p-0 rounded-lg text-xs font-bold transition-all",
                          isSelected ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:bg-muted"
                        )}
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {day.full}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-xl border bg-muted/5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold tracking-tight">Geo & Currency Targeting</h4>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground/80">Allow Countries</Label>
            {metadata?.visibility?.countries_allow?.enum_options ? (
              <Popover open={openAllow} onOpenChange={setOpenAllow}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="h-9 w-full justify-between"
                  >
                    <span className="truncate">Add Country...</span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 max-h-[400px] gap-0" align="start">
                  <Command shouldFilter={false} className="flex-1">
                    <CommandInput
                      placeholder="Search country..."
                      value={searchAllow}
                      onValueChange={setSearchAllow}
                    />
                  <CommandList className="flex-1 overflow-y-auto">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {filteredAllowCountries.map((opt) => (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={() => {
                            if (!value.countries_allow?.includes(opt)) {
                              handleChange({ countries_allow: [...(value.countries_allow || []), opt] })
                            }
                            setOpenAllow(false)
                          }}
                        >
                          {getCountryName(opt)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                placeholder="e.g. US, GB, DE, FR"
                value={value.countries_allow?.join(", ") || ""}
                onChange={handleCountriesAllowChange}
                className="h-9"
              />
            )}
            {value.countries_allow && value.countries_allow.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {value.countries_allow.map((c) => (
                  <Badge key={c} variant="secondary" className="pl-2 pr-1 py-0 h-6 gap-1 text-[10px] font-bold uppercase tracking-wider">
                    {getCountryName(c)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full p-0 hover:bg-muted"
                      onClick={() => handleChange({ countries_allow: value.countries_allow?.filter(x => x !== c) })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">Limit this router to specific countries.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground/80">Deny Countries</Label>
            {metadata?.visibility?.countries_deny?.enum_options ? (
              <Popover open={openDeny} onOpenChange={setOpenDeny}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="h-9 w-full justify-between"
                  >
                    <span className="truncate">Block Country...</span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 max-h-[400px] gap-0" align="start">
                  <Command shouldFilter={false} className="flex-1">
                    <CommandInput
                      placeholder="Search country..."
                      value={searchDeny}
                      onValueChange={setSearchDeny}
                    />
                  <CommandList className="flex-1 overflow-y-auto">
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {filteredDenyCountries.map((opt) => (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={() => {
                            if (!value.countries_deny?.includes(opt)) {
                              handleChange({ countries_deny: [...(value.countries_deny || []), opt] })
                            }
                            setOpenDeny(false)
                          }}
                        >
                          {getCountryName(opt)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                placeholder="e.g. RU, CN"
                value={value.countries_deny?.join(", ") || ""}
                onChange={handleCountriesDenyChange}
                className="h-9"
              />
            )}
            {value.countries_deny && value.countries_deny.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {value.countries_deny.map((c) => (
                  <Badge key={c} variant="destructive" className="pl-2 pr-1 py-0 h-6 gap-1 text-[10px] font-bold uppercase tracking-wider">
                    {getCountryName(c)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full p-0 hover:bg-destructive/10"
                      onClick={() => handleChange({ countries_deny: value.countries_deny?.filter(x => x !== c) })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground/80">Allow Currencies</Label>
            {metadata?.visibility?.currencies_allow?.enum_options ? (
              <Popover open={openCurrency} onOpenChange={setOpenCurrency}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="h-9 w-full justify-between"
                  >
                    <span className="truncate">Add Currency...</span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0 max-h-[400px] gap-0" align="start">
                  <Command shouldFilter={false} className="flex-1">
                    <CommandInput
                      placeholder="Search currency..."
                      value={searchCurrency}
                      onValueChange={setSearchCurrency}
                    />
                  <CommandList className="flex-1 overflow-y-auto">
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCurrencies.map((opt) => (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={() => {
                            if (!value.currencies_allow?.includes(opt)) {
                              handleChange({ currencies_allow: [...(value.currencies_allow || []), opt] })
                            }
                            setOpenCurrency(false)
                          }}
                        >
                          {opt}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                placeholder="e.g. USD, EUR, GBP, USDT"
                value={value.currencies_allow?.join(", ") || ""}
                onChange={handleCurrenciesAllowChange}
                className="h-9"
              />
            )}
            {value.currencies_allow && value.currencies_allow.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {value.currencies_allow.map((c) => (
                    <Badge key={c} variant="secondary" className="pl-2 pr-1 py-0 h-6 gap-1 text-[10px] font-bold uppercase tracking-wider">
                    {c}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full p-0 hover:bg-primary/10"
                      onClick={() => handleChange({ currencies_allow: value.currencies_allow?.filter(x => x !== c) })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">Limit this router to specific currencies.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-xl border bg-primary/5 border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold tracking-tight">Quotas & Transaction Limits</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Min Transaction</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary">
                <CircleDollarSign className="h-3.5 w-3.5" />
              </div>
              <Input
                type="number"
                value={value.min_amount || ""}
                onChange={handleMinAmountChange}
                className="h-9 pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Max Transaction</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary">
                <CircleDollarSign className="h-3.5 w-3.5" />
              </div>
              <Input
                type="number"
                value={value.max_amount || ""}
                onChange={handleMaxAmountChange}
                className="h-9 pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Daily Amount Limit</Label>
            <Input
              type="number"
              value={value.daily_amount_limit || ""}
              onChange={handleDailyAmountLimitChange}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Monthly Amount Limit</Label>
            <Input
              type="number"
              value={value.monthly_amount_limit || ""}
              onChange={handleMonthlyAmountLimitChange}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Daily Order Limit</Label>
            <Input
              type="number"
              value={value.daily_order_limit || ""}
              onChange={handleDailyOrderLimitChange}
              className="h-9"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
