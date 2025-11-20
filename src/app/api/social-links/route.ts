import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { profileId, platform, url } = body;

        if (!profileId || !platform || !url) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const socialLink = await prisma.socialLink.create({
            data: {
                profileId,
                platform,
                url,
            },
        });

        return NextResponse.json(socialLink);
    } catch (error) {
        console.error("Error creating social link:", error);
        return NextResponse.json({ error: "Failed to create social link" }, { status: 500 });
    }
}
