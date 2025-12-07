"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

// Generate time options every 15 minutes
const TIME_OPTIONS: string[] = [];
for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${hour}:00`);
    TIME_OPTIONS.push(`${hour}:30`);
}

interface StepOpeningHoursProps {
    formData: {
        day: number;
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }[];
    onChange: (hours: StepOpeningHoursProps['formData']) => void;
    translations: {
        open: string;
        days: string[];
    };
}

export function StepOpeningHours({ formData, onChange, translations: t }: StepOpeningHoursProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Otváracie hodiny ⏰
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Kedy ste k dispozícii? (voliteľné)
                </p>
            </div>

            <div className="space-y-3">
                {t.days.map((dayName, index) => {
                    const dayIndex = index === 6 ? 0 : index + 1; // Sunday is 0
                    const dayData = formData.find(h => h.day === dayIndex);
                    if (!dayData) return null;

                    return (
                        <div key={dayIndex} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50">
                            <div className="flex items-center justify-between sm:w-32">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {dayName}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer sm:hidden">
                                    <input
                                        type="checkbox"
                                        checked={dayData.isOpen}
                                        onChange={(e) => {
                                            const newHours = formData.map(h =>
                                                h.day === dayIndex ? { ...h, isOpen: e.target.checked } : h
                                            );
                                            onChange(newHours);
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.open}</span>
                                </label>
                            </div>

                            <label className="hidden sm:flex items-center gap-2 cursor-pointer min-w-[100px]">
                                <input
                                    type="checkbox"
                                    checked={dayData.isOpen}
                                    onChange={(e) => {
                                        const newHours = formData.map(h =>
                                            h.day === dayIndex ? { ...h, isOpen: e.target.checked } : h
                                        );
                                        onChange(newHours);
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t.open}</span>
                            </label>

                            {dayData.isOpen && (
                                <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="relative group/select">
                                        <select
                                            value={dayData.openTime}
                                            onChange={(e) => {
                                                const newHours = formData.map(h =>
                                                    h.day === dayIndex ? { ...h, openTime: e.target.value } : h
                                                );
                                                onChange(newHours);
                                            }}
                                            className="pl-3 pr-9 py-2 border-0 bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm font-medium appearance-none cursor-pointer hover:ring-blue-400 dark:hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all w-[100px] outline-none"
                                        >
                                            {TIME_OPTIONS.map(time => (
                                                <option key={time} value={time} className="bg-white dark:bg-gray-900">{time}</option>
                                            ))}
                                        </select>
                                        <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover/select:text-blue-500 transition-colors pointer-events-none" />
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500 font-medium">-</span>
                                    <div className="relative group/select">
                                        <select
                                            value={dayData.closeTime}
                                            onChange={(e) => {
                                                const newHours = formData.map(h =>
                                                    h.day === dayIndex ? { ...h, closeTime: e.target.value } : h
                                                );
                                                onChange(newHours);
                                            }}
                                            className="pl-3 pr-9 py-2 border-0 bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm font-medium appearance-none cursor-pointer hover:ring-blue-400 dark:hover:ring-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all w-[100px] outline-none"
                                        >
                                            {TIME_OPTIONS.map(time => (
                                                <option key={time} value={time} className="bg-white dark:bg-gray-900">{time}</option>
                                            ))}
                                        </select>
                                        <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover/select:text-blue-500 transition-colors pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> Zákazníci uvidia, kedy ste otvorení, a budú vedieť, kedy vás môžu kontaktovať.
                </p>
            </div>
        </div>
    );
}
