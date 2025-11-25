"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, isSuperAdmin } from "@/lib/auth";

// Check if user is super admin
async function checkSuperAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || !isSuperAdmin(session)) {
        throw new Error("Unauthorized: Super admin access required");
    }
    return session;
}

// Get all companies
export async function getAllCompanies() {
    await checkSuperAdmin();

    return await prisma.profile.findMany({
        select: {
            id: true,
            name: true,
            subdomain: true,
            createdAt: true,
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            },
            tier: true,
            _count: {
                select: {
                    services: true,
                    bookings: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

// Get all users
export async function getAllUsers() {
    await checkSuperAdmin();

    return await prisma.user.findMany({
        include: {
            profiles: {
                select: {
                    id: true,
                    name: true,
                    subdomain: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

// Create a new company
export async function createCompany(data: {
    email?: string;
    password?: string;
    subdomain: string;
    name: string;
}) {
    await checkSuperAdmin();

    // Check if subdomain exists
    const existingProfile = await prisma.profile.findUnique({
        where: { subdomain: data.subdomain }
    });

    if (existingProfile) {
        return { error: "Subdoména už existuje" };
    }

    // If email/password provided, create with user
    if (data.email && data.password) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return { error: "Používateľ s týmto emailom už existuje" };
        }

        // Create user and profile
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: "USER",
                onboardingCompleted: true,
                profiles: {
                    create: {
                        subdomain: data.subdomain,
                        name: data.name,
                        language: "sk",
                        theme: "blue"
                    }
                }
            },
            include: { profiles: true }
        });

        return { success: true, user };
    } else {
        // Create profile without user
        const profile = await prisma.profile.create({
            data: {
                subdomain: data.subdomain,
                name: data.name,
                language: "sk",
                theme: "blue"
            }
        });

        return { success: true, profile };
    }
}

// Delete company
export async function deleteCompany(profileId: string) {
    await checkSuperAdmin();

    // Get profile with user
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { user: true }
    });

    if (!profile) {
        return { error: "Profil neexistuje" };
    }

    // Delete profile (cascades to services, bookings, etc.)
    await prisma.profile.delete({
        where: { id: profileId }
    });

    // Delete user if they have no other profiles
    if (profile.userId) {
        const userProfiles = await prisma.profile.count({
            where: { userId: profile.userId }
        });

        if (userProfiles === 0) {
            await prisma.user.delete({
                where: { id: profile.userId }
            });
        }
    }

    return { success: true };
}

// Delete user
export async function deleteUser(userId: string) {
    await checkSuperAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return { error: "Používateľ neexistuje" };
    }

    // Delete user (cascades to profile, services, bookings, etc.)
    await prisma.user.delete({
        where: { id: userId }
    });

    return { success: true };
}

// Assign user to company
export async function assignUserToCompany(userId: string, profileId: string) {
    await checkSuperAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profiles: true }
    });

    if (!user) {
        return { error: "Používateľ neexistuje" };
    }

    if (user.profiles && user.profiles.length > 0) {
        return { error: "Používateľ už má priradenú firmu" };
    }

    const profile = await prisma.profile.findUnique({
        where: { id: profileId }
    });

    if (!profile) {
        return { error: "Firma neexistuje" };
    }

    // Update profile to link to user
    await prisma.profile.update({
        where: { id: profileId },
        data: { userId: userId }
    });

    return { success: true };
}

// Get dashboard stats
export async function getSuperAdminStats() {
    await checkSuperAdmin();

    const [totalUsers, totalCompanies, totalBookings, totalServices] = await Promise.all([
        prisma.user.count(),
        prisma.profile.count(),
        prisma.booking.count(),
        prisma.service.count()
    ]);

    return {
        totalUsers,
        totalCompanies,
        totalBookings,
        totalServices
    };
}

// Update user role
export async function updateUserRole(userId: string, newRole: string) {
    await checkSuperAdmin();

    const validRoles = ["USER", "ADMIN", "SUPERADMIN"];
    if (!validRoles.includes(newRole)) {
        return { error: "Neplatná rola" };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return { error: "Používateľ neexistuje" };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    return { success: true };
}

// Change user's company (reassign profile to different user)
export async function changeUserCompany(userId: string, newProfileId: string | null) {
    await checkSuperAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profiles: true }
    });

    if (!user) {
        return { error: "Používateľ neexistuje" };
    }

    // If newProfileId is null or empty, unassign user from current profile
    if (!newProfileId) {
        if (user.profiles && user.profiles.length > 0) {
            await prisma.profile.update({
                where: { id: user.profiles[0].id },
                data: { userId: null }
            });
        }
        return { success: true };
    }

    const newProfile = await prisma.profile.findUnique({
        where: { id: newProfileId },
        include: { user: true }
    });

    if (!newProfile) {
        return { error: "Firma neexistuje" };
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
        // If user has a current profile, unlink it
        if (user.profiles && user.profiles.length > 0) {
            await tx.profile.update({
                where: { id: user.profiles[0].id },
                data: { userId: null }
            });
        }

        // If new profile has a current user, unlink it
        if (newProfile.userId) {
            await tx.profile.update({
                where: { id: newProfileId },
                data: { userId: null }
            });
        }

        // Assign user to new profile
        await tx.profile.update({
            where: { id: newProfileId },
            data: { userId: userId }
        });
    });

    return { success: true };
}

