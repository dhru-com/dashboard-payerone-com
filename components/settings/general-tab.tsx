import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, Loader2 } from "lucide-react"
import { COUNTRIES, TIMEZONES, LANGUAGES } from "@/lib/constants"
import { User } from "@/types/auth"

interface GeneralTabProps {
  formData: {
    company_name: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    timezone: string;
    language: string;
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectChange: (id: string, value: string) => void
  handleUpdateProfile: (e: React.FormEvent) => void
  isUpdatingProfile: boolean
  clientId: string
  isCopied: boolean
  copyToClipboard: (text: string) => void
  userProfile: User | null
}

export function GeneralTab({
  formData,
  handleInputChange,
  handleSelectChange,
  handleUpdateProfile,
  isUpdatingProfile,
  clientId,
  isCopied,
  copyToClipboard,
  userProfile
}: GeneralTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage your business details and preferences.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-6 max-w-xl pb-6">
          {/* Account Details Group */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-sm">
                <Label htmlFor="company_name" className="text-xs font-medium">Account name <span className="text-destructive">*</span></Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Account Name"
                  className="h-9"
                  required
                />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <Label htmlFor="clientid" className="text-xs font-medium">Account ID</Label>
                <div className="relative">
                  <Input
                    id="clientid"
                    value={clientId}
                    readOnly
                    className="pr-10 bg-muted h-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                    onClick={() => copyToClipboard(clientId)}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">Copy Account ID</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="-mx-4">
            <Separator />
          </div>

          {/* Business Address Group */}
          <div className="space-y-4">
            <CardTitle>Business address</CardTitle>
            <div className="space-y-3">
              <div className="space-y-3">
                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="address1" className="text-xs font-medium">Address line 1</Label>
                  <Input
                    id="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    placeholder="Address Line 1"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="address2" className="text-xs font-medium">Address line 2</Label>
                  <Input
                    id="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    placeholder="Address Line 2"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-medium">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <div className="space-y-1.5">
                  <Label htmlFor="postcode" className="text-xs font-medium">Postcode</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    placeholder="Postcode"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-medium">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger id="country" className="w-full h-9">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="-mx-4">
            <Separator />
          </div>

          {/* Phone Verification Group */}
          <div className="space-y-4">
            <CardTitle>Phone verification</CardTitle>
            <div className="flex items-center gap-2">
              {userProfile?.phone_verified ? (
                <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30 text-[10px] px-2 py-0 h-5">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px] px-2 py-0 h-5">
                  Not Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="-mx-4">
            <Separator />
          </div>

          {/* Location & Localization Group */}
          <div className="space-y-4">
            <CardTitle>Location & Localization</CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="timezone" className="text-xs font-medium">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleSelectChange("timezone", value)}
                >
                  <SelectTrigger id="timezone" className="w-full h-9">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs font-medium">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleSelectChange("language", value)}
                >
                  <SelectTrigger id="language" className="w-full h-9">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUpdatingProfile}>
            {isUpdatingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
