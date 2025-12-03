import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        console.log('=== Profile PATCH API called ===');
        const session = await getServerSession(authOptions);
        console.log('Session:', session?.user?.id);

        if (!session?.user?.id) {
            console.log('Unauthorized - no session');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log('Request body:', body);
        const { seoTitle, seoDesc } = body;

        // Get user's profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profiles: true }
        });
        console.log('User found:', user?.id, 'Profiles:', user?.profiles?.length);

        if (!user?.profiles || user.profiles.length === 0) {
            console.log('No profile found for user');
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const profileId = user.profiles[0].id;
        console.log('Updating profile:', profileId, 'with:', { seoTitle, seoDesc });

        // Update profile
        const updatedProfile = await prisma.profile.update({
            where: { id: profileId },
            data: {
                seoTitle,
                seoDesc,
            },
        });
        console.log('Profile updated successfully:', updatedProfile.id);

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("Failed to update profile - FULL ERROR:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
