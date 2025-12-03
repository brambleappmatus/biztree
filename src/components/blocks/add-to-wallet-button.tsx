"use client";

import React, { useState } from "react";
import { ProfileCore } from "@/types";
import { Wallet } from "lucide-react";
import { getTranslation, Language } from "@/lib/i18n";
import { getBlockBgClass } from "@/lib/background-utils";

interface AddToWalletButtonProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
}

// Detect platform
function getPlatform(): "ios" | "android" | "other" {
    if (typeof window === "undefined") return "other";

    const userAgent = window.navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
        return "ios";
    }

    if (/android/.test(userAgent)) {
        return "android";
    }

    return "other";
}

export default function AddToWalletButton({ profile, lang, bgImage }: AddToWalletButtonProps) {
    const t = getTranslation(lang);
    const blockBgClass = getBlockBgClass(bgImage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const platform = getPlatform();

    // Don't show on desktop
    if (platform === "other") {
        return null;
    }

    const handleAddToWallet = async () => {
        setLoading(true);
        setError(null);

        try {
            const walletType = platform === "ios" ? "apple" : "google";
            const response = await fetch(`/api/wallet/${walletType}/${profile.subdomain}`);

            if (!response.ok) {
                throw new Error("Failed to generate pass");
            }

            // Download the vCard file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${profile.name.replace(/\s+/g, "_")}.vcf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Error adding to wallet:", err);
            setError(t.common.passError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <button
                onClick={handleAddToWallet}
                disabled={loading}
                className={`${blockBgClass} w-full p-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <div className="p-3 rounded-full bg-black/10">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Wallet className="w-5 h-5" />
                    )}
                </div>
                <span className="text-sm font-medium">
                    {loading ? t.common.generatingPass : t.common.addToWallet}
                </span>
            </button>
            {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
        </div>
    );
}
