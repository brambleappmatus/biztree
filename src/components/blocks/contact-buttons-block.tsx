import React from "react";
import { ProfileCore } from "@/types";
import { Phone, Mail, MessageCircle, Navigation } from "lucide-react";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface ContactButtonsBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
}

export default function ContactButtonsBlock({ profile, lang, bgImage }: ContactButtonsBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

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
            icon: Mail,
            href: `mailto:${profile.email}`,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        });
    }

    const whatsappLink = profile.socialLinks?.find(link => link.platform === "whatsapp");
    if (whatsappLink) {
        buttons.push({
            label: t.common.whatsapp,
            icon: MessageCircle,
            href: whatsappLink.url.startsWith("http") ? whatsappLink.url : `https://wa.me/${whatsappLink.url.replace(/[^0-9]/g, '')}`,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        });
    }

    if (buttons.length === 0) return null;

    return (
        <div className="grid grid-cols-2 gap-3">
            {buttons.map((button) => (
                <a
                    key={button.label}
                    href={button.href}
                    className={`${blockBgClass} p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95`}
                >
                    <div className={`p-3 rounded-full ${button.bgColor}`}>
                        <button.icon className={`w-5 h-5 ${button.color}`} />
                    </div>
                    <span className={`text-sm font-medium ${isLight ? "text-white" : "text-gray-900"}`}>{button.label}</span>
                </a>
            ))}
        </div>
    );
}
