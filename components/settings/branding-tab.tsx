"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Upload, Info, Plus, X, Monitor, Smartphone, Copy, Check, ChevronDown, RotateCcw } from "lucide-react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getBranding, updateBranding, BrandingData, getUploadUrl } from "@/lib/branding-actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

// Helper function to determine text color based on background brightness
function getContrastColor(hexColor: string) {
  // If hex color is not valid, return black
  if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) return 'text-black';

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Using the HSP color model to determine perceived brightness
  // http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp > 127.5 ? 'text-black' : 'text-white';
}

function CheckoutPreview({
  brandColor,
  accentColor,
  logoPreview,
  viewMode,
  onCopy,
  isCopied
}: {
  brandColor: string;
  accentColor: string;
  logoPreview: string | null;
  viewMode: 'desktop' | 'mobile';
  onCopy: (text: string) => void;
  isCopied: boolean;
}) {

  const textColor = getContrastColor(brandColor);
  const isMobile = viewMode === 'mobile';

  // Dynamic contrast for accent color background
  const accentTextColor = getContrastColor(accentColor);

  return (
    <div className={cn(
      "relative transition-all duration-300 flex items-center justify-center py-8",
      isMobile ? "w-full" : "w-full max-w-4xl"
    )}>
      {isMobile ? (
        /* Mobile Frame */
        <div className="relative w-[300px] h-[600px] bg-slate-100 rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-200/80">
          {/* Speaker */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-300 rounded-full z-20" />

          {/* Internal Screen Container */}
          <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-background flex flex-col relative">
            <div className={cn("flex flex-1 overflow-hidden flex-col")}>
              {/* Left Panel (Top in mobile) */}
              <div
                className="relative p-6 flex flex-col justify-between transition-colors duration-300 h-[30%]"
                style={{ backgroundColor: brandColor }}
              >
                <div className="space-y-4">
                  <div className="h-6 mt-2">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company Logo" className="h-full object-contain" />
                    ) : (
                      <div className={cn("text-lg font-bold flex items-center gap-2", textColor)}>
                        <div className="w-6 h-6 rounded bg-foreground/10 flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div className={cn("w-1 h-1 rounded-full", textColor === 'text-white' ? 'bg-white' : 'bg-black')} />
                      <p className={cn("text-[7px] font-bold uppercase tracking-[0.1em]", textColor)}>Your Company</p>
                    </div>
                    <p className={cn("text-2xl font-bold tracking-tight", textColor)}>$11.00</p>
                  </div>
                </div>
              </div>

              {/* Right Panel (Bottom in mobile) */}
              <div className="bg-background p-6 flex flex-col items-center gap-4 h-[70%]">
                <div className="text-center space-y-1">
                  <h3 className="text-[10px] font-bold tracking-tight">Payment Methods</h3>
                  <p className="text-[9px] text-muted-foreground">Select your preferred payment and method.</p>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-medium">Card</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-medium">Crypto</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>

                <div
                  className="w-full mt-auto rounded-xl p-4 space-y-2 shadow-sm transition-colors duration-300"
                  style={{ backgroundColor: accentColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[8px] uppercase tracking-[0.2em] font-bold opacity-60",
                      accentTextColor
                    )}>Amount to pay</span>
                    <button
                      onClick={() => onCopy("10.00")}
                      className={cn(
                        "transition-colors p-1 opacity-60 hover:opacity-100",
                        accentTextColor
                      )}
                    >
                      {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-lg font-bold tracking-tight",
                      accentTextColor
                    )}>10.00</span>
                    <span className={cn("text-[8px] opacity-60", accentTextColor)}>USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-foreground/10 rounded-full" />
          </div>
        </div>
      ) : (
        /* Desktop Frame */
        <div className={cn(
          "bg-white rounded-xl shadow-2xl overflow-hidden flex transition-all duration-300 border-[8px] border-slate-200/80 shrink-0 flex-col w-full h-[500px]"
        )}
        >
          {/* Browser Header */}
          <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-4 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 max-w-md h-6 rounded bg-slate-200/40 flex items-center px-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
              <div className="h-1.5 w-32 rounded bg-slate-300/30" />
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden flex-row">
            {/* Left Panel */}
            <div
              className="relative p-10 flex flex-col justify-between transition-colors duration-300 w-[40%]"
              style={{ backgroundColor: brandColor }}
            >
              <div className="space-y-8">
                <div className="h-10">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company Logo" className="h-full object-contain" />
                  ) : (
                    <div className={cn("text-xl font-bold flex items-center gap-2", textColor)}>
                      <div className="w-10 h-10 rounded bg-foreground/10 flex items-center justify-center border border-foreground/5">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", textColor === 'text-white' ? 'bg-white' : 'bg-black')} />
                    <p className={cn("text-xs font-bold uppercase tracking-[0.15em]", textColor)}>Your Company</p>
                  </div>
                  <p className={cn("text-5xl font-bold tracking-tight", textColor)}>$11.00</p>
                </div>
              </div>

              <div className={cn("mt-auto text-[10px] opacity-40 font-medium", textColor)}>
                Powered by PayerOne
              </div>
            </div>

            {/* Right Panel */}
            <div className="bg-background p-10 flex flex-1 flex-col items-center justify-center gap-8">
              <div className="w-full max-w-xs space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight">Payment Methods</h3>
                  <p className="text-xs text-muted-foreground ">Select your preferred payment and method.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500 shadow-sm" />
                      <span className="text-xs font-semibold">Credit Card</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500 shadow-sm" />
                      <span className="text-xs font-semibold">Cryptocurrency</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                <div
                  className="w-full rounded-2xl p-6 space-y-3 shadow-lg transition-all duration-300"
                  style={{ backgroundColor: accentColor }}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] uppercase tracking-[0.2em] font-bold opacity-60",
                      accentTextColor
                    )}>Amount to pay</span>
                    <button
                      onClick={() => onCopy("10.00")}
                      className={cn(
                        "transition-colors p-1 opacity-60 hover:opacity-100",
                        accentTextColor
                      )}
                    >
                      {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-3xl font-bold tracking-tight",
                      accentTextColor
                    )}>10.00</span>
                    <span className={cn("text-sm font-medium opacity-60", accentTextColor)}>USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BrandingTab() {
  const [brandColor, setBrandColor] = React.useState("#fafafa")
  const [accentColor, setAccentColor] = React.useState("#000000")

  const DEFAULT_BRAND_COLOR = "#fafafa"
  const DEFAULT_ACCENT_COLOR = "#000000"
  const [iconPreview, setIconPreview] = React.useState<string | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop')
  const [previewTab, setPreviewTab] = React.useState('hosted')
  const [isCopied, setIsCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = React.useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)
  const [isDraggingIcon, setIsDraggingIcon] = React.useState(false)
  const [isDraggingLogo, setIsDraggingLogo] = React.useState(false)

  // Fetch initial branding data
  React.useEffect(() => {
    async function loadBranding() {
      try {
        const result = await getBranding()
        if (result && result.status === "success" && result.data) {
          setBrandColor(result.data.brand_colour || "#fafafa")
          setAccentColor(result.data.accent_colour || "#000000")
          setIconPreview(result.data.icon || null)
          setLogoPreview(result.data.logo || null)
        }
      } catch (error) {
        console.error("Failed to fetch branding:", error)
        toast.error("Failed to load branding details")
      } finally {
        setIsLoading(false)
      }
    }
    loadBranding()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data: BrandingData = {
        icon: iconPreview || "",
        logo: logoPreview || "",
        brand_colour: brandColor,
        accent_colour: accentColor,
      }
      const result = await updateBranding(data)
      if (result && result.status === "success") {
        toast.success("Branding updated successfully")
      } else {
        toast.error(result.message || "Failed to update branding")
      }
    } catch (error) {
      console.error("Failed to update branding:", error)
      toast.error("An error occurred while saving branding")
    } finally {
      setIsSaving(false)
    }
  }

  // Use useEffect to ensure the logo is loaded correctly if it's already there
  React.useEffect(() => {
    // If we have a logo, we should make sure it's reflected in the preview
  }, [logoPreview])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  const handleDragOver = (e: React.DragEvent, type: 'icon' | 'logo') => {
    e.preventDefault()
    if (type === 'icon') setIsDraggingIcon(true)
    else setIsDraggingLogo(true)
  }

  const handleDragLeave = (e: React.DragEvent, type: 'icon' | 'logo') => {
    e.preventDefault()
    if (type === 'icon') setIsDraggingIcon(false)
    else setIsDraggingLogo(false)
  }

  const handleDrop = async (e: React.DragEvent, type: 'icon' | 'logo') => {
    e.preventDefault()
    if (type === 'icon') setIsDraggingIcon(false)
    else setIsDraggingLogo(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file, type)
    }
  }

  const processFile = async (file: File, type: 'icon' | 'logo') => {
    if (file.size > 512 * 1024) {
      toast.error("File size must be less than 512KB")
      return
    }

    // Dimension validation
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const { width, height } = img;
          if (type === 'icon') {
            if (width !== height) {
              reject(new Error("Icon must be square (equal width and height)"));
              return;
            }
            if (width < 128 || height < 128) {
              reject(new Error("Icon dimensions must be at least 128x128px"));
              return;
            }
          } else {
            if (width < 128 || height < 128) {
              reject(new Error("Logo dimensions must be at least 128x128px"));
              return;
            }
          }
          resolve(true);
        };
        img.onerror = () => reject(new Error("Failed to load image for validation"));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid image dimensions");
      return;
    }

    const isIcon = type === 'icon';
    if (isIcon) setIsUploadingIcon(true);
    else setIsUploadingLogo(true);

    try {
      // 1. Get Presigned URL
      const response = await getUploadUrl(file.name, file.type);

      if (response.status !== "success") {
        throw new Error(response.message || "Failed to get upload URL");
      }

      const { upload_url, download_url } = response;

      // 2. Direct PUT to S3
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: { "Content-Type": file.type },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // 3. Update state with download_url
      if (isIcon) setIconPreview(download_url);
      else setLogoPreview(download_url);

      toast.success(`${isIcon ? 'Icon' : 'Logo'} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      if (isIcon) setIsUploadingIcon(false);
      else setIsUploadingLogo(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'logo') => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file, type)
      // Reset input value to allow re-uploading the same file if needed
      if (e.target) e.target.value = '';
    }
  }

  const handleRemoveFile = (e: React.MouseEvent, type: 'icon' | 'logo') => {
    e.stopPropagation()
    if (type === 'icon') {
      setIconPreview(null)
      if (iconInputRef.current) iconInputRef.current.value = ''
    } else {
      setLogoPreview(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const iconInputRef = React.useRef<HTMLInputElement>(null)
  const logoInputRef = React.useRef<HTMLInputElement>(null)

  const PRESET_COLORS = [
    { brand: "#fafafa", accent: "#000000", label: "Default" },
    { brand: "#f0f9ff", accent: "#0ea5e9", label: "Ocean" },
    { brand: "#fdf2f8", accent: "#ec4899", label: "Rose" },
    { brand: "#f0fdf4", accent: "#22c55e", label: "Emerald" },
    { brand: "#fffbeb", accent: "#f59e0b", label: "Amber" },
    { brand: "#faf5ff", accent: "#a855f7", label: "Purple" },
    { brand: "#eef2ff", accent: "#6366f1", label: "Indigo" },
    { brand: "#1a1a1a", accent: "#ffffff", label: "Dark" },
  ]

  return (
    <Card className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Configure your brand assets and preview how they look to your customers.
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading || isUploadingIcon || isUploadingLogo}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Settings */}
          <div className="md:w-[35%] p-6 space-y-8">
            {/* Assets Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brand Assets</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Icon</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[200px] text-[10px]">A smaller representation of your logo (favicon).</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="relative group">
                    <div
                      onClick={() => !isUploadingIcon && iconInputRef.current?.click()}
                      onDragOver={(e) => handleDragOver(e, 'icon')}
                      onDragLeave={(e) => handleDragLeave(e, 'icon')}
                      onDrop={(e) => handleDrop(e, 'icon')}
                      className={cn(
                        "h-24 w-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-muted/30 cursor-pointer transition-all duration-300 relative overflow-hidden",
                        isUploadingIcon && "cursor-not-allowed opacity-80",
                        isDraggingIcon && "border-primary bg-primary/5 ring-4 ring-primary/10",
                        !isDraggingIcon && !iconPreview && "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/50",
                        iconPreview && "border-transparent bg-background shadow-sm ring-1 ring-border"
                      )}
                    >
                      {isUploadingIcon ? (
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-[10px] mt-2 font-medium text-muted-foreground">Uploading...</span>
                        </div>
                      ) : iconPreview ? (
                        <div className="w-full h-full p-3 flex items-center justify-center animate-in fade-in duration-500">
                          <img src={iconPreview} alt="Icon preview" className="max-w-full max-h-full object-contain drop-shadow-sm" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                             <p className="text-[10px] text-white font-medium">Change Icon</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 px-2 text-center">
                          <div className="p-2 rounded-full bg-background shadow-sm border border-border group-hover:scale-110 transition-transform duration-300">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold">Upload Icon</p>
                            <p className="text-[8px] text-muted-foreground">128x128px • 512KB</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={iconInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={(e) => handleFileChange(e, 'icon')}
                        disabled={isUploadingIcon}
                      />
                    </div>
                    {iconPreview && !isUploadingIcon && (
                      <button
                        onClick={(e) => handleRemoveFile(e, 'icon')}
                        className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-background border rounded-full shadow-lg hover:bg-destructive hover:text-destructive-foreground transition-all z-20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove icon</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium">Logo</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[200px] text-[10px]">The full-sized version of your logo used in checkouts.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="relative group">
                    <div
                      onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                      onDragOver={(e) => handleDragOver(e, 'logo')}
                      onDragLeave={(e) => handleDragLeave(e, 'logo')}
                      onDrop={(e) => handleDrop(e, 'logo')}
                      className={cn(
                        "h-24 w-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-muted/30 cursor-pointer transition-all duration-300 relative overflow-hidden",
                        isUploadingLogo && "cursor-not-allowed opacity-80",
                        isDraggingLogo && "border-primary bg-primary/5 ring-4 ring-primary/10",
                        !isDraggingLogo && !logoPreview && "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/50",
                        logoPreview && "border-transparent bg-background shadow-sm ring-1 ring-border"
                      )}
                    >
                      {isUploadingLogo ? (
                        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-[10px] mt-2 font-medium text-muted-foreground">Uploading...</span>
                        </div>
                      ) : logoPreview ? (
                        <div className="w-full h-full p-3 flex items-center justify-center animate-in fade-in duration-500">
                          <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain drop-shadow-sm" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                             <p className="text-[10px] text-white font-medium">Change Logo</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 px-2 text-center">
                          <div className="p-2 rounded-full bg-background shadow-sm border border-border group-hover:scale-110 transition-transform duration-300">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold">Upload Logo</p>
                            <p className="text-[8px] text-muted-foreground">128x128px • 512KB</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={logoInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={(e) => handleFileChange(e, 'logo')}
                        disabled={isUploadingLogo}
                      />
                    </div>
                    {logoPreview && !isUploadingLogo && (
                      <button
                        onClick={(e) => handleRemoveFile(e, 'logo')}
                        className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-background border rounded-full shadow-lg hover:bg-destructive hover:text-destructive-foreground transition-all z-20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Remove logo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-6">
              {/* Brand Color */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">Brand colour</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px]">Add a splash of colour to your branded pages</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-xl overflow-hidden bg-background h-9 w-32 shadow-sm">
                    <div
                      className="w-10 h-full border-r cursor-pointer"
                      style={{ backgroundColor: brandColor }}
                      onClick={() => document.getElementById('brand-color-picker')?.click()}
                    />
                    <input
                      id="brand-color-picker"
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1 flex items-center px-2.5 gap-1">
                      <span className="text-muted-foreground/50 font-mono text-xs">#</span>
                      <input
                        type="text"
                        value={brandColor.replace('#', '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setBrandColor(`#${val}`);
                          }
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-mono text-xs outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold">Accent colour</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px]">Used for the main button colour across pages</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-xl overflow-hidden bg-background h-9 w-32 shadow-sm">
                    <div
                      className="w-10 h-full border-r cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                      onClick={() => document.getElementById('accent-color-picker')?.click()}
                    />
                    <input
                      id="accent-color-picker"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1 flex items-center px-2.5 gap-1">
                      <span className="text-muted-foreground/50 font-mono text-xs">#</span>
                      <input
                        type="text"
                        value={accentColor.replace('#', '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setAccentColor(`#${val}`);
                          }
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-mono text-xs outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color Presets</Label>
                  <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0 h-5 border-muted-foreground/20 text-muted-foreground">Pro</Badge>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((preset) => {
                    const isActive = brandColor === preset.brand && accentColor === preset.accent;
                    return (
                      <TooltipProvider key={preset.label}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setBrandColor(preset.brand)
                                setAccentColor(preset.accent)
                              }}
                              className={cn(
                                "group relative flex flex-col items-center gap-2 p-1.5 rounded-xl border-2 transition-all duration-300 hover:bg-muted/50",
                                isActive
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                  : "border-transparent hover:border-muted-foreground/20"
                              )}
                            >
                              <div className="relative h-10 w-10 overflow-hidden rounded-full shadow-inner ring-1 ring-black/5">
                                <div className="absolute inset-0 flex">
                                  <div className="h-full w-1/2" style={{ backgroundColor: preset.brand }} />
                                  <div className="h-full w-1/2" style={{ backgroundColor: preset.accent }} />
                                </div>
                                {isActive && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
                                    <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm scale-110 animate-in zoom-in-50 duration-300">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/0 transition-colors group-hover:bg-black/5" />
                              </div>
                              <span className={cn(
                                "text-[10px] font-semibold transition-colors truncate w-full text-center",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                              )}>
                                {preset.label}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            <div className="space-y-1">
                              <p className="font-bold">{preset.label} Palette</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full border" style={{ backgroundColor: preset.brand }} />
                                  <span className="text-[10px] opacity-70">Brand</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full border" style={{ backgroundColor: preset.accent }} />
                                  <span className="text-[10px] opacity-70">Accent</span>
                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden md:block h-auto" />

          {/* Right Side - Preview */}
          <div className=" w-full md:w-[65%] bg-muted/5 flex flex-col">
            <div className="flex items-center justify-between px-6 py-0 bg-background h-[52px]">
              <Tabs value={previewTab} onValueChange={setPreviewTab}>
                <TabsList>
                  <TabsTrigger value="hosted" className="text-xs">
                    Hosted Checkout
                  </TabsTrigger>
                  <TabsTrigger value="embedded" className="text-xs">
                    Embedded
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-md",
                    viewMode === 'desktop' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-md",
                    viewMode === 'mobile' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                  )}
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-0 flex flex-col items-center justify-center overflow-hidden min-h-[600px] animate-in fade-in duration-500">
              {previewTab === 'hosted' ? (
                <div key="hosted-preview" className="w-full h-full flex items-center justify-center p-4">
                  <CheckoutPreview
                    brandColor={brandColor}
                    accentColor={accentColor}
                    logoPreview={logoPreview}
                    viewMode={viewMode}
                    onCopy={copyToClipboard}
                    isCopied={isCopied}
                  />
                </div>
              ) : (
                <div key="embedded-preview" className={cn(
                  "border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-background/50 space-y-3 p-8 transition-all duration-300 animate-in zoom-in-95 duration-300",
                  viewMode === 'desktop' ? "w-full max-w-2xl h-[500px]" : "w-[300px] h-[600px]"
                )}>
                  <div className="p-3 rounded-full bg-muted/50">
                    <Upload className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Embedded Preview coming soon</p>
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                      Live preview of Embedded checkout will be available here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
