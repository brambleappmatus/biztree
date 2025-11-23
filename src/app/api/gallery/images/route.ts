import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { url, albumId, caption } = body;

        if (!url || !albumId) {
            return NextResponse.json({ error: "URL and Album ID required" }, { status: 400 });
        }

        // Verify ownership of the album
        const album = await prisma.galleryAlbum.findUnique({
            where: { id: albumId },
            include: { profile: true }
        });

        if (!album || album.profile.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Get max order
        const lastImage = await prisma.galleryImage.findFirst({
            where: { albumId },
            orderBy: { order: 'desc' }
        });
        const newOrder = (lastImage?.order ?? -1) + 1;

        const image = await prisma.galleryImage.create({
            data: {
                url,
                albumId,
                caption,
                order: newOrder
            }
        });

        // If this is the first image and album has no cover, set it
        if (!album.coverUrl) {
            await prisma.galleryAlbum.update({
                where: { id: albumId },
                data: { coverUrl: url }
            });
        }

        return NextResponse.json(image);
    } catch (error) {
        console.error("Error creating image:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
