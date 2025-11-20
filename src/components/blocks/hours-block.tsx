import React from "react";
import { ProfileCore } from "@/types";
import { cn } from "@/lib/utils";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface HoursBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
}

const DAYS = ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"];

export default function HoursBlock({ profile, lang, bgImage }: HoursBlockProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

    if (!profile.hours || profile.hours.length === 0) return null;

    // Sort hours by day of week (Monday first for EU)
    const sortedHours = [...profile.hours].sort((a, b) => {
        const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
        const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
        return dayA - dayB;
    });

    const today = new Date().getDay();

    return (
        <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`}>
            <h2 className={`font-semibold mb-3 flex items-center gap-2 ${isLight ? "text-white" : "text-gray-900"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {t.common.hours}
            </h2>
            <div className="space-y-2 text-sm">
                {sortedHours.map((hour) => {
                    const isToday = hour.dayOfWeek === today;
                    return (
                        <div key={hour.id} className={cn(
                            "flex justify-between py-1 border-b last:border-0",
                            isLight ? "border-white/10 text-gray-200" : "border-gray-100 text-gray-700",
                            isToday && "font-bold text-[var(--primary)]",
                            hour.isClosed && "opacity-50"
                        )}>
                            <span>{DAYS[hour.dayOfWeek]}</span>
                            <span>
                                {hour.isClosed ? (
                                    <span>{t.common.closed}</span>
                                ) : (
                                    `${hour.openTime} - ${hour.closeTime}`
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
