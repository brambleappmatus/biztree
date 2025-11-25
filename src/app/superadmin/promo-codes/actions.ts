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

// Get all promo codes
export async function getPromoCodes() {
    await checkSuperAdmin();

    const promoCodes = await prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' }
    });

    // Convert Decimal to string for client components
    return promoCodes.map(promo => ({
        ...promo,
        value: promo.value.toString()
    }));
}

// Create promo code
export async function createPromoCode(data: {
    code: string;
    description?: string;
    type: string;
    value: number;
    maxUses?: number;
    validFrom?: Date;
    validUntil?: Date;
    applicableTierIds?: string[];
}) {
    await checkSuperAdmin();

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
        where: { code: data.code.toUpperCase() }
    });

    if (existing) {
        return { error: "Promo code already exists" };
    }

    await prisma.promoCode.create({
        data: {
            code: data.code.toUpperCase(),
            description: data.description,
            type: data.type,
            value: data.value,
            maxUses: data.maxUses,
            validFrom: data.validFrom || new Date(),
            validUntil: data.validUntil,
            applicableTierIds: data.applicableTierIds || [],
            isActive: true
        }
    });

    return { success: true };
}

// Update promo code
export async function updatePromoCode(id: string, data: {
    description?: string;
    value?: number;
    maxUses?: number;
    validFrom?: Date;
    validUntil?: Date;
    applicableTierIds?: string[];
}) {
    await checkSuperAdmin();

    await prisma.promoCode.update({
        where: { id },
        data: {
            description: data.description,
            value: data.value,
            maxUses: data.maxUses,
            validFrom: data.validFrom,
            validUntil: data.validUntil,
            applicableTierIds: data.applicableTierIds
        }
    });

    return { success: true };
}

// Toggle promo code active status
export async function togglePromoCodeStatus(id: string) {
    await checkSuperAdmin();

    const promoCode = await prisma.promoCode.findUnique({
        where: { id }
    });

    if (!promoCode) {
        return { error: "Promo code not found" };
    }

    await prisma.promoCode.update({
        where: { id },
        data: { isActive: !promoCode.isActive }
    });

    return { success: true };
}

// Delete promo code
export async function deletePromoCode(id: string) {
    await checkSuperAdmin();

    await prisma.promoCode.delete({
        where: { id }
    });

    return { success: true };
}

// Generate random promo code
export function generatePromoCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
