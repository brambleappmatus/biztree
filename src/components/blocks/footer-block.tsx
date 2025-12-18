"use client";

import React, { useState, useEffect } from "react";
import { getTranslation, Language, LANGUAGES } from "@/lib/i18n";

export default function FooterBlock({ lang: initialLang, bgImage, showBranding = true }: { lang: Language; bgImage: string | null; showBranding?: boolean }) {
    const [lang, setLang] = useState<Language>(initialLang);
    const t = getTranslation(lang);

    // Sync with localStorage and update page
    useEffect(() => {
        const stored = localStorage.getItem("biztree_language") as Language;
        if (stored && ["sk", "en", "cs"].includes(stored)) {
            setLang(stored);
        }
    }, []);

    const cycleLang = () => {
        const currentIndex = LANGUAGES.findIndex(l => l.code === lang);
        const nextIndex = (currentIndex + 1) % LANGUAGES.length;
        const nextLang = LANGUAGES[nextIndex].code;
        setLang(nextLang);
        localStorage.setItem("biztree_language", nextLang);
        // Reload to apply new language across the page
        window.location.reload();
    };

    const currentFlag = LANGUAGES.find(l => l.code === lang)?.flag || "🌐";

    return (
        <div className="text-center py-6 text-xs opacity-90" style={{ color: 'var(--header-text)' }}>
            {showBranding && (
                <div className="mb-4">
                    <p className="font-medium opacity-80 mb-1">{t.common.poweredBy}</p>
                    <a
                        href="https://biztree.sk"
                        className="inline-block px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all font-semibold"
                    >
                        {t.common.createOwn}
                    </a>
                </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-3 text-[10px] opacity-60">
                <a href="/cookies" className="hover:underline">Cookies</a>
                <span>•</span>
                <a href="/privacy" className="hover:underline">Privacy</a>
                <span>•</span>
                <button
                    onClick={cycleLang}
                    className="hover:underline flex items-center gap-1"
                    title="Change language"
                >
                    <span>{currentFlag}</span>
                    <span className="uppercase">{lang}</span>
                </button>
            </div>
        </div>
    );
}
