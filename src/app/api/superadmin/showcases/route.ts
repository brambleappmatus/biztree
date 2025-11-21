import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all showcases
export async function GET() {
    try {
        const showcases = await prisma.showcase.findMany({
            orderBy: { order: "asc" },
        });
        return NextResponse.json(showcases);
    } catch (error) {
        console.error("Error fetching showcases:", error);
        return NextResponse.json({ error: "Failed to fetch showcases" }, { status: 500 });
    }
}

// POST create new showcase
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { name, imageUrl, profileUrl } = body;

        // Get the highest order number and add 1
        const maxOrder = await prisma.showcase.findFirst({
            orderBy: { order: "desc" },
            select: { order: true },
        });

        const showcase = await prisma.showcase.create({
            data: {
                name,
                imageUrl,
                profileUrl,
                order: (maxOrder?.order ?? -1) + 1,
            },
        });

        return NextResponse.json(showcase);
    } catch (error) {
        console.error("Error creating showcase:", error);
        return NextResponse.json({ error: "Failed to create showcase" }, { status: 500 });
    }
}
