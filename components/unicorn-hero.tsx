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
      {/* Gradient Overlays - Lighter to show background image clearly */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
    </div>
  )
}
