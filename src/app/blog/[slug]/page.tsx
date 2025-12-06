import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Calendar, User, ArrowLeft } from "lucide-react";
import LandingNav from "@/components/landing-nav";
import { Metadata } from "next";

interface Props {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
    });

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        openGraph: {
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt || undefined,
            images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
            type: "article",
            publishedTime: post.publishedAt?.toISOString(),
            authors: post.authorName ? [post.authorName] : undefined,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const post = await prisma.blogPost.findUnique({
        where: {
            slug: params.slug,
            isPublished: true,
        },
    });

    if (!post) {
        notFound();
    }

    // Increment view count (this is a side effect in a Server Component, which is generally okay for simple stats but ideally should be separate)
    // However, to avoid blocking rendering, we'll skip it here or do it via a client component if strict accuracy is needed.
    // For now, we'll just focus on rendering.

    return (
        <div className="min-h-screen bg-white">
            <LandingNav />

            <article className="pt-32 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-12">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            {post.publishedAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>
                                        {new Date(post.publishedAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                            {post.authorName && (
                                <div className="flex items-center gap-1">
                                    <User size={16} />
                                    <span>{post.authorName}</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-xl text-gray-600 leading-relaxed">
                                {post.excerpt}
                            </p>
                        )}
                    </header>

                    {/* Featured Image */}
                    {post.featuredImage && (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-lg">
                            <Image
                                src={post.featuredImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>
        </div>
    );
}
