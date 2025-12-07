"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BlogEditor from "@/components/admin/blog-editor";
import CategorySelector from "@/components/admin/blog/category-selector";

interface BlogFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    metaTitle: string;
    metaDescription: string;
    authorName: string;
    authorImage: string;
    isPublished: boolean;
    categoryIds: string[];
}

export default function NewBlogPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingAuthorImage, setUploadingAuthorImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authorImageInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<BlogFormData>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        metaTitle: "",
        metaDescription: "",
        authorName: "",
        authorImage: "",
        isPublished: false,
        categoryIds: [],
    });

    // Auto-generate slug from title
    useEffect(() => {
        if (formData.title && !formData.slug) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }
    }, [formData.title, formData.slug]);

    const handleChange = (field: keyof BlogFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'author') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'featured') {
            setUploadingImage(true);
        } else {
            setUploadingAuthorImage(true);
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const { url } = await response.json();
                if (type === 'featured') {
                    handleChange("featuredImage", url);
                } else {
                    handleChange("authorImage", url);
                }
            } else {
                alert("Failed to upload image");
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image");
        } finally {
            if (type === 'featured') {
                setUploadingImage(false);
            } else {
                setUploadingAuthorImage(false);
            }
        }
    };


    const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/superadmin/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    isPublished: publish,
                }),
            });

            if (response.ok) {
                router.push("/superadmin/blog");
            } else {
                const error = await response.json();
                alert(error.error + (error.details ? `\n\nDetails: ${error.details}` : "") || "Failed to create blog post");
            }
        } catch (error) {
            console.error("Failed to create blog post:", error);
            alert("Failed to create blog post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/superadmin/blog"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">New Blog Post</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Create a new blog post with rich content
                    </p>
                </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                {/* Title & Slug */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Basic Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Slug (URL) *
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => handleChange("slug", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                URL: /blog/{formData.slug || "your-post-slug"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Excerpt
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => handleChange("excerpt", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Short description for previews..."
                            />
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Featured Image
                    </h2>
                    <div className="space-y-4">
                        {formData.featuredImage ? (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                <Image
                                    src={formData.featuredImage}
                                    alt="Featured"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleChange("featuredImage", "")}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                            >
                                <Upload size={48} className="text-gray-400 mb-2" />
                                <span className="text-gray-600 dark:text-gray-400">
                                    {uploadingImage ? "Uploading..." : "Click to upload featured image"}
                                </span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'featured')}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Content Editor */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Content</h2>
                    <BlogEditor
                        content={formData.content}
                        onChange={(content) => handleChange("content", content)}
                    />
                </div>

                {/* Author Info */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Author Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Author Name
                            </label>
                            <input
                                type="text"
                                value={formData.authorName}
                                onChange={(e) => handleChange("authorName", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Author Image
                            </label>
                            <div className="flex gap-2">
                                {formData.authorImage ? (
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={formData.authorImage}
                                            alt="Author"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => authorImageInputRef.current?.click()}
                                    disabled={uploadingAuthorImage}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    {uploadingAuthorImage ? "Uploading..." : formData.authorImage ? "Change" : "Upload"}
                                </button>
                                {formData.authorImage && (
                                    <button
                                        type="button"
                                        onClick={() => handleChange("authorImage", "")}
                                        className="px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            <input
                                ref={authorImageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'author')}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        SEO Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Meta Title
                            </label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={(e) => handleChange("metaTitle", e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Leave empty to use post title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Meta Description
                            </label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => handleChange("metaDescription", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Leave empty to use excerpt"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <Link
                        href="/superadmin/blog"
                        className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Link>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <Eye size={18} />
                            Publish
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
