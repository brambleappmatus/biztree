import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Check, Crown, Sparkles, CreditCard, Calendar, Shield, Star, Zap } from "lucide-react";
import { SubscriptionActions } from "@/components/subscription/subscription-actions";
import { PricingFeaturesList } from "@/components/subscription/pricing-features-list";

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
                            status: { in: ['ACTIVE', 'TRIAL', 'PAST_DUE'] }
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

    // Map tier names to Stripe price IDs
    const tierPriceMap: Record<string, string> = {
        'Business': process.env.STRIPE_BUSINESS_PRICE_ID || '',
        'Pro': process.env.STRIPE_PRO_PRICE_ID || '',
    };

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
                            {subscriptionStatus === "ACTIVE" && (
                                <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Aktívne predplatné
                                </span>
                            )}
                            {subscriptionStatus === "TRIAL" && (
                                <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium flex items-center gap-2">
                                    <Star className="w-4 h-4" />
                                    Skúšobná doba
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cena</p>
                                <p className="text-xl font-semibold">
                                    {currentTier ? `€${currentTier.price}/mesiac` : 'Zdarma'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ďalšia platba</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="text-lg">
                                        {expiresAt ? new Date(expiresAt).toLocaleDateString('sk-SK') : 'Navždy'}
                                    </p>
                                </div>
                            </div>
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

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-8">
                {tiers.map((tier) => {
                    const isCurrentTier = currentTier?.id === tier.id;
                    const isPro = tier.name === 'Pro';
                    const isBusiness = tier.name === 'Business';

                    // Logic for downgrade detection
                    // Assuming price is a good proxy for rank. Free (0) < Business (3.9) < Pro (8.9)
                    // If current tier price > tier price, it's a downgrade option
                    const currentPrice = currentTier?.price ? Number(currentTier.price) : 0;
                    const tierPrice = tier.price ? Number(tier.price) : 0;
                    const isDowngrade = currentPrice > tierPrice;
                    const isFree = tier.name === 'Free';

                    return (
                        <div
                            key={tier.id}
                            className={`relative flex flex-col rounded-2xl transition-all duration-300 ${isBusiness
                                ? 'bg-white dark:bg-gray-800 ring-2 ring-blue-600 shadow-2xl scale-105 z-10'
                                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xl'
                                }`}
                        >
                            {isBusiness && (
                                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                                        <Star className="w-3 h-3 fill-current" />
                                        Najpopulárnejšie
                                    </span>
                                </div>
                            )}

                            <div className="p-5 md:p-6 flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-xl font-bold ${isBusiness ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                        {tier.name}
                                    </h3>
                                    {isPro && <Crown className="w-5 h-5 text-yellow-500" />}
                                    {isBusiness && <Sparkles className="w-5 h-5 text-blue-400" />}
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">€{tier.price?.toString()}</span>
                                        <span className="text-sm text-gray-500">/mesiac</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {tier.name === 'Free' && "Ideálne pre začiatok"}
                                        {tier.name === 'Business' && "Pre rastúce firmy"}
                                        {tier.name === 'Pro' && "Pre profesionálov"}
                                    </p>
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
                                {isCurrentTier ? (
                                    // Current Tier
                                    activeSubscription && tierPriceMap[tier.name] ? (
                                        <SubscriptionActions
                                            tierId={tier.id}
                                            tierName={tier.name}
                                            priceId={tierPriceMap[tier.name]}
                                            hasActiveSubscription={true}
                                            cancelAtPeriodEnd={activeSubscription.cancelAtPeriodEnd || false}
                                        />
                                    ) : (
                                        <div className="w-full py-2.5 text-center text-gray-500 text-sm font-medium bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            Váš aktuálny plán
                                        </div>
                                    )
                                ) : (
                                    // Not Current Tier (Upgrade or Downgrade)
                                    (tierPriceMap[tier.name] || isFree) && (
                                        <SubscriptionActions
                                            tierId={tier.id}
                                            tierName={tier.name}
                                            priceId={tierPriceMap[tier.name] || ''}
                                            hasActiveSubscription={false} // Always false for non-current tiers in this context (we want upgrade/downgrade buttons)
                                            cancelAtPeriodEnd={false}
                                            isDowngrade={isDowngrade}
                                            isFree={isFree}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
