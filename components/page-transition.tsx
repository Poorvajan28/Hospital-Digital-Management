"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, useRef, type ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [phase, setPhase] = useState<"enter" | "idle">("enter")
    const prevPathname = useRef(pathname)

    useEffect(() => {
        if (pathname !== prevPathname.current) {
            prevPathname.current = pathname
            setPhase("enter")
            const timer = setTimeout(() => setPhase("idle"), 500)
            return () => clearTimeout(timer)
        }
    }, [pathname])

    // Initial mount
    useEffect(() => {
        const timer = setTimeout(() => setPhase("idle"), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div
            className={`transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === "enter"
                    ? "animate-page-enter"
                    : ""
                }`}
        >
            {children}
        </div>
    )
}
