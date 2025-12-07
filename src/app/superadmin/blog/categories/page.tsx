"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoriesManager from "@/components/admin/blog/categories-manager";

export default function BlogCategoriesPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage categories for your blog posts
                    </p>
                </div>
            </div>

            <CategoriesManager />
        </div>
    );
}
