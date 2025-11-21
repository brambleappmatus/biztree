import React from "react";
import { getTranslation, Language } from "@/lib/i18n";
import { getTextColorClass } from "@/lib/background-utils";

export default function FooterBlock({ lang, bgImage }: { lang: Language; bgImage: string | null }) {
    const t = getTranslation(lang);
    const textColorClass = getTextColorClass(bgImage);

    return (
        <div className={`text-center py-4 text-xs ${textColorClass} opacity-75`}>
            <p>{t.common.poweredBy}</p>
            <a href="https://biztree.sk" className={`underline ${textColorClass} opacity-90 hover:opacity-100`}>
                {t.common.createOwn}
            </a>
            <div className="flex justify-center gap-4 mt-3 text-[10px] opacity-60">
                <a href="/cookies" className="hover:underline">Cookies</a>
                <span>•</span>
                <a href="/privacy" className="hover:underline">Privacy</a>
            </div>
        </div>
    );
}
