import { sk } from "./sk";
import { en } from "./en";

export type Language = "sk" | "en";

export const LANGUAGES = [
    { code: "sk" as Language, name: "Slovenčina", flag: "🇸🇰" },
    { code: "en" as Language, name: "English", flag: "🇬🇧" },
] as const;

export const TRANSLATIONS = {
    sk,
    en,
} as const;

export function getTranslation(lang: string) {
    const translations = TRANSLATIONS[lang as Language];
    return translations || TRANSLATIONS.sk;
}
