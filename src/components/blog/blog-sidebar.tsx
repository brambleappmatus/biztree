"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Tag, X } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: {
        posts: number;
    };
}

interface BlogSidebarProps {
    categories: Category[];
}

export default function BlogSidebar({ categories }: BlogSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category");
    const currentSearch = searchParams.get("search") || "";

    const [searchTerm, setSearchTerm] = useState(currentSearch);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== currentSearch) {
                const params = new URLSearchParams(searchParams.toString());
                if (searchTerm) {
                    params.set("search", searchTerm);
                } else {
                    params.delete("search");
                }
                router.push(`/blog?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, currentSearch, router, searchParams]);

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Search</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-blue-600" />
                    Categories
                </h3>
                <div className="space-y-2">
                    <Link
                        href="/blog"
                        className={`block px-3 py-2 rounded-lg transition-colors ${!currentCategory
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        All Articles
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?category=${category.slug}`}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentCategory === category.slug
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span>{category.name}</span>
                            {category._count && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {category._count.posts}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
