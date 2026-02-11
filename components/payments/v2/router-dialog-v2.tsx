"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Trash2, LayoutGrid, Sliders, Activity, HelpCircle, Search, GripVertical, Plus, X, ArrowUpDown, RefreshCw, ArrowDown10, Scale } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Router, GatewayInventoryItem, PaymentGatewayV2Metadata, RouterVisibility } from "@/types/payment-gateway-v2"
import { addRouter, deleteRouterV2 } from "@/lib/payment-gateway-v2-actions"
import { toast } from "sonner"
import { VisibilityRulesForm } from "./visibility-rules-form"
import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/safe-image"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface RouterDialogV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  metadata?: PaymentGatewayV2Metadata
  inventoryMetadata?: PaymentGatewayV2Metadata
  inventory: Record<string, GatewayInventoryItem>
  initialData: Router | null
}

const defaultVisibility: RouterVisibility = {
  enabled: true,
  priority: 1,
  timezone: "UTC",
}

const STRATEGIES = [
  {
    id: 'round_robin',
    label: 'Round Robin',
    description: 'Distributes traffic equally across all eligible members by taking turns.',
    icon: RefreshCw,
    details: (
      <div className="space-y-2 max-w-[280px]">
        <p className="font-bold text-primary">How it works:</p>
        <p>Distributes traffic equally across all eligible members using a modulo operation based on total group orders.</p>
        <div className="p-2 bg-muted rounded-md space-y-1">
          <p className="font-bold text-[10px] uppercase">Logic Example:</p>
          <p className="italic text-[10px]">3 gateways (A, B, C)</p>
          <ul className="text-[10px] space-y-0.5">
            <li>Order #1: 0 % 3 = 0 → Use A</li>
            <li>Order #2: 1 % 3 = 1 → Use B</li>
            <li>Order #3: 2 % 3 = 2 → Use C</li>
            <li>Order #4: 3 % 3 = 0 → Use A</li>
          </ul>
        </div>
        <p><strong>Best for:</strong> Perfectly equal distribution to keep volume balanced across accounts.</p>
      </div>
    )
  },
  {
    id: 'priority',
    label: 'Priority',
    description: 'Treats the list as a "failover" chain. Always tries the first gateway first.',
    icon: ArrowDown10,
    details: (
      <div className="space-y-2 max-w-[280px]">
        <p className="font-bold text-primary">How it works:</p>
        <p>It treats the members list as a sequential failover chain, always preferring the first available gateway.</p>
        <div className="p-2 bg-muted rounded-md space-y-1">
          <p className="font-bold text-[10px] uppercase">Logic Flow:</p>
          <ol className="text-[10px] list-decimal pl-4 space-y-1">
            <li>Check 1st member: Enabled & under quota?</li>
            <li>If Yes, use it.</li>
            <li>If No (e.g. hit $500 limit), move to 2nd member and check status.</li>
            <li>Repeat until an available member is found.</li>
          </ol>
        </div>
        <p><strong>Best for:</strong> Using a preferred account (e.g. lower fees) until it is full, then falling back.</p>
      </div>
    )
  },
  {
    id: 'weighted',
    label: 'Weighted',
    description: 'Distributes traffic based on custom percentages (%) assigned to each member.',
    icon: Scale,
    details: (
      <div className="space-y-2 max-w-[280px]">
        <p className="font-bold text-primary">How it works:</p>
        <p>Distributes traffic based on probability weights. The higher the weight, the more traffic a gateway receives.</p>
        <div className="p-2 bg-muted rounded-md space-y-1">
          <p className="font-bold text-[10px] uppercase">Logic Example:</p>
          <p className="text-[10px]">Gateway A (80), Gateway B (20)</p>
          <ul className="text-[10px] space-y-0.5">
            <li>System picks random number (1-100)</li>
            <li>1-80 → picks A</li>
            <li>81-100 → picks B</li>
          </ul>
        </div>
        <p><strong>Best for:</strong> Load balancing where one account has higher limits or is stronger than others.</p>
      </div>
    )
  },
]

