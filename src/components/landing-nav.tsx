"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LANGUAGES, getTranslation, Language } from "@/lib/i18n";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingNav() {
    const [lang, setLang] = useState<Language>("sk");
    const t = getTranslation(lang);

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                    </div>
                    BizTree
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
                            <Globe size={16} />
                            <span className="uppercase">{lang}</span>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block">
                            {LANGUAGES.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => setLang(l.code)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between",
                                        lang === l.code && "bg-blue-50 text-blue-600 font-medium"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{l.flag}</span> {l.name}
                                    </span>
                                    {lang === l.code && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="hidden sm:block text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                        {t.landing.login}
                    </Link>
                    <Link
                        href="/register"
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
                    >
                        {t.landing.ctaStart}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
