import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                select: {
                    id: true,
                    subdomain: true,
                    name: true,
                    avatarUrl: true,
                    theme: true,
                    seoTitle: true,
                    seoDesc: true,
                    bgImage: true,
                    bgBlur: true,
                    bgNoise: true
                }
            }
        }
    });

    if (!user?.profiles || user.profiles.length === 0) {
        return NextResponse.json({ subdomain: null, profile: null });
    }

    return NextResponse.json({
        subdomain: user.profiles[0]?.subdomain,
        profile: user.profiles[0]
    });
}
