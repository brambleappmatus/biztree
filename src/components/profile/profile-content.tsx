"use client";

import React, { useState, useEffect } from "react";
import { Language, getTranslation } from "@/lib/i18n";
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
import { getPlanLimits } from "@/lib/subscription-limits";

interface ProfileContentProps {
    profileData: ProfileCore;
    effectiveBgImage: string | null;
    defaultLang: Language;
    hasFeatureAccessMap: {
        component_contact: boolean;
        component_business_card: boolean;
        component_custom_links: boolean;
        page_services: boolean;
        component_documents: boolean;
        component_gallery: boolean;
        component_hours: boolean;
        component_social_links: boolean;
        component_map: boolean;
        disable_branding: boolean;
    };
}

export default function ProfileContent({
    profileData,
    effectiveBgImage,
    defaultLang,
    hasFeatureAccessMap
}: ProfileContentProps) {
    const [lang, setLang] = useState<Language>(defaultLang);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("biztree_language") as Language;
        if (stored && ["sk", "en", "cs"].includes(stored)) {
            setLang(stored);
        }
    }, []);

    const t = getTranslation(lang);

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="animate-fade-up">
                <HeaderBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
            </div>

            {/* Contact Buttons */}
            {(profileData.phone || profileData.email) && hasFeatureAccessMap.component_contact && (
                <div className="animate-fade-up delay-100">
                    <ContactButtonsBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                </div>
            )}

            {/* Add to Wallet Button */}
            {(profileData.phone || profileData.email) && profileData.showBusinessCard && hasFeatureAccessMap.component_business_card && (
                <div className="animate-fade-up delay-150">
                    <AddToWalletButton profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                </div>
            )}

            {/* Custom Links */}
            {profileData.links && profileData.links.length > 0 && hasFeatureAccessMap.component_custom_links && (
                <div className="animate-fade-up delay-200">
                    <LinksBlock links={profileData.links} bgImage={effectiveBgImage} />
                </div>
            )}

            {/* Services */}
            {profileData.services && profileData.services.length > 0 && hasFeatureAccessMap.page_services && (
                <div className="animate-fade-up delay-300">
                    <h2 className="text-xl font-bold mb-3 px-1" style={{ color: 'var(--header-text)' }}>{t.profile.services}</h2>
                    <ServicesBlock
                        profile={{
                            ...profileData,
                            services: profileData.services.slice(0, getPlanLimits(profileData.tier?.name).maxServices),
                        }}
                        lang={lang}
                        bgImage={effectiveBgImage}
                    />
                </div>
            )}

            {/* Documents */}
            {profileData.documents && profileData.documents.length > 0 && hasFeatureAccessMap.component_documents && (
                <div className="animate-fade-up delay-350 mb-4">
                    <h2 className="text-xl font-bold mb-3 px-1" style={{ color: 'var(--header-text)' }}>{t.profile.documents}</h2>
                    <DocumentsBlock documents={profileData.documents} bgImage={effectiveBgImage} />
                </div>
            )}

            {/* Gallery */}
            {profileData.albums && profileData.albums.length > 0 && hasFeatureAccessMap.component_gallery && (
                <div className="animate-fade-up delay-375">
                    <h2 className="text-xl font-bold mb-3 px-1" style={{ color: 'var(--header-text)' }}>{t.profile.gallery}</h2>
                    <GalleryBlock albums={profileData.albums} bgImage={effectiveBgImage} lang={lang} />
                </div>
            )}

            {/* Hours */}
            {profileData.hours && profileData.hours.length > 0 && hasFeatureAccessMap.component_hours && (
                <div className="animate-fade-up delay-400">
                    <HoursBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                </div>
            )}

            {/* Social Links */}
            {profileData.socialLinks && profileData.socialLinks.length > 0 && hasFeatureAccessMap.component_social_links && (
                <div className="animate-fade-up delay-500">
                    <SocialLinksBlock profile={profileData} lang={lang} bgImage={effectiveBgImage} />
                </div>
            )}

            {/* Location */}
            {(profileData.address || (profileData.locationLat && profileData.locationLng)) && hasFeatureAccessMap.component_contact && (
                <div className="animate-fade-up delay-500">
                    <LocationBlock
                        profile={{
                            ...profileData,
                            mapEmbed: hasFeatureAccessMap.component_map ? profileData.mapEmbed : null
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
                    showBranding={!hasFeatureAccessMap.disable_branding}
                />
            </div>
        </div>
    );
}
