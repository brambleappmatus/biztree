"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "rotate";
    delay?: number;
    duration?: number;
    threshold?: number;
    once?: boolean;
}

export default function ScrollAnimation({
    children,
    className,
    animation = "fade",
    delay = 0,
    duration = 0.6,
    threshold = 0.1,
    once = true,
}: ScrollAnimationProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.disconnect();
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, once]);

    const getAnimationClass = () => {
        const visible = isVisible ? "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0" : "";

        if (!isVisible) {
            switch (animation) {
                case "fade":
                    return "opacity-0";
                case "slide-up":
                    return "opacity-0 translate-y-8";
                case "slide-down":
                    return "opacity-0 -translate-y-8";
                case "slide-left":
                    return "opacity-0 translate-x-8";
                case "slide-right":
                    return "opacity-0 -translate-x-8";
                case "scale":
                    return "opacity-0 scale-95";
                case "rotate":
                    return "opacity-0 rotate-6";
                default:
                    return "opacity-0";
            }
        }

        return visible;
    };

    return (
        <div
            ref={ref}
            className={cn("transition-all", getAnimationClass(), className)}
            style={{
                transitionDelay: `${delay}ms`,
                transitionDuration: `${duration}s`,
            }}
        >
            {children}
        </div>
    );
}
