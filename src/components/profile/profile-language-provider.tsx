"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { Language } from "@/lib/i18n";

interface ProfileLanguageProviderProps {
    children: (lang: Language) => ReactNode;
    defaultLang: Language;
}

export function ProfileLanguageProvider({ children, defaultLang }: ProfileLanguageProviderProps) {
    const [lang, setLang] = useState<Language>(defaultLang);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("biztree_language") as Language;
        if (stored && ["sk", "en", "cs"].includes(stored)) {
            setLang(stored);
        }
    }, []);

    // During SSR or before mount, use default language
    if (!mounted) {
        return <>{children(defaultLang)}</>;
    }

    return <>{children(lang)}</>;
}
