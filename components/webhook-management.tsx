"use client"

import * as React from "react"
import { 
  Plus, 
  MoreHorizontal, 
  Play, 
  Trash2, 
  Edit2, 
  Globe,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Empty, 
  EmptyContent, 
  EmptyDescription, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle 
} from "@/components/ui/empty"
import { 
  createWebhook, 
  deleteWebhook, 
  updateWebhook, 
  testWebhook 
} from "@/lib/webhook-actions"
import { Webhook } from "@/types/webhook"

interface WebhookManagementProps {
  initialWebhooks: Webhook[]
}

export function WebhookManagement({ initialWebhooks }: WebhookManagementProps) {
  const [webhooks, setWebhooks] = React.useState<Webhook[]>(initialWebhooks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedWebhook, setSelectedWebhook] = React.useState<Webhook | null>(null)
  const [url, setUrl] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isTesting, setIsTesting] = React.useState<string | null>(null)

  const handleCreate = async () => {
    if (!url) {
      toast.error("Please enter a webhook URL")
      return
    }

    setIsLoading(true)
    const result = await createWebhook({ url })
    setIsLoading(false)

    if (result.success) {
      toast.success("Webhook created successfully")
      setIsCreateDialogOpen(false)
      setUrl("")
      // Update local state (optional since revalidatePath is used, but good for immediate feedback if not using server components for list)
      if (result.data) {
        setWebhooks([...webhooks, result.data])
      }
    } else {
      toast.error(result.message)
    }
  }

  const handleUpdate = async () => {
    if (!selectedWebhook || !url) return

    setIsLoading(true)
    const result = await updateWebhook(selectedWebhook.uuid, { url })
    setIsLoading(false)

    if (result.success) {
      toast.success("Webhook updated successfully")
      setIsEditDialogOpen(false)
      setSelectedWebhook(null)
      setUrl("")
      setWebhooks(webhooks.map(w => w.uuid === selectedWebhook.uuid ? { ...w, url } : w))
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async () => {
    if (!selectedWebhook) return

    setIsLoading(true)
    const result = await deleteWebhook(selectedWebhook.uuid)
    setIsLoading(false)

    if (result.success) {
      toast.success("Webhook deleted successfully")
      setIsDeleteDialogOpen(false)
      setWebhooks(webhooks.filter(w => w.uuid !== selectedWebhook.uuid))
      setSelectedWebhook(null)
    } else {
      toast.error(result.message)
    }
  }

  const handleTest = async (webhook: Webhook) => {
    setIsTesting(webhook.uuid)
    const result = await testWebhook(webhook.uuid)
    setIsTesting(null)

    if (result.success) {
      toast.success(result.message || `Test webhook sent (HTTP ${result.data?.http_code})`)
    } else {
      toast.error(result.message)
    }
  }

  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setUrl(webhook.url)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Configure endpoints to receive real-time notifications about events.
            </CardDescription>
          </div>
          {webhooks.length > 0 && (
            <Button onClick={() => { setUrl(""); setIsCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <Empty className="min-h-[350px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Globe className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Webhooks Configured</EmptyTitle>
                <EmptyDescription>
                  Add your first webhook endpoint to start receiving real-time notifications about events in your account.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => { setUrl(""); setIsCreateDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.uuid}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[300px] md:max-w-[500px]">
                          {webhook.url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{webhook.created_at}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTest(webhook)} disabled={isTesting === webhook.uuid}>
                            {isTesting === webhook.uuid ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="mr-2 h-4 w-4" />
                            )}
                            Test Webhook
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(webhook)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(webhook)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Enter the URL where you want to receive webhook events.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input 
                id="url" 
                placeholder="https://your-api.com/webhooks" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webhook</DialogTitle>
            <DialogDescription>
              Update your webhook endpoint URL.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url">Webhook URL</Label>
              <Input 
                id="edit-url" 
                placeholder="https://your-api.com/webhooks" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium break-all">URL: {selectedWebhook?.url}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
