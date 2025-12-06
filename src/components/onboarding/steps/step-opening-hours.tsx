"use client";

import { cn } from "@/lib/utils";

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
                        <div key={dayIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {dayName}
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={dayData.isOpen}
                                    onChange={(e) => {
                                        const newHours = formData.map(h =>
                                            h.day === dayIndex ? { ...h, isOpen: e.target.checked } : h
                                        );
                                        onChange(newHours);
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{t.open}</span>
                            </label>
                            {dayData.isOpen && (
                                <>
                                    <input
                                        type="time"
                                        value={dayData.openTime}
                                        onChange={(e) => {
                                            const newHours = formData.map(h =>
                                                h.day === dayIndex ? { ...h, openTime: e.target.value } : h
                                            );
                                            onChange(newHours);
                                        }}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="time"
                                        value={dayData.closeTime}
                                        onChange={(e) => {
                                            const newHours = formData.map(h =>
                                                h.day === dayIndex ? { ...h, closeTime: e.target.value } : h
                                            );
                                            onChange(newHours);
                                        }}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                    />
                                </>
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
