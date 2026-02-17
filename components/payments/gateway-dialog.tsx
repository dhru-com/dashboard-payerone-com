/**
 * @deprecated This component is part of the legacy Payment Gateways V1.
 * All future development should be done in the V2 components located in /components/payments/v2/
 */
"use client"

import * as React from "react"
import { useForm, Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Trash2, Upload, HelpCircle, Eye, Calendar, Clock, LayoutGrid, Sliders, Percent, CircleDollarSign, Ban, CheckCircle2, Activity } from "lucide-react"
import { toast } from "sonner"
import { SafeImage } from "@/components/safe-image"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
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
import { Check, ChevronsUpDown, QrCode, Info } from "lucide-react"
import jsQR from "jsqr"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ActivatedGateway, PaymentGatewayMetadata, PaymentGatewayConfigField, Visibility } from "@/types/payment-gateway"
import { addPaymentGateway, updatePaymentGateway, deletePaymentGateway } from "@/lib/payment-gateway-actions"

interface GatewayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metadata: Record<string, PaymentGatewayMetadata>
  initialData?: { uuid: string; gateway: ActivatedGateway } | null
  readOnly?: boolean
}

const decodeBase64 = (str: string) => {
  try {
    return atob(str)
  } catch (e) {
    return str
  }
}

export function GatewayDialog({ open, onOpenChange, metadata, initialData, readOnly = false }: GatewayDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const isEdit = !!initialData

  const gatewayTypes = Object.keys(metadata)

  type FormValues = {
    type: string
    config: Record<string, unknown>
    visibility: Visibility
  }

  const form = useForm<FormValues>({
    defaultValues: {
      type: "",
      config: {},
      visibility: {
        enabled: false,
        date_start: "",
        date_end: "",
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        time_start: "",
        time_end: "",
        min_amount: 0,
        max_amount: 0,
      },
    },
  })

  const selectedType = form.watch("type")
  const visibilityEnabled = form.watch("visibility.enabled")
  const currentMetadata = metadata[selectedType]

  // Control the accordion value
  const [accordionValue, setAccordionValue] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    if (visibilityEnabled) {
      setAccordionValue("availability")
    }
  }, [visibilityEnabled])

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.gateway.type,
        config: initialData.gateway.config,
        visibility: initialData.gateway.visibility || {
          enabled: false,
          date_start: "",
          date_end: "",
          days_of_week: [0, 1, 2, 3, 4, 5, 6],
          time_start: "",
          time_end: "",
          min_amount: 0,
          max_amount: 0,
        },
      })
    } else {
      form.reset({
        type: "",
        config: {},
        visibility: {
          enabled: false,
          date_start: "",
          date_end: "",
          days_of_week: [0, 1, 2, 3, 4, 5, 6],
          time_start: "",
          time_end: "",
          min_amount: 0,
          max_amount: 0,
        },
      })
    }
  }, [initialData, form, open])

  // Update config default values when type changes in Add mode
  React.useEffect(() => {
    if (!isEdit && selectedType && metadata[selectedType]) {
      const defaultConfig: Record<string, unknown> = {}
      Object.entries(metadata[selectedType].config).forEach(([key, field]) => {
        if (field.type === "checkbox") {
          defaultConfig[key] = false
        } else if (field.type === "float") {
          defaultConfig[key] = "0"
        } else {
          defaultConfig[key] = ""
        }
      })
      form.setValue("config", defaultConfig)
    }
  }, [selectedType, isEdit, metadata, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const result = isEdit
        ? await updatePaymentGateway(initialData!.uuid, values)
        : await addPaymentGateway(values)

      if (result && result.status === "success") {
        toast.success(isEdit ? "Gateway updated successfully" : "Gateway added successfully")
        onOpenChange(false)
      } else {
        toast.error(result?.message || `Failed to ${isEdit ? "update" : "add"} gateway`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData) return

    setIsDeleting(true)
    try {
      const result = await deletePaymentGateway(initialData.uuid)
      if (result && result.status === "success") {
        toast.success("Gateway deleted successfully")
        setIsDeleteDialogOpen(false)
        onOpenChange(false)
      } else {
        toast.error(result?.message || "Failed to delete gateway")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
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

  const renderField = (key: string, field: PaymentGatewayConfigField, customClassName?: string) => {
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
            rules={{ required: field.required }}
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
                      readOnly={readOnly}
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
                      formField.value ? <Ban className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-success" />
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
                      disabled={readOnly}
                    />
                  ) : (
                    <Checkbox
                      checked={formField.value as boolean}
                      onCheckedChange={formField.onChange}
                      disabled={readOnly}
                    />
                  )}
                </FormControl>
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
            rules={{ required: field.required }}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.name}{field.required && <span className="text-destructive ml-1">*</span>}</FormLabel>
                <Select onValueChange={formField.onChange} value={formField.value as string} disabled={readOnly}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <div className="p-1">
                      <Input
                        placeholder={`Search ${field.name.toLowerCase()}...`}
                        className="h-8 mb-1"
                        onChange={(e) => {
                          const search = e.target.value.toLowerCase()
                          const items = e.target.closest('[data-slot="select-content"]')?.querySelectorAll('[data-slot="select-item"]')
                          items?.forEach((item) => {
                            const text = item.textContent?.toLowerCase() || ""
                            if (text.includes(search)) {
                              (item as HTMLElement).style.display = "flex"
                            } else {
                              (item as HTMLElement).style.display = "none"
                            }
                          })
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {field.enum_options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>
                    <span dangerouslySetInnerHTML={{ __html: decodeBase64(field.description) }} />
                  </FormDescription>
                )}
                <FormMessage />
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
            rules={{ required: field.required }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && <span className="text-destructive ml-1">*</span>}</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter QR Code URL or upload image"
                        {...formField}
                        value={(formField.value as string) ?? ""}
                        className="flex-1"
                        readOnly={readOnly}
                      />
                      {!readOnly && (
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
                            onClick={() => document.getElementById(`qr-upload-${key}`)?.click()}
                            title="Upload QR Image"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </FormControl>
                {field.description && (
                  <FormDescription>
                    <span dangerouslySetInnerHTML={{ __html: decodeBase64(field.description) }} />
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>{isEdit ? "Edit Gateway" : "Add Gateway"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your payment gateway configuration."
              : "Choose a gateway type and configure it."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto pb-20">
              <div className="space-y-6 pt-6">
                {!isEdit && (
                  <div className="px-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gateway Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isEdit || readOnly}
                          >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gateway type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <div className="p-1">
                                  <Input
                                    placeholder="Search gateway type..."
                                    className="h-8 mb-1"
                                    onChange={(e) => {
                                      const search = e.target.value.toLowerCase()
                                      const items = document.querySelectorAll('[data-slot="select-item"]')
                                      items.forEach((item) => {
                                        const text = item.textContent?.toLowerCase() || ""
                                        if (text.includes(search)) {
                                          (item as HTMLElement).style.display = "flex"
                                        } else {
                                          (item as HTMLElement).style.display = "none"
                                        }
                                      })
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {gatewayTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                      <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-sm border bg-muted/50 p-0.5">
                                        <SafeImage
                                          src={`/logos/${type}.svg`}
                                          alt={type}
                                          fill
                                          className="object-contain"
                                          fallbackIcon={<HelpCircle className="h-3 w-3 text-muted-foreground" />}
                                        />
                                      </div>
                                      <span>{metadata[type].name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                )}

                {selectedType && currentMetadata && (
                  <>
                    <div className="px-6">
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
                    </div>

                    <Tabs defaultValue="config" className="w-full">
                      <div className="px-6">
                      <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted/50 rounded-lg">
                          <TabsTrigger value="config" className="rounded-md data-[state=active]:shadow-sm">
                            <Sliders className="h-3.5 w-3.5 mr-2" />
                            Configuration
                          </TabsTrigger>
                          <TabsTrigger value="availability" className="rounded-md data-[state=active]:shadow-sm relative">
                            <Calendar className="h-3.5 w-3.5 mr-2" />
                            Availability
                            {visibilityEnabled && (
                              <Badge variant="success" className="ml-2 h-4 px-1 text-[10px] absolute -top-1 -right-1 border-2 border-background">Active</Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>
                      </div>

                    <TabsContent value="config" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="p-6">
                        <div className="space-y-6">
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
                                  // Find if there's a counterpart
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
                                        {renderField(percentEntry[0] as string, percentEntry[1] as PaymentGatewayConfigField, "space-y-1.5")}
                                        {renderField(fixedEntry[0] as string, fixedEntry[1] as PaymentGatewayConfigField, "space-y-1.5")}
                                        <p className="col-span-2 text-[10px] text-muted-foreground italic">
                                          These fees will be applied to each transaction processed through this gateway.
                                        </p>
                                      </div>
                                    );
                                  }
                                }

                                rendered.add(key);
                                return renderField(key, field);
                              });

                              return [statusSection, ...content];
                            })()}
                          </div>
                        </div>
                      </TabsContent>

                    <TabsContent value="availability" className="mt-0 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="space-y-6 p-6">
                        <div className="space-y-6">
                            <div className={cn(
                              "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                              visibilityEnabled
                                ? "bg-success/5 border-success/20 shadow-sm"
                                : "bg-muted/30 border-muted-foreground/10"
                            )}>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "p-1.5 rounded-lg",
                                    visibilityEnabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                                  )}>
                                    <Activity className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold text-sm tracking-tight">Availability Rules</span>
                                  <Badge
                                    variant={visibilityEnabled ? "success" : "secondary"}
                                    className="ml-2 h-4 px-1.5 text-[9px] uppercase font-black"
                                  >
                                    {visibilityEnabled ? "Enabled" : "Disabled"}
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground ml-8">
                                  {visibilityEnabled
                                    ? "Gateway will only be shown when criteria are met."
                                    : "Availability rules are currently inactive."}
                                </p>
                              </div>
                              <FormField
                                control={form.control}
                                name="visibility.enabled"
                                render={({ field }) => (
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-success"
                                      disabled={readOnly}
                                    />
                                  </FormControl>
                                )}
                              />
                            </div>

                            {!visibilityEnabled && (
                              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-3 items-start animate-in fade-in slide-in-from-top-1">
                                <div className="p-1 rounded-full bg-primary/20 text-primary shrink-0 mt-0.5">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-primary/80 leading-none">Need more control?</p>
                                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Enable availability rules to restrict this gateway to specific dates, times, or transaction amounts.
                                  </p>
                                </div>
                              </div>
                            )}

                            {visibilityEnabled && (
                              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-4">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Date Range
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="visibility.date_start"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">Start Date</FormLabel>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                  "w-full justify-start text-left font-normal h-9 px-3",
                                                  !field.value && "text-muted-foreground"
                                                )}
                                                disabled={readOnly}
                                              >
                                                <Calendar className="mr-2 h-3.5 w-3.5 opacity-70" />
                                                {field.value ? format(parseISO(field.value), "PPP") : <span className="text-xs">Pick a date</span>}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                              <UiCalendar
                                                mode="single"
                                                selected={field.value ? parseISO(field.value) : undefined}
                                                onSelect={(date) => {
                                                  if (date) {
                                                    const iso = format(date, "yyyy-MM-dd")
                                                    field.onChange(iso)
                                                  } else {
                                                    field.onChange("")
                                                  }
                                                }}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="visibility.date_end"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">End Date</FormLabel>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                  "w-full justify-start text-left font-normal h-9 px-3",
                                                  !field.value && "text-muted-foreground"
                                                )}
                                                disabled={readOnly}
                                              >
                                                <Calendar className="mr-2 h-3.5 w-3.5 opacity-70" />
                                                {field.value ? format(parseISO(field.value), "PPP") : <span className="text-xs">Pick a date</span>}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                              <UiCalendar
                                                mode="single"
                                                selected={field.value ? parseISO(field.value) : undefined}
                                                onSelect={(date) => {
                                                  if (date) {
                                                    const iso = format(date, "yyyy-MM-dd")
                                                    field.onChange(iso)
                                                  } else {
                                                    field.onChange("")
                                                  }
                                                }}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    Daily Schedule
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="visibility.time_start"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">Start Time</FormLabel>
                                          <FormControl>
                                            <div className="relative group">
                                              <Input
                                                type="time"
                                                {...field}
                                                className="h-9 focus:ring-1 pl-8 transition-all hover:border-primary/50"
                                                readOnly={readOnly}
                                              />
                                              <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="visibility.time_end"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">End Time</FormLabel>
                                          <FormControl>
                                            <div className="relative group">
                                              <Input
                                                type="time"
                                                {...field}
                                                className="h-9 focus:ring-1 pl-8 transition-all hover:border-primary/50"
                                                readOnly={readOnly}
                                              />
                                              <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name="visibility.days_of_week"
                                    render={({ field }) => (
                                      <FormItem className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">Active Days</FormLabel>
                                          {!readOnly && (
                                            <div className="flex gap-2">
                                              <Button type="button" variant="ghost" size="xs" className="h-7 px-2 text-[10px]" onClick={() => field.onChange([0,1,2,3,4,5,6])}>All</Button>
                                              <Button type="button" variant="ghost" size="xs" className="h-7 px-2 text-[10px]" onClick={() => field.onChange([])}>None</Button>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
                                            const isSelected = field.value?.includes(index)
                                            const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                                            return (
                                              <TooltipProvider key={`${day}-${index}`}>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button
                                                      type="button"
                                                      variant={isSelected ? "default" : "outline"}
                                                      size="sm"
                                                      className={cn(
                                                        "h-9 w-9 p-0 rounded-lg text-xs font-bold transition-all",
                                                        isSelected ? "bg-primary text-primary-foreground shadow-md scale-105" : "text-muted-foreground hover:bg-muted"
                                                      )}
                                                      disabled={readOnly}
                                                      onClick={() => {
                                                        const current = field.value || []
                                                        const next = isSelected
                                                          ? current.filter((i: number) => i !== index)
                                                          : [...current, index].sort()
                                                        field.onChange(next)
                                                      }}
                                                    >
                                                      {day}
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent side="top">
                                                    {fullDays[index]}
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )
                                          })}
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="space-y-4 pt-2 border-t">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    Amount Limits
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="visibility.min_amount"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">Min Amount</FormLabel>
                                          <FormControl>
                                            <div className="relative group">
                                              <Input
                                                type="number"
                                                step="any"
                                                {...field}
                                                className="h-9 pl-8 pr-10 transition-all focus-visible:ring-1 group-hover:border-primary/40"
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                              />
                                              <CircleDollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">MIN</div>
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="visibility.max_amount"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground/70">Max Amount</FormLabel>
                                          <FormControl>
                                            <div className="relative group">
                                              <Input
                                                type="number"
                                                step="any"
                                                {...field}
                                                className="h-9 pl-8 pr-10 transition-all focus-visible:ring-1 group-hover:border-primary/40"
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                readOnly={readOnly}
                                              />
                                              <CircleDollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black opacity-30 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">MAX</div>
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </TabsContent>
                    </Tabs>
                  </>
                )}
                </div>
              </div>

              <DialogFooter className="p-6 pt-2 shrink-0 border-t">
                {isEdit && !readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isSubmitting || isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {readOnly ? "Close" : "Cancel"}
                </Button>
                {!readOnly && (
                  <Button type="submit" disabled={isSubmitting || isDeleting || !selectedType}>
                    {(isSubmitting || isDeleting) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEdit ? "Update Gateway" : "Add Gateway"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              payment gateway integration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
