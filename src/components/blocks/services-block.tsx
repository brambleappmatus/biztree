"use client";

import React, { useState } from "react";
import { ProfileCore } from "@/types";
import BookingFlow from "../booking/booking-flow";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface ServicesBlockProps {
    profile: ProfileCore;
}

export default function ServicesBlock({ profile, lang, bgImage }: { profile: ProfileCore, lang: Language, bgImage: string | null }) {
    const t = getTranslation(lang);
    const [selectedService, setSelectedService] = useState<ProfileCore["services"][0] | null>(null);
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

    if (!profile.services || profile.services.length === 0) return null;

    return (
        <>
            <div className="flex flex-col gap-3">
                {profile.services.map((service) => (
                    <div
                        key={service.id}
                        className={`${blockBgClass} p-4 rounded-2xl shadow-sm flex justify-between items-center animate-scale-in transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
                    >
                        <div>
                            <h3 className={`font-semibold ${isLight ? "text-white" : "text-gray-900"}`}>{service.name}</h3>
                            <p className={`text-sm ${isLight ? "text-gray-300" : "text-gray-600"}`}>
                                {service.duration} min • {Number(service.price)} {service.currency}
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedService(service)}
                            className="ios-btn px-4 py-2 text-sm font-semibold"
                        >
                            {t.common.book}
                        </button>
                    </div>
                ))}
            </div>

            {selectedService && (
                <BookingFlow
                    service={selectedService}
                    profile={profile}
                    onClose={() => setSelectedService(null)}
                    lang={lang}
                />
            )}
        </>
    );
}
