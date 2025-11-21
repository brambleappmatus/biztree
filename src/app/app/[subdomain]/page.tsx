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

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;
    const profile = await prisma.profile.findUnique({
        where: { subdomain },
    });

    if (!profile) {
        return {
            title: "BizTree - Stránka nenájdená",
        };
    }

    return {
        title: `${profile.name} | BizTree`,
        description: profile.about || `Rezervujte si služby u ${profile.name} online.`,
        openGraph: {
            title: profile.name,
            description: profile.about || `Rezervujte si služby u ${profile.name} online.`,
            type: "website",
        },
        icons: {
            icon: profile.avatarUrl || '/favicon.ico',
            shortcut: profile.avatarUrl || '/favicon.ico',
            apple: profile.avatarUrl || '/favicon.ico',
        },
    };
}

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;

    const profileData = await prisma.profile.findUnique({
        where: { subdomain },
        include: {
            services: true,
            socialLinks: true,
            hours: true,
            links: true,
        },
    }) as ProfileCore | null;

    if (!profileData) {
        return notFound();
    }

    // Extract language from profile
    const lang = (profileData.language || "sk") as "sk" | "cz" | "en" | "pl" | "hu";
    const textColorClass = getTextColorClass(profileData.bgImage);

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <HeaderBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />

            {/* Contact Buttons */}
            <ContactButtonsBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />

            {/* Custom Links */}
            {profileData.links && profileData.links.length > 0 && (
                <LinksBlock links={profileData.links} bgImage={profileData.bgImage} />
            )}

            {/* Services */}
            {profileData.services && profileData.services.length > 0 && (
                <div>
                    <h2 className={`text-xl font-bold mb-3 px-1 ${textColorClass}`}>Služby</h2>
                    <ServicesBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />
                </div>
            )}

            {/* Hours */}
            <HoursBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />

            {/* Social Links */}
            <SocialLinksBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />

            {/* Location */}
            <LocationBlock profile={profileData} lang={lang} bgImage={profileData.bgImage} />

            {/* Footer */}
            <FooterBlock lang={lang} bgImage={profileData.bgImage} />

            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        name: profileData.name,
                        description: profileData.about,
                        telephone: profileData.phone,
                        email: profileData.email,
                        address: profileData.address
                            ? {
                                "@type": "PostalAddress",
                                streetAddress: profileData.address,
                            }
                            : undefined,
                    }),
                }}
            />
        </div>
    );
}
