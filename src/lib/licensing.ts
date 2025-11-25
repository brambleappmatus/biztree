"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Check if a subscription is expired and handle auto-downgrade
 */
async function checkAndHandleExpiration(profileId: string): Promise<void> {
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: {
            id: true,
            subscriptionExpiresAt: true,
            subscriptionStatus: true,
            tierId: true,
            tier: { select: { name: true } }
        }
    });

    if (!profile) return;

    // Check if subscription is expired
    const now = new Date();
    if (profile.subscriptionExpiresAt && profile.subscriptionExpiresAt < now) {
        // Only downgrade if not already on Free tier
        if (profile.tier?.name !== "Free") {
            // Get Free tier
            const freeTier = await prisma.tier.findUnique({
                where: { name: "Free" }
            });

            if (freeTier) {
                // Update profile to Free tier
                await prisma.profile.update({
                    where: { id: profileId },
                    data: {
                        tierId: freeTier.id,
                        subscriptionStatus: "EXPIRED",
                        bgImage: "dark-gray" // Reset background on downgrade
                    }
                });

                // Log the downgrade
                await prisma.subscriptionHistory.create({
                    data: {
                        profileId,
                        action: "EXPIRED",
                        previousTierId: profile.tierId,
                        newTierId: freeTier.id,
                        performedBy: "SYSTEM",
                        notes: "Subscription expired and auto-downgraded to Free tier"
                    }
                });
            }
        }
    }
}

/**
 * Get the effective tier for a profile (considering expiration)
 */
export async function getEffectiveTier(profileId: string) {
    await checkAndHandleExpiration(profileId);

    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
            tier: {
                include: {
                    features: {
                        include: {
                            feature: true
                        }
                    }
                }
            }
        }
    });

    return profile?.tier || null;
}

/**
 * Server-side utility to check if a profile has access to a specific feature
 */
export async function hasFeatureAccess(profileId: string, featureKey: string): Promise<boolean> {
    const tier = await getEffectiveTier(profileId);

    if (!tier) {
        // No tier assigned = no access to premium features
        return false;
    }

    return tier.features.some(tf => tf.feature.key === featureKey);
}

/**
 * Get all features for a specific profile
 */
export async function getProfileFeatures(profileId: string): Promise<string[]> {
    const tier = await getEffectiveTier(profileId);

    if (!tier) {
        return [];
    }

    return tier.features.map(tf => tf.feature.key);
}

/**
 * Get current user's profile features
 */
export async function getCurrentUserFeatures(): Promise<string[]> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                select: { id: true }
            }
        }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        return [];
    }

    return getProfileFeatures(user.profiles[0].id);
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(code: string, tierId?: string) {
    const promoCode = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!promoCode) {
        return { valid: false, error: "Promo code not found" };
    }

    if (!promoCode.isActive) {
        return { valid: false, error: "Promo code is inactive" };
    }

    const now = new Date();
    if (promoCode.validFrom > now) {
        return { valid: false, error: "Promo code not yet valid" };
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
        return { valid: false, error: "Promo code has expired" };
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
        return { valid: false, error: "Promo code usage limit reached" };
    }

    // Check if applicable to the tier
    if (tierId && promoCode.applicableTierIds.length > 0) {
        if (!promoCode.applicableTierIds.includes(tierId)) {
            return { valid: false, error: "Promo code not applicable to this tier" };
        }
    }

    return {
        valid: true,
        promoCode: {
            id: promoCode.id,
            code: promoCode.code,
            type: promoCode.type,
            value: promoCode.value,
            description: promoCode.description
        }
    };
}

/**
 * Apply a promo code to a profile (increment usage)
 */
export async function applyPromoCode(promoCodeId: string) {
    await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: {
            currentUses: { increment: 1 }
        }
    });
}

