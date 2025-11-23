import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, isActive } = body;

        // Verify ownership
        const album = await prisma.galleryAlbum.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!album || album.profile.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const updatedAlbum = await prisma.galleryAlbum.update({
            where: { id },
            data: {
                name: name ?? album.name,
                isActive: isActive ?? album.isActive
            }
        });

        return NextResponse.json(updatedAlbum);
    } catch (error) {
        console.error("Error updating album:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const album = await prisma.galleryAlbum.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!album || album.profile.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.galleryAlbum.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting album:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
