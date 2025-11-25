import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { profileId } = await request.json();

        if (!profileId) {
            return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
        }

        // Clear Google Calendar tokens
        await prisma.profile.update({
            where: { id: profileId },
            data: {
                googleAccessToken: null,
                googleRefreshToken: null,
                googleTokenExpiry: null,
            } as any
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error disconnecting Google Calendar:", error);
        return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }
}
