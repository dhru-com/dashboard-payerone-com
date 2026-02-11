"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, ArrowRight, Sparkles, ShieldCheck, TrendingDown } from "lucide-react"

interface UpgradePromotionProps {
  currentPlan?: string
}

export function UpgradePromotion({ currentPlan }: UpgradePromotionProps) {
  // Only show for FREE plan users
  if (currentPlan !== "FREE") return null

  return (
    <div className="px-4 lg:px-6 mb-2">
      <Card className="relative overflow-hidden border-[#e6e2fb] bg-linear-to-r from-[#e6e2fb]/30 via-background to-background transition-shadow">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles className="h-20 w-20 text-primary" />
        </div>

        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight">Unlock Premium Features</h3>
                  <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider bg-[#e6e2fb] text-[#5e4db2] border-[#e6e2fb]">
                    Upgrade Available
                  </Badge>
                </div>
                <p className="text-[13px] text-muted-foreground leading-snug max-w-2xl">
                  You are currently on the <span className="font-semibold text-foreground">Free Plan</span>. Upgrade to <span className="font-semibold text-primary">Starter</span> or <span className="font-semibold text-primary">Pro</span> to reduce your transaction fees by up to <span className="font-semibold text-green-600">80%</span> and unlock dedicated VIP support.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  Lower Fees
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-blue-500" />
                  Priority Support
                </div>
              </div>
              <Button asChild size="sm" className="w-full sm:w-auto font-bold transition-all">
                <Link href="/billing?tab=manage">
                  View Upgrade Options
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
