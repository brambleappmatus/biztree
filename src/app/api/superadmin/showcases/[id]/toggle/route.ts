import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH toggle active status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { isActive } = body;

        const showcase = await prisma.showcase.update({
            where: { id },
            data: { isActive },
        });

        return NextResponse.json(showcase);
    } catch (error) {
        console.error("Error toggling showcase:", error);
        return NextResponse.json({ error: "Failed to toggle showcase" }, { status: 500 });
    }
}
