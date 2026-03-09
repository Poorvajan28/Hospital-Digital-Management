"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
    value: number
    duration?: number
    suffix?: string
    prefix?: string
    className?: string
    decimals?: number
}

export function AnimatedCounter({
    value,
    duration = 1200,
    suffix = "",
    prefix = "",
    className = "",
    decimals = 0,
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (hasAnimated.current) {
            setCount(value)
            return
        }
        hasAnimated.current = true

        const startTime = performance.now()
        const startValue = 0

        function animate(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = startValue + (value - startValue) * eased

            setCount(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setCount(value)
            }
        }

        requestAnimationFrame(animate)
    }, [value, duration])

    const displayValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toLocaleString("en-IN")

    return (
        <span ref={ref} className={className}>
            {prefix}{displayValue}{suffix}
        </span>
    )
}
