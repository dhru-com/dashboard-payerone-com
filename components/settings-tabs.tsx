"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { User, ApiResponse, NotificationPreferences } from "@/types/auth"
import { disconnectTelegram, updateNotificationPreferences, checkTelegramConnection, updateProfile } from "@/lib/auth-actions"
import { toast } from "sonner"
import { GeneralTab } from "./settings/general-tab"
import { AccountTab } from "./settings/account-tab"
import { NotificationsTab } from "./settings/notifications-tab"
import { BrandingTab } from "./settings/branding-tab"

export function SettingsTabs({
  userProfile,
  notificationPreferences
}: {
  userProfile: User | null,
  notificationPreferences?: ApiResponse<NotificationPreferences> | null
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isDisconnecting, setIsDisconnecting] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false)
  const [showQrDialog, setShowQrDialog] = React.useState(false)
  const [isPolling, setIsPolling] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)
  const [localPreferences, setLocalPreferences] = React.useState<Record<string, Record<string, boolean>>>(
    notificationPreferences?.data?.preferences || {}
  )
  const [formData, setFormData] = React.useState({
    first_name: userProfile?.first_name || "",
    last_name: userProfile?.last_name || "",
    company_name: userProfile?.company_name || "",
    address1: userProfile?.address1 || "",
    address2: userProfile?.address2 || "",
    city: userProfile?.city || "",
    state: userProfile?.state || "",
    postcode: userProfile?.postcode || "",
    country: userProfile?.country || "",
    timezone: userProfile?.timezone || "",
    language: userProfile?.language || "",
  })

  const activeTab = searchParams.get("tab") || "general"

  const isTelegramConnected = userProfile?.telegram_connected === true
  const clientId = userProfile?.clientid || ""
  const telegramBotUrl = `https://t.me/payerone_notifications_bot?start=${clientId}`

  // Sync local state when prop changes
  React.useEffect(() => {
    if (notificationPreferences?.data?.preferences) {
      setLocalPreferences(notificationPreferences.data.preferences)
    }
  }, [notificationPreferences])

  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        company_name: userProfile.company_name || "",
        address1: userProfile.address1 || "",
        address2: userProfile.address2 || "",
        city: userProfile.city || "",
        state: userProfile.state || "",
        postcode: userProfile.postcode || "",
        country: userProfile.country || "",
        timezone: userProfile.timezone || "",
        language: userProfile.language || "",
      })
    }
  }, [userProfile])

  // Stop polling if telegram is connected
  React.useEffect(() => {
    if (isTelegramConnected && isPolling) {
      setIsPolling(false)
      setShowQrDialog(false)
    }
  }, [isTelegramConnected, isPolling])

  // Polling logic
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout
    let timeoutId: NodeJS.Timeout

    if (isPolling && !isTelegramConnected) {
      // Poll every 5 seconds
      intervalId = setInterval(async () => {
        const connected = await checkTelegramConnection()
        if (connected) {
          setIsPolling(false)
          setShowQrDialog(false)
          toast.success("Telegram connected successfully!")
          router.refresh()
        }
      }, 5000)

      // Stop after 2 minutes (120000 ms)
      timeoutId = setTimeout(() => {
        if (isPolling) {
          setIsPolling(false)
          toast.error("Connection timeout. Please try again.")
        }
      }, 120000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isPolling, isTelegramConnected, router])

  const startPolling = () => {
    if (!isPolling) {
      setIsPolling(true)
    }
  }

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleDisconnectTelegram = async () => {
    try {
      setIsDisconnecting(true)
      const result = await disconnectTelegram()
      if (result.status === "success") {
        toast.success("Telegram disconnected successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to disconnect Telegram")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while disconnecting Telegram")
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleTogglePreference = async (type: string, channel: string, value: boolean) => {
    const updatedPreferences = {
      ...localPreferences,
      [type]: {
        ...localPreferences[type],
        [channel]: value
      }
    }

    // Update local state immediately for snappy UI
    setLocalPreferences(updatedPreferences)

    try {
      setIsUpdating(true)
      const result = await updateNotificationPreferences(updatedPreferences)
      if (result.status === "success") {
        toast.success("Notification preferences updated")
      } else {
        toast.error(result.message || "Failed to update notification preferences")
        // Rollback on error
        setLocalPreferences(localPreferences)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while updating preferences")
      // Rollback on error
      setLocalPreferences(localPreferences)
    } finally {
      setIsUpdating(false)
    }
  }

  // Add this to handle form submission with correct types
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name || !formData.company_name) {
      toast.error("First name, last name and company name are required")
      return
    }

    try {
      setIsUpdatingProfile(true)
      const result = await updateProfile(formData as Partial<User>)
      if (result.status === "success") {
        toast.success("Profile updated successfully")
        router.refresh()
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while updating profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success("Account ID copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="space-y-4">
        <GeneralTab
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleUpdateProfile={handleUpdateProfile}
          isUpdatingProfile={isUpdatingProfile}
          clientId={clientId}
          isCopied={isCopied}
          copyToClipboard={copyToClipboard}
          userProfile={userProfile}
        />
      </TabsContent>
      <TabsContent value="account" className="space-y-4">
        <AccountTab
          formData={formData}
          handleInputChange={handleInputChange}
          handleUpdateProfile={handleUpdateProfile}
          isUpdatingProfile={isUpdatingProfile}
        />
      </TabsContent>
      <TabsContent value="branding" className="space-y-4">
        <BrandingTab />
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <NotificationsTab
          isTelegramConnected={isTelegramConnected}
          isDisconnecting={isDisconnecting}
          handleDisconnectTelegram={handleDisconnectTelegram}
          telegramBotUrl={telegramBotUrl}
          startPolling={startPolling}
          showQrDialog={showQrDialog}
          setShowQrDialog={setShowQrDialog}
          setIsPolling={setIsPolling}
          isPolling={isPolling}
          notificationPreferences={notificationPreferences}
          localPreferences={localPreferences}
          handleTogglePreference={handleTogglePreference}
          isUpdating={isUpdating}
        />
      </TabsContent>
    </Tabs>
  )
}
