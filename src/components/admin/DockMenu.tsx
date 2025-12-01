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
    Crown,
    Briefcase,
    LayoutGrid
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

    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Fetch subdomain
        fetch("/api/user/subdomain")
            .then(res => res.json())
            .then(data => setSubdomain(data.subdomain))
            .catch(err => console.error("Failed to fetch subdomain:", err));
    }, []);

    const allItems = [
        {
            label: "Vaše Biztree",
            icon: Settings,
            href: "/admin",
            matchExact: true,
            badge: 0,
            featureKey: null
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
            label: "Pracovníci",
            icon: Briefcase,
            href: "/admin/workers",
            badge: 0,
            featureKey: "calendar_worker_management"
        },
        {
            label: "Stoly",
            icon: LayoutGrid,
            href: "/admin/tables",
            badge: 0,
            featureKey: "calendar_table_reservation"
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
            featureKey: null
        },
    ];

    const hasAccess = (featureKey: string | null) => {
        if (!featureKey) return true;
        return userFeatures.includes(featureKey);
    };

    // Mobile specific items
    const mobileBottomItems = [
        allItems.find(i => i.href === "/admin")!, // Vaše Biztree
        allItems.find(i => i.href === "/admin/bookings")!, // Rezervácie
        allItems.find(i => i.href === "/admin/subscription")!, // Predplatné
    ];

    const mobileMenuItems = [
        allItems.find(i => i.href === "/admin/dashboard")!,
        allItems.find(i => i.href === "/admin/services")!,
        allItems.find(i => i.href === "/admin/seo")!,
    ];

    const getProfileUrl = () => {
        if (!subdomain) return '#';
        if (typeof window === 'undefined') return '#';
        const hostname = window.location.hostname;

        // Handle localhost
        if (hostname.includes('localhost')) {
            return `http://${subdomain}.localhost:3000`;
        }

        // Handle production/preview
        const parts = hostname.split('.');
        if (parts.length >= 2) {
            const domain = parts.slice(1).join('.');
            return `${window.location.protocol}//${subdomain}.${domain}`;
        }

        return '#';
    };

    const MobileLanguageSwitcher = () => {
        const { language, setLanguage } = useLanguage();
        const [isOpen, setIsOpen] = useState(false);
        const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                    <Globe size={18} />
                    <span className="flex-1 text-left">{currentLang.name}</span>
                    <span className="text-xl">{currentLang.flag}</span>
                </button>

                {isOpen && (
                    <div className="pl-11 pr-4 pb-2 space-y-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                    language === lang.code
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                                )}
                            >
                                <span>{lang.name}</span>
                                <span>{lang.flag}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const MobileMenu = () => (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div
                className="absolute bottom-24 right-4 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 overflow-hidden p-2"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col gap-1">
                    {mobileMenuItems.map((item) => {
                        const locked = !hasAccess(item.featureKey);
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <button
                                key={item.href}
                                onClick={() => {
                                    router.push(item.href);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors relative",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {locked && (
                                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                        <Lock size={10} />
                                        Pro
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1" />

                    <MobileLanguageSwitcher />

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={18} />
                        Odhlásiť sa
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Dock */}
            <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <Dock className="items-end pb-3">
                        {allItems.map((item) => {
                            const isActive = item.matchExact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);
                            const locked = !hasAccess(item.featureKey);

                            return (
                                <div key={item.href} className="relative">
                                    <DockItem
                                        onClick={() => router.push(item.href)}
                                        className={cn(
                                            "aspect-square rounded-full transition-colors duration-200",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                                        )}
                                    >
                                        <DockLabel>{item.label}</DockLabel>
                                        <DockIcon>
                                            <item.icon className="h-3/5 w-3/5" />
                                        </DockIcon>
                                    </DockItem>
                                    {locked && (
                                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg pointer-events-none z-10">
                                            <Lock className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
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

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
                {isMobileMenuOpen && <MobileMenu />}

                <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 flex items-center justify-between">
                    {mobileBottomItems.map((item) => {
                        const isActive = item.matchExact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        const locked = !hasAccess(item.featureKey);

                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all relative",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                                )}
                            >
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {locked && (
                                    <div className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                        <Lock className="w-2 h-2 text-white" />
                                    </div>
                                )}
                                {item.badge > 0 && !locked && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}

                    {/* My Website Link */}
                    {subdomain && (
                        <a
                            href={getProfileUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                        >
                            <Globe size={24} strokeWidth={2} />
                        </a>
                    )}

                    {/* Hamburger Menu Trigger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={cn(
                            "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all",
                            isMobileMenuOpen
                                ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white"
                                : "text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                        )}
                    >
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                            <div className={cn("w-5 h-0.5 bg-current rounded-full transition-all", isMobileMenuOpen && "rotate-45 translate-y-2")} />
                            <div className={cn("w-5 h-0.5 bg-current rounded-full transition-all", isMobileMenuOpen && "opacity-0")} />
                            <div className={cn("w-5 h-0.5 bg-current rounded-full transition-all", isMobileMenuOpen && "-rotate-45 -translate-y-2")} />
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
