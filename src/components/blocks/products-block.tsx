"use client";

import React, { useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, getTranslation } from "@/lib/i18n";
import ProductModal from "@/components/profile/product-modal";
import CatalogModal from "@/components/profile/catalog-modal";

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

interface ProductsBlockProps {
    products: ProductType[];
    bgImage?: string | null;
    lang?: Language;
}

export default function ProductsBlock({ products, bgImage, lang = "sk" }: ProductsBlockProps) {
    const t = getTranslation(lang);
    const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
    const [showCatalog, setShowCatalog] = useState(false);

    // Only show available products
    const availableProducts = products.filter(p => p.isAvailable);

    if (availableProducts.length === 0) return null;

    // Determine if background is an image (for styling)
    const isImageBg = bgImage?.startsWith("http") || false;

    const formatPrice = (price: number, currency: string = "EUR") => {
        return new Intl.NumberFormat(lang === "en" ? "en-US" : "sk-SK", {
            style: "currency",
            currency: currency,
        }).format(price);
    };

    return (
        <>
            <div className={cn(
                "gap-3",
                availableProducts.length === 1 && "grid grid-cols-1",
                availableProducts.length === 2 && "grid grid-cols-2",
                availableProducts.length === 3 && "grid grid-cols-3",
                availableProducts.length >= 4 && "flex overflow-x-auto snap-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-2"
            )}>
                {availableProducts.slice(0, 6).map((product) => (
                    <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={cn(
                            "group relative h-32 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all hover:scale-[1.02] active:scale-[0.98] text-left",
                            availableProducts.length >= 4 && "flex-shrink-0 w-48 snap-start"
                        )}
                    >
                        {/* Product Image or Placeholder */}
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50">
                                <Package className={cn("w-10 h-10 opacity-40", isImageBg ? "text-white" : "text-gray-600")} />
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Price Badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-sm">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatPrice(product.price, product.currency)}
                            </span>
                        </div>

                        {/* Product Name */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-semibold text-sm leading-tight truncate">
                                {product.name}
                            </h3>
                            {product.description && (
                                <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                                    {product.description}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* View All Button */}
            {availableProducts.length > 3 && (
                <button
                    onClick={() => setShowCatalog(true)}
                    className="mt-3 w-full py-3 rounded-2xl ios-card hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    style={{ color: 'var(--card-text)' }}
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.profile.viewCatalog || "Zobraziť katalóg"}</span>
                </button>
            )}

            {/* Product Modal */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    lang={lang}
                />
            )}

            {/* Catalog Modal */}
            {showCatalog && (
                <CatalogModal
                    products={availableProducts}
                    onClose={() => setShowCatalog(false)}
                    onSelectProduct={(product: ProductType) => {
                        setShowCatalog(false);
                        setSelectedProduct(product);
                    }}
                    lang={lang}
                />
            )}
        </>
    );
}
