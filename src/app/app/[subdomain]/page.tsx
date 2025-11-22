import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import HeaderBlock from "@/components/blocks/header-block";
import ServicesBlock from "@/components/blocks/services-block";
import HoursBlock from "@/components/blocks/hours-block";
import ContactButtonsBlock from "@/components/blocks/contact-buttons-block";
import SocialLinksBlock from "@/components/blocks/social-links-block";
import LinksBlock from "@/components/blocks/links-block";
import LocationBlock from "@/components/blocks/location-block";
import FooterBlock from "@/components/blocks/footer-block";
import { ProfileCore } from "@/types";
import { getTextColorClass } from "@/lib/background-utils";
import { Metadata } from "next";

import { cache } from "react";

// Cached data fetcher to deduplicate requests
const getProfile = cache(async (subdomain: string) => {
    return await prisma.profile.findUnique({
        where: { subdomain },
        include: {
            services: true,
            socialLinks: true,
            hours: true,
            links: true,
        },
    }) as ProfileCore | null;
});

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;
    const profile = await getProfile(subdomain);

    if (!profile) {
        return {
            title: "BizTree - Stránka nenájdená",
        };
    }

    const title = profile.seoTitle || `${profile.name} | BizTree`;
    const description = profile.seoDesc || profile.about || `Rezervujte si služby u ${profile.name} online.`;
    const ogImage = profile.avatarUrl || profile.logo || 'https://biztree.bio/logo.svg';
    const url = `https://${subdomain}.biztree.bio`;

    return {
        title,
        description,
        keywords: `${profile.name}, rezervácie, služby, online booking`,
        metadataBase: new URL(url),
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
                    url: ogImage,
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
            images: [ogImage],
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

    // Extract language from profile
    const lang = (profileData.language || "sk") as "sk" | "cz" | "en" | "pl" | "hu";
    const textColorClass = getTextColorClass(profileData.bgImage);

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

            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="animate-fade-up">
                    <HeaderBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                </div>

                {/* Contact Buttons */}
                {(profileData.phone || profileData.email) && (
                    <div className="animate-fade-up delay-100">
                        <ContactButtonsBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                    </div>
                )}

                {/* Custom Links */}
                {profileData.links && profileData.links.length > 0 && (
                    <div className="animate-fade-up delay-200">
                        <LinksBlock links={profileData.links} bgImage={profileData.bgImage} />
                    </div>
                )}

                {/* Services */}
                {profileData.services && profileData.services.length > 0 && (
                    <div className="animate-fade-up delay-300">
                        <h2 className={`text-xl font-bold mb-3 px-1 ${textColorClass}`}>Služby</h2>
                        <ServicesBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                    </div>
                )}

                {/* Hours */}
                {profileData.hours && profileData.hours.length > 0 && (
                    <div className="animate-fade-up delay-400">
                        <HoursBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                    </div>
                )}

                {/* Social Links */}
                {profileData.socialLinks && profileData.socialLinks.length > 0 && (
                    <div className="animate-fade-up delay-500">
                        <SocialLinksBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                    </div>
                )}

                {/* Location */}
                {(profileData.address || (profileData.locationLat && profileData.locationLng)) && (
                    <div className="animate-fade-up delay-500">
                        <LocationBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                    </div>
                )}

                {/* Footer */}
                <div className="animate-fade-up delay-500">
                    <FooterBlock lang={lang} bgImage={profileData.bgImage} />
                </div>
            </div>
        </>
    );
}
