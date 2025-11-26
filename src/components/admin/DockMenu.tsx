"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LineChart,
    LogOut,
    Lock,
    Crown
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/motion-primitives/dock";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { LANGUAGES } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";

function LanguageDockItem() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    return (
        <div className="relative z-50">
            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 overflow-hidden z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center justify-between transition-colors dark:text-gray-200",
                                language === lang.code && "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span>{lang.flag}</span> {lang.name}
                            </span>
                            {language === lang.code && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
            <DockItem
                onClick={() => setIsOpen(!isOpen)}
                className="aspect-square rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
                <DockLabel>{currentLang.name}</DockLabel>
                <DockIcon>
                    <Globe className="h-3/5 w-3/5" />
                </DockIcon>
            </DockItem>
        </div>
    );
}

export default function DockMenu() {
    const router = useRouter();
    const pathname = usePathname();
    const [bookingCount, setBookingCount] = useState<number>(0);
    const [userFeatures, setUserFeatures] = useState<string[]>([]);
    const [featuresLoading, setFeaturesLoading] = useState(true);

    useEffect(() => {
        // Fetch booking count
        const fetchBookingCount = async () => {
            try {
                const response = await fetch("/api/bookings/count");
                if (response.ok) {
                    const data = await response.json();
                    setBookingCount(data.count);
                }
            } catch (error) {
                console.error("Failed to fetch booking count:", error);
            }
        };

        fetchBookingCount();
        // Refresh count every 30 seconds
        const interval = setInterval(fetchBookingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch user features
        const fetchFeatures = async () => {
            try {
                const response = await fetch("/api/user/features");
                if (response.ok) {
                    const data = await response.json();
                    setUserFeatures(data.features || []);
                }
            } catch (error) {
                console.error("Failed to fetch features:", error);
            } finally {
                setFeaturesLoading(false);
            }
        };

        fetchFeatures();
    }, []);

    const items = [
        {
            label: "Vaše Biztree",
            icon: Settings,
            href: "/admin",
            matchExact: true,
            badge: 0,
            featureKey: null // Always accessible
        },
        {
            label: "Prehľad",
            icon: LayoutDashboard,
            href: "/admin/dashboard",
            badge: 0,
            featureKey: "page_dashboard"
        },
        {
            label: "Služby",
            icon: Users,
            href: "/admin/services",
            badge: 0,
            featureKey: "page_services"
        },
        {
            label: "Rezervácie",
            icon: Calendar,
            href: "/admin/bookings",
            badge: bookingCount,
            featureKey: "page_bookings"
        },
        {
            label: "SEO",
            icon: LineChart,
            href: "/admin/seo",
            badge: 0,
            featureKey: "page_seo"
        },
        {
            label: "Predplatné",
            icon: Crown,
            href: "/admin/subscription",
            badge: 0,
            featureKey: null // Always accessible
        },
    ];

    const hasAccess = (featureKey: string | null) => {
        if (!featureKey) return true; // No feature key = always accessible
        return userFeatures.includes(featureKey);
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="pointer-events-auto">
                <Dock className="items-end pb-3">
                    {items.map((item) => {
                        const isActive = item.matchExact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        const locked = !hasAccess(item.featureKey);

                        return (
                            <div key={item.href} className="relative">
                                <DockItem
                                    onClick={() => {
                                        if (locked) {
                                            // TODO: Show upgrade modal
                                            return;
                                        }
                                        router.push(item.href);
                                    }}
                                    className={cn(
                                        "aspect-square rounded-full transition-colors duration-200",
                                        locked
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600"
                                            : isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                    )}
                                >
                                    <DockLabel>{item.label}</DockLabel>
                                    <DockIcon>
                                        {locked ? (
                                            <Lock className="h-3/5 w-3/5" />
                                        ) : (
                                            <item.icon className="h-3/5 w-3/5" />
                                        )}
                                    </DockIcon>
                                </DockItem>
                                {item.badge > 0 && !locked && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg pointer-events-none z-10">
                                        {item.badge > 99 ? "99+" : item.badge}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div className="w-px h-8 bg-gray-200 dark:bg-neutral-800 mx-1 self-center" />

                    <LanguageDockItem />

                    <DockItem
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="aspect-square rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        <DockLabel>Odhlásiť sa</DockLabel>
                        <DockIcon>
                            <LogOut className="h-3/5 w-3/5" />
                        </DockIcon>
                    </DockItem>
                </Dock>
            </div>
        </div>
    );
}
