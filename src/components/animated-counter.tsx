"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    className?: string;
    threshold?: number;
}

export default function AnimatedCounter({
    end,
    duration = 2,
    suffix = "",
    className,
    threshold = 0.1,
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);

                    const startTime = Date.now();
                    const endTime = startTime + duration * 1000;

                    const updateCount = () => {
                        const now = Date.now();
                        const progress = Math.min((now - startTime) / (duration * 1000), 1);

                        // Smoother easing function (easeOutCubic instead of easeOutQuart)
                        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

                        // Use Math.round for smoother transition without final jump
                        const currentCount = Math.round(easeOutCubic * end);

                        setCount(currentCount);

                        if (now < endTime) {
                            requestAnimationFrame(updateCount);
                        }
                    };

                    requestAnimationFrame(updateCount);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [end, duration, hasAnimated, threshold]);

    return (
        <div ref={ref} className={cn("tabular-nums", className)}>
            {count}{suffix}
        </div>
    );
}
