"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProfileCore } from "@/types";
import { Language } from "@/lib/i18n";
import HourlyFlow from "./hourly-flow";
import DailyFlow from "./daily-flow";
import TableFlow from "./table-flow";

interface BookingFlowProps {
    service: ProfileCore["services"][0];
    profile: Omit<ProfileCore, "services">;
    onClose: () => void;
    lang: Language;
}

export default function BookingFlow({ service, profile, onClose, lang }: BookingFlowProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    // Determine calendar type (default to HOURLY_SERVICE for backward compatibility)
    const calendarType = service.calendarType || "HOURLY_SERVICE";

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className={cn(
                    "bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-[height] duration-300 ease-in-out",
                    // Height is controlled by the child flow component
                )}
            >
                {calendarType === "HOURLY_SERVICE" && (
                    <HourlyFlow service={service} profile={profile} onClose={onClose} lang={lang} />
                )}
                {calendarType === "DAILY_RENTAL" && (
                    <DailyFlow service={service} profile={profile} onClose={onClose} lang={lang} />
                )}
                {calendarType === "TABLE_RESERVATION" && (
                    <TableFlow service={service} profile={profile} onClose={onClose} lang={lang} />
                )}
            </motion.div>
        </div>,
        document.body
    );
}
