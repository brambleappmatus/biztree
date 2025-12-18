import React from "react";
import { ProfileCore } from "@/types";
import { SocialIcon } from "react-social-icons";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass } from "@/lib/background-utils";

interface SocialLinksBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
    themeColor?: string;
}

export default function SocialLinksBlock({ profile, lang, bgImage, themeColor }: SocialLinksBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const iconStyle = (profile as any).iconStyle || 'standard';

    if (!profile.socialLinks || profile.socialLinks.length === 0) return null;

    let fgColor = "white";
    let bgColor: string | undefined = undefined;

    if (iconStyle === 'black') {
        fgColor = "white";
        bgColor = "black";
    } else if (iconStyle === 'white') {
        fgColor = "black";
        bgColor = "white";
    }

    return (
        <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`} style={{ color: 'var(--card-text)' }}>
            <h2 className="font-semibold mb-3 opacity-90" style={{ color: 'var(--card-text)' }}>{t.profile.socialLinks}</h2>
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
                                fgColor={fgColor}
                                bgColor={bgColor}
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
