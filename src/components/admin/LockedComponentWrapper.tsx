"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useFeatures } from "@/contexts/features-context";

interface LockedComponentWrapperProps {
    featureKey: string;
    children: React.ReactNode;
}

export function LockedComponentWrapper({ featureKey, children }: LockedComponentWrapperProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const { hasAccess: checkAccess, isLoading } = useFeatures();
    const hasAccess = checkAccess(featureKey);

    // ... (useEffect removed as it's handled by context)

    // ... (loading state remains the same)
    if (isLoading) {
        return (
            <div className="relative">
                <div className="opacity-30 pointer-events-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div
                className="relative group rounded-xl overflow-hidden cursor-pointer"
                onClick={() => {
                    showToast("Táto funkcia je uzamknutá. Pre odomknutie prejdite na vyšší balík.", "info");
                    router.push("/admin/subscription");
                }}
            >
                {/* Content - disabled look */}
                <div className="opacity-50 pointer-events-none select-none grayscale-[0.5] filter blur-[0.5px]">
                    {children}
                </div>

                {/* Small Lock Badge - Top Right */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-blue-900/20 backdrop-blur-sm border border-white/10 transition-transform group-hover:scale-105">
                        <Lock className="w-3 h-3" />
                        <span>Zamknuté</span>
                    </div>
                </div>

                {/* Hover Overlay - Subtle */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-blue-50/10 transition-colors duration-200" />
            </div>
        );
    }

    return <>{children}</>;
}
