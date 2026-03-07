"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(false)
        // Small delay for the exit animation
        const timer = requestAnimationFrame(() => {
            setIsVisible(true)
        })
        return () => cancelAnimationFrame(timer)
    }, [pathname])

    return (
        <div
            className={`transition-all duration-300 ease-out ${isVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-3 scale-[0.99]"
                }`}
        >
            {children}
        </div>
    )
}
