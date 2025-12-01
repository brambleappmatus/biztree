"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { isFeatureAllowed } from "@/lib/subscription-limits";

export async function updateProfileSettings(profileId: string, data: {
    allowConcurrentServices?: boolean;
}) {
    // If enabling concurrent services, check limit
    if (data.allowConcurrentServices) {
        const profileCheck = await prisma.profile.findUnique({
            where: { id: profileId },
            include: { tier: true }
        });

        if (!profileCheck) throw new Error("Profile not found");

        if (!isFeatureAllowed(profileCheck.tier?.name, 'concurrentBookings')) {
            throw new Error("Concurrent bookings are not available in your plan");
        }
    }

    const profile = await prisma.profile.update({
        where: { id: profileId },
        data: {
            allowConcurrentServices: data.allowConcurrentServices,
        },
    });

    revalidatePath("/admin/services");
    return profile;
}

export async function getProfileSettings(profileId: string) {
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: {
            allowConcurrentServices: true,
        },
    });
    return profile;
}
