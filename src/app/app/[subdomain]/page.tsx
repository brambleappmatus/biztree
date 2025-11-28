import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import HeaderBlock from "@/components/blocks/header-block";
import ServicesBlock from "@/components/blocks/services-block";
import HoursBlock from "@/components/blocks/hours-block";
import ContactButtonsBlock from "@/components/blocks/contact-buttons-block";
import AddToWalletButton from "@/components/blocks/add-to-wallet-button";
import SocialLinksBlock from "@/components/blocks/social-links-block";
import LinksBlock from "@/components/blocks/links-block";
import LocationBlock from "@/components/blocks/location-block";
import GalleryBlock from "@/components/blocks/gallery-block";
import DocumentsBlock from "@/components/blocks/documents-block";
import FooterBlock from "@/components/blocks/footer-block";
import { ProfileCore } from "@/types";
import { getTextColorClass } from "@/lib/background-utils";
import { Language } from "@/lib/i18n";
import { Metadata } from "next";

import { getProfile } from "@/lib/data-profile";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";

// Helper to check if profile has access to a feature
function hasFeatureAccess(profile: any, featureKey: string): boolean {
    if (!profile.tier) return false;
    return profile.tier.features.some((tf: any) => tf.feature.key === featureKey);
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;
    const profile = await getProfile(subdomain);

    if (!profile) {
        return {
            title: "BizTree - Stránka nenájdená",
        };
    }

    // Prioritize custom SEO settings if available
    const title = profile.seoTitle || `${profile.name} | BizTree`;
    const description = profile.seoDesc || profile.about || `Rezervujte si služby u ${profile.name} online.`;

    // Generate dynamic OG image URL with profile details
    const baseUrl = process.env.NEXTAUTH_URL || 'https://biztree.bio';
    const ogImageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(profile.name)}&tag=${encodeURIComponent(subdomain)}&theme=${encodeURIComponent(profile.theme || 'blue')}${profile.avatarUrl ? `&image=${encodeURIComponent(profile.avatarUrl)}` : ''}`;

    const url = `https://${subdomain}.biztree.bio`;

    return {
        title,
        description,
        keywords: `${profile.name}, rezervácie, služby, online booking`,
        metadataBase: new URL(url),
        icons: {
            icon: `${baseUrl}/logo.svg`,
        },
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: 'BizTree',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: profile.name,
                },
            ],
            locale: 'sk_SK',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;

    const profileData = await getProfile(subdomain);

    if (!profileData) {
        return notFound();
    }

    // Enforce background image restrictions
    let effectiveBgImage = profileData.bgImage;
    if (effectiveBgImage) {
        const isUnsplashImage = effectiveBgImage.includes('unsplash');
        const isCustomImage = effectiveBgImage.startsWith('http') && !isUnsplashImage;

        // Reset to dark-gray if user has restricted background but lacks access
        if (isUnsplashImage && !hasFeatureAccess(profileData, 'component_background_images')) {
            effectiveBgImage = 'dark-gray';
        } else if (isCustomImage && !hasFeatureAccess(profileData, 'component_background_upload')) {
            effectiveBgImage = 'dark-gray';
        }
    }

    // Extract language from profile - fallback to supported languages only
    const lang = (profileData.language === "sk" || profileData.language === "en" ? profileData.language : "sk") as Language;
    const textColorClass = getTextColorClass(effectiveBgImage || profileData.bgImage);

    // Helper function to convert day number to day name
    const getDayName = (dayOfWeek: number): string => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return days[dayOfWeek] || "Monday";
    };

    // Generate JSON-LD structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": profileData.name,
        "description": profileData.about || `Rezervujte si služby u ${profileData.name} online.`,
        "url": `https://${subdomain}.biztree.bio`,
        "logo": profileData.avatarUrl || profileData.logo,
        "image": profileData.avatarUrl || profileData.logo,
        "telephone": profileData.phone,
        "email": profileData.email,
        ...(profileData.address && {
            "address": {
                "@type": "PostalAddress",
                "streetAddress": profileData.address,
                "addressCountry": "SK"
            }
        }),
        ...(profileData.locationLat && profileData.locationLng && {
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": profileData.locationLat,
                "longitude": profileData.locationLng
            }
        }),
        ...(profileData.hours && profileData.hours.length > 0 && {
            "openingHoursSpecification": profileData.hours
                .filter(h => !h.isClosed)
                .map(hour => ({
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": getDayName(hour.dayOfWeek),
                    "opens": hour.openTime,
                    "closes": hour.closeTime
                }))
        }),
        ...(profileData.services && profileData.services.length > 0 && {
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Služby",
                "itemListElement": profileData.services.map(service => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": service.name,
                        "description": service.description
                    }
                }))
            }
        }),
    };

    return (
        <>
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Analytics Tracking */}
            <AnalyticsTracker profileId={profileData.id} />

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="animate-fade-up">
                    <HeaderBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                </div>

                {/* Contact Buttons */}
                {(profileData.phone || profileData.email) && hasFeatureAccess(profileData, 'component_contact') && (
                    <div className="animate-fade-up delay-100">
                        <ContactButtonsBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Add to Wallet Button */}
                {(profileData.phone || profileData.email) && profileData.showBusinessCard && hasFeatureAccess(profileData, 'component_business_card') && (
                    <div className="animate-fade-up delay-150">
                        <AddToWalletButton profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Custom Links */}
                {profileData.links && profileData.links.length > 0 && hasFeatureAccess(profileData, 'component_custom_links') && (
                    <div className="animate-fade-up delay-200">
                        <LinksBlock links={profileData.links} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Services */}
                {profileData.services && profileData.services.length > 0 && hasFeatureAccess(profileData, 'page_services') && (
                    <div className="animate-fade-up delay-300">
                        <h2 className={`text-xl font-bold mb-3 px-1 ${textColorClass}`}>Služby</h2>
                        <ServicesBlock
                            profile={{
                                ...profileData,
                                services: profileData.services.map(s => ({
                                    ...s,
                                    price: s.price ? Number(s.price) : 0
                                })),
                                // Serialize tier to convert Decimal price field
                                tier: profileData.tier ? {
                                    ...profileData.tier,
                                    price: profileData.tier.price ? Number(profileData.tier.price) : null,
                                } as any : null
                            }}
                            lang={lang}
                            bgImage={effectiveBgImage}
                        />
                    </div>
                )}

                {/* Documents */}
                {profileData.documents && profileData.documents.length > 0 && hasFeatureAccess(profileData, 'component_documents') && (
                    <div className="animate-fade-up delay-350 mb-4">
                        <h2 className={`text-xl font-bold mb-3 px-1 ${textColorClass}`}>Dokumenty</h2>
                        <DocumentsBlock documents={profileData.documents} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Gallery */}
                {profileData.albums && profileData.albums.length > 0 && hasFeatureAccess(profileData, 'component_gallery') && (
                    <div className="animate-fade-up delay-375">
                        <h2 className={`text-xl font-bold mb-3 px-1 ${textColorClass}`}>Galéria</h2>
                        <GalleryBlock albums={profileData.albums} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Hours */}
                {profileData.hours && profileData.hours.length > 0 && hasFeatureAccess(profileData, 'component_hours') && (
                    <div className="animate-fade-up delay-400">
                        <HoursBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Social Links */}
                {profileData.socialLinks && profileData.socialLinks.length > 0 && hasFeatureAccess(profileData, 'component_social_links') && (
                    <div className="animate-fade-up delay-500">
                        <SocialLinksBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                    </div>
                )}

                {/* Location - check contact for address, map for iframe */}
                {(profileData.address || (profileData.locationLat && profileData.locationLng)) && hasFeatureAccess(profileData, 'component_contact') && (
                    <div className="animate-fade-up delay-500">
                        <LocationBlock
                            profile={{
                                ...profileData,
                                // Hide map embed if map feature is locked
                                mapEmbed: hasFeatureAccess(profileData, 'component_map') ? profileData.mapEmbed : null
                            }}
                            lang={lang}
                            bgImage={effectiveBgImage}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="animate-fade-up delay-500">
                    <FooterBlock
                        lang={lang}
                        bgImage={effectiveBgImage}
                        showBranding={!hasFeatureAccess(profileData, 'disable_branding')}
                    />
                </div>
            </div>
        </>
    );
}
