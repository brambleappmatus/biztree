import React from "react";
import { getTranslation, Language } from "@/lib/i18n";
import { getTextColorClass } from "@/lib/background-utils";

export default function FooterBlock({ lang, bgImage, showBranding = true }: { lang: Language; bgImage: string | null; showBranding?: boolean }) {
    const t = getTranslation(lang);
    const textColorClass = getTextColorClass(bgImage);

    return (
        <div className={`text-center py-6 text-xs ${textColorClass} opacity-90`}>
            {showBranding && (
                <div className="mb-4">
                    <p className="font-medium opacity-80 mb-1">{t.common.poweredBy}</p>
                    <a
                        href="https://biztree.sk"
                        className={`inline-block px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all font-semibold ${textColorClass}`}
                    >
                        {t.common.createOwn}
                    </a>
                </div>
            )}

            <div className="flex justify-center gap-4 mt-3 text-[10px] opacity-60">
                <a href="/cookies" className="hover:underline">Cookies</a>
                <span>•</span>
                <a href="/privacy" className="hover:underline">Privacy</a>
            </div>
        </div>
    );
}
