"use server";

import prisma from "@/lib/prisma";
import { checkProductLimit } from "@/lib/subscription-limits";
import { revalidatePath } from "next/cache";

export async function getProducts(profileId: string) {
    return await prisma.product.findMany({
        where: { profileId },
        orderBy: { order: "asc" }
    });
}

export async function createProduct(profileId: string, data: {
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
}) {
    const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
            tier: true,
            _count: { select: { products: true } }
        }
    });

    if (!profile) throw new Error("Profile not found");

    // Check product limit
    if (!checkProductLimit(profile.tier?.name, profile._count.products)) {
        throw new Error("Product limit reached for your plan");
    }

    // Get the highest order number and add 1
    const maxOrder = await prisma.product.findFirst({
        where: { profileId },
        orderBy: { order: "desc" },
        select: { order: true }
    });

    const product = await prisma.product.create({
        data: {
            profileId,
            name: data.name,
            price: data.price,
            description: data.description,
            imageUrl: data.imageUrl,
            isAvailable: data.isAvailable ?? true,
            order: (maxOrder?.order ?? -1) + 1
        }
    });

    revalidatePath("/admin/services");
    return product;
}

export async function updateProduct(productId: string, data: {
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
}) {
    const product = await prisma.product.update({
        where: { id: productId },
        data: {
            name: data.name,
            price: data.price,
            description: data.description,
            imageUrl: data.imageUrl,
            isAvailable: data.isAvailable,
        }
    });

    revalidatePath("/admin/services");
    return product;
}

export async function deleteProduct(productId: string) {
    await prisma.product.delete({
        where: { id: productId }
    });

    revalidatePath("/admin/services");
    return { success: true };
}

export async function reorderProducts(items: { id: string; order: number }[]) {
    try {
        await prisma.$transaction(
            items.map((item) =>
                prisma.product.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );

        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Error reordering products:", error);
        return { error: "Failed to reorder products" };
    }
}
