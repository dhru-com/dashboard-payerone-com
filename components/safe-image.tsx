"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { Wallet } from "lucide-react"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
  fallbackIcon?: React.ReactNode
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/logos/wallet.svg",
  fallbackIcon,
  className,
  ...props
}: SafeImageProps) {
  const [error, setError] = React.useState(false)

  if (error) {
    if (fallbackIcon) {
      return (
        <div className={className} style={{ width: props.width, height: props.height }}>
          {fallbackIcon}
        </div>
      )
    }
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        className={className}
        {...props}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      {...props}
      onError={() => setError(true)}
    />
  )
}
