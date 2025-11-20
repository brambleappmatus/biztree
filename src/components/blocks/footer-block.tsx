import React from "react";
import { getTranslation, Language } from "@/lib/i18n";
import { getTextColorClass } from "@/lib/background-utils";

export default function FooterBlock({ lang, bgImage }: { lang: Language; bgImage: string | null }) {
    const t = getTranslation(lang);
    const textColorClass = getTextColorClass(bgImage);

    return (
        <div className={`text-center py-6 text-xs ${textColorClass} opacity-75`}>
            <p>{t.common.poweredBy}</p>
            <a href="https://biztree.sk" className={`underline ${textColorClass} opacity-90 hover:opacity-100`}>
                {t.common.createOwn}
            </a>
        </div>
    );
}
