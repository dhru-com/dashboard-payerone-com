import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { QRCodeSVG } from "qrcode.react"
import { CheckCircle2, XCircle, ChevronDown, ExternalLink, QrCode, MessageSquare, BellRing, Loader2 } from "lucide-react"
import { ApiResponse } from "@/types/auth"

interface NotificationsTabProps {
  isTelegramConnected: boolean
  isDisconnecting: boolean
  handleDisconnectTelegram: () => void
  telegramBotUrl: string
  startPolling: () => void
  showQrDialog: boolean
  setShowQrDialog: (open: boolean) => void
  setIsPolling: (polling: boolean) => void
  isPolling: boolean
  notificationPreferences?: ApiResponse<{
    preferences: Record<string, Record<string, boolean>>,
    types: Record<string, string>,
    channels: Record<string, string>
  }> | null
  localPreferences: Record<string, Record<string, boolean>>
  handleTogglePreference: (type: string, channel: string, value: boolean) => void
  isUpdating: boolean
}

export function NotificationsTab({
  isTelegramConnected,
  isDisconnecting,
  handleDisconnectTelegram,
  telegramBotUrl,
  startPolling,
  showQrDialog,
  setShowQrDialog,
  setIsPolling,
  isPolling,
  notificationPreferences,
  localPreferences,
  handleTogglePreference,
  isUpdating
}: NotificationsTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Communication Channels</CardTitle>
          <CardDescription>
            Configure how you receive general notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-0.5">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <div className="bg-telegram/10 p-1 rounded-md">
                  <MessageSquare className="h-3.5 w-3.5 text-telegram" />
                </div>
                Telegram Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive instant notifications via Telegram.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isTelegramConnected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 text-sm font-medium bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md border border-green-200 dark:border-green-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    onClick={handleDisconnectTelegram}
                    disabled={isDisconnecting}
                  >
                    <XCircle className="h-4 w-4" />
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </div>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 border-telegram text-telegram hover:bg-telegram/10">
                        Connect Telegram
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild onSelect={startPolling}>
                        <a href={telegramBotUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in Desktop
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setShowQrDialog(true)
                          startPolling()
                        }}
                        className="cursor-pointer"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Show QR Code
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Dialog
                    open={showQrDialog}
                    onOpenChange={(open) => {
                      setShowQrDialog(open)
                      if (!open) setIsPolling(false)
                    }}
                  >
                    <DialogContent className="max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-telegram" />
                          Scan to Connect
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Scan the QR code with your Telegram app to connect your account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center p-6 space-y-4 relative">
                        <div className="bg-white p-4 rounded-xl shadow-inner border">
                          <QRCodeSVG
                            value={telegramBotUrl}
                            size={200}
                            level="H"
                            imageSettings={{
                              src: "/logos/telegram.svg",
                              x: undefined,
                              y: undefined,
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                          />
                        </div>
                        {isPolling && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-telegram/10 text-telegram rounded-full animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs font-medium">Waiting for connection...</span>
                          </div>
                        )}
                        <div className="text-center space-y-1.5">
                          <p className="text-sm font-medium">Scan this QR code with your phone</p>
                          <p className="text-xs text-muted-foreground">
                            It will open Telegram and start the notification bot.
                          </p>
                        </div>
                        <Button asChild onClick={startPolling}>
                          <a href={telegramBotUrl} target="_blank" rel="noopener noreferrer">
                            Open Link Directly
                          </a>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which events you want to be notified about and via which channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[300px] py-2 px-4 text-xs font-bold uppercase tracking-wider">Event Type</TableHead>
                  <TableHead className="text-center py-2 text-xs font-bold uppercase tracking-wider">
                    <span>Email</span>
                  </TableHead>
                  {isTelegramConnected && (
                    <TableHead className="text-center py-2 text-xs font-bold uppercase tracking-wider">
                      <span>Telegram</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationPreferences?.data ? (
                  Object.entries(notificationPreferences.data.types).map(([type, label]) => (
                    <TableRow key={type} className="h-12">
                      <TableCell className="font-medium py-2 px-4 text-xs">{label}</TableCell>
                      <TableCell className="text-center py-2">
                        <div className="flex justify-center">
                          <Switch
                            checked={localPreferences[type]?.email || false}
                            onCheckedChange={(checked) => handleTogglePreference(type, 'email', checked)}
                            disabled={isUpdating}
                            className="scale-75"
                          />
                        </div>
                      </TableCell>
                      {isTelegramConnected && (
                        <TableCell className="text-center py-2">
                          <div className="flex justify-center">
                            <Switch
                              checked={localPreferences[type]?.telegram || false}
                              onCheckedChange={(checked) => handleTogglePreference(type, 'telegram', checked)}
                              disabled={isUpdating}
                              className="scale-75"
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Failed to load preferences.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {!isTelegramConnected && (
          <CardFooter className="border-t bg-amber-50 dark:bg-amber-500/10 px-4 py-2">
            <p className="text-[10px] leading-tight text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <BellRing className="h-3 w-3" />
              Telegram notifications are disabled until you connect your Telegram account.
            </p>
          </CardFooter>
        )}
      </Card>
    </>
  )
}
