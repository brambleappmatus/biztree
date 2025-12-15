"use client";

import { useState } from "react";
import { Crown, Sparkles, Star, Check } from "lucide-react";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";
import { PricingFeaturesList } from "@/components/subscription/pricing-features-list";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

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
    trialEndsAt?: Date | null;
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
    redirectUrl,
    trialEndsAt
}: PricingSectionProps) {
    const { t } = useLanguage();
    // Detect the user's current billing cycle from their subscription
    const detectBillingCycle = (): 'monthly' | 'yearly' | 'lifetime' => {
        if (!activeSubscription?.stripePriceId) return 'monthly';

        const priceId = activeSubscription.stripePriceId;

        // Check if it's a lifetime subscription
        const lifetimePriceIds = Object.values(priceIds.lifetime);
        if (lifetimePriceIds.includes(priceId)) {
            return 'lifetime';
        }

        // Check if it's a yearly subscription
        const yearlyPriceIds = Object.values(priceIds.yearly);
        if (yearlyPriceIds.includes(priceId)) {
            return 'yearly';
        }

        // Default to monthly
        return 'monthly';
    };

    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>(detectBillingCycle());

    // Check if user has already used a trial
    const hasUsedTrial = !!trialEndsAt;

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
                        {t.pricing.monthly}
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
                        {t.pricing.yearly}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                            -25%
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
                            {t.pricing.lifetime}
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
                        // Check if this is the user's current tier AND billing cycle
                        const isCurrentTierAndCycle = (() => {
                            if (currentTier?.id !== tier.id) return false;

                            // If user has an active subscription, check if the billing cycle matches
                            if (activeSubscription?.stripePriceId) {
                                const priceId = activeSubscription.stripePriceId;

                                if (billingCycle === 'lifetime') {
                                    return Object.values(priceIds.lifetime).includes(priceId);
                                } else if (billingCycle === 'yearly') {
                                    return Object.values(priceIds.yearly).includes(priceId);
                                } else {
                                    return Object.values(priceIds.monthly).includes(priceId);
                                }
                            }

                            // If no active subscription, only match on monthly Free tier
                            return billingCycle === 'monthly' && tier.name === 'Free';
                        })();

                        const isCurrentTier = isCurrentTierAndCycle;

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
                            period = t.pricing.perMonth;
                        } else if (billingCycle === 'yearly') {
                            displayPrice = prices.yearly[tier.name] || 0;
                            priceId = priceIds.yearly[tier.name] || '';
                            period = t.pricing.perYear;
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

                        // Treat cancelled subscriptions as inactive for OTHER tiers
                        // This allows switching from cancelled Business to Pro trial
                        const isCurrentTierCard = isCurrentTierAndCycle;
                        const isCancelled = activeSubscription?.cancelAtPeriodEnd || false;
                        const hasActiveSubscription = !!activeSubscription && (!isCancelled || isCurrentTierCard);


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
                                                    🔥 {t.pricing.lifetimeLicense}
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
                                                <span className="text-sm text-gray-500 ml-1">{t.pricing.oneTime}</span>
                                            )}
                                        </div>
                                        {billingCycle === 'lifetime' ? (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">
                                                ⚡ {t.pricing.payOnceUseForever}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {tier.name === 'Free' && t.pricing.idealForStart}
                                                {tier.name === 'Business' && t.pricing.forGrowingBusiness}
                                                {tier.name === 'Pro' && t.pricing.forProfessionals}
                                            </p>
                                        )}
                                        {billingCycle === 'yearly' && (
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                                {t.pricing.saveYearly.replace('{{amount}}', String(Math.round((prices.monthly[tier.name] * 12 - displayPrice) * 100) / 100))}
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
                                            stripeSubscriptionId={activeSubscription?.stripeSubscriptionId}
                                            isYearly={billingCycle === 'yearly'}
                                            hasUsedTrial={hasUsedTrial}
                                            isCurrentTier={isCurrentTierCard}
                                        />
                                    ) : (
                                        <div className="w-full py-2.5 text-center text-gray-400 text-sm">
                                            {t.pricing.unavailable}
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
