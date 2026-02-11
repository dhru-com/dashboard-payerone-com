import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ShieldCheck, ExternalLink } from "lucide-react"

interface AccountTabProps {
  formData: {
    first_name: string;
    last_name: string;
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpdateProfile: (e: React.FormEvent) => void
  isUpdatingProfile: boolean
}

export function AccountTab({
  formData,
  handleInputChange,
  handleUpdateProfile,
  isUpdatingProfile
}: AccountTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your personal information.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6 max-w-xl pb-6">
            <div className="space-y-4">
              <div className="space-y-1.5 max-w-sm">
                <Label htmlFor="first_name" className="text-xs font-medium">First Name <span className="text-destructive">*</span></Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <Label htmlFor="last_name" className="text-xs font-medium">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="h-9"
                  required
                />
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

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Password & Security</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>
            To manage your password, two-factor authentication, and other security settings, please visit our central account management portal.
          </p>
          <div>
            <Button variant="outline" size="sm" asChild className="h-8 gap-2">
              <a 
                href="https://account.dhru.com/update?change=password-auth" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Manage Password & Security
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
