import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all documents for a profile
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const profileId = searchParams.get("profileId");

        if (!profileId) {
            return NextResponse.json({ error: "Profile ID required" }, { status: 400 });
        }

        const documents = await prisma.document.findMany({
            where: { profileId },
            orderBy: { order: "asc" },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

// POST: Create a new document record
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, url, fileType, fileSize, profileId } = body;

        if (!name || !url || !fileType || !fileSize || !profileId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify the profile belongs to the user
        const profile = await prisma.profile.findFirst({
            where: {
                id: profileId,
                userId: session.user.id,
            },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Check if user already has 6 documents
        const existingCount = await prisma.document.count({
            where: { profileId },
        });

        if (existingCount >= 6) {
            return NextResponse.json({ error: "Maximum 6 documents allowed" }, { status: 400 });
        }

        // Get the highest order number
        const lastDocument = await prisma.document.findFirst({
            where: { profileId },
            orderBy: { order: "desc" },
        });

        const document = await prisma.document.create({
            data: {
                name,
                url,
                fileType,
                fileSize,
                profileId,
                order: (lastDocument?.order ?? -1) + 1,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error creating document:", error);
        return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }
}
