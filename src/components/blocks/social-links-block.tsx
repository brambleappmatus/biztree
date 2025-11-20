import React from "react";
import { ProfileCore } from "@/types";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface SocialLinksBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
};

export default function SocialLinksBlock({ profile, lang, bgImage }: SocialLinksBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

    if (!profile.socialLinks || profile.socialLinks.length === 0) return null;

    return (
        <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`}>
            <h2 className={`font-semibold mb-3 ${isLight ? "text-white" : "text-gray-900"}`}>Social Links</h2>
            <div className="flex gap-3 justify-center">
                {profile.socialLinks.map((link) => {
                    const Icon = ICON_MAP[link.platform.toLowerCase()] || Instagram;
                    return (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 rounded-full transition-colors ${isLight
                                    ? "bg-white/10 hover:bg-white/20"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isLight ? "text-white" : "text-gray-700"}`} />
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
