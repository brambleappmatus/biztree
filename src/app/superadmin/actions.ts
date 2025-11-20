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
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            },
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
            profile: {
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
    email: string;
    password: string;
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
            profile: {
                create: {
                    subdomain: data.subdomain,
                    name: data.name,
                    language: "sk",
                    theme: "blue"
                }
            }
        },
        include: { profile: true }
    });

    return { success: true, user };
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
        include: { profile: true }
    });

    if (!user) {
        return { error: "Používateľ neexistuje" };
    }

    if (user.profile) {
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
export async function changeUserCompany(userId: string, newProfileId: string) {
    await checkSuperAdmin();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!user) {
        return { error: "Používateľ neexistuje" };
    }

    const newProfile = await prisma.profile.findUnique({
        where: { id: newProfileId },
        include: { user: true }
    });

    if (!newProfile) {
        return { error: "Firma neexistuje" };
    }

    // Swap the profiles between users if new profile has a user
    if (newProfile.userId && user.profile) {
        // Swap profiles
        await prisma.$transaction([
            prisma.profile.update({
                where: { id: user.profile.id },
                data: { userId: newProfile.userId }
            }),
            prisma.profile.update({
                where: { id: newProfileId },
                data: { userId: userId }
            })
        ]);
    } else if (user.profile) {
        // Just reassign user's current profile and take the new one
        await prisma.profile.update({
            where: { id: newProfileId },
            data: { userId: userId }
        });
    } else {
        // User has no profile, just assign them to the new one
        await prisma.profile.update({
            where: { id: newProfileId },
            data: { userId: userId }
        });
    }

    return { success: true };
}
