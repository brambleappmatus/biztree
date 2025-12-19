import React from "react";
import { notFound } from "next/navigation";
import { Language, getTranslation } from "@/lib/i18n";
import { Metadata } from "next";

import { getProfile } from "@/lib/data-profile";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import ProfileContent from "@/components/profile/profile-content";

// Force dynamic rendering and disable caching for preview
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const defaultLang = (["sk", "en", "cs"].includes(profileData.language) ? profileData.language : "sk") as Language;
    // Text color now controlled by CSS variable --card-text set in layout

    // Pre-compute feature access map for client component
    const hasFeatureAccessMap = {
        component_contact: hasFeatureAccess(profileData, 'component_contact'),
        component_business_card: hasFeatureAccess(profileData, 'component_business_card'),
        component_custom_links: hasFeatureAccess(profileData, 'component_custom_links'),
        page_services: hasFeatureAccess(profileData, 'page_services'),
        component_documents: hasFeatureAccess(profileData, 'component_documents'),
        component_gallery: hasFeatureAccess(profileData, 'component_gallery'),
        component_hours: hasFeatureAccess(profileData, 'component_hours'),
        component_social_links: hasFeatureAccess(profileData, 'component_social_links'),
        component_map: hasFeatureAccess(profileData, 'component_map'),
        component_products: hasFeatureAccess(profileData, 'component_products'),
        disable_branding: hasFeatureAccess(profileData, 'disable_branding'),
    };

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
                "name": getTranslation(defaultLang).profile.services,
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

            <ProfileContent
                profileData={profileData as any}
                effectiveBgImage={effectiveBgImage}
                defaultLang={defaultLang}
                hasFeatureAccessMap={hasFeatureAccessMap}
            />
        </>
    );
}
