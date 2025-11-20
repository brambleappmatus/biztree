"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addLink(profileId: string, title: string, url: string) {
    try {
        // Get highest order
        const lastLink = await prisma.link.findFirst({
            where: { profileId },
            orderBy: { order: "desc" },
        });

        const newOrder = lastLink ? lastLink.order + 1 : 0;

        await prisma.link.create({
            data: {
                profileId,
                title,
                url,
                order: newOrder,
            },
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error adding link:", error);
        return { error: "Failed to add link" };
    }
}

export async function deleteLink(linkId: string) {
    try {
        await prisma.link.delete({
            where: { id: linkId },
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error deleting link:", error);
        return { error: "Failed to delete link" };
    }
}

export async function updateLinkOrder(items: { id: string; order: number }[]) {
    try {
        await prisma.$transaction(
            items.map((item) =>
                prisma.link.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        );

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating link order:", error);
        return { error: "Failed to update order" };
    }
}
