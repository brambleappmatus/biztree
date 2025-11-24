"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltProps {
    children: React.ReactNode;
    className?: string;
    rotationFactor?: number;
    isReverse?: boolean;
    springOptions?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };
    style?: React.CSSProperties;
}

export default function Tilt({
    children,
    className = "",
    rotationFactor = 15,
    isReverse = false,
    springOptions = { stiffness: 300, damping: 30, mass: 0.5 },
    style = {},
}: TiltProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(
        useTransform(y, [-0.5, 0.5], [
            isReverse ? -rotationFactor : rotationFactor,
            isReverse ? rotationFactor : -rotationFactor,
        ]),
        springOptions
    );

    const rotateY = useSpring(
        useTransform(x, [-0.5, 0.5], [
            isReverse ? rotationFactor : -rotationFactor,
            isReverse ? -rotationFactor : rotationFactor,
        ]),
        springOptions
    );

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                ...style,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
