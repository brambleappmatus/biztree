"use server";

import prisma from "@/lib/prisma";

export async function toggleLifetimeDeals(enabled: boolean) {
    try {
        await prisma.systemSettings.upsert({
            where: { key: 'ENABLE_LIFETIME_DEALS' },
            update: { value: String(enabled) },
            create: {
                key: 'ENABLE_LIFETIME_DEALS',
                value: String(enabled)
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error toggling lifetime deals:', error);
        throw new Error(error.message || 'Failed to update settings');
    }
}

export async function getLifetimeDealsStatus() {
    try {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: 'ENABLE_LIFETIME_DEALS' }
        });
        return setting?.value === 'true';
    } catch (error) {
        console.error('Error fetching lifetime deals status:', error);
        return false;
    }
}
