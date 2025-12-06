"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    isPublished: boolean;
    publishedAt: Date | null;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const response = await fetch("/api/superadmin/blog");
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to load blog posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;

        try {
            const response = await fetch(`/api/superadmin/blog/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setPosts(posts.filter((post) => post.id !== id));
            } else {
                alert("Failed to delete blog post");
            }
        } catch (error) {
            console.error("Failed to delete blog post:", error);
            alert("Failed to delete blog post");
        }
    };

    const togglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/superadmin/blog/${id}/publish`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !currentStatus }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map((post) => (post.id === id ? updatedPost : post)));
            }
        } catch (error) {
            console.error("Failed to toggle publish status:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Create and manage blog posts for SEO and ChatGPT indexing
                    </p>
                </div>
                <Link
                    href="/superadmin/blog/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus size={20} />
                    New Post
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No blog posts yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Create your first blog post to improve SEO and get indexed by ChatGPT
                    </p>
                    <Link
                        href="/superadmin/blog/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus size={20} />
                        Create First Post
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Featured Image */}
                                <div className="md:w-64 h-48 md:h-auto bg-gray-100 dark:bg-gray-800 relative flex-shrink-0">
                                    {post.featuredImage ? (
                                        <Image
                                            src={post.featuredImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Calendar size={48} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                    {post.title}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${post.isPublished
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}
                                                >
                                                    {post.isPublished ? "Published" : "Draft"}
                                                </span>
                                            </div>
                                            {post.excerpt && (
                                                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Eye size={16} />
                                                {post.viewCount} views
                                            </span>
                                            {post.publishedAt && (
                                                <span>
                                                    Published {new Date(post.publishedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => togglePublish(post.id, post.isPublished)}
                                                className={`p-2 rounded-lg transition-colors ${post.isPublished
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                                    }`}
                                                title={post.isPublished ? "Unpublish" : "Publish"}
                                            >
                                                {post.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <Link
                                                href={`/superadmin/blog/${post.id}/edit`}
                                                className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
