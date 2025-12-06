import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all blog posts
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const posts = await prisma.blogPost.findMany({
            orderBy: [
                { isPublished: 'desc' },
                { createdAt: 'desc' }
            ],
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

// POST create new blog post
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Check if slug already exists
        const existingPost = await prisma.blogPost.findUnique({
            where: { slug: data.slug },
        });

        if (existingPost) {
            return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 });
        }

        const post = await prisma.blogPost.create({
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || null,
                content: data.content,
                featuredImage: data.featuredImage || null,
                metaTitle: data.metaTitle || null,
                metaDescription: data.metaDescription || null,
                authorName: data.authorName || null,
                authorImage: data.authorImage || null,
                isPublished: data.isPublished || false,
                publishedAt: data.isPublished ? new Date() : null,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to create blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
    }
}
