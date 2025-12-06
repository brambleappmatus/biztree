import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single blog post
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const post = await prisma.blogPost.findUnique({
            where: { id: params.id },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to fetch blog post:", error);
        return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
    }
}

// PATCH update blog post
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Check if slug is being changed and if it conflicts
        if (data.slug) {
            const existingPost = await prisma.blogPost.findFirst({
                where: {
                    slug: data.slug,
                    NOT: { id: params.id },
                },
            });

            if (existingPost) {
                return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 });
            }
        }

        const updateData: any = {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || null,
            content: data.content,
            featuredImage: data.featuredImage || null,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            authorName: data.authorName || null,
            authorImage: data.authorImage || null,
            isPublished: data.isPublished,
        };

        // Set publishedAt when publishing for the first time
        const currentPost = await prisma.blogPost.findUnique({
            where: { id: params.id },
        });

        if (data.isPublished && !currentPost?.publishedAt) {
            updateData.publishedAt = new Date();
        } else if (!data.isPublished) {
            updateData.publishedAt = null;
        }

        const post = await prisma.blogPost.update({
            where: { id: params.id },
            data: updateData,
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

// DELETE blog post
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.blogPost.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
