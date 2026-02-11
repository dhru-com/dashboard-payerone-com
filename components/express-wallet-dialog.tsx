"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { NETWORK_METADATA, NetworkMetadata } from "@/lib/networks"
import { addForwardingAddress, updateForwardingAddress, deleteForwardingAddress } from "@/lib/forwarding-actions"
import { ForwardingAddress } from "@/types/forwarding-address"

const formSchema = z.object({
  type: z.string().min(1, "Please select a type"),
  address: z.string().min(1, "Address is required"),
  network: z.array(z.string()).min(1, "Please select at least one network"),
})

type FormValues = z.infer<typeof formSchema>

interface ExpressWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ForwardingAddress | null
  existingTypes?: string[]
  networkMetadata?: Record<string, NetworkMetadata>
}

export function ExpressWalletDialog({
  open,
  onOpenChange,
  initialData,
  existingTypes = [],
  networkMetadata = NETWORK_METADATA
}: ExpressWalletDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isAgreementChecked, setIsAgreementChecked] = React.useState(false)
  const isEdit = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      address: "",
      network: [],
    },
  })

  // Determine type from network list if editing
  const getAddressType = (networks: string[]) => {
    if (networks.length === 0) return ""
    const firstNet = networks[0]
    return networkMetadata[firstNet]?.type || ""
  }

  // Set form values when initialData changes or dialog opens
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          type: getAddressType(initialData.network),
          address: initialData.address,
          network: initialData.network,
        })
      } else {
        form.reset({
          type: "",
          address: "",
          network: [],
        })
      }
      setIsAgreementChecked(false)
    }
  }, [open, initialData, form])

  const selectedType = form.watch("type")

  // Reset networks when type changes (only in add mode)
  const previousType = React.useRef(selectedType)
  React.useEffect(() => {
    if (previousType.current !== selectedType && !isEdit) {
      form.setValue("network", [])
    }
    previousType.current = selectedType
  }, [selectedType, form, isEdit])

  const types = ['evm', 'solana']

  const networksForType = Object.entries(networkMetadata).filter(
    ([_, meta]) => meta.type === selectedType
  )

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Stripping type for API payload
      const payload = {
        address: values.address,
        network: values.network,
      }

      const result = isEdit
        ? await updateForwardingAddress(initialData!.uuid, payload)
        : await addForwardingAddress(payload)

      if (result && result.status === "success") {
        toast.success(isEdit ? "Express wallet updated successfully" : "Express wallet added successfully")
        form.reset()
        onOpenChange(false)
      } else {
        toast.error(result?.message || `Failed to ${isEdit ? 'update' : 'add'} express wallet`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleNetwork = (networkKey: string, checked: boolean) => {
    const currentNetworks = form.getValues("network")
    let newNetworks: string[]
    if (checked) {
      newNetworks = [...currentNetworks, networkKey]
    } else {
      newNetworks = currentNetworks.filter(n => n !== networkKey)
    }
    form.setValue("network", newNetworks, { shouldValidate: true })
  }

  const handleDelete = async () => {
    if (!initialData) return

    setIsDeleting(true)
    try {
      const result = await deleteForwardingAddress(initialData.uuid)
      if (result && result.status === "success") {
        toast.success("Express wallet deleted successfully")
        setIsDeleteDialogOpen(false)
        onOpenChange(false)
      } else {
        toast.error(result?.message || "Failed to delete express wallet")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Express Wallet" : "Add Express Wallet"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update your express settlement wallet details." : "Add a new wallet address for express settlement."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your wallet address"
                        {...field}
                        disabled={isEdit && !isAgreementChecked}
                      />
                    </FormControl>
                    <FormMessage />
                    {isEdit && (
                      <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-destructive uppercase tracking-wider leading-none">Safety Warning</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Changing the address will reset all current assigned virtual wallet addresses to your customers.
                              Old wallets will not be accessible and funds cannot be recovered if sent to them.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 border-t border-destructive/10 pt-2">
                          <Checkbox
                            id="agree-to-edit"
                            checked={isAgreementChecked}
                            onCheckedChange={(checked) => setIsAgreementChecked(checked === true)}
                          />
                          <label
                            htmlFor="agree-to-edit"
                            className="text-xs font-medium leading-none cursor-pointer"
                          >
                            I agree to edit address
                          </label>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {selectedType && (
                <div className="space-y-4">
                  <Label>Enabled Networks</Label>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="grid grid-cols-1 gap-4">
                      {networksForType.map(([netKey, meta]) => (
                        <div key={netKey} className="flex items-center space-x-2">
                          <Checkbox
                            id={`network-${netKey}`}
                            checked={form.watch("network").includes(netKey)}
                            onCheckedChange={(checked) =>
                              toggleNetwork(netKey, checked === true)
                            }
                          />
                          <div className="flex items-center gap-2">
                            <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={`/logos/${netKey}.svg`}
                                alt={meta.name}
                                fill
                                className="object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                            <label
                              htmlFor={`network-${netKey}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {meta.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {form.formState.errors.network?.message && (
                     <p className="text-destructive text-sm font-medium">
                       {String(form.formState.errors.network.message)}
                     </p>
                  )}
                </div>
              )}

              <DialogFooter>
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
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Update Wallet" : "Add Wallet"}
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
              express wallet configuration for this address.
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
