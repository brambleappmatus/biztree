"use client";

import React, { useState } from "react";
import { Sparkles, Star, Zap, Mail, Check, CreditCard, Loader2 } from "lucide-react";
import ScrollAnimation from "@/components/scroll-animation";
import MagneticButton from "@/components/magnetic-button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface ChristmasDealSectionProps {
    prices: {
        lifetime: {
            Business: number;
            Pro: number;
        };
    };
    priceIds: {
        lifetime: {
            Business: string;
            Pro: string;
        };
    };
}

export default function ChristmasDealSection({ prices, priceIds }: ChristmasDealSectionProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState<string | null>(null);

    const handlePurchase = async (priceId: string, planName: string) => {
        try {
            setLoading(planName);
            const response = await fetch('/api/stripe/create-guest-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Failed to create checkout session');
                setLoading(null);
            }
        } catch (error) {
            console.error('Error:', error);
            setLoading(null);
        }
    };

    return (
        <section id="christmas-deal" className="relative py-24 px-4 overflow-hidden bg-white">
            {/* Soft Gradient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-b-[50%] pointer-events-none -z-10" />

            {/* Decorative floating orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <ScrollAnimation animation="slide-up">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span>{t.christmas.limitedOffer}</span>
                            <Zap className="w-4 h-4 text-blue-500" />
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
                            {t.christmas.headline} <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                                {t.christmas.headlineHighlight}
                            </span>
                        </h2>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            {t.christmas.description}
                            <br />
                            <span className="text-blue-600 font-medium">{t.christmas.perfectGift}</span>
                        </p>
                    </div>
                </ScrollAnimation>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                    {/* Business Plan */}
                    <ScrollAnimation animation="slide-up" delay={100}>
                        <div className="relative bg-white text-gray-900 rounded-3xl p-8 hover:transform hover:-translate-y-2 transition-all duration-300 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-blue-100 group h-full flex flex-col min-h-[550px]">
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                                <div className="bg-white text-blue-600 border border-blue-100 px-6 py-2 rounded-full font-bold shadow-sm flex items-center gap-2 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                    <Star className="w-4 h-4 fill-current" />
                                    Business Lifetime
                                </div>
                            </div>

                            <div className="mt-12 text-center flex-grow flex flex-col">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-5xl font-bold text-gray-900">{prices.lifetime.Business}€</span>
                                </div>
                                <div className="text-gray-500 font-medium mb-8">{t.christmas.oneTimePayment}</div>

                                <ul className="space-y-4 text-left mb-8 max-w-xs mx-auto flex-grow">
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-gray-700">{t.christmas.allBusinessFeatures}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-gray-700">{t.christmas.customDomainIncluded}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-gray-700">{t.christmas.foreverNoFees}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-gray-700">{t.christmas.giftVoucherEmail}</span>
                                    </li>
                                </ul>

                                <div className="flex flex-col gap-3 mt-auto">
                                    <MagneticButton
                                        onClick={() => handlePurchase(priceIds.lifetime.Business, 'business')}
                                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                        disabled={!!loading}
                                    >
                                        {loading === 'business' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <CreditCard className="w-5 h-5" />
                                        )}
                                        {t.christmas.buyWithCard}
                                    </MagneticButton>

                                    <a
                                        href={`mailto:hello@biztree.bio?subject=${encodeURIComponent(t.christmas.emailSubjectBusiness)}&body=${encodeURIComponent(t.christmas.emailBody.replace('{{plan}}', 'Business').replace('{{price}}', String(prices.lifetime.Business)))}`}
                                        className="text-sm text-gray-400 hover:text-blue-600 font-medium transition-colors py-2"
                                    >
                                        {t.christmas.orOrderByEmail}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>

                    {/* Pro Plan */}
                    <ScrollAnimation animation="slide-up" delay={200} className="h-full">
                        <div className="relative bg-white text-gray-900 rounded-3xl p-8 z-10 shadow-2xl border-4 border-purple-500 hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-purple-200 h-full flex flex-col min-h-[550px]">
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-max">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                                    Pro Lifetime
                                </div>
                            </div>

                            <div className="mt-12 text-center flex-grow flex flex-col">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {prices.lifetime.Pro}€
                                    </span>
                                </div>
                                <div className="text-gray-500 font-medium mb-8">{t.christmas.oneTimePayment}</div>

                                <ul className="space-y-4 text-left mb-8 max-w-xs mx-auto flex-grow">
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-gray-900 font-medium">{t.christmas.everythingFromBusiness}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-gray-900 font-medium">{t.christmas.advancedProFeatures}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-gray-900 font-medium">{t.christmas.premiumSupport}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="text-gray-900 font-medium">{t.christmas.giftVoucherEmail}</span>
                                    </li>
                                </ul>

                                <div className="flex flex-col gap-3 mt-auto">
                                    <MagneticButton
                                        onClick={() => handlePurchase(priceIds.lifetime.Pro, 'pro')}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                                        disabled={!!loading}
                                    >
                                        {loading === 'pro' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <CreditCard className="w-5 h-5" />
                                        )}
                                        {t.christmas.buyWithCard}
                                    </MagneticButton>

                                    <a
                                        href={`mailto:hello@biztree.bio?subject=${encodeURIComponent(t.christmas.emailSubjectPro)}&body=${encodeURIComponent(t.christmas.emailBody.replace('{{plan}}', 'Pro').replace('{{price}}', String(prices.lifetime.Pro)))}`}
                                        className="text-sm text-gray-400 hover:text-purple-600 font-medium transition-colors py-2"
                                    >
                                        {t.christmas.orOrderByEmail}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ScrollAnimation>
                </div>

                <div className="mt-16 text-center">
                    <p className="inline-flex items-center justify-center gap-2 text-gray-500 bg-gray-50 px-6 py-3 rounded-full border border-gray-100">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{t.christmas.afterPaymentContact}</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
