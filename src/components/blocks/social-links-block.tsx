import React from "react";
import { ProfileCore } from "@/types";
import { SocialIcon } from "react-social-icons";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface SocialLinksBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
}

export default function SocialLinksBlock({ profile, lang, bgImage }: SocialLinksBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

    if (!profile.socialLinks || profile.socialLinks.length === 0) return null;

    return (
        <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`}>
            <h2 className={`font-semibold mb-3 ${isLight ? "text-white" : "text-gray-900"}`}>Social Links</h2>
            <div className="flex gap-3 justify-center flex-wrap">
                {profile.socialLinks.map((link) => {
                    return (
                        <div
                            key={link.id}
                            className="transition-transform hover:scale-110"
                        >
                            <SocialIcon
                                url={link.url}
                                network={link.platform.toLowerCase()}
                                style={{ width: 40, height: 40 }}
                                fgColor="white"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
