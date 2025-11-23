import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profiles: true }
        });

        if (!user || !user.profiles || user.profiles.length === 0) {
            return NextResponse.json({ count: 0 });
        }

        const count = await prisma.booking.count({
            where: {
                profileId: user.profiles[0].id,
                status: { in: ["PENDING", "CONFIRMED"] },
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error fetching booking count:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
