"use client";

import { Check, Plus } from "lucide-react";
import { Language } from "@/lib/i18n";

interface Feature {
    id: string;
    name: string;
    description: string | null;
}

interface TierFeature {
    feature: Feature;
}

interface Tier {
    id: string;
    name: string;
    price: any; // Prisma Decimal type
    features: TierFeature[];
}

interface PricingFeaturesListProps {
    allFeatures: Feature[];
    tierFeatures: TierFeature[];
    tierName: string;
    allTiers: Tier[];
    language?: Language;
}

// Translations for feature names per language
const featureTranslationsByLang: Record<Language, Record<string, string>> = {
    sk: {
        "Contact Component": "Kontaktný komponent",
        "Dashboard Access": "Prístup k dashboardu",
        "SEO Settings": "SEO nastavenia",
        "Social Links": "Sociálne odkazy",
        "Background Images (Unsplash)": "Pozadie (Unsplash)",
        "Bookings Management": "Správa rezervácií",
        "Business Card": "Vizitka",
        "Custom Background Upload": "Vlastné pozadie",
        "Custom Links": "Vlastné odkazy",
        "Gallery Component": "Galéria",
        "Opening Hours": "Otváracie hodiny",
        "Services Management": "Správa služieb",
        "Disable Branding": "Bez brandingu",
        "Dokumenty": "Dokumenty",
        "Google Maps Integration": "Google Maps integrácia",
        "Daily Rental Bookings": "Denné prenájmy",
        "Graphical Floor Plan": "Grafický pôdorys",
        "Service Subcategories": "Podkategórie služieb",
        "Concurrent Bookings": "Súbežné rezervácie",
        "Table Reservations": "Rezervácie stolov",
        "Worker Selection": "Výber pracovníka",
        "Worker Management": "Správa pracovníkov",
        "Products & Menu": "Produkty & Menu",
        "Table Management": "Správa stolov",
        "Hourly Service Bookings": "Hodinové rezervácie",
        "Google Calendar": "Google Kalendár",
    },
    en: {
        "Contact Component": "Contact Component",
        "Dashboard Access": "Dashboard Access",
        "SEO Settings": "SEO Settings",
        "Social Links": "Social Links",
        "Background Images (Unsplash)": "Background (Unsplash)",
        "Bookings Management": "Bookings Management",
        "Business Card": "Business Card",
        "Custom Background Upload": "Custom Background",
        "Custom Links": "Custom Links",
        "Gallery Component": "Gallery",
        "Opening Hours": "Opening Hours",
        "Services Management": "Services Management",
        "Disable Branding": "No Branding",
        "Dokumenty": "Documents",
        "Google Maps Integration": "Google Maps Integration",
        "Daily Rental Bookings": "Daily Rental Bookings",
        "Graphical Floor Plan": "Graphical Floor Plan",
        "Service Subcategories": "Service Subcategories",
        "Concurrent Bookings": "Concurrent Bookings",
        "Table Reservations": "Table Reservations",
        "Worker Selection": "Worker Selection",
        "Worker Management": "Worker Management",
        "Products & Menu": "Products & Menu",
        "Table Management": "Table Management",
        "Hourly Service Bookings": "Hourly Service Bookings",
        "Google Calendar": "Google Calendar",
    },
    cs: {
        "Contact Component": "Kontaktní komponenta",
        "Dashboard Access": "Přístup k dashboardu",
        "SEO Settings": "SEO nastavení",
        "Social Links": "Sociální odkazy",
        "Background Images (Unsplash)": "Pozadí (Unsplash)",
        "Bookings Management": "Správa rezervací",
        "Business Card": "Vizitka",
        "Custom Background Upload": "Vlastní pozadí",
        "Custom Links": "Vlastní odkazy",
        "Gallery Component": "Galerie",
        "Opening Hours": "Otevírací hodiny",
        "Services Management": "Správa služeb",
        "Disable Branding": "Bez brandingu",
        "Dokumenty": "Dokumenty",
        "Google Maps Integration": "Google Maps integrace",
        "Daily Rental Bookings": "Denní pronájmy",
        "Graphical Floor Plan": "Grafický půdorys",
        "Service Subcategories": "Podkategorie služeb",
        "Concurrent Bookings": "Souběžné rezervace",
        "Table Reservations": "Rezervace stolů",
        "Worker Selection": "Výběr pracovníka",
        "Worker Management": "Správa pracovníků",
        "Products & Menu": "Produkty & Menu",
        "Table Management": "Správa stolů",
        "Hourly Service Bookings": "Hodinové rezervace",
        "Google Calendar": "Google Kalendář",
    },
};

