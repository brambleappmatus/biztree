import React from "react";
import { ProfileCore } from "@/types";
import { Phone, Send, MessageCircle, Navigation } from "lucide-react";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass } from "@/lib/background-utils";

// Custom envelope icon to avoid rendering issues
const EnvelopeIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={style}
    >
        <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z" />
    </svg>
);

interface ContactButtonsBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
    themeColor?: string;
}

export default function ContactButtonsBlock({ profile, lang, bgImage, themeColor }: ContactButtonsBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const iconStyle = (profile as any).iconStyle || 'standard';

    const buttons = [];

    if (profile.phone) {
        buttons.push({
            label: t.common.call,
            icon: Phone,
            href: `tel:${profile.phone}`,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        });
    }

    if (profile.email) {
        buttons.push({
            label: t.common.email,
            icon: EnvelopeIcon,
            href: `mailto:${profile.email}`,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        });
    }

    if (buttons.length === 0) return null;

    return (
        <div className={buttons.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-3"}>
            {buttons.map((button) => {
                let iconColorClass = button.color;
                let iconBgClass = button.bgColor;
                let customIconStyle = themeColor ? { color: themeColor } : undefined;
                let customBgStyle = themeColor ? { backgroundColor: `${themeColor}20` } : undefined;

                if (iconStyle === 'black') {
                    iconColorClass = 'text-black';
                    iconBgClass = 'bg-black/5';
                    customIconStyle = undefined;
                    customBgStyle = undefined;
                } else if (iconStyle === 'white') {
                    iconColorClass = 'text-white';
                    iconBgClass = 'bg-white/10';
                    customIconStyle = undefined;
                    customBgStyle = undefined;
                }

                return (
                    <a
                        key={button.label}
                        href={button.href}
                        className={`${blockBgClass} p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95`}
                        style={{ color: 'var(--card-text)' }}
                    >
                        <div
                            className={`p-3 rounded-full ${!themeColor && iconStyle === 'standard' ? iconBgClass : ''} ${iconStyle !== 'standard' ? iconBgClass : ''}`}
                            style={iconStyle === 'standard' ? customBgStyle : undefined}
                        >
                            <button.icon
                                className={`w-5 h-5 ${!themeColor && iconStyle === 'standard' ? iconColorClass : ''} ${iconStyle !== 'standard' ? iconColorClass : ''}`}
                                style={iconStyle === 'standard' ? customIconStyle : undefined}
                            />
                        </div>
                        <span className="text-sm font-medium opacity-90" style={{ color: 'var(--card-text)' }}>{button.label}</span>
                    </a>
                );
            })}
        </div>
    );
}
