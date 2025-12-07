"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    _count?: {
        posts: number;
    };
}

export default function CategoriesManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "" });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch("/api/superadmin/blog/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const response = await fetch("/api/superadmin/blog/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            if (response.ok) {
                setNewCategory({ name: "", slug: "", description: "" });
                loadCategories();
            } else {
                const error = await response.json();
                alert(error.error || "Failed to create category");
            }
        } catch (error) {
            console.error("Failed to create category:", error);
            alert("Failed to create category");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const response = await fetch(`/api/superadmin/blog/categories/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                loadCategories();
            } else {
                alert("Failed to delete category");
            }
        } catch (error) {
            console.error("Failed to delete category:", error);
            alert("Failed to delete category");
        }
    };

    // Auto-generate slug
    useEffect(() => {
        if (newCategory.name) {
            const slug = newCategory.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setNewCategory((prev) => ({ ...prev, slug }));
        }
    }, [newCategory.name]);

    if (loading) return <div>Loading categories...</div>;

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {/* Create Form */}
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Plus size={20} />
                        New Category
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={newCategory.slug}
                                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Category"}
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Tag size={20} />
                    Existing Categories
                </h2>
                {categories.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                                            /{category.slug}
                                        </code>
                                        <span>•</span>
                                        <span>{category._count?.posts || 0} posts</span>
                                    </div>
                                    {category.description && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Category"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
