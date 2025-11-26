import React from "react";
import { ProfileCore } from "@/types";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface LocationBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
    themeColor?: string;
}

export default function LocationBlock({ profile, lang, bgImage, themeColor }: LocationBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

    if (!profile.address && !profile.mapEmbed) return null;

    return (
        <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`}>
            <h2 className={`font-semibold mb-3 ${isLight ? "text-white" : "text-gray-900"}`}>{t.common.location}</h2>

            {profile.address && (
                <p className={`text-sm mb-3 ${isLight ? "text-gray-300" : "text-gray-600"}`}>{profile.address}</p>
            )}

            {profile.mapEmbed ? (
                <div
                    className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
                    dangerouslySetInnerHTML={{ __html: profile.mapEmbed }}
                />
            ) : profile.address ? (
                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${isLight
                        ? "bg-white/20 hover:bg-white/30 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                        }`}
                    style={themeColor ? { backgroundColor: `${themeColor}20`, color: themeColor } : undefined}
                >
                    <span>Navigovať</span>
                </a>
            ) : null}
        </div>
    );
}
