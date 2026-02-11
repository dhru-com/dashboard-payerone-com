"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

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
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
import { NETWORK_METADATA } from "@/lib/networks"
import { addMerchantAddress, updateMerchantAddress, deleteMerchantAddress } from "@/lib/merchant-actions"
import { MerchantAddress } from "@/types/merchant"

const formSchema = z.object({
  type: z.string().min(1, "Please select a type"),
  address: z.string().min(1, "Address is required"),
  networks: z.record(z.string(), z.array(z.string())).refine((val) => {
    return Object.values(val).some(tokens => tokens.length > 0)
  }, "Please select at least one network and token"),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface MerchantAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: MerchantAddress | null
  existingTypes?: string[]
}

export function MerchantAddressDialog({ open, onOpenChange, initialData, existingTypes = [] }: MerchantAddressDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const isEdit = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      address: "",
      networks: {},
      notes: "",
      is_active: true,
    },
  })

  // Set form values when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        address: initialData.address,
        networks: initialData.networks,
        notes: initialData.notes || "",
        is_active: initialData.is_active,
      })
    } else {
      form.reset({
        type: "",
        address: "",
        networks: {},
        notes: "",
        is_active: true,
      })
    }
  }, [initialData, form])

  const selectedType = form.watch("type")

  // Reset networks when type changes (only in add mode or if type is actually different)
  const previousType = React.useRef(selectedType)
  React.useEffect(() => {
    if (previousType.current !== selectedType && !isEdit) {
      form.setValue("networks", {})
    }
    previousType.current = selectedType
  }, [selectedType, form, isEdit])

  const types = Array.from(new Set(Object.values(NETWORK_METADATA).map(n => n.type)))

  const networksForType = Object.entries(NETWORK_METADATA).filter(
    ([_, meta]) => meta.type === selectedType
  )

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Map is_active boolean to 1/0 as per API example if needed
      // But let's try boolean first as it's cleaner. The issue says "is_active": 1.
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0
      }

      const result = isEdit
        ? await updateMerchantAddress(initialData!.uuid, payload)
        : await addMerchantAddress(payload)

      if (result && result.status === "success") {
        toast.success(isEdit ? "Merchant address updated successfully" : "Merchant address added successfully")
        form.reset()
        onOpenChange(false)
      } else {
        toast.error(result?.message || `Failed to ${isEdit ? 'update' : 'add'} merchant address`)
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
      const result = await deleteMerchantAddress(initialData.uuid)
      if (result && result.status === "success") {
        toast.success("Merchant address deleted successfully")
        setIsDeleteDialogOpen(false)
        onOpenChange(false)
      } else {
        toast.error(result?.message || "Failed to delete merchant address")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleToken = (networkKey: string, tokenSymbol: string, checked: boolean) => {
    const currentNetworks = form.getValues("networks")
    const networkTokens = currentNetworks[networkKey] || []

    let newTokens: string[]
    if (checked) {
      newTokens = [...networkTokens, tokenSymbol]
    } else {
      newTokens = networkTokens.filter(t => t !== tokenSymbol)
    }

    const newNetworks = { ...currentNetworks }
    if (newTokens.length > 0) {
      newNetworks[networkKey] = newTokens
    } else {
      delete newNetworks[networkKey]
    }

    form.setValue("networks", newNetworks, { shouldValidate: true })
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>{isEdit ? "Edit Receiving Address" : "Add Receiving Address"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your receiving address details." : "Add a new address to receive customer payments."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-6 p-6 pt-2 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="p-1">
                              <Input
                                placeholder="Search type..."
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
                            {types.map((type) => {
                              const isAlreadyAdded = existingTypes.includes(type)
                              return (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="capitalize"
                                  disabled={!isEdit && isAlreadyAdded}
                                >
                                  <span className="flex items-center gap-2">
                                    {type.toUpperCase()}
                                    {!isEdit && isAlreadyAdded && (
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        (Already Added)
                                      </span>
                                    )}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end gap-2">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 h-10">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your wallet address" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType && (
                  <div className="space-y-4">
                    <Label>Enabled Networks & Tokens</Label>
                    <div className="rounded-md border p-4">
                      <div className="space-y-6">
                        {networksForType.map(([netKey, meta]) => (
                          <div key={netKey} className="space-y-3">
                            <div className="flex items-center gap-2 font-medium text-sm">
                               <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={`/logos/${netKey}.svg`}
                                  alt={meta.name}
                                  fill
                                  className="object-contain"
                                  onError={(e) => {
                                    // Fallback for missing icons
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              </div>
                              {meta.name}
                            </div>
                            <div className="grid grid-cols-2 gap-4 pl-6">
                              {Object.entries(meta.tokens).map(([tokenSymbol]) => (
                                <div key={tokenSymbol} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${netKey}-${tokenSymbol}`}
                                    checked={form.watch("networks")[netKey]?.includes(tokenSymbol) || false}
                                    onCheckedChange={(checked) =>
                                      toggleToken(netKey, tokenSymbol, checked === true)
                                    }
                                  />
                                  <label
                                    htmlFor={`${netKey}-${tokenSymbol}`}
                                    className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
                                  >
                                    {tokenSymbol}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {form.formState.errors.networks?.message && (
                       <p className="text-destructive text-sm font-medium">
                         {String(form.formState.errors.networks.message)}
                       </p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any internal notes about this address"
                          className="resize-none"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-2 shrink-0 border-t">
              {isEdit && (
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {(isSubmitting || isDeleting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Update Address" : "Add Address"}
              </Button>
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
            This action cannot be undone. This will permanently delete your
            receiving wallet configuration for this address.
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
