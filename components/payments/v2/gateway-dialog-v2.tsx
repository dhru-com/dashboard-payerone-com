"use client"

import * as React from "react"
import { useForm, useWatch, Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, HelpCircle, Sliders, Percent, CircleDollarSign, Ban, Activity, Search, ArrowLeft, QrCode } from "lucide-react"
import { toast } from "sonner"
import { SafeImage } from "@/components/safe-image"
import jsQR from "jsqr"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PaymentGatewayV2Metadata, GatewayInventoryItem } from "@/types/payment-gateway-v2"
import { addGateway, deleteGatewayV2 } from "@/lib/payment-gateway-v2-actions"
import { cn } from "@/lib/utils"

interface GatewayDialogV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  metadata?: PaymentGatewayV2Metadata
  initialData: GatewayInventoryItem | null
}

const decodeBase64 = (str: string) => {
  try {
    return atob(str)
  } catch {
    return str
  }
}

const formSchema = z.object({
  type: z.string().min(1, "Provider type is required"),
  config: z.record(z.string(), z.any()),
  limits: z.object({
    daily_amount_limit: z.number().min(0),
    daily_order_limit: z.number().min(0),
    monthly_amount_limit: z.number().min(0),
  }),
})

type FormValues = z.infer<typeof formSchema>

export function GatewayDialogV2({ open, onOpenChange, metadata, initialData }: GatewayDialogV2Props) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const isEdit = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      config: {},
      limits: {
        daily_amount_limit: 0,
        daily_order_limit: 0,
        monthly_amount_limit: 0,
      },
    },
  })

  const selectedType = useWatch({
    control: form.control,
    name: "type"
  })
  const currentMetadata = metadata?.inventory_config?.[selectedType]

  const initializedUuid = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      initializedUuid.current = null
      return
    }

    const currentUuid = initialData?.uuid || "new"
    if (initializedUuid.current !== currentUuid) {
      const newValues = initialData
        ? {
            type: initialData.type,
            config: initialData.config || {},
            limits: {
              daily_amount_limit: initialData.limits?.daily_amount_limit || initialData.limits?.daily_total_amount || 0,
              daily_order_limit: initialData.limits?.daily_order_limit || initialData.limits?.daily_order_count || 0,
              monthly_amount_limit: initialData.limits?.monthly_amount_limit || initialData.limits?.monthly_total_amount || 0,
            },
          }
        : {
            type: "",
            config: {},
            limits: {
              daily_amount_limit: 0,
              daily_order_limit: 0,
              monthly_amount_limit: 0,
            },
          }

      const timer = setTimeout(() => {
        form.reset(newValues)
        initializedUuid.current = currentUuid
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialData, open, form])

  // Update config default values when type changes in Add mode
  const lastSelectedType = React.useRef<string>("")
  React.useEffect(() => {
    if (!open || isEdit || !selectedType || !metadata?.inventory_config[selectedType]) {
      if (!open) lastSelectedType.current = ""
      return
    }

    if (lastSelectedType.current !== selectedType) {
      const configMetadata = metadata.inventory_config[selectedType].config
      const defaultConfig: Record<string, unknown> = {}

      Object.entries(configMetadata).forEach(([key, field]) => {
        let defaultValue: unknown
        if (field.type === "checkbox") {
          defaultValue = false
        } else if (field.type === "float") {
          defaultValue = 0
        } else {
          defaultValue = ""
        }
        defaultConfig[key] = defaultValue
      })

      const currentConfig = form.getValues("config")
      if (JSON.stringify(currentConfig) !== JSON.stringify(defaultConfig)) {
        form.setValue("config", defaultConfig, { shouldDirty: false })
      }
      lastSelectedType.current = selectedType
    }
  }, [selectedType, isEdit, metadata, open, form])

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const res = await addGateway({
        uuid: initialData?.uuid,
        ...values
      })
      if (res.status === "success") {
        toast.success(isEdit ? "Gateway updated" : "Gateway added")
        onOpenChange(false)
      } else {
        toast.error(res.message || "Failed to save gateway")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.uuid) return
    if (!confirm("Are you sure you want to delete this gateway?")) return

    setIsDeleting(true)
    try {
      const res = await deleteGatewayV2(initialData.uuid)
      if (res.status === "success") {
        toast.success("Gateway deleted")
        onOpenChange(false)
      } else {
        toast.error(res.message || "Failed to delete gateway")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: Path<FormValues>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear the input value to allow the same file to be uploaded again
    e.target.value = ""

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageData = event.target?.result as string
      const image = new Image()
      image.src = imageData
      image.onload = () => {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (!context) return

        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(image, 0, 0)

        let currentImgData = context.getImageData(0, 0, canvas.width, canvas.height)
        let bestCode: any = null
        let maxArea = 0

        // Find all QR codes (limited to 10 for safety)
        for (let i = 0; i < 10; i++) {
          const code = jsQR(currentImgData.data, currentImgData.width, currentImgData.height)
          if (!code) break

          // Calculate area (shoelace formula)
          const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = code.location
          const area = Math.abs(
            (topLeftCorner.x * topRightCorner.y + topRightCorner.x * bottomRightCorner.y + bottomRightCorner.x * bottomLeftCorner.y + bottomLeftCorner.x * topLeftCorner.y) -
            (topLeftCorner.y * topRightCorner.x + topRightCorner.y * bottomRightCorner.x + bottomRightCorner.y * bottomLeftCorner.x + bottomLeftCorner.y * topLeftCorner.x)
          ) / 2

          if (area > maxArea) {
            maxArea = area
            bestCode = code
          }

          // Mask the detected QR code with white to find others
          context.fillStyle = "white"
          context.beginPath()
          context.moveTo(topLeftCorner.x, topLeftCorner.y)
          context.lineTo(topRightCorner.x, topRightCorner.y)
          context.lineTo(bottomRightCorner.x, bottomRightCorner.y)
          context.lineTo(bottomLeftCorner.x, bottomLeftCorner.y)
          context.closePath()
          context.fill()

          currentImgData = context.getImageData(0, 0, canvas.width, canvas.height)
        }

        if (bestCode) {
          // Use type assertion to bypass strict path checking for dynamic config keys
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form.setValue(fieldName, bestCode.data as string as any, { shouldValidate: true })
          toast.success("QR Code decoded successfully")
        } else {
          toast.error("Could not find a valid QR code in the image")
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const renderField = (key: string, field: { name: string; type: string; required?: boolean; description?: string; enum_options?: string[] }, customClassName?: string) => {
    const fieldName = `config.${key}` as Path<FormValues>
    const isPercent = key.toLowerCase().includes('percent') || field.name.includes('%') || field.name.toLowerCase().includes('percentage');
    const isFixed = key.toLowerCase().includes('fixed') || field.name.toLowerCase().includes('fixed');
    const isFee = key.toLowerCase().includes('fee') || field.name.toLowerCase().includes('fee');

    switch (field.type) {
      case "string":
      case "float":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className={customClassName}>
                <FormLabel className="text-xs font-medium text-muted-foreground/80">
                  {field.name}{field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      type={field.type === "float" ? "number" : "text"}
                      step={field.type === "float" ? "any" : undefined}
                      className={cn(
                        "h-9 transition-all focus-visible:ring-1",
                        isPercent && field.type === "float" && "pr-8",
                        isFixed && field.type === "float" && "pl-8",
                        isFee && "border-primary/20 group-hover:border-primary/40"
                      )}
                      {...formField}
                      value={(formField.value as string | number) ?? ""}
                      onChange={(e) => {
                        const val = field.type === "float" ? parseFloat(e.target.value) || 0 : e.target.value
                        formField.onChange(val)
                      }}
                    />
                    {isPercent && field.type === "float" && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Percent className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {isFixed && field.type === "float" && (
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <CircleDollarSign className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </FormControl>
                {field.description && (
                  <FormDescription className="text-[11px] leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: decodeBase64(field.description) }} />
                  </FormDescription>
                )}
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        )
      case "checkbox":
        const isDisableToggle = key.toLowerCase() === 'disable' || key.toLowerCase() === 'disabled';
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className={cn(
                "flex flex-row items-center justify-between rounded-xl border p-4 transition-all",
                isDisableToggle
                  ? (formField.value ? "bg-destructive/5 border-destructive/20" : "bg-success/5 border-success/20")
                  : "bg-muted/5 hover:bg-muted/10"
              )}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isDisableToggle ? (
                      formField.value ? <Ban className="h-4 w-4 text-destructive" /> : null
                    ) : null}
                    <FormLabel className="text-sm font-semibold cursor-pointer">
                      {isDisableToggle ? "Status" : field.name}
                    </FormLabel>
                    {isDisableToggle && (
                      <Badge variant={formField.value ? "destructive" : "success"} className="ml-2 text-[10px] h-4 px-1.5 uppercase font-bold">
                        {formField.value ? "Disabled" : "Active"}
                      </Badge>
                    )}
                  </div>
                  {field.description && (
                    <FormDescription className="text-xs max-w-[80%]">
                      <span dangerouslySetInnerHTML={{ __html: decodeBase64(field.description) }} />
                    </FormDescription>
                  )}
                </div>
                <FormControl>
                  {isDisableToggle ? (
                    <Switch
                      checked={!(formField.value as boolean)}
                      onCheckedChange={(val) => formField.onChange(!val)}
                      className="data-[state=checked]:bg-success"
                    />
                  ) : (
                    <Checkbox
                      checked={formField.value as boolean}
                      onCheckedChange={formField.onChange}
                    />
                  )}
                </FormControl>
              </FormItem>
            )}
          />
        )
      case "qr_reader":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className={customClassName}>
                <FormLabel className="text-xs font-medium text-muted-foreground/80">
                  {field.name}{field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter QR Code URL or upload image"
                        {...formField}
                        value={(formField.value as string) ?? ""}
                        className="flex-1 h-9"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`qr-upload-${key}`}
                          onChange={(e) => handleQrUpload(e, fieldName)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => document.getElementById(`qr-upload-${key}`)?.click()}
                          title="Upload QR Image"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </FormControl>
                {field.description && (
                  <FormDescription className="text-[11px] leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: decodeBase64(field.description) }} />
                  </FormDescription>
                )}
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        )
      case "enum":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground/80">
                  {field.name}{field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value as string || ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${field.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.enum_options?.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription className="text-[11px]">
                    <span dangerouslySetInnerHTML={{ __html: decodeBase64(field.description) }} />
                  </FormDescription>
                )}
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        )
      default:
        return null
    }
  }

  const [providerSearch, setProviderSearch] = React.useState("")
  const [step, setStep] = React.useState<1 | 2>(1)

  React.useEffect(() => {
    if (open) {
      setStep(initialData ? 2 : 1)
      setProviderSearch("")
    }
  }, [open, initialData])

  const providers = React.useMemo(() => metadata?.inventory_config ? Object.keys(metadata.inventory_config) : [], [metadata])
  const filteredProviders = React.useMemo(() => {
    return providers.filter(p => {
      const name = metadata?.inventory_config[p].name || p
      return name.toLowerCase().includes(providerSearch.toLowerCase())
    })
  }, [providers, providerSearch, metadata])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            {!isEdit && step === 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>{isEdit ? "Edit Gateway" : step === 1 ? "Select Provider" : "Configure Gateway"}</DialogTitle>
          </div>
          <DialogDescription className={cn(!isEdit && step === 2 && "pl-11")}>
            {isEdit
              ? "Update your payment gateway configuration and limits."
              : step === 1
                ? "Choose a payment provider to continue."
                : `Configure credentials for ${currentMetadata?.name || selectedType}.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto pb-6">
              <div className="space-y-6 pt-6 px-6">
                {!isEdit && step === 1 && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                          <FormLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                            Available Providers
                          </FormLabel>
                          <div className="relative w-full sm:w-48">
                            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search providers..."
                              className="h-7 pl-7 text-[10px]"
                              value={providerSearch}
                              onChange={(e) => setProviderSearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto rounded-xl border bg-muted/30 p-4 shadow-inner">
                          {filteredProviders.map((p) => {
                            const isSelected = field.value === p
                            return (
                              <div
                                key={p}
                                className={cn(
                                  "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md h-28 text-center gap-3",
                                  isSelected
                                    ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                                    : "bg-background border-border hover:border-primary/30"
                                )}
                                onClick={() => {
                                  field.onChange(p)
                                  setStep(2)
                                }}
                              >
                                <div className={cn(
                                  "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition-colors p-2",
                                  isSelected ? "bg-background border-primary/20" : "bg-muted/50 border-border"
                                )}>
                                  <SafeImage
                                    src={`/logos/${p}.svg`}
                                    alt={p}
                                    fill
                                    className="object-contain"
                                    fallbackIcon={<HelpCircle className="h-6 w-6 text-muted-foreground" />}
                                  />
                                </div>
                                <span className={cn(
                                  "text-xs font-bold leading-tight transition-colors line-clamp-2",
                                  isSelected ? "text-primary" : "text-foreground"
                                )}>
                                  {metadata?.inventory_config[p].name || p}
                                </span>
                              </div>
                            )
                          })}
                          {filteredProviders.length === 0 && (
                            <div className="col-span-full py-8 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 opacity-10" />
                              No providers match your search.
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {((isEdit) || (!isEdit && step === 2)) && selectedType && currentMetadata && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    <div className="rounded-lg bg-muted/50 p-4 text-sm flex items-start gap-4 border">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-background p-2 shadow-sm">
                        <SafeImage
                          src={`/logos/${selectedType}.svg`}
                          alt={selectedType}
                          fill
                          className="object-contain"
                          fallbackIcon={<HelpCircle className="h-full w-full text-muted-foreground" />}
                        />
                      </div>
                      <div className="flex-1 leading-relaxed">
                        <span dangerouslySetInnerHTML={{ __html: decodeBase64(currentMetadata.description) }} />
                      </div>
                    </div>

                    <Tabs defaultValue="config" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted/50 rounded-lg">
                        <TabsTrigger value="config" className="rounded-md data-[state=active]:shadow-sm">
                          <Sliders className="h-3.5 w-3.5 mr-2" />
                          Configuration
                        </TabsTrigger>
                        <TabsTrigger value="limits" className="rounded-md data-[state=active]:shadow-sm">
                          <Activity className="h-3.5 w-3.5 mr-2" />
                          Limits
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="config" className="mt-4 space-y-6">
                        {(() => {
                          const entries = Object.entries(currentMetadata.config);
                          const rendered = new Set<string>();

                          // First, render the disable toggle if it exists
                          const disableField = entries.find(([key]) => key.toLowerCase() === 'disable' || key.toLowerCase() === 'disabled');
                          const statusSection = disableField ? renderField(disableField[0], disableField[1]) : null;
                          if (disableField) rendered.add(disableField[0]);

                          const content = entries.map(([key, field]) => {
                            if (rendered.has(key)) return null;

                            const isFee = key.toLowerCase().includes('fee') || field.name.toLowerCase().includes('fee');
                            const isPercent = key.toLowerCase().includes('percent') || field.name.includes('%') || field.name.toLowerCase().includes('percentage');
                            const isFixed = key.toLowerCase().includes('fixed') || field.name.toLowerCase().includes('fixed');

                            if (isFee && (isPercent || isFixed)) {
                              const pair = entries.find(([k, f]) => {
                                if (rendered.has(k)) return false;
                                const kLower = k.toLowerCase();
                                const fLower = f.name.toLowerCase();
                                const isOtherFee = kLower.includes('fee') || fLower.includes('fee');
                                if (!isOtherFee) return false;
                                if (isPercent) {
                                  return kLower.includes('fixed') || fLower.includes('fixed');
                                } else {
                                  return kLower.includes('percent') || fLower.includes('%') || fLower.includes('percentage');
                                }
                              });

                              if (pair) {
                                rendered.add(key);
                                rendered.add(pair[0]);

                                const percentEntry = isPercent ? [key, field] : pair;
                                const fixedEntry = isPercent ? pair : [key, field];

                                return (
                                  <div key={`${key}-${pair[0]}`} className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-primary/5 border-primary/10">
                                    <div className="col-span-2 flex items-center gap-2 mb-1">
                                      <div className="h-6 w-1 rounded-full bg-primary" />
                                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">Transaction Fees</h4>
                                    </div>
                                    {renderField(percentEntry[0] as string, percentEntry[1] as { name: string; type: string; required?: boolean; description?: string; enum_options?: string[] }, "space-y-1.5")}
                                    {renderField(fixedEntry[0] as string, fixedEntry[1] as { name: string; type: string; required?: boolean; description?: string; enum_options?: string[] }, "space-y-1.5")}
                                  </div>
                                );
                              }
                            }

                            rendered.add(key);
                            return renderField(key, field);
                          });

                          return [statusSection, ...content];
                        })()}
                      </TabsContent>

                      <TabsContent value="limits" className="mt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="limits.daily_amount_limit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Daily Amount Limit</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                      <CircleDollarSign className="h-3.5 w-3.5" />
                                    </div>
                                    <Input
                                      type="number"
                                      className="pl-8"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="limits.monthly_amount_limit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monthly Amount Limit</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                      <CircleDollarSign className="h-3.5 w-3.5" />
                                    </div>
                                    <Input
                                      type="number"
                                      className="pl-8"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="limits.daily_order_limit"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Daily Order Limit</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t bg-background shrink-0 gap-2">
              {initialData && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              {(!isEdit && step === 1) ? (
                <Button
                  type="button"
                  disabled={!selectedType}
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || isDeleting || !selectedType}>
                  {isSubmitting ? "Saving..." : isEdit ? "Update Gateway" : "Save Gateway"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
