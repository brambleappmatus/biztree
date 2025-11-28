import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Crown, Sparkles, Calendar, Shield, Star } from "lucide-react";
import { PricingSection } from "@/components/subscription/pricing-section";
import { CancelSubscriptionButton } from "@/components/subscription/cancel-subscription-button";
import { SubscriptionSuccessHandler } from "@/components/subscription/subscription-success-handler";
import { getStripePrices } from "@/lib/stripe";

export default async function SubscriptionPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                select: {
                    id: true,
                    subscriptionStatus: true,
                    subscriptionExpiresAt: true,
                    trialEndsAt: true,
                    createdAt: true,
                    tier: {
                        include: {
                            features: {
                                include: {
                                    feature: true
                                }
                            }
                        }
                    },
                    subscriptions: {
                        where: {
                            status: { in: ['ACTIVE', 'TRIAL', 'TRIALING', 'PAST_DUE'] }
                        },
                        take: 1
                    }
                }
            }
        }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    const profile = user.profiles[0];
    const currentTier = profile.tier;
    const subscriptionStatus = profile.subscriptionStatus;
    const expiresAt = profile.subscriptionExpiresAt;
    const activeSubscription = profile.subscriptions[0];

    // Get all tiers with features
    const tiers = await prisma.tier.findMany({
        include: {
            features: {
                include: {
                    feature: true
                }
            }
        },
        orderBy: { price: 'asc' }
    });

    // Get all features for comparison
    const allFeatures = await prisma.feature.findMany({
        orderBy: { name: 'asc' }
    });

    // Define pricing structure
    const priceIds = {
        monthly: {
            'Business': process.env.STRIPE_BUSINESS_PRICE_ID || '',
            'Pro': process.env.STRIPE_PRO_PRICE_ID || '',
        },
        yearly: {
            'Business': process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
            'Pro': process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
        },
        lifetime: {
            'Business': process.env.STRIPE_BUSINESS_LIFETIME_PRICE_ID || '',
            'Pro': process.env.STRIPE_PRO_LIFETIME_PRICE_ID || '',
        }
    };

    // Fetch prices from Stripe
    const allPriceIds = [
        priceIds.monthly['Business'],
        priceIds.monthly['Pro'],
        priceIds.yearly['Business'],
        priceIds.yearly['Pro'],
        priceIds.lifetime['Business'],
        priceIds.lifetime['Pro'],
    ].filter(Boolean);

    const stripePrices = await getStripePrices(allPriceIds);

    const getPriceAmount = (id: string, fallback: number) => {
        const price = stripePrices.find(p => p.id === id);
        return price && price.unit_amount ? price.unit_amount / 100 : fallback;
    };

    // Define prices
    const monthlyPrices = {
        'Free': 0,
        'Business': getPriceAmount(priceIds.monthly['Business'], 3.90),
        'Pro': getPriceAmount(priceIds.monthly['Pro'], 8.90),
    };

    const prices = {
        monthly: monthlyPrices,
        yearly: {
            'Free': 0,
            'Business': getPriceAmount(priceIds.yearly['Business'], 35.00),
            'Pro': getPriceAmount(priceIds.yearly['Pro'], 79.00),
        },
        lifetime: {
            'Free': 0,
            'Business': getPriceAmount(priceIds.lifetime['Business'], parseFloat(process.env.STRIPE_BUSINESS_LIFETIME_PRICE || '69')),
            'Pro': getPriceAmount(priceIds.lifetime['Pro'], parseFloat(process.env.STRIPE_PRO_LIFETIME_PRICE || '119')),
        }
    };

    // Check if lifetime deals are enabled
    const enableLifetime = process.env.ENABLE_LIFETIME_DEALS === 'true';

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="text-center space-y-4 pt-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    Investujte do svojho podnikania
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Vyberte si plán, ktorý najlepšie vyhovuje vašim potrebám a posuňte svoje podnikanie na vyššiu úroveň.
                </p>
            </div>

            {/* Current Membership Card */}
            <div className="max-w-3xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-black text-white shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />

                    <div className="relative p-8 md:p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Aktuálne členstvo</p>
                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                    {currentTier ? (
                                        <>
                                            {currentTier.name === 'Pro' && <Crown className="w-8 h-8 text-yellow-400" />}
                                            {currentTier.name === 'Business' && <Sparkles className="w-8 h-8 text-blue-400" />}
                                            {currentTier.name} Member
                                        </>
                                    ) : (
                                        'Free Member'
                                    )}
                                </h2>
                            </div>
                            {activeSubscription?.cancelAtPeriodEnd && expiresAt && new Date(expiresAt) > new Date() ? (
                                <span className="px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-sm font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Zrušené
                                </span>
                            ) : subscriptionStatus === "ACTIVE" ? (
                                <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Aktívne predplatné
                                </span>
                            ) : (subscriptionStatus === "TRIAL" || subscriptionStatus === "TRIALING") ? (
                                <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium flex items-center gap-2">
                                    <Star className="w-4 h-4" />
                                    Skúšobná doba
                                </span>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cena</p>
                                <p className="text-xl font-semibold">
                                    {subscriptionStatus === "LIFETIME"
                                        ? 'Lifetime'
                                        : currentTier?.name === 'Free'
                                            ? 'Zdarma'
                                            : `€${currentTier?.price}/mesiac`
                                    }
                                </p>
                            </div>
                            {currentTier?.name !== 'Free' && subscriptionStatus !== "LIFETIME" && (
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                                        {activeSubscription?.cancelAtPeriodEnd ? 'Platné do' : 'Ďalšia platba'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-lg">
                                            {expiresAt
                                                ? new Date(expiresAt).toLocaleDateString('sk-SK')
                                                : 'Navždy'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Členom od</p>
                                <p className="text-lg">
                                    {new Date(profile.createdAt).toLocaleDateString('sk-SK')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <PricingSection
                tiers={tiers}
                currentTier={currentTier}
                activeSubscription={activeSubscription}
                allFeatures={allFeatures}
                priceIds={priceIds}
                prices={prices}
                enableLifetime={enableLifetime}
                trialEndsAt={profile.trialEndsAt}
            />

            {/* Cancel Subscription/Trial Button */}
            <CancelSubscriptionButton subscriptionStatus={subscriptionStatus} />

            {/* Success/Cancel Handler */}
            <SubscriptionSuccessHandler />
        </div>
    );
}