const formSchema = z.object({
  label: z.string().min(1, "Group name is required"),
  mask_name: z.string().min(1, "Display name is required"),
  strategy: z.enum(['round_robin', 'priority', 'weighted']),
  members: z.array(z.string()).min(1, "At least one member is required"),
  visibility: z.object({
    enabled: z.boolean(),
    priority: z.number(),
    timezone: z.string(),
    date_start: z.string().optional(),
    date_end: z.string().optional(),
    days_of_week: z.array(z.number()).optional(),
    time_start: z.string().optional(),
    time_end: z.string().optional(),
    countries_allow: z.array(z.string()).optional(),
    countries_deny: z.array(z.string()).optional(),
    currencies_allow: z.array(z.string()).optional(),
    min_amount: z.number().optional(),
    max_amount: z.number().optional(),
    daily_amount_limit: z.number().optional(),
    monthly_amount_limit: z.number().optional(),
    daily_order_limit: z.number().optional(),
  }),
})

type FormValues = z.infer<typeof formSchema>

export function RouterDialogV2({ open, onOpenChange, metadata, inventoryMetadata, inventory, initialData }: RouterDialogV2Props) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const isEdit = !!initialData

  const formKey = React.useMemo(() => `${initialData?.uuid || "new"}-${open}`, [initialData?.uuid, open])

  const handleDelete = async () => {
    if (!initialData?.uuid) return
    if (!confirm("Are you sure you want to delete this router?")) return

    setIsDeleting(true)
    try {
      const res = await deleteRouterV2(initialData.uuid)
      if (res.status === "success") {
        toast.success("Router deleted")
        onOpenChange(false)
      } else {
        toast.error(res.message || "Failed to delete router")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>{isEdit ? "Edit Routing Policy" : "Add Routing Policy"}</DialogTitle>
          <DialogDescription>
            Group multiple gateways and define advanced visibility rules (Geo-fencing, Scheduling, Quotas) to optimize your checkout experience.
          </DialogDescription>
        </DialogHeader>

        <RouterFormInner
          key={formKey}
          initialData={initialData}
          inventory={inventory}
          metadata={metadata}
          inventoryMetadata={inventoryMetadata}
          onOpenChange={onOpenChange}
          isEdit={isEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </DialogContent>
    </Dialog>
  )
}

interface RouterFormInnerProps {
  initialData: Router | null
  inventory: Record<string, GatewayInventoryItem>
  metadata?: PaymentGatewayV2Metadata
  inventoryMetadata?: PaymentGatewayV2Metadata
  onOpenChange: (open: boolean) => void
  isEdit: boolean
  onDelete: () => Promise<void>
  isDeleting: boolean
}

function RouterFormInner({ initialData, inventory, metadata, inventoryMetadata, onOpenChange, isEdit, onDelete, isDeleting }: RouterFormInnerProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      label: initialData.label,
      mask_name: initialData.mask_name,
      strategy: initialData.strategy,
      members: initialData.members,
      visibility: initialData.visibility,
    } : {
      label: "",
      mask_name: "",
      strategy: 'round_robin',
      members: [],
      visibility: defaultVisibility,
    },
  })

  // Use a stable onChange for members to avoid re-renders of the whole dialog
  const handleMembersChange = React.useCallback((newMembers: string[]) => {
    form.setValue("members", newMembers, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
  }, [form])

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const res = await addRouter({
        uuid: initialData?.uuid,
        ...values
      })
      if (res.status === "success") {
        toast.success(isEdit ? "Router updated" : "Router added")
        onOpenChange(false)
      } else {
        toast.error(res.message || "Failed to save router")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibilityEnabled = useWatch({
    control: form.control,
    name: "visibility.enabled"
  })

  const strategy = useWatch({
    control: form.control,
    name: "strategy"
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="general" className="rounded-md data-[state=active]:shadow-sm">
                <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="logic" className="rounded-md data-[state=active]:shadow-sm relative">
                <Activity className="h-3.5 w-3.5 mr-2" />
                Availability Rules
                {visibilityEnabled && (
                  <Badge variant="success" className="ml-2 h-4 px-1.5 text-[9px] uppercase font-black bg-success text-success-foreground border-none shadow-sm animate-pulse">
                    Active
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <TabsContent value="general" className="m-0 p-6 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              <FormField
                control={form.control}
                name="visibility.enabled"
                render={({ field }) => (
                  <FormItem className={cn(
                    "flex flex-row items-center justify-between rounded-xl border p-4 transition-all duration-300",
                    field.value
                      ? "bg-success/5 border-success/20 shadow-sm"
                      : "bg-muted/30 border-muted-foreground/10"
                  )}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          field.value ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                        )}>
                          <Activity className="h-4 w-4" />
                        </div>
                        <FormLabel className="text-sm font-bold tracking-tight cursor-pointer">
                          Enable Routing Policy
                        </FormLabel>
                        <Badge
                          variant={field.value ? "success" : "secondary"}
                          className="ml-2 h-4 px-1.5 text-[9px] uppercase font-black"
                        >
                          {field.value ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <FormDescription className="text-[11px] text-muted-foreground">
                        Is this router currently active and ready for use?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-success"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Card Processing Pool" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mask_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checkout Display Name (Mask)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pay by Card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Selection Strategy</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <TooltipProvider>
                        {STRATEGIES.map((s) => {
                          const isSelected = field.value === s.id
                          const Icon = s.icon
                          return (
                            <div
                              key={s.id}
                              className={cn(
                                "relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md gap-3",
                                isSelected
                                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                                  : "bg-background border-border hover:border-primary/30"
                              )}
                              onClick={() => field.onChange(s.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className={cn(
                                  "p-2 rounded-lg border transition-colors",
                                  isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border group-hover:border-primary/30"
                                )}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="p-4 bg-popover text-popover-foreground shadow-xl border-primary/20 border-2">
                                      {s.details}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className={cn(
                                  "text-sm font-bold transition-colors",
                                  isSelected ? "text-primary" : "text-foreground"
                                )}>
                                  {s.label}
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  {s.description}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <GatewaySelector
                    inventory={inventory}
                    inventoryMetadata={inventoryMetadata}
                    selectedMembers={field.value || []}
                    onChange={handleMembersChange}
                    strategy={strategy}
                  />
                )}
              />
            </TabsContent>

            <TabsContent value="logic" className="m-0 p-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <VisibilityRulesForm
                    value={field.value ?? defaultVisibility}
                    onChange={field.onChange}
                    metadata={metadata}
                  />
                )}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 pt-4 border-t bg-background shrink-0 gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Policy" : "Save Policy"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

interface GatewaySelectorProps {
  inventory: Record<string, GatewayInventoryItem>
  inventoryMetadata?: PaymentGatewayV2Metadata
  selectedMembers: string[]
  onChange: (value: string[]) => void
  strategy?: string
}

function SortableMemberItem({
  id,
  item,
  providerName,
  onRemove
}: {
  id: string,
  item: GatewayInventoryItem,
  providerName: string,
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border bg-background transition-all shadow-sm",
        isDragging ? "opacity-50 scale-[1.02] shadow-lg border-primary" : "border-border hover:border-primary/30"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded text-muted-foreground transition-colors shrink-0">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className={cn(
        "relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border p-1.5 transition-colors bg-muted/20 border-border"
      )}>
        <SafeImage
          src={`/logos/${item.type}.svg`}
          alt={item.type}
          fill
          className="object-contain"
          fallbackIcon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <div className="min-w-0 flex flex-col flex-1 text-left">
        <span className="text-sm font-bold truncate">{item.label || providerName}</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">{providerName}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {item.limits?.daily_amount_limit !== undefined && item.limits.daily_amount_limit > 0 && (
          <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold border-primary/20 bg-primary/5 text-primary whitespace-nowrap">
            ${item.limits.daily_amount_limit.toLocaleString()} / Day
          </Badge>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function GatewaySelector({
  inventory,
  inventoryMetadata,
  selectedMembers,
  onChange,
  strategy
}: GatewaySelectorProps) {
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = selectedMembers.indexOf(active.id as string)
      const newIndex = selectedMembers.indexOf(over.id as string)
      onChange(arrayMove(selectedMembers, oldIndex, newIndex))
    }
  }

  // Determine if a type is already "locked" because members are selected
  const lockedType = React.useMemo(() => {
    if (selectedMembers.length === 0) return null
    const firstMemberId = selectedMembers[0]
    return inventory[firstMemberId]?.type || null
  }, [selectedMembers, inventory])

  // If a type is locked, force the filter to that type
  React.useEffect(() => {
    if (lockedType) {
      setTypeFilter(lockedType)
    }
  }, [lockedType])

  const availableTypes = React.useMemo(() => {
    const types = new Set<string>()
    Object.values(inventory).forEach(item => types.add(item.type))
    return Array.from(types).sort()
  }, [inventory])

  const availableGateways = React.useMemo(() => {
    const s = search.toLowerCase()
    return Object.entries(inventory).filter(([uuid, item]) => {
      const itemUuid = item.uuid || uuid
      // Don't show already selected gateways in available list
      if (selectedMembers.includes(itemUuid)) return false

      const providerName = inventoryMetadata?.inventory_config[item.type]?.name || item.type
      const itemName = item.label || providerName

      const matchesSearch = (
        itemName.toLowerCase().includes(s) ||
        item.type.toLowerCase().includes(s) ||
        itemUuid.toLowerCase().includes(s)
      )

      // If locked, only show locked type. Otherwise follow typeFilter.
      const matchesType = lockedType ? item.type === lockedType : (typeFilter === "all" || item.type === typeFilter)

      return matchesSearch && matchesType
    })
  }, [inventory, inventoryMetadata, search, typeFilter, lockedType, selectedMembers])

  const toggleMember = React.useCallback((uuid: string) => {
    if (selectedMembers.includes(uuid)) {
      onChange(selectedMembers.filter((id) => id !== uuid))
    } else {
      onChange([...selectedMembers, uuid])
    }
  }, [selectedMembers, onChange])

  return (
    <FormItem>
      <div className="space-y-6">
        {/* Selected Members Section */}
        {selectedMembers.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                Selected Members ({selectedMembers.length})
              </Label>
              {strategy === 'priority' && (
                <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 border-primary/20 text-primary">
                  <ArrowUpDown className="h-2 w-2 mr-1" />
                  Order defines failover priority
                </Badge>
              )}
              {strategy === 'round_robin' && (
                <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 border-primary/20 text-primary">
                  <RefreshCw className="h-2 w-2 mr-1" />
                  Order defines rotation sequence
                </Badge>
              )}
              {strategy === 'weighted' && (
                <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 border-primary/20 text-primary">
                  <Scale className="h-2 w-2 mr-1" />
                  Order defines probability ranges
                </Badge>
              )}
            </div>

            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 shadow-inner">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedMembers}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedMembers.map((id) => {
                      const item = inventory[id]
                      if (!item) return null
                      const providerName = inventoryMetadata?.inventory_config[item.type]?.name || item.type
                      return (
                        <SortableMemberItem
                          key={id}
                          id={id}
                          item={item}
                          providerName={providerName}
                          onRemove={toggleMember}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}

        {/* Available Members Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Available Gateways
            </Label>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter} disabled={!!lockedType}>
                <SelectTrigger className={cn(
                  "h-7 text-[10px] min-w-[120px] w-full sm:w-[140px]",
                  lockedType && "bg-primary/5 border-primary/20 text-primary font-bold"
                )}>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {inventoryMetadata?.inventory_config[type]?.name || type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search gateways..."
                  className="h-7 pl-7 text-[10px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {lockedType && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[10px] text-primary font-medium animate-in fade-in slide-in-from-top-1">
              <Activity className="h-3 w-3" />
              <span>Selection restricted to <strong>{inventoryMetadata?.inventory_config[lockedType]?.name || lockedType.toUpperCase()}</strong> gateways only.</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto rounded-xl border bg-muted/30 p-4 shadow-inner">
            {availableGateways.map(([uuid, item]) => {
              const itemUuid = item.uuid || uuid
              const providerName = inventoryMetadata?.inventory_config[item.type]?.name || item.type
              return (
                <div
                  key={itemUuid}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleMember(itemUuid)
                  }}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-muted/20 p-1.5 group-hover:bg-background transition-colors">
                    <SafeImage
                      src={`/logos/${item.type}.svg`}
                      alt={item.type}
                      fill
                      className="object-contain"
                      fallbackIcon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
                    />
                  </div>
                  <div className="min-w-0 flex flex-col flex-1 text-left">
                    <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.label || providerName}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight opacity-70">{providerName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.limits?.daily_amount_limit !== undefined && item.limits.daily_amount_limit > 0 && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold border-primary/20 bg-primary/5 text-primary whitespace-nowrap">
                        ${item.limits.daily_amount_limit.toLocaleString()} / Day
                      </Badge>
                    )}
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )
            })}
            {availableGateways.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-2">
                <Sliders className="h-8 w-8 opacity-10" />
                {Object.values(inventory).length === 0
                  ? "No payment gateways found. Add them first."
                  : search || typeFilter !== "all"
                    ? "No gateways match your filters."
                    : "No more available gateways of this type."}
              </div>
            )}
          </div>
        </div>
        <FormMessage />
      </div>
    </FormItem>
  )
}
