"use client";

import { Crown, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingPaywallProps {
    onSelectPlan: (plan: 'free' | 'business' | 'pro') => void;
    selectedPlan: 'free' | 'business' | 'pro' | null;
    businessPriceId: string;
    proPriceId: string;
}

const FEATURES = {
    free: [
        "Základný profil",
        "Kontaktné informácie",
        "Sociálne siete",
        "Otváracie hodiny",
    ],
    business: [
        "Všetko z Free",
        "Vlastná doména",
        "Online rezervácie",
        "Správa služieb",
        "Email notifikácie",
        "Analytika návštevnosti",
    ],
    pro: [
        "Všetko z Business",
        "Neomedzené rezervácie",
        "SMS notifikácie",
        "Prioritná podpora",
        "Vlastný branding",
        "API prístup",
    ]
};

export function OnboardingPaywall({ onSelectPlan, selectedPlan, businessPriceId, proPriceId }: OnboardingPaywallProps) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Vyberte si plán 🚀
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Začnite zadarmo alebo odomknite prémiové funkcie
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {/* Business Plan */}
                <button
                    onClick={() => onSelectPlan('business')}
                    className={cn(
                        "relative flex flex-col p-6 rounded-2xl transition-all duration-300 text-left",
                        "bg-white dark:bg-gray-800 border-2 hover:border-blue-700 shadow-2xl",
                        selectedPlan === 'business'
                            ? "border-blue-600 ring-4 ring-blue-200 dark:ring-blue-900 scale-[1.02]"
                            : "border-blue-500"
                    )}
                >
                    {/* Recommended Badge */}
                    <div className={cn(
                        "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-bold rounded-full",
                        selectedPlan === 'business' ? "bg-green-600" : "bg-blue-600"
                    )}>
                        {selectedPlan === 'business' ? 'VYBRANÉ ✓' : 'ODPORÚČANÉ'}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Business
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Pre rastúce firmy</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">€3.90</span>
                            <span className="text-sm text-gray-500">/mesiac</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                            ✨ 7 dní zadarmo
                        </p>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                        {FEATURES.business.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </button>

                {/* Pro Plan */}
                <button
                    onClick={() => onSelectPlan('pro')}
                    className={cn(
                        "relative flex flex-col p-6 rounded-2xl transition-all duration-300 text-left",
                        "bg-white dark:bg-gray-900 border-2 hover:border-yellow-600 dark:hover:border-yellow-500 shadow-xl",
                        selectedPlan === 'pro'
                            ? "border-yellow-500 ring-4 ring-yellow-200 dark:ring-yellow-900 scale-[1.02]"
                            : "border-gray-200 dark:border-gray-800"
                    )}
                >
                    {selectedPlan === 'pro' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            VYBRANÉ ✓
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Crown className="w-5 h-5 text-yellow-500" />
                                Pro
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Pre profesionálov</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">€8.90</span>
                            <span className="text-sm text-gray-500">/mesiac</span>
                        </div>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1">
                            ✨ 7 dní zadarmo
                        </p>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                        {FEATURES.pro.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </button>
            </div>

            {/* Free Option - Styled Card */}
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => onSelectPlan('free')}
                    className={cn(
                        "w-full group flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                        selectedPlan === 'free'
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                            selectedPlan === 'free'
                                ? "border-green-500 bg-green-500"
                                : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                        )}>
                            {selectedPlan === 'free' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="text-left">
                            <span className={cn(
                                "block font-semibold text-base transition-colors",
                                selectedPlan === 'free'
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-gray-900 dark:text-gray-100"
                            )}>
                                Pokračovať zdarma
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Základný plán s obmedzenými funkciami
                            </span>
                        </div>
                    </div>
                </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Bez viazanosti</span>
                </div>
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Zrušiť kedykoľvek</span>
                </div>
                <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Bezpečná platba</span>
                </div>
            </div>
        </div>
    );
}