// Update company tier
export async function updateCompanyTier(
    profileId: string,
    tierId: string | null,
    expiresAt?: Date | null,
    notes?: string
) {
    await checkSuperAdmin();

    // Get the profile's current background and the new tier's features
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { bgImage: true, tierId: true }
    });

    const newTier = tierId ? await prisma.tier.findUnique({
        where: { id: tierId },
        include: {
            features: {
                include: {
                    feature: true
                }
            }
        }
    }) : null;

    // Check if new tier has background image features
    const hasUnsplashAccess = newTier?.features.some(tf => tf.feature.key === 'component_background_images') ?? false;
    const hasUploadAccess = newTier?.features.some(tf => tf.feature.key === 'component_background_upload') ?? false;

    // Prepare update data
    const updateData: any = { tierId };

    // Set subscription status and expiration
    if (tierId) {
        updateData.subscriptionStatus = expiresAt ? "ACTIVE" : "ACTIVE";
        updateData.subscriptionExpiresAt = expiresAt;
    } else {
        updateData.subscriptionStatus = null;
        updateData.subscriptionExpiresAt = null;
    }

    // Reset background to dark-gray if user loses access and has a custom/Unsplash background
    if (profile?.bgImage) {
        const isUnsplashImage = profile.bgImage.includes('unsplash');
        const isCustomImage = profile.bgImage.startsWith('http') && !isUnsplashImage;

        if ((isUnsplashImage && !hasUnsplashAccess) || (isCustomImage && !hasUploadAccess)) {
            updateData.bgImage = 'dark-gray';
        }
    }

    await prisma.profile.update({
        where: { id: profileId },
        data: updateData
    });

    // Log the tier change in subscription history
    const session = await getServerSession(authOptions);
    await prisma.subscriptionHistory.create({
        data: {
            profileId,
            action: "MANUAL_CHANGE",
            previousTierId: profile?.tierId,
            newTierId: tierId,
            performedBy: "ADMIN",
            performedByUserId: session?.user?.id,
            notes: notes || `Tier manually changed by superadmin${expiresAt ? ` with expiration: ${expiresAt.toISOString()}` : ''}`
        }
    });

    return { success: true };
}

// Extend subscription expiration
export async function extendSubscription(profileId: string, days: number) {
    await checkSuperAdmin();

    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { subscriptionExpiresAt: true }
    });

    if (!profile) {
        return { error: "Profile not found" };
    }

    const currentExpiration = profile.subscriptionExpiresAt || new Date();
    const newExpiration = new Date(currentExpiration);
    newExpiration.setDate(newExpiration.getDate() + days);

    await prisma.profile.update({
        where: { id: profileId },
        data: {
            subscriptionExpiresAt: newExpiration,
            subscriptionStatus: "ACTIVE"
        }
    });

    // Log the extension
    const session = await getServerSession(authOptions);
    await prisma.subscriptionHistory.create({
        data: {
            profileId,
            action: "RENEWED",
            performedBy: "ADMIN",
            performedByUserId: session?.user?.id,
            notes: `Subscription extended by ${days} days to ${newExpiration.toISOString()}`
        }
    });

    return { success: true, newExpiration };
}

// Get subscription history for a profile
export async function getSubscriptionHistory(profileId: string) {
    await checkSuperAdmin();

    return await prisma.subscriptionHistory.findMany({
        where: { profileId },
        include: {
            promoCode: {
                select: {
                    code: true,
                    description: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}

// Get all tiers (simple version for dropdown)
export async function getTiersList() {
    await checkSuperAdmin();
    const tiers = await prisma.tier.findMany({
        orderBy: { price: 'asc' }
    });

    // Convert Decimal to string for client components
    return tiers.map(tier => ({
        ...tier,
        price: tier.price?.toString() || "0"
    }));
}

