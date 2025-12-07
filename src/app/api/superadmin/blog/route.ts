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
        console.log("POST Blog Post Data:", JSON.stringify(data, null, 2));

        // Check if slug already exists
        const existingPost = await prisma.blogPost.findUnique({
            where: { slug: data.slug },
        });

        if (existingPost) {
            return NextResponse.json({ error: "A post with this slug already exists" }, { status: 400 });
        }

        const createData: any = {
            title: data.title,
            slug: data.slug,
            content: data.content,
            isPublished: data.isPublished || false,
            publishedAt: data.isPublished ? new Date() : null,
        };

        if (data.excerpt) createData.excerpt = data.excerpt;
        if (data.featuredImage) createData.featuredImage = data.featuredImage;
        if (data.metaTitle) createData.metaTitle = data.metaTitle;
        if (data.metaDescription) createData.metaDescription = data.metaDescription;
        if (data.authorName) createData.authorName = data.authorName;
        if (data.authorImage) createData.authorImage = data.authorImage;

        if (data.categoryIds && data.categoryIds.length > 0) {
            createData.categories = {
                connect: data.categoryIds.map((id: string) => ({ id })),
            };
        }

        console.log("Create Data:", JSON.stringify(createData, null, 2));

        const post = await prisma.blogPost.create({
            data: createData,
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to create blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
