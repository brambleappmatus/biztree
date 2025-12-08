"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles, Calendar, Globe2, Zap, Check, Shield, Palette, TrendingUp, Users, Rocket, BarChart3, Image as ImageIcon, Bell, Link2, Layout, Smartphone } from "lucide-react";
import ScrollAnimation from "@/components/scroll-animation";
import AnimatedCounter from "@/components/animated-counter";
import MagneticButton from "@/components/magnetic-button";
import { useLanguage } from "@/contexts/language-context";
import { PricingSection } from "@/components/subscription/pricing-section";
import ChristmasDealSection from "@/components/christmas-deal-section";
import ChristmasFloatingButton from "@/components/christmas-floating-button";

// Lazy load heavy components
const ShowcaseCarousel = dynamic(() => import("@/components/showcase-carousel"), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-2xl" />,
    ssr: false
});

interface LandingContentProps {
    showcases: any[];
    serializedTiers: any[];
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
    blogPosts?: any[];
}

export default function LandingContent({ showcases, serializedTiers, allFeatures, priceIds, prices, enableLifetime, blogPosts }: LandingContentProps) {
    const { t, language } = useLanguage();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {/* Floating Christmas Deal Button */}
            <ChristmasFloatingButton />

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
                            <div className="relative flex flex-col items-center">
                                {/* Main Image Container */}
                                <div className="relative flex justify-center items-center w-full">
                                    {/* Main Image */}
                                    <div className="relative z-10 w-full max-w-[580px] h-auto">
                                        <Image
                                            src="/hero-mockup.png"
                                            alt="BizTree App Interface"
                                            width={580}
                                            height={700}
                                            priority
                                            className="w-full h-auto drop-shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Background Glow */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-gradient-to-tr from-blue-200/30 via-purple-200/30 to-pink-200/30 blur-3xl rounded-full -z-10" />

                                    {/* Desktop Floaters */}
                                    <div className="hidden md:block">
                                        {[
                                            {
                                                icon: <Link2 size={20} />,
                                                title: language === 'sk' ? "Všetko v jednom" : "All in One",
                                                desc: language === 'sk' ? "Web, rezervácie a kontakt" : "Web, bookings & contact",
                                                colorClass: "bg-blue-100 text-blue-600",
                                                position: "top-[15%] -left-12",
                                                delay: 0
                                            },
                                            {
                                                icon: <Bell size={16} />,
                                                title: language === 'sk' ? "Notifikácie" : "Notifications",
                                                desc: language === 'sk' ? "Automatické potvrdenia a pripomenutia" : "Auto confirmations & reminders",
                                                colorClass: "bg-green-100 text-green-600",
                                                position: "top-[10%] -right-12",
                                                delay: 2.5
                                            },
                                            {
                                                icon: <Zap size={20} />,
                                                title: language === 'sk' ? "Rýchle nastavenie" : "Quick Setup",
                                                desc: language === 'sk' ? "Hotový web do 5 minút" : "Website ready in 5 mins",
                                                colorClass: "bg-purple-100 text-purple-600",
                                                position: "bottom-[20%] -right-8",
                                                delay: 1.5
                                            },
                                            {
                                                icon: <Smartphone size={20} />,
                                                title: language === 'sk' ? "Responzívny dizajn" : "Responsive Design",
                                                desc: language === 'sk' ? "Funguje na mobile aj PC" : "Works on mobile & PC",
                                                colorClass: "bg-orange-100 text-orange-600",
                                                position: "bottom-[15%] -left-8",
                                                delay: 2
                                            }
                                        ].map((benefit, index) => (
                                            <div
                                                key={index}
                                                className={`absolute ${benefit.position} bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 animate-float z-20 max-w-[240px]`}
                                                style={{ animationDelay: `${benefit.delay}s` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${benefit.colorClass}`}>
                                                        {benefit.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">{benefit.title}</p>
                                                        <p className="text-sm font-bold text-gray-900 leading-tight">{benefit.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Benefits Grid */}
                                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full">
                                    {[
                                        {
                                            icon: <Link2 size={20} />,
                                            title: language === 'sk' ? "Všetko v jednom" : "All in One",
                                            desc: language === 'sk' ? "Web, rezervácie a kontakt" : "Web, bookings & contact",
                                            colorClass: "bg-blue-100 text-blue-600"
                                        },
                                        {
                                            icon: <Bell size={16} />,
                                            title: language === 'sk' ? "Notifikácie" : "Notifications",
                                            desc: language === 'sk' ? "Automatické potvrdenia a pripomenutia" : "Auto confirmations & reminders",
                                            colorClass: "bg-green-100 text-green-600"
                                        },
                                        {
                                            icon: <Zap size={20} />,
                                            title: language === 'sk' ? "Rýchle nastavenie" : "Quick Setup",
                                            desc: language === 'sk' ? "Hotový web do 5 minút" : "Website ready in 5 mins",
                                            colorClass: "bg-purple-100 text-purple-600"
                                        },
                                        {
                                            icon: <Smartphone size={20} />,
                                            title: language === 'sk' ? "Responzívny dizajn" : "Responsive Design",
                                            desc: language === 'sk' ? "Funguje na mobile aj PC" : "Works on mobile & PC",
                                            colorClass: "bg-orange-100 text-orange-600"
                                        }
                                    ].map((benefit, index) => (
                                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${benefit.colorClass}`}>
                                                {benefit.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">{benefit.title}</p>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollAnimation>
                    </div>
                </div>
            </section>

            {/* Christmas Deal Section */}
            <ChristmasDealSection prices={prices as any} priceIds={priceIds as any} />

            {/* Stats Section */}
            <section className="py-16 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <ScrollAnimation animation="slide-up" delay={0}>
                            <div className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                                    <AnimatedCounter end={350} suffix="+" />
                                </div>
                                <div className="text-sm text-gray-600 font-medium">{t.landing.activeCompanies}</div>
                            </div>
                        </ScrollAnimation>

                        <ScrollAnimation animation="slide-up" delay={100}>
                            <div className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                                    <AnimatedCounter end={8} suffix="k+" />
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
            <section id="features" className="py-24 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {mounted ? (
                        <>
                            {/* Title and Description */}
                            <ScrollAnimation animation="slide-up">
                                <div className="mb-12">
                                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                        {t.landing.allYouNeed}
                                    </h2>
                                    <p className="text-gray-600 text-xl">
                                        {t.landing.completeSolution}
                                    </p>
                                </div>
                            </ScrollAnimation>

                            {/* Flex layout: Features (Left) + Bizzy (Right) */}
                            <div className="flex flex-col lg:flex-row gap-12 items-end relative">
                                {/* Left side - Feature Grid */}
                                <div className="w-full lg:w-7/12 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                {/* Bizzy - absolutely positioned within section */}
                                <div className="hidden lg:block absolute bottom-0 right-0 pointer-events-none z-10" style={{ width: '50vw', maxWidth: '900px', transform: 'translateX(40%)' }}>
                                    <ScrollAnimation animation="slide-left" delay={200}>
                                        <Image
                                            src="/bizzy-cheese.png"
                                            alt="Bizzy with cheese"
                                            width={1200}
                                            height={1200}
                                            className="drop-shadow-2xl w-full h-auto"
                                        />
                                    </ScrollAnimation>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Server-side placeholder - simple non-animated version
                        <div className="mb-12">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                {t.landing.allYouNeed}
                            </h2>
                            <p className="text-gray-600 text-xl">
                                {t.landing.completeSolution}
                            </p>
                        </div>
                    )}
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

                    <PricingSection
                        tiers={serializedTiers}
                        currentTier={null}
                        activeSubscription={null}
                        allFeatures={allFeatures}
                        priceIds={priceIds}
                        prices={prices}
                        enableLifetime={enableLifetime}
                        buttonText="Začať"
                        redirectUrl="/admin/subscription"
                    />
                </div>
            </section>

            {/* Demo Showcase Section */}
            <section id="showcase" className="py-24 bg-white">
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

            {/* Blog Section */}
            {blogPosts && blogPosts.length > 0 && (
                <section className="py-20 px-4 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <ScrollAnimation animation="slide-up">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
                                    {language === 'sk' ? 'Najnovšie z blogu' : 'Latest from Blog'}
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    {language === 'sk' ? 'Tipy a triky pre vaše podnikanie' : 'Tips and tricks for your business'}
                                </p>
                            </div>
                        </ScrollAnimation>

                        <div className="grid md:grid-cols-3 gap-8">
                            {blogPosts.map((post: any, index: number) => (
                                <ScrollAnimation key={post.id} animation="slide-up" delay={index * 100}>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
                                    >
                                        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                            {post.featuredImage ? (
                                                <Image
                                                    src={post.featuredImage}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                                                    <span className="text-4xl">📝</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col">
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                {post.publishedAt && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        <span>
                                                            {mounted ? new Date(post.publishedAt).toLocaleDateString() : ""}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-4 flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                                                {language === 'sk' ? 'Čítať viac' : 'Read Article'} <ArrowRight size={16} className="ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </ScrollAnimation>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link
                                href="/blog"
                                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {language === 'sk' ? 'Zobraziť všetky články' : 'View All Articles'}
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA Section */}
            <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-visible">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 overflow-hidden">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-end">
                        {/* Left Column - CTA Content */}
                        <div className="text-center lg:text-left mb-8 lg:mb-0">
                            <ScrollAnimation animation="slide-up" delay={0}>
                                <Sparkles className="mx-auto lg:mx-0 mb-6 text-blue-200 animate-float" size={56} />
                            </ScrollAnimation>

                            <ScrollAnimation animation="slide-up" delay={100}>
                                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                                    {t.landing.readyToStart}
                                </h2>
                            </ScrollAnimation>

                            <ScrollAnimation animation="slide-up" delay={200}>
                                <p className="text-blue-100 text-xl mb-10">
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

                        {/* Right Column - Empty space for layout */}
                        <div className="hidden lg:block"></div>
                    </div>
                </div>

                {/* Bizzy with Rocket - Absolutely positioned within section */}
                <div className="hidden lg:block absolute bottom-0 right-0 pointer-events-none z-30" style={{ width: '55vw', maxWidth: '1000px' }}>
                    <ScrollAnimation animation="scale" delay={100}>
                        <Image
                            src="/bizzy-rocket.png"
                            alt="Bizzy with cheese rocket"
                            width={1400}
                            height={1400}
                            className="drop-shadow-2xl w-full h-auto"
                        />
                    </ScrollAnimation>
                </div>
            </section>
        </>
    );
}
