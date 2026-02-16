"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {Code2, BookOpen, Terminal, Download, WebhookIcon, ArrowRight, Key} from "lucide-react"
import Link from "next/link"
import {Button} from "@/components/ui/button";

export function DocumentationPortal() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative">
      {/* Decorative background elements - enlarged to avoid clipping content shadows */}
      <div className="absolute -inset-4 overflow-hidden pointer-events-none rounded-[2.5rem]">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>



      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-8 md:p-10">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent)]" />
        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/30 relative z-10">
          <Code2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          Developer Documentation
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed relative z-10">
          Integrate PayerOne into your application with our powerful API, ready-to-use plugins, and interactive tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 p-1 -m-1">
        <Link href="/developer/docs/api" className="block">
          <Card className="group cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 p-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">API Documentation</CardTitle>
                <CardDescription className="text-sm mt-1">Detailed guides for Standard Checkout, Express Wallets, and Order management.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Explore Documentation <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/developer/docs/simulator" className="block">
          <Card className="group cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 p-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">API Simulator</CardTitle>
                <CardDescription className="text-sm mt-1">Test our endpoints in real-time with our interactive API explorer.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Try the Simulator <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/developer/docs/plugins" className="block">
          <Card className="group cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-2 p-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Download Plugins</CardTitle>
                <CardDescription className="text-sm mt-1">Ready-to-use plugins for popular platforms like WooCommerce, WHMCS, and more.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                View All Plugins <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/developer/docs/webhooks" className="block h-full">
          <Card className="group cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="space-y-2 p-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                <WebhookIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Webhooks Docs</CardTitle>
                <CardDescription className="text-sm mt-1">Everything you need to know about integrating our real-time payment notifications.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Webhook Integration Guide <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
