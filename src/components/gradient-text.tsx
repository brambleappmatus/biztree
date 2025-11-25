"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
    from?: string;
    via?: string;
    to?: string;
}

export default function GradientText({
    children,
    className,
    animate = true,
    from = "from-blue-600",
    via = "via-purple-600",
    to = "to-pink-600",
}: GradientTextProps) {
    return (
        <span
            className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                from,
                via,
                to,
                animate && "animate-gradient bg-[length:200%_auto]",
                className
            )}
        >
            {children}
        </span>
    );
}
