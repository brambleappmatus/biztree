import React from "react";
import { ProfileCore } from "@/types";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass } from "@/lib/background-utils";

interface LocationBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
    themeColor?: string;
}

export default function LocationBlock({ profile, lang, bgImage, themeColor }: LocationBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);

    if (!profile.address && !profile.mapEmbed) return null;

    return (
        <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`} style={{ color: 'var(--card-text)' }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--card-text)', opacity: 0.9 }}>{t.common.location}</h2>

            {profile.address && (
                <p className="text-sm mb-3" style={{ color: 'var(--card-text)', opacity: 0.7 }}>{profile.address}</p>
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
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors bg-current/10 hover:bg-current/15"
                    style={themeColor ? { backgroundColor: `${themeColor}20`, color: themeColor } : undefined}
                >
                    <span>{t.common.navigate}</span>
                </a>
            ) : null}
        </div>
    );
}