// Product catalog descriptions per tier per language
const productCatalogByLang: Record<Language, Record<string, string>> = {
    sk: {
        Free: "Katalóg produktov (5 produktov)",
        Business: "Katalóg produktov (20 produktov)",
        Pro: "Katalóg produktov (50 produktov)",
    },
    en: {
        Free: "Product catalog (5 products)",
        Business: "Product catalog (20 products)",
        Pro: "Product catalog (50 products)",
    },
    cs: {
        Free: "Katalog produktů (5 produktů)",
        Business: "Katalog produktů (20 produktů)",
        Pro: "Katalog produktů (50 produktů)",
    },
};

// Inherited tier text per language
const inheritedTextByLang: Record<Language, Record<string, string>> = {
    sk: {
        Business: "Všetko čo vo Free",
        Pro: "Všetko čo v Business",
    },
    en: {
        Business: "Everything in Free",
        Pro: "Everything in Business",
    },
    cs: {
        Business: "Vše z Free",
        Pro: "Vše z Business",
    },
};

export function PricingFeaturesList({ allFeatures, tierFeatures, tierName, allTiers, language = "sk" }: PricingFeaturesListProps) {
    // Get feature IDs for this tier
    const tierFeatureIds = new Set(tierFeatures.map(tf => tf.feature.id));

    // Determine the previous tier based on price
    let previousTierFeatureIds = new Set<string>();

    if (tierName === 'Business') {
        const freeTier = allTiers.find(t => t.name === 'Free');
        if (freeTier) {
            previousTierFeatureIds = new Set(freeTier.features.map(tf => tf.feature.id));
        }
    } else if (tierName === 'Pro') {
        const businessTier = allTiers.find(t => t.name === 'Business');
        if (businessTier) {
            previousTierFeatureIds = new Set(businessTier.features.map(tf => tf.feature.id));
        }
    }

    // Filter to get only NEW features for this tier (not in previous tier)
    // Sort by feature.id to ensure consistent order between server and client (prevents hydration mismatch)
    const newFeaturesForTier = allFeatures
        .filter(feature =>
            tierFeatureIds.has(feature.id) && !previousTierFeatureIds.has(feature.id)
        )
        .sort((a, b) => a.id.localeCompare(b.id));

    // Determine what to show based on tier
    const showInheritedLine = tierName === 'Business' || tierName === 'Pro';
    const inheritedText = inheritedTextByLang[language]?.[tierName] || (tierName === 'Business' ? 'Všetko čo vo Free' : 'Všetko čo v Business');

    // Translate feature name
    const translateFeature = (name: string) => featureTranslationsByLang[language]?.[name] || name;

    // Get product catalog info for this tier
    const productCatalogText = productCatalogByLang[language]?.[tierName];

    return (
        <div className="space-y-2 mb-4">
            <div className="space-y-2">
                {/* Show inherited features line for Business and Pro */}
                {showInheritedLine && (
                    <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full p-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {inheritedText}
                        </span>
                    </div>
                )}

                {/* Show only the NEW features for this tier */}
                {newFeaturesForTier.map((feature) => (
                    <div
                        key={feature.id}
                        className="flex items-start gap-2.5"
                    >
                        <div className="mt-0.5 rounded-full p-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Plus className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                            {translateFeature(feature.name)}
                        </span>
                    </div>
                ))}

                {/* Product Catalog Feature */}
                {productCatalogText && (
                    <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 rounded-full p-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Plus className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                            {productCatalogText}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

