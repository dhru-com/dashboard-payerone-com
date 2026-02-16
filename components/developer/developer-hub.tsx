"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Key,
  Webhook,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  Terminal,
  Activity,
  Zap,
  ExternalLink,
  ShieldCheck,
  RefreshCcw
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function DeveloperHub() {
  const integrationSteps = [
    { title: "Obtain API Keys", description: "Get your Sandbox and Live credentials.", href: "/developer/api-keys", completed: true },
    { title: "Configure Webhooks", description: "Set up endpoints for real-time notifications.", href: "/developer/webhooks", completed: false },
    { title: "Test Integration", description: "Use the API Simulator to verify your flow.", href: "/developer/docs/simulator", completed: false },
    { title: "Go Live", description: "Switch to production mode and start processing.", href: "/developer/api-keys", completed: false },
  ]

  const completedSteps = integrationSteps.filter(s => s.completed).length
  const progressPercentage = (completedSteps / integrationSteps.length) * 100

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero / Header */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-8 md:p-10">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Developer Hub</h1>
            <p className="text-muted-foreground max-w-xl text-balance">
              Everything you need to build, test, and manage your PayerOne integration in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/developer/docs">
                <BookOpen className="mr-2 h-4 w-4" />
                Docs
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/developer/api-keys">
                <Key className="mr-2 h-4 w-4" />
                Get API Keys
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Environment</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sandbox</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Operational
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Keys</CardTitle>
            <Key className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Active</div>
            <p className="text-xs text-muted-foreground mt-1">Sandbox & Production</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 Endpoint</div>
            <p className="text-xs text-muted-foreground mt-1">99.8% Success rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Version</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v2.0</div>
            <p className="text-xs text-muted-foreground mt-1">Latest version</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1 -m-1">
        {/* Main Content Areas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/developer/docs" className="group block">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md bg-card/50">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Documentation</CardTitle>
                  <CardDescription className="text-sm">
                    Comprehensive guides, API reference, and integration tutorials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Browse Docs <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/developer/docs/simulator" className="group">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md bg-card/50">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Terminal className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">API Simulator</CardTitle>
                  <CardDescription className="text-sm">
                    Interactive tool to test API calls and webhooks in a safe environment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Open Simulator <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/developer/api-keys" className="group">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md bg-card/50">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Manage Keys</CardTitle>
                  <CardDescription className="text-sm">
                    View and rotate your API tokens for Sandbox and Live modes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Manage Keys <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/developer/webhooks" className="group">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md bg-card/50">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Webhook className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Webhooks</CardTitle>
                  <CardDescription className="text-sm">
                    Configure endpoint URLs and listen for real-time payment events.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Configure Webhooks <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Placeholder for Recent Activity */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent API Activity</CardTitle>
                <CardDescription>Live feed of your most recent API requests.</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <RefreshCcw className="h-6 w-6 text-muted-foreground animate-spin-slow" />
                </div>
                <h3 className="font-semibold text-base mb-1">No recent activity</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Start making API calls to see your integration activity here in real-time.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/developer/docs/api">View API Reference</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar area: Integration Progress */}
        <div className="space-y-6">
          <Card className="bg-card/50 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-16 w-16 text-primary fill-primary" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Integration Progress</CardTitle>
              <CardDescription>Follow these steps to complete your integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{progressPercentage}% Complete</span>
                  <span className="text-muted-foreground">{completedSteps}/{integrationSteps.length} Steps</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="space-y-4">
                {integrationSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="space-y-1">
                      <Link href={step.href} className="text-sm font-semibold hover:underline flex items-center gap-1 group">
                        {step.title}
                        {!step.completed && <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </Link>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full text-xs font-semibold h-9" asChild>
                  <Link href="mailto:support@payerone.com">
                    Need Help? Contact Support
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Security Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never share your <strong className="text-foreground">Private Key</strong> in client-side code or public repositories. Use environment variables to store them securely.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
