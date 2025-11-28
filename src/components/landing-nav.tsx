"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";

export default function LandingNav() {
    const [scrolled, setScrolled] = useState(false);
    const { t, language } = useLanguage();

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
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300",
                        scrolled && "scale-95"
                    )}>
                        <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="group-hover:text-blue-600 transition-colors">BizTree</span>
                </Link>

                {/* Desktop Navigation Pill */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1.5 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-full shadow-sm">
                    {[
                        { href: "/", label: language === 'sk' ? 'Domov' : 'Home' },
                        { href: "#features", label: t.landing.features },
                        { href: "#showcase", label: language === 'sk' ? 'Ukážky' : 'Showcase' },
                        { href: "#pricing", label: t.landing.pricing },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="w-px h-4 bg-gray-200 mx-1" />

                    <div className="px-1 scale-90">
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Right Actions Pill */}
                <div className="flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-full shadow-sm">
                    {/* Mobile Language Switcher */}
                    <div className="md:hidden px-1 scale-90">
                        <LanguageSwitcher />
                    </div>

                    <Link
                        href="/login"
                        className="hidden sm:block px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all"
                    >
                        {t.landing.login}
                    </Link>
                    <Link
                        href="/register"
                        className={cn(
                            "px-5 py-2 rounded-full text-sm font-medium transition-all",
                            "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                        )}
                    >
                        <span className="sm:hidden">{t.landing.startNow}</span>
                        <span className="hidden sm:inline">{t.landing.ctaStart}</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

