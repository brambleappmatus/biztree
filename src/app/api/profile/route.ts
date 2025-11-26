import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { seoTitle, seoDesc } = body;

        // Get user's profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profiles: true }
        });

        if (!user?.profiles || user.profiles.length === 0) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const profileId = user.profiles[0].id;

        // Update profile
        const updatedProfile = await prisma.profile.update({
            where: { id: profileId },
            data: {
                seoTitle,
                seoDesc,
            },
        });

        return NextResponse.json({ profile: updatedProfile });
    } catch (error) {
        console.error("Failed to update profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
