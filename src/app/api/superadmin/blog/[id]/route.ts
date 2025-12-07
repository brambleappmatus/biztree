import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single blog post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const post = await prisma.blogPost.findUnique({
            where: { id },
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { id } = await params;

        console.log("PATCH Blog Post Data:", JSON.stringify(data, null, 2));

        // Check if slug is being changed and if it conflicts
        if (data.slug) {
            const existingPost = await prisma.blogPost.findFirst({
                where: {
                    slug: data.slug,
                    NOT: { id },
                },
            });

            if (existingPost) {
                return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 });
            }
        }

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
        if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
        if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
        if (data.authorName !== undefined) updateData.authorName = data.authorName;
        if (data.authorImage !== undefined) updateData.authorImage = data.authorImage;
        if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

        if (data.categoryIds !== undefined) {
            updateData.categories = {
                set: data.categoryIds.map((id: string) => ({ id })),
            };
        }

        // Set publishedAt when publishing for the first time
        const currentPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (data.isPublished && !currentPost?.publishedAt) {
            updateData.publishedAt = new Date();
        } else if (data.isPublished === false) {
            updateData.publishedAt = null;
        }

        console.log("Update Data:", JSON.stringify(updateData, null, 2));

        const post = await prisma.blogPost.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// DELETE blog post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.blogPost.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
