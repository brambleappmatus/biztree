"use client";

import { useState } from "react";
import { Crown, Sparkles, Star, Check } from "lucide-react";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";
import { PricingFeaturesList } from "@/components/subscription/pricing-features-list";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
    tiers: any[];
    currentTier: any;
    activeSubscription: any;
    allFeatures: any[];
    priceIds: {
        monthly: Record<string, string>;
        yearly: Record<string, string>;
        lifetime: Record<string, string>;
    };
    prices: {
        monthly: Record<string, number>;
        yearly: Record<string, number>;
        lifetime: Record<string, number>;
    };
    enableLifetime: boolean;
    buttonText?: string;
    redirectUrl?: string;
}

export function PricingSection({
    tiers,
    currentTier,
    activeSubscription,
    allFeatures,
    priceIds,
    prices,
    enableLifetime,
    buttonText,
    redirectUrl
}: PricingSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');

    return (
        <div className="space-y-8">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            billingCycle === 'monthly'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        Mesačne
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                            billingCycle === 'yearly'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        )}
                    >
                        Ročne
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                            -20%
                        </span>
                    </button>
                    {enableLifetime && (
                        <button
                            onClick={() => setBillingCycle('lifetime')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                                billingCycle === 'lifetime'
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                            )}
                        >
                            Navždy
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                LTD
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Pricing Cards */}
            <div className={cn(
                "grid grid-cols-1 gap-4 lg:gap-6",
                billingCycle === 'monthly'
                    ? "md:grid-cols-3"
                    : "md:grid-cols-2 max-w-4xl mx-auto"
            )}>
                {tiers
                    .filter(tier => {
                        // Hide Free tier for yearly/lifetime views
                        if (billingCycle !== 'monthly' && tier.name === 'Free') {
                            return false;
                        }
                        return true;
                    })
                    .map((tier) => {
                        const isCurrentTier = currentTier?.id === tier.id && billingCycle === 'monthly'; // Simplification: current tier is usually monthly unless we track cycle
                        // Actually, we should check if the user has a lifetime subscription if billingCycle is lifetime
                        // But for now, let's stick to the basic logic and refine.

                        const isPro = tier.name === 'Pro';
                        const isBusiness = tier.name === 'Business';
                        const isFree = tier.name === 'Free';

                        // Determine Price and ID based on cycle
                        let displayPrice = 0;
                        let priceId = '';
                        let period = '/mesiac';

                        if (billingCycle === 'monthly') {
                            displayPrice = prices.monthly[tier.name] || 0;
                            priceId = priceIds.monthly[tier.name] || '';
                            period = '/mesiac';
                        } else if (billingCycle === 'yearly') {
                            displayPrice = prices.yearly[tier.name] || 0;
                            priceId = priceIds.yearly[tier.name] || '';
                            period = '/rok';
                        } else {
                            displayPrice = prices.lifetime[tier.name] || 0;
                            priceId = priceIds.lifetime[tier.name] || '';
                            period = '';
                        }

                        // Skip Free tier for Yearly/Lifetime if it doesn't make sense (usually Free is always there but 0)
                        // But for Yearly/Lifetime views, maybe we still show Free as 0?
                        // The image shows Pro and Business for Yearly/Lifetime. Free is likely not applicable or just 0.
                        if (billingCycle !== 'monthly' && isFree) {
                            // Maybe render a placeholder or just keep it as 0
                        }

                        // Logic for downgrade/upgrade
                        // This is complex with different cycles. 
                        // For now, if it's not the current active plan, we show the button to switch.

                        const showActions = !isFree || billingCycle === 'monthly';

                        // Determine if this is a downgrade
                        const tierOrder = ['Free', 'Business', 'Pro'];
                        const currentTierName = currentTier?.name || 'Free';
                        const currentTierIndex = tierOrder.indexOf(currentTierName);
                        const targetTierIndex = tierOrder.indexOf(tier.name);
                        const isDowngrade = targetTierIndex < currentTierIndex;
                        const hasActiveSubscription = !!activeSubscription;

                        return (
                            <div
                                key={tier.id}
                                className={cn(
                                    "relative flex flex-col rounded-2xl transition-all duration-300",
                                    isBusiness
                                        ? "bg-white dark:bg-gray-800 ring-2 ring-blue-600 shadow-2xl"
                                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xl"
                                )}
                            >
                                {/* ... (badges and header) ... */}

                                <div className="p-5 md:p-6 flex-1">
                                    {/* ... (price and features) ... */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className={cn("text-xl font-bold", isBusiness ? "text-blue-600 dark:text-blue-400" : "")}>
                                                {tier.name}
                                            </h3>
                                            {billingCycle === 'lifetime' && (
                                                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                                                    🔥 Licencia navždy
                                                </p>
                                            )}
                                        </div>
                                        {isPro && <Crown className="w-5 h-5 text-yellow-500" />}
                                        {isBusiness && <Sparkles className="w-5 h-5 text-blue-400" />}
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                €{displayPrice}
                                            </span>
                                            {period && <span className="text-sm text-gray-500">{period}</span>}
                                            {billingCycle === 'lifetime' && (
                                                <span className="text-sm text-gray-500 ml-1">jednorazovo</span>
                                            )}
                                        </div>
                                        {billingCycle === 'lifetime' ? (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">
                                                ⚡ Platíte raz, používate navždy
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {tier.name === 'Free' && "Ideálne pre začiatok"}
                                                {tier.name === 'Business' && "Pre rastúce firmy"}
                                                {tier.name === 'Pro' && "Pre profesionálov"}
                                            </p>
                                        )}
                                        {billingCycle === 'yearly' && (
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                                Ušetríte €{Math.round((prices.monthly[tier.name] * 12 - displayPrice) * 100) / 100} ročne
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <PricingFeaturesList
                                            allFeatures={allFeatures}
                                            tierFeatures={tier.features}
                                            tierName={tier.name}
                                            allTiers={tiers}
                                        />
                                    </div>
                                </div>

                                <div className="p-5 md:p-6 pt-0 mt-auto">
                                    {priceId || isFree ? (
                                        <SubscriptionActions
                                            tierId={tier.id}
                                            tierName={tier.name}
                                            priceId={priceId}
                                            hasActiveSubscription={hasActiveSubscription}
                                            cancelAtPeriodEnd={activeSubscription?.cancelAtPeriodEnd || false}
                                            isDowngrade={isDowngrade}
                                            isFree={isFree}
                                            mode={billingCycle === 'lifetime' ? 'payment' : 'subscription'}
                                            buttonText={buttonText}
                                            redirectUrl={redirectUrl}
                                        />
                                    ) : (
                                        <div className="w-full py-2.5 text-center text-gray-400 text-sm">
                                            Nedostupné
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
