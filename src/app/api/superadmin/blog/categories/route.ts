import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const categories = await prisma.blogCategory.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, slug, description } = await req.json();

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const existingCategory = await prisma.blogCategory.findUnique({
            where: { slug },
        });

        if (existingCategory) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }

        const category = await prisma.blogCategory.create({
            data: {
                name,
                slug,
                description,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
