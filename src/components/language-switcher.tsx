"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { LANGUAGES, Language } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
    variant?: "default" | "compact" | "white";
    className?: string;
}

export default function LanguageSwitcher({ variant = "default", className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    if (variant === "compact") {
        return (
            <div ref={dropdownRef} className={cn("relative", className)}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                    <Globe size={16} />
                    <span className="uppercase font-medium">{currentLang.code}</span>
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                                    language === lang.code && "bg-blue-50 text-blue-600 font-medium"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{lang.flag}</span> {lang.name}
                                </span>
                                {language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (variant === "white") {
        return (
            <div ref={dropdownRef} className={cn("relative", className)}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-white"
                >
                    <Globe size={16} />
                    <span className="uppercase font-medium">{currentLang.code}</span>
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 text-gray-900">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                                    language === lang.code && "bg-blue-50 text-blue-600 font-medium"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{lang.flag}</span> {lang.name}
                                </span>
                                {language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
            >
                <Globe size={16} />
                <span className="uppercase">{currentLang.code}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors",
                                language === lang.code && "bg-blue-50 text-blue-600 font-medium"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span>{lang.flag}</span> {lang.name}
                            </span>
                            {language === lang.code && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
