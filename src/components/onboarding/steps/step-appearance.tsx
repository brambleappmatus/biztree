"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
    { id: "blue", name: "Blue", color: "#007AFF" },
    { id: "emerald", name: "Emerald", color: "#34C759" },
    { id: "coral", name: "Coral", color: "#FF2D55" },
    { id: "amber", name: "Amber", color: "#FF9500" },
    { id: "lavender", name: "Lavender", color: "#AF52DE" },
    { id: "graphite", name: "Graphite", color: "#8E8E93" },
];

const BACKGROUNDS = [
    { id: "black", name: "Black", gradient: "linear-gradient(to bottom, #000000, #1a1a1a)" },
    { id: "dark", name: "Dark Gray", gradient: "linear-gradient(to bottom, #1a1a1a, #2d2d2d)" },
    { id: "blue-purple", name: "Blue Purple", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "pink-orange", name: "Pink Orange", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: "green-blue", name: "Green Blue", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: "sunset", name: "Sunset", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: "ocean", name: "Ocean", gradient: "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)" },
    { id: "forest", name: "Forest", gradient: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)" },
];

interface StepAppearanceProps {
    formData: {
        theme: string;
        bgImage: string;
    };
    onChange: (data: Partial<StepAppearanceProps['formData']>) => void;
    translations: {
        colorTheme: string;
        background: string;
    };
}

export function StepAppearance({ formData, onChange, translations: t }: StepAppearanceProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Vzhľad profilu 🎨
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Prispôsobte si farby a pozadie
                </p>
            </div>

            {/* Theme Selection */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t.colorTheme}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {THEMES.map((theme) => (
                        <button
                            key={theme.id}
                            type="button"
                            onClick={() => onChange({ theme: theme.id })}
                            className={cn(
                                "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                formData.theme === theme.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            <div
                                className="w-8 h-8 rounded-full shadow-sm"
                                style={{ backgroundColor: theme.color }}
                            />
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {theme.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Selection */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t.background}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BACKGROUNDS.map((bg) => (
                        <button
                            key={bg.id}
                            type="button"
                            onClick={() => onChange({ bgImage: bg.id })}
                            className={cn(
                                "h-24 rounded-lg border-2 transition-all relative overflow-hidden",
                                formData.bgImage === bg.id
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            )}
                        >
                            <div
                                className="w-full h-full"
                                style={{
                                    background: bg.gradient,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                            />
                            {formData.bgImage === bg.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20">
                                    <Check className="text-white" size={24} />
                                </div>
                            )}
                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded">
                                {bg.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
