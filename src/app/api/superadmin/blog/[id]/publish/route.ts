import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH toggle publish status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isPublished } = await request.json();

        const currentPost = await prisma.blogPost.findUnique({
            where: { id: params.id },
        });

        if (!currentPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: {
                isPublished,
                publishedAt: isPublished && !currentPost.publishedAt ? new Date() : currentPost.publishedAt,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to toggle publish status:", error);
        return NextResponse.json({ error: "Failed to toggle publish status" }, { status: 500 });
    }
}
