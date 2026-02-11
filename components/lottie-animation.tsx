"use client"

import * as React from "react"
import dynamic from "next/dynamic"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface LottieAnimationProps {
  animationData: any
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottieAnimation({ 
  animationData, 
  className, 
  loop = true,
  autoplay = true 
}: LottieAnimationProps) {
  return (
    <div className={className}>
      <Lottie 
        animationData={animationData} 
        loop={loop} 
        autoplay={autoplay}
      />
    </div>
  )
}
