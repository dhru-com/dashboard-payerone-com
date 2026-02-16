"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  SearchIcon,
  ChevronDown
} from "lucide-react"

const PLUGINS = [
  { name: "WooCommerce", icon: "/logos/plugins/woocommerce.svg", link: "https://downloads.dhru.com/payerone_plugins/woocommerce-payerone.zip", category: "E-commerce" },
  { name: "Magento", icon: "/logos/plugins/magento.svg", link: "https://downloads.dhru.com/payerone_plugins/magento-payerone.zip", category: "E-commerce" },
  { name: "Shopify", icon: "/logos/plugins/shopify.svg", link: "https://downloads.dhru.com/payerone_plugins/shopify-payerone.zip", category: "E-commerce", comingSoon: true },
  { name: "PrestaShop", icon: "/logos/plugins/prestashop.svg", link: "https://downloads.dhru.com/payerone_plugins/prestashop-payerone.zip", category: "E-commerce" },
  { name: "WHMCS", icon: "/logos/plugins/whmcs.svg", link: "https://downloads.dhru.com/payerone_plugins/whmcs-payerone.zip", category: "Billing & Hosting" },
  { name: "OpenCart", icon: "/logos/plugins/opencart.svg", link: "https://downloads.dhru.com/payerone_plugins/opencart-payerone.zip", category: "E-commerce" },
  { name: "Shopware", icon: "/logos/plugins/shopware.svg", link: "https://downloads.dhru.com/payerone_plugins/shopware-payerone.zip", category: "E-commerce" },
  { name: "CS-Cart", icon: "https://www.cs-cart.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/cscart-payerone.zip", category: "E-commerce" },
  { name: "Drupal Commerce", icon: "https://www.drupal.org/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/drupal-payerone.zip", category: "LMS & CMS" },
  { name: "EDD", icon: "https://easydigitaldownloads.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/edd-payerone.zip", category: "E-commerce" },
  { name: "Ghost", icon: "https://ghost.org/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/ghost-payerone.zip", category: "LMS & CMS" },
  { name: "Gravity Forms", icon: "https://www.gravityforms.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/gravityforms-payerone.zip", category: "Forms" },
  { name: "Joomla", icon: "https://www.joomla.org/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/joomla-payerone.zip", category: "LMS & CMS" },
  { name: "Moodle", icon: "https://moodle.org/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/moodle-payerone.zip", category: "LMS & CMS" },
  { name: "Paid Memberships Pro", icon: "https://www.paidmembershipspro.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/pmpro-payerone.zip", category: "LMS & CMS" },
  { name: "Spree Commerce", icon: "https://spreecommerce.org/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/spree-payerone.zip", category: "E-commerce" },
  { name: "Sylius", icon: "https://sylius.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/sylius-payerone.zip", category: "E-commerce" },
  { name: "VirtueMart", icon: "https://virtuemart.net/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/virtuemart-payerone.zip", category: "E-commerce" },
  { name: "WP eCommerce", icon: "https://wpecommerce.org/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/wpecommerce-payerone.zip", category: "E-commerce" },
  { name: "WiseCP", icon: "https://www.wisecp.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/wisecp-payerone.zip", category: "Billing & Hosting" },
  { name: "X-Cart", icon: "https://www.x-cart.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/xcart-payerone.zip", category: "E-commerce" },
  { name: "XenForo", icon: "https://xenforo.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/xenforo-payerone.zip", category: "LMS & CMS" },
  { name: "Zen Cart", icon: "https://www.zen-cart.com/favicon.ico", link: "https://downloads.dhru.com/payerone_plugins/zencart-payerone.zip", category: "E-commerce" },
];

export function PluginDownloads() {
  const [pluginSearch, setPluginSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")

  const categories = ["All", ...Array.from(new Set(PLUGINS.map(p => p.category)))]

  const filteredPlugins = PLUGINS.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(pluginSearch.toLowerCase())
    const matchesCategory = selectedCategory === "All" || plugin.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-4 pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Download className="h-6 w-6 text-primary" />
                Download Plugins
              </CardTitle>
              <CardDescription className="text-sm">
                Choose from {PLUGINS.length} pre-built integrations for your platform.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  className="pl-9 bg-background"
                  value={pluginSearch}
                  onChange={(e) => setPluginSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-background min-w-[140px] justify-between">
                    {selectedCategory}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat} onClick={() => setSelectedCategory(cat)}>
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-6">
          {filteredPlugins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPlugins.map((plugin) => (
                <Card key={plugin.name} className="group overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center p-2 group-hover:bg-primary/5 transition-colors">
                        <img
                          src={plugin.icon}
                          alt={plugin.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.currentTarget.src = "https://www.google.com/s2/favicons?domain=" + plugin.name.toLowerCase() + ".com&sz=64" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{plugin.name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {plugin.category}
                        </p>
                      </div>
                    </div>
                    {plugin.comingSoon ? (
                      <Button variant="outline" size="sm" className="w-full gap-2 shadow-sm opacity-60 cursor-not-allowed" disabled>
                        Coming soon
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full gap-2 shadow-sm" asChild>
                        <a href={plugin.link} download>
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border-2 border-dashed">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <SearchIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg">No plugins found</h3>
              <p className="text-muted-foreground text-sm max-w-xs text-center">
                We couldn't find any plugins matching "{pluginSearch}"{selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}.
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  setPluginSearch("");
                  setSelectedCategory("All");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
