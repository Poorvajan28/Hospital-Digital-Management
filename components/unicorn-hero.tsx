"use client"

import Image from "next/image"

export function UnicornHero() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Hospital Background Image */}
      <Image
        src="/images/hospital-hero.jpg"
        alt="Modern hospital building"
        fill
        className="object-cover"
        priority
      />
      {/* Gradient Overlays - Balanced to show background while maintaining text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/25 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
    </div>
  )
}
