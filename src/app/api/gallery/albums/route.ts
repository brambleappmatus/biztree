import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get profile ID from query param or infer from user
        const { searchParams } = new URL(request.url);
        const profileId = searchParams.get("profileId");

        if (!profileId) {
            return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
        }

        // Verify ownership
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            select: { userId: true }
        });

        if (!profile || profile.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const albums = await prisma.galleryAlbum.findMany({
            where: { profileId },
            include: {
                images: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(albums);
    } catch (error) {
        console.error("Error fetching albums:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, profileId } = body;

        if (!name || !profileId) {
            return NextResponse.json({ error: "Name and Profile ID required" }, { status: 400 });
        }

        // Verify ownership
        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
            select: { userId: true }
        });

        if (!profile || profile.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Get max order
        const lastAlbum = await prisma.galleryAlbum.findFirst({
            where: { profileId },
            orderBy: { order: 'desc' }
        });
        const newOrder = (lastAlbum?.order ?? -1) + 1;

        const album = await prisma.galleryAlbum.create({
            data: {
                name,
                profileId,
                order: newOrder
            }
        });

        return NextResponse.json(album);
    } catch (error) {
        console.error("Error creating album:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
