import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Calendar, User, ArrowRight } from "lucide-react";
import LandingNav from "@/components/landing-nav";

export const metadata = {
    title: "Blog | BizTree",
    description: "Latest news, updates, and tips from BizTree.",
};

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            publishedAt: "desc",
        },
    });

    return (
        <div className="min-h-screen bg-white">
            <LandingNav />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        BizTree Blog
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Latest updates, guides, and insights to help you grow your business.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {posts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">No posts found. Check back later!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                        {post.featuredImage ? (
                                            <Image
                                                src={post.featuredImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                                                <span className="text-4xl">📝</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            {post.publishedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    <span>
                                                        {new Date(post.publishedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {post.authorName && (
                                                <div className="flex items-center gap-1">
                                                    <User size={14} />
                                                    <span>{post.authorName}</span>
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>

                                        {post.excerpt && (
                                            <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                                                {post.excerpt}
                                            </p>
                                        )}

                                        <div className="mt-auto pt-4 flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                                            Read Article <ArrowRight size={16} className="ml-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
