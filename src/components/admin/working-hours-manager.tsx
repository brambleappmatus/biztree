"use client";

import React, { useState } from "react";
import { Profile, WorkingHours } from "@prisma/client";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiButton } from "@/components/ui/mui-button";
import { updateWorkingHours } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkingHoursManagerProps {
    profile: Profile & { hours: WorkingHours[] };
}

const DAYS = [
    { id: 1, name: "Pondelok" },
    { id: 2, name: "Utorok" },
    { id: 3, name: "Streda" },
    { id: 4, name: "Štvrtok" },
    { id: 5, name: "Piatok" },
    { id: 6, name: "Sobota" },
    { id: 0, name: "Nedeľa" },
];

export default function WorkingHoursManager({ profile }: WorkingHoursManagerProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Initialize state from profile hours or defaults
    const [hours, setHours] = useState(() => {
        return DAYS.map((day) => {
            const existing = profile.hours.find((h) => h.dayOfWeek === day.id);
            return {
                dayOfWeek: day.id,
                openTime: existing?.openTime || "09:00",
                closeTime: existing?.closeTime || "17:00",
                isClosed: existing ? existing.isClosed : false,
            };
        });
    });

    const handleTimeChange = (dayId: number, field: "openTime" | "closeTime", value: string) => {
        setHours((prev) =>
            prev.map((h) => (h.dayOfWeek === dayId ? { ...h, [field]: value } : h))
        );
    };

    const toggleClosed = (dayId: number) => {
        setHours((prev) =>
            prev.map((h) => (h.dayOfWeek === dayId ? { ...h, isClosed: !h.isClosed } : h))
        );
    };

    const saveHours = async () => {
        setSaving(true);
        try {
            await updateWorkingHours(profile.id, hours);
            router.refresh();
        } catch (error) {
            console.error("Error saving hours:", error);
            alert("Chyba pri ukladaní otváracích hodín");
        } finally {
            setSaving(false);
        }
    };

    return (
        <MuiCard
            title="Otváracie hodiny"
            subtitle="Nastavte si, kedy ste k dispozícii pre zákazníkov"
            className="mt-8"
            action={
                <MuiButton
                    onClick={saveHours}
                    loading={saving}
                    disabled={saving}
                    className="h-10"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Uložiť
                </MuiButton>
            }
        >
            <div className="space-y-1 mt-2">
                {hours.map((day) => {
                    const dayName = DAYS.find((d) => d.id === day.dayOfWeek)?.name;

                    return (
                        <div
                            key={day.dayOfWeek}
                            className={cn(
                                "grid grid-cols-[100px,1fr,auto] items-center gap-4 p-3 rounded-lg transition-colors",
                                day.isClosed ? "bg-gray-50 dark:bg-gray-900/50 opacity-70" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            )}
                        >
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {dayName}
                            </div>

                            <div className="flex items-center gap-2">
                                {!day.isClosed ? (
                                    <>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={day.openTime}
                                                onChange={(e) => handleTimeChange(day.dayOfWeek, "openTime", e.target.value)}
                                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={day.closeTime}
                                                onChange={(e) => handleTimeChange(day.dayOfWeek, "closeTime", e.target.value)}
                                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                        Zatvorené
                                    </span>
                                )}
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!day.isClosed}
                                    onChange={() => toggleClosed(day.dayOfWeek)}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    );
                })}
            </div>
        </MuiCard>
    );
}
