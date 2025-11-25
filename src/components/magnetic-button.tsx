"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    onClick?: () => void;
    href?: string;
}

export default function MagneticButton({
    children,
    className,
    strength = 0.3,
    onClick,
    href,
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;

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
        className: cn("cursor-pointer", className),
    };

    if (href) {
        return (
            <a {...commonProps} href={href}>
                {children}
            </a>
        );
    }

    return (
        <button {...commonProps} onClick={onClick}>
            {children}
        </button>
    );
}
