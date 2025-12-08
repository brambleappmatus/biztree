"use client";

import React, { useState, useEffect } from "react";
import { Gift, Snowflake } from "lucide-react";

export default function ChristmasFloatingButton() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const christmasSection = document.getElementById("christmas-deal");
            if (christmasSection) {
                const rect = christmasSection.getBoundingClientRect();
                // Hide button when user reaches the Christmas section
                setIsVisible(rect.top > 100);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Check initial position

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToChristmas = () => {
        const christmasSection = document.getElementById("christmas-deal");
        if (christmasSection) {
            christmasSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToChristmas}
            className="fixed top-24 right-6 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-bold text-sm animate-float group"
            aria-label="Scroll to Christmas Deal"
        >
            <Snowflake className="w-4 h-4 animate-spin-slow" />
            <span>Vianočná ponuka</span>
            <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>
    );
}
