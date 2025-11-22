import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const BACKGROUND_GRADIENTS: Record<string, string> = {
    "none": "transparent",
    "black": "linear-gradient(to bottom, #000000, #1a1a1a)",
    "dark": "linear-gradient(to bottom, #1a1a1a, #2d2d2d)",
    "white": "linear-gradient(to bottom, #ffffff, #f5f5f5)",
    "blue-purple": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "pink-orange": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "green-blue": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "sunset": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "ocean": "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)",
    "forest": "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    "yellow": "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    "red": "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    "navy": "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    "charcoal": "linear-gradient(135deg, #232526 0%, #414345 100%)",
    "burgundy": "linear-gradient(135deg, #7b4397 0%, #dc2430 100%)",
    "teal": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    // Premium fade gradients
    "peach-fade": "linear-gradient(135deg, #ff9a56 0%, #ffecd2 100%)",
    "lavender-fade": "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "mint-fade": "linear-gradient(135deg, #00d2ff 0%, #e0f9ff 100%)",
    "rose-fade": "linear-gradient(135deg, #ff6b9d 0%, #ffc3d8 100%)",
    "sky-fade": "linear-gradient(135deg, #4facfe 0%, #e0f4ff 100%)",
    // Multi-color gradients
    "rainbow": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    "tropical": "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd200 100%)",
    "aurora": "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)",
    "cosmic": "linear-gradient(135deg, #667eea 0%, #764ba2 33%, #f093fb 66%, #f5576c 100%)",
    // New mesh/ray gradients - premium multi-color rays
    "sunset-rays": "radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.9) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(78, 205, 196, 0.9) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(255, 159, 64, 0.8) 0%, transparent 50%), linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    "neon-dreams": "radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.8) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 20, 147, 0.8) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.6) 0%, transparent 60%), linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    "ocean-depths": "radial-gradient(circle at 40% 40%, rgba(64, 224, 208, 0.7) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(72, 209, 204, 0.7) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(32, 178, 170, 0.6) 0%, transparent 50%), linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    "fire-ice": "radial-gradient(circle at 20% 80%, rgba(255, 69, 0, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 191, 255, 0.8) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.5) 0%, transparent 60%), linear-gradient(135deg, #232526 0%, #414345 100%)",
};

import { ProfileRefresher } from "@/components/profile/profile-refresher";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { ProfileHeaderBadges } from "@/components/profile/profile-header-badges";

// This layout wraps the public profile pages
export default async function ProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;

    const profile = await prisma.profile.findUnique({
        where: { subdomain },
        select: {
            theme: true,
            bgImage: true,
            bgBlur: true,
            bgNoise: true,
            name: true,
            avatarUrl: true,
            about: true
        },
    });

    if (!profile) {
        return notFound();
    }

    // Check if bgImage is a URL (Unsplash image) or a gradient ID
    const isImageUrl = profile.bgImage?.startsWith("http");

    let backgroundStyle: React.CSSProperties = {};

    if (isImageUrl) {
        // Use image URL as background
        backgroundStyle = {
            backgroundImage: `url(${profile.bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        };
    } else {
        // Use gradient from mapping
        const backgroundGradient = profile.bgImage && BACKGROUND_GRADIENTS[profile.bgImage]
            ? BACKGROUND_GRADIENTS[profile.bgImage]
            : "transparent";
        backgroundStyle = {
            background: backgroundGradient,
        };
    }

    return (
        <div
            className="min-h-[100dvh] w-full flex justify-center relative"
            data-theme={profile.theme}
        >
            {/* Fixed Background Layer - Covers entire viewport including safe areas */}
            <div
                className="fixed inset-0 z-0"
                style={backgroundStyle}
            />

            {/* Noise Overlay - High Quality Sharp Grain */}
            {profile.bgNoise && (
                <div
                    className="fixed inset-0 z-[1] pointer-events-none"
                    style={{
                        opacity: 0.08,
                        backgroundImage: `url('/textures/grain.png')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        imageRendering: 'crisp-edges',
                        mixBlendMode: 'overlay',
                    }}
                />
            )}

            {/* Background Overlay for better text readability on images */}
            {isImageUrl && (
                <div
                    className={cn(
                        "fixed inset-0 z-0",
                        profile.bgBlur ? "backdrop-blur-md bg-black/30" : "bg-black/20"
                    )}
                />
            )}

            <ProfileHeaderBadges profile={profile} />
            <ProfileRefresher />
            <CookieConsent />

            {/* Main Content Container - Mobile First, Narrow on Desktop */}
            <main className="w-full max-w-[480px] min-h-[100dvh] relative z-10 bg-transparent flex flex-col pb-8 pt-safe pb-safe">
                {children}
            </main>
        </div>
    );
}
