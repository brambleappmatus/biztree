"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";

export default function LandingNav() {
    const [scrolled, setScrolled] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-lg"
                    : "bg-white/80 backdrop-blur-md border-b border-gray-100"
            )}
        >
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300",
                        scrolled && "scale-95"
                    )}>
                        <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="group-hover:text-blue-600 transition-colors">BizTree</span>
                </Link>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />

                    <Link
                        href="/login"
                        className="hidden sm:block text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                        {t.landing.login}
                    </Link>
                    <Link
                        href="/register"
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
                            scrolled
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                    >
                        {t.landing.ctaStart}
                    </Link>
                </div>
            </div>
        </nav>
    );
}

