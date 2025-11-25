import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT update showcase
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, imageUrl, profileUrl, layers } = body;

        const showcase = await prisma.$transaction(async (tx) => {
            // Update showcase details
            const updated = await tx.showcase.update({
                where: { id },
                data: { name, imageUrl, profileUrl },
            });

            // If layers are provided, replace them
            if (layers) {
                // Delete existing layers
                await tx.showcaseLayer.deleteMany({
                    where: { showcaseId: id }
                });

                // Create new layers
                if (layers.length > 0) {
                    await tx.showcaseLayer.createMany({
                        data: layers.map((layer: any) => ({
                            showcaseId: id,
                            imageUrl: layer.imageUrl,
                            depth: layer.depth,
                            order: layer.order
                        }))
                    });
                }
            }

            return await tx.showcase.findUnique({
                where: { id },
                include: { layers: true }
            });
        });

        return NextResponse.json(showcase);
    } catch (error) {
        console.error("Error updating showcase:", error);
        return NextResponse.json({ error: "Failed to update showcase" }, { status: 500 });
    }
}

// DELETE showcase
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        await prisma.showcase.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting showcase:", error);
        return NextResponse.json({ error: "Failed to delete showcase" }, { status: 500 });
    }
}
