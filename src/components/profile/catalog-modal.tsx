"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Search } from "lucide-react";
import { Language, getTranslation } from "@/lib/i18n";

interface ProductType {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    imageUrl: string | null;
    isAvailable: boolean;
    order: number;
}

interface CatalogModalProps {
    products: ProductType[];
    onClose: () => void;
    onSelectProduct: (product: ProductType) => void;
    lang?: Language;
}

export default function CatalogModal({ products, onClose, onSelectProduct, lang = "sk" }: CatalogModalProps) {
    const t = getTranslation(lang);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const formatPrice = (price: number, currency: string = "EUR") => {
        return new Intl.NumberFormat(lang === "en" ? "en-US" : "sk-SK", {
            style: "currency",
            currency: currency,
        }).format(price);
    };

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t.profile.products || "Produkty"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t.profile.search || "Hľadať..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => onSelectProduct(product)}
                                        className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all text-left"
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-3">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                {formatPrice(product.price, product.currency)}
                                            </p>
                                        </div>

                                        {/* Unavailable Overlay */}
                                        {!product.isAvailable && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                                    {t.profile.unavailable || "Nedostupné"}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t.profile.noProducts || "Žiadne produkty"}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
