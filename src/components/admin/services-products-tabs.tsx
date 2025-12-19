"use client";

import React, { useState } from "react";
import { Service, CalendarType, Worker } from "@prisma/client";
import ServicesManager from "./services-manager";
import ProductsManager from "./products-manager";

// Local interface matching ProductsManager's ProductType
interface ProductType {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    imageUrl: string | null;
    isAvailable: boolean;
    order: number;
    profileId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ServicesProductsTabsProps {
    profileId: string;
    services: (Omit<Service, "price" | "minimumValue" | "pricePerDay"> & {
        price: number | any;
        minimumValue: number | any;
        pricePerDay: number | any;
        workers?: any[];
    })[];
    products: ProductType[];
    workers: Worker[];
    isGoogleConnected: boolean;
    allowConcurrentServices?: boolean;
    tierName?: string;
    enabledFeatures?: string[];
}

export default function ServicesProductsTabs({
    profileId,
    services,
    products,
    workers,
    isGoogleConnected,
    allowConcurrentServices = false,
    tierName,
    enabledFeatures
}: ServicesProductsTabsProps) {
    const [activeTab, setActiveTab] = useState<"services" | "products">("services");

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "services"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    Služby
                </button>
                <button
                    onClick={() => setActiveTab("products")}
                    className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === "products"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                >
                    Produkty
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "services" ? (
                <ServicesManager
                    profileId={profileId}
                    services={services}
                    workers={workers}
                    isGoogleConnected={isGoogleConnected}
                    allowConcurrentServices={allowConcurrentServices}
                    tierName={tierName}
                    enabledFeatures={enabledFeatures}
                />
            ) : (
                <ProductsManager
                    profileId={profileId}
                    products={products}
                    tierName={tierName}
                />
            )}
        </div>
    );
}
