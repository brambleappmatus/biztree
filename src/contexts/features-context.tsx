"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface FeaturesContextType {
    features: string[];
    isLoading: boolean;
    error: string | null;
    hasAccess: (featureKey: string) => boolean;
    refreshFeatures: () => Promise<void>;
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [features, setFeatures] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeatures = async () => {
        if (!session?.user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch("/api/user/features");
            if (response.ok) {
                const data = await response.json();
                setFeatures(data.features || []);
                setError(null);
            } else {
                setError("Failed to fetch features");
            }
        } catch (err) {
            console.error("Error fetching features:", err);
            setError("Error fetching features");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, [session]);

    const hasAccess = (featureKey: string) => {
        if (isLoading) return false;
        return features.includes(featureKey);
    };

    return (
        <FeaturesContext.Provider value={{ features, isLoading, error, hasAccess, refreshFeatures: fetchFeatures }}>
            {children}
        </FeaturesContext.Provider>
    );
}

export function useFeatures() {
    const context = useContext(FeaturesContext);
    if (context === undefined) {
        throw new Error("useFeatures must be used within a FeaturesProvider");
    }
    return context;
}
