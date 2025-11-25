"use client";

import { Check, Plus } from "lucide-react";

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
}

// Slovak translations for feature names
const featureTranslations: Record<string, string> = {
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
};

export function PricingFeaturesList({ allFeatures, tierFeatures, tierName, allTiers }: PricingFeaturesListProps) {
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
    const newFeaturesForTier = allFeatures.filter(feature =>
        tierFeatureIds.has(feature.id) && !previousTierFeatureIds.has(feature.id)
    );

    // Determine what to show based on tier
    const showInheritedLine = tierName === 'Business' || tierName === 'Pro';
    const inheritedText = tierName === 'Business' ? 'Všetko čo vo Free' : 'Všetko čo v Business';

    // Translate feature name
    const translateFeature = (name: string) => featureTranslations[name] || name;

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
            </div>
        </div>
    );
}
