"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
}

export default function MagneticButton({
    children,
    className,
    strength = 0.3,
    onClick,
    href,
    disabled = false,
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current || disabled) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const style = {
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.2s ease-out",
    };

    const commonProps = {
        ref: ref as any,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style,
        className: cn("cursor-pointer", className, disabled && "opacity-70 cursor-not-allowed transform-none"),
    };

    if (href && !disabled) {
        return (
            <a {...commonProps} href={href}>
                {children}
            </a>
        );
    }

    return (
        <button {...commonProps} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
}
