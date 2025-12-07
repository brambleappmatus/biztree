"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategorySelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export default function CategorySelector({ selectedIds, onChange }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadCategories();

        // Click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const toggleCategory = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((c) => c !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const selectedCategories = categories.filter((c) => selectedIds.includes(c.id));

    if (loading) return <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />;

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer flex flex-wrap gap-2 items-center"
                onClick={() => setOpen(!open)}
            >
                {selectedCategories.length === 0 && (
                    <span className="text-gray-500 dark:text-gray-400">Select categories...</span>
                )}

                {selectedCategories.map((category) => (
                    <span
                        key={category.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(category.id);
                        }}
                    >
                        {category.name}
                        <X size={14} className="hover:text-purple-900 dark:hover:text-purple-100" />
                    </span>
                ))}

                <div className="ml-auto">
                    <ChevronsUpDown size={16} className="text-gray-400" />
                </div>
            </div>

            {open && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {categories.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">No categories found</div>
                    ) : (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedIds.includes(category.id)
                                        ? "bg-purple-600 border-purple-600 text-white"
                                        : "border-gray-300 dark:border-gray-600"
                                    }`}>
                                    {selectedIds.includes(category.id) && <Check size={12} />}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-200">{category.name}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
