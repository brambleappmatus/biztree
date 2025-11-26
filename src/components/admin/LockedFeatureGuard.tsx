"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useFeatures } from "@/contexts/features-context";

interface LockedFeatureGuardProps {
    featureKey: string;
    children: React.ReactNode;
}

export function LockedFeatureGuard({ featureKey, children }: LockedFeatureGuardProps) {
    const { hasAccess: checkAccess, isLoading } = useFeatures();
    const hasAccess = checkAccess(featureKey);

    // ... (useEffect removed as it's handled by context)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
                    <Lock className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Feature Locked
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                    This feature is not available in your current plan. Upgrade to access this and other premium features.
                </p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Upgrade Plan
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
