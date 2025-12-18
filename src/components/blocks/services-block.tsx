"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ProfileCore } from "@/types";
// import BookingFlow from "../booking/booking-flow"; // Removed static import
const BookingFlow = dynamic(() => import("../booking/booking-flow"), { ssr: false });
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass } from "@/lib/background-utils";

interface ServicesBlockProps {
    profile: Omit<ProfileCore, "services"> & {
        services: (Omit<ProfileCore["services"][0], "price" | "minimumValue" | "pricePerDay"> & {
            price: number | any; // Accept number or Decimal (typed as any to avoid import issues)
            minimumValue: number | any;
            pricePerDay: number | any;
        })[];
    };
    lang: Language;
    bgImage: string | null;
}

export default function ServicesBlock({ profile, lang, bgImage }: ServicesBlockProps) {
    const t = getTranslation(lang);
    const [selectedService, setSelectedService] = useState<ProfileCore["services"][0] | null>(null);
    const blockBgClass = getBlockBgClass(bgImage);

    if (!profile.services || profile.services.length === 0) return null;

    return (
        <>
            <div className={`${blockBgClass} p-4 rounded-2xl shadow-sm`} style={{ color: 'var(--card-text)' }}>
                <div className="flex flex-col gap-3">
                    {profile.services.map((service) => (
                        <div
                            key={service.id}
                            className="p-4 rounded-xl bg-white/5 flex justify-between items-center animate-scale-in transition-all duration-200 hover:scale-[1.02] hover:bg-white/10"
                        >
                            <div>
                                <h3 className="font-semibold opacity-90">{service.name}</h3>
                                <p className="text-sm opacity-70">
                                    {service.calendarType === "DAILY_RENTAL" && (
                                        <>
                                            {[
                                                service.minimumDays && `Min. ${service.minimumDays} ${service.minimumDays === 1 ? t.profile.night : t.profile.nights}`,
                                                service.pricePerDay && Number(service.pricePerDay) > 0 && `${Number(service.pricePerDay)} ${service.currency} / ${t.profile.nightPer}`
                                            ].filter(Boolean).join(' • ')}
                                        </>
                                    )}
                                    {service.calendarType === "HOURLY_SERVICE" && (
                                        <>
                                            {/* Display duration and price only when > 0 */}
                                            {[
                                                service.duration > 0 && `${service.duration} min`,
                                                service.price && Number(service.price) > 0 && `${Number(service.price)} ${service.currency}`
                                            ].filter(Boolean).join(' • ')}
                                        </>
                                    )}
                                    {service.calendarType === "TABLE_RESERVATION" && (
                                        <>
                                            {[
                                                service.duration > 0 && `${service.duration} min`,
                                                service.maxCapacity && `Max. ${service.maxCapacity} ${t.profile.people}`
                                            ].filter(Boolean).join(' • ')}
                                        </>
                                    )}
                                </p>
                            </div>
                            {
                                service.bookingEnabled !== false && (
                                    <button
                                        onClick={() => setSelectedService(service)}
                                        className="ios-btn px-4 py-2 text-sm font-semibold"
                                    >
                                        {t.common.book}
                                    </button>
                                )
                            }
                        </div>
                    ))}
                </div >
            </div>

            {selectedService && (
                <BookingFlow
                    service={selectedService}
                    profile={profile}
                    onClose={() => setSelectedService(null)}
                    lang={lang}
                />
            )
            }
        </>
    );
}
