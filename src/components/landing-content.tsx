"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, Globe2, Zap, Check, Shield, Palette, TrendingUp, Users, Rocket, BarChart3 } from "lucide-react";
import ShowcaseCarousel from "@/components/showcase-carousel";
import ScrollAnimation from "@/components/scroll-animation";
import AnimatedCounter from "@/components/animated-counter";
import MagneticButton from "@/components/magnetic-button";
import { useLanguage } from "@/contexts/language-context";

interface LandingContentProps {
    showcases: any[];
    serializedTiers: any[];
}

export default function LandingContent({ showcases, serializedTiers }: LandingContentProps) {
    const { t } = useLanguage();

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 sm:pt-40 pb-20 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Text Content */}
                        <div className="space-y-8">
                            {/* Floating badge */}
                            <ScrollAnimation animation="slide-right" delay={0}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
                                    <Sparkles className="w-4 h-4" />
                                    <span>{t.landing.trustedBy}</span>
                                </div>
                            </ScrollAnimation>

                            {/* Headline */}
                            <ScrollAnimation animation="slide-up" delay={100}>
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                                    <span className="bg-gradient-to-r from-gray-900 via-blue-700 to-gray-900 bg-clip-text text-transparent">
                                        {t.landing.heroTitle}
                                    </span>
                                </h1>
                            </ScrollAnimation>

                            {/* Subtitle */}
                            <ScrollAnimation animation="slide-up" delay={200}>
                                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                                    {t.landing.heroSubtitle}
                                </p>
                            </ScrollAnimation>

                            {/* CTA Buttons */}
                            <ScrollAnimation animation="slide-up" delay={300}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/register">
                                        <MagneticButton className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-xl hover:shadow-blue-500/30 gap-2">
                                            {t.landing.ctaStart} <ArrowRight size={20} />
                                        </MagneticButton>
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="inline-flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg gap-2"
                                    >
                                        {t.landing.viewPricing}
                                    </Link>
                                </div>
                            </ScrollAnimation>

                            {/* Trust indicators */}
                            <ScrollAnimation animation="fade" delay={400}>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>{t.landing.noCreditCard}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>{t.landing.fiveMinSetup}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>{t.landing.support247}</span>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        </div>

                        {/* Right Column - Product Showcase */}
                        <ScrollAnimation animation="slide-left" delay={200}>
                            <div className="relative">
                                {/* Placeholder for product image */}
                                <div className="relative rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 p-8 border border-gray-200 shadow-2xl">
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-2xl opacity-20 blur-xl animate-float" />
                                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-2xl opacity-20 blur-xl animate-float" style={{ animationDelay: '1s' }} />

                                    <div className="relative aspect-[4/3] bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                                        <div className="text-center p-8">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                                                <img src="/logo.svg" alt="BizTree" className="w-12 h-12" />
                                            </div>
                                            <p className="text-gray-400 text-sm">Your product screenshot here</p>
                                            <p className="text-gray-300 text-xs mt-2">Recommended: 1200x900px</p>
                                        </div>
                                    </div>

                                    <div className="absolute -top-6 left-8 bg-white rounded-xl shadow-lg px-4 py-3 animate-float">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-semibold text-gray-700">500+ {t.landing.activeCompanies}</span>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-6 right-8 bg-white rounded-xl shadow-lg px-4 py-3 animate-float" style={{ animationDelay: '1.5s' }}>
                                        <div className="text-sm">
                                            <div className="font-bold text-blue-600 text-lg">10k+</div>
                                            <div className="text-gray-600 text-xs">{t.landing.bookings}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <ScrollAnimation animation="slide-up" delay={0}>
                            <div className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                    <AnimatedCounter end={500} suffix="+" />
                                </div>
                                <div className="text-sm text-gray-600 font-medium">{t.landing.activeCompanies}</div>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={100}>
                            <div className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                                    <AnimatedCounter end={10} suffix="k+" />
                                </div>
                                <div className="text-sm text-gray-600 font-medium">{t.landing.bookings}</div>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={200}>
                            <div className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                                    <AnimatedCounter end={5} suffix=" min" />
                                </div>
                                <div className="text-sm text-gray-600 font-medium">{t.landing.setupTime}</div>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={300}>
                            <div className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
                                    24/7
                                </div>
                                <div className="text-sm text-gray-600 font-medium">{t.landing.support}</div>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
                <div className="max-w-6xl mx-auto">
                    <ScrollAnimation animation="slide-up">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                {t.landing.allYouNeed}
                            </h2>
                            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                                {t.landing.completeSolution}
                            </p>
                        </div>
                    </ScrollAnimation>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ScrollAnimation animation="slide-up" delay={0}>
                            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Calendar className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{t.landing.onlineBooking}</h3>
                                <p className="text-gray-600 leading-relaxed">{t.landing.onlineBookingDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={100}>
                            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Globe2 className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{t.landing.customDomain}</h3>
                                <p className="text-gray-600 leading-relaxed">{t.landing.customDomainDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={200}>
                            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Zap className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{t.landing.quickSetup}</h3>
                                <p className="text-gray-600 leading-relaxed">{t.landing.quickSetupDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={0}>
                            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Palette className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{t.landing.customDesign}</h3>
                                <p className="text-gray-600 leading-relaxed">{t.landing.customDesignDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={100}>
                            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <TrendingUp className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{t.landing.seoOptimization}</h3>
                                <p className="text-gray-600 leading-relaxed">{t.landing.seoOptimizationDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={200}>
                            <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <BarChart3 className="text-white" size={28} />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{t.landing.analytics}</h3>
                                <p className="text-gray-600 leading-relaxed">{t.landing.analyticsDesc}</p>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-6xl mx-auto">
                    <ScrollAnimation animation="slide-up">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                {t.landing.simplePricing}
                            </h2>
                            <p className="text-gray-600 text-xl">{t.landing.choosePlan}</p>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {serializedTiers.map((tier, index) => {
                            const isBusiness = tier.name === 'Business';

                            return (
                                <ScrollAnimation key={tier.id} animation="slide-up" delay={index * 100}>
                                    <div
                                        className={`relative rounded-2xl p-8 transition-all duration-300 h-full flex flex-col ${isBusiness
                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105 border-4 border-blue-500 hover:scale-110'
                                            : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1'
                                            }`}
                                    >
                                        {isBusiness && (
                                            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                                                    <Sparkles className="w-3 h-3" />
                                                    {t.landing.mostPopular}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <h3 className={`text-2xl font-bold mb-2 ${isBusiness ? 'text-white' : 'text-gray-900'}`}>
                                                {tier.name}
                                            </h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-5xl font-bold ${isBusiness ? 'text-white' : 'text-gray-900'}`}>
                                                    €{tier.price?.toString() || '0'}
                                                </span>
                                                <span className={isBusiness ? 'text-blue-100' : 'text-gray-500'}>{t.landing.perMonth}</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-grow">
                                            {tier.features.slice(0, 6).map((tf: any) => (
                                                <li key={tf.feature.id} className="flex items-start gap-3">
                                                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isBusiness ? 'text-blue-200' : 'text-green-600'}`} />
                                                    <span className={`text-sm ${isBusiness ? 'text-blue-50' : 'text-gray-700'}`}>
                                                        {tf.feature.name}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            href="/register"
                                            className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all ${isBusiness
                                                ? 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                                                }`}
                                        >
                                            {t.landing.startNow}
                                        </Link>
                                    </div>
                                </ScrollAnimation>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Demo Showcase Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <ScrollAnimation animation="slide-up">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                {t.landing.showcaseTitle}
                            </h2>
                            <p className="text-gray-600 text-xl">{t.landing.showcaseDesc}</p>
                        </div>
                    </ScrollAnimation>

                    <ScrollAnimation animation="scale" delay={200}>
                        <ShowcaseCarousel showcases={showcases} />
                    </ScrollAnimation>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-4xl mx-auto">
                    <ScrollAnimation animation="slide-up">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                                {t.landing.whyChoose}
                            </h2>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ScrollAnimation animation="slide-up" delay={0}>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                    <Rocket className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{t.landing.quickStart}</h3>
                                <p className="text-gray-600 text-sm">{t.landing.quickStartDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={100}>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{t.landing.secure}</h3>
                                <p className="text-gray-600 text-sm">{t.landing.secureDesc}</p>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={200}>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{t.landing.supportTitle}</h3>
                                <p className="text-gray-600 text-sm">{t.landing.supportDesc}</p>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <ScrollAnimation animation="scale">
                        <Sparkles className="mx-auto mb-6 text-blue-200 animate-float" size={56} />
                    </ScrollAnimation>

                    <ScrollAnimation animation="slide-up" delay={100}>
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                            {t.landing.readyToStart}
                        </h2>
                    </ScrollAnimation>

                    <ScrollAnimation animation="slide-up" delay={200}>
                        <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
                            {t.landing.readyToStartDesc}
                        </p>
                    </ScrollAnimation>

                    <ScrollAnimation animation="slide-up" delay={300}>
                        <Link href="/register">
                            <MagneticButton className="inline-flex items-center justify-center bg-white text-blue-600 px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all hover:shadow-2xl gap-3">
                                {t.landing.createPageFree} <ArrowRight size={24} />
                            </MagneticButton>
                        </Link>
                    </ScrollAnimation>
                </div>
            </section>
        </>
    );
}
