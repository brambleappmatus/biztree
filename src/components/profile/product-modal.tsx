"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Check, XCircle } from "lucide-react";
import { Language, getTranslation } from "@/lib/i18n";

interface ProductType {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    imageUrl: string | null;
    isAvailable: boolean;
}

interface ProductModalProps {
    product: ProductType;
    onClose: () => void;
    lang?: Language;
}

export default function ProductModal({ product, onClose, lang = "sk" }: ProductModalProps) {
    const t = getTranslation(lang);
    const [mounted, setMounted] = useState(false);

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
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-100 dark:bg-gray-800">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                            </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-lg">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(product.price, product.currency)}
                            </span>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {product.name}
                        </h2>

                        {/* Availability Status */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4 ${product.isAvailable
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                            {product.isAvailable ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    {t.profile.available || "Dostupné"}
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4" />
                                    {t.profile.unavailable || "Nedostupné"}
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Future: Add to Cart button (currently hidden/disabled) */}
                        {/* 
                        <button
                            disabled
                            className="mt-6 w-full py-3 rounded-xl bg-gray-200 text-gray-500 font-semibold cursor-not-allowed"
                        >
                            Čoskoro: Pridať do košíka
                        </button>
                        */}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
