"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTiers() {
    return await prisma.tier.findMany({
        include: {
            features: {
                include: {
                    feature: true
                }
            }
        },
        orderBy: {
            price: 'asc'
        }
    });
}

export async function getFeatures() {
    return await prisma.feature.findMany({
        orderBy: {
            name: 'asc'
        }
    });
}

export async function updateTierFeatures(tierId: string, featureIds: string[]) {
    // Transaction to update features
    await prisma.$transaction(async (tx) => {
        // Remove all existing features for this tier
        await tx.tierFeature.deleteMany({
            where: {
                tierId
            }
        });

        // Add new features
        if (featureIds.length > 0) {
            await tx.tierFeature.createMany({
                data: featureIds.map(featureId => ({
                    tierId,
                    featureId
                }))
            });
        }
    });

    revalidatePath("/superadmin/licensing");
}

export async function createTier(name: string, price: number) {
    await prisma.tier.create({
        data: {
            name,
            price
        }
    });
    revalidatePath("/superadmin/licensing");
}

export async function createFeature(key: string, name: string, description?: string) {
    await prisma.feature.create({
        data: {
            key,
            name,
            description
        }
    });
    revalidatePath("/superadmin/licensing");
}
