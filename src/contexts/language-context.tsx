"use client";
// Re-trigger type check

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Language, TRANSLATIONS, getTranslation } from "@/lib/i18n";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof TRANSLATIONS.sk | typeof TRANSLATIONS.en | typeof TRANSLATIONS.cs;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "biztree_language";

// Helper function to detect browser language and map to supported languages
export function detectBrowserLanguage(): Language {
    if (typeof navigator === "undefined") return "sk";

    const browserLang = navigator.language?.toLowerCase().slice(0, 2) || "";

    if (browserLang === "cs") return "cs";
    if (browserLang === "en") return "en";
    // Default to Slovak for Slovak browsers and all others
    return "sk";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("sk");
    const [mounted, setMounted] = useState(false);

    // Initialize from localStorage on client, with browser language detection fallback
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem(STORAGE_KEY) as Language;
        if (stored && ["sk", "en", "cs"].includes(stored)) {
            setLanguageState(stored);
        } else {
            // Detect browser language as fallback
            const browserLang = detectBrowserLanguage();
            setLanguageState(browserLang);
            localStorage.setItem(STORAGE_KEY, browserLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, lang);
        }
    };

    // Recalculate translations whenever language changes
    const t = useMemo(() => getTranslation(language), [language]);

    const value = useMemo(
        () => ({ language, setLanguage, t }),
        [language, t]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        // Return default values during SSR or if provider is missing
        return {
            language: "sk" as Language,
            setLanguage: () => { },
            t: TRANSLATIONS.sk
        };
    }
    return context;
}
