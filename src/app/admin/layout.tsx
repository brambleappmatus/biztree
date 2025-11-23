"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Calendar, Users, Settings, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhonePreview } from "@/components/admin/phone-preview";
import DockMenu from "@/components/admin/DockMenu";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);

    useEffect(() => {
        // Fetch user's subdomain and check if they have a profile
        if (session?.user?.id) {
            fetch('/api/user/subdomain')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch subdomain');
                    return res.json();
                })
                .then(data => {
                    setSubdomain(data.subdomain);
                    setHasProfile(!!data.subdomain);
                })
                .catch(err => {
                    console.error('Failed to fetch subdomain:', err);
                    // If no subdomain, redirect to onboarding
                    setHasProfile(false);
                });
        }
    }, [session]);

    // Redirect to onboarding if user has no profile
    useEffect(() => {
        if (hasProfile === false && pathname !== '/onboarding') {
            window.location.href = '/onboarding';
        }
    }, [hasProfile, pathname]);

    // Show loading while checking profile status
    if (status === "loading" || hasProfile === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Determine the base domain based on environment
    const getProfileUrl = () => {
        if (!subdomain) return '#';

        // Check if we're in production
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;

            // If on Vercel or production domain
            if (hostname.includes('vercel.app')) {
                return `https://${subdomain}.biztree.bio`;
            } else if (hostname.includes('biztree.bio')) {
                return `https://${subdomain}.biztree.bio`;
            } else if (hostname.includes('biztree.sk')) {
                return `https://${subdomain}.biztree.sk`;
            }
        }

        // Default to localhost for development
        return `http://${subdomain}.localhost:3000`;
    };

    const profileUrl = getProfileUrl();

    return (
        <div className={cn("min-h-screen bg-gray-50 flex flex-col md:flex-row", inter.className)}>
            {/* Mobile Header - Only visible on mobile */}
            <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-lg font-bold text-blue-600">BizTree Admin</h1>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
                    title="Odhlásiť sa"
                >
                    <LogOut size={20} />
                </button>
            </header>

            {/* Desktop Dock - Replaces Sidebar */}
            <div className="hidden md:block">
                <DockMenu />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:flex-row min-h-screen">
                {/* Center Content */}
                <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden">
                    <div className={cn(
                        pathname === "/admin"
                            ? "w-full max-w-5xl"
                            : "max-w-2xl mx-auto"
                    )}>
                        {children}
                    </div>
                </div>

                {/* Right Preview Sidebar - Only visible on desktop and on settings page */}
                {pathname === "/admin" && (
                    <aside className="hidden md:block w-full md:w-[300px] lg:w-[380px] bg-white border-t md:border-l border-gray-200 p-8">
                        <div className="sticky top-8 flex flex-col items-center gap-6">
                            {/* Visit Site Link */}
                            <div className="w-full bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Váš verejný profil</span>
                                    <a
                                        href={profileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-semibold text-gray-900 truncate max-w-[200px] hover:text-blue-600 transition-colors"
                                    >
                                        {subdomain ? `${subdomain}.biztree.bio` : 'Loading...'}
                                    </a>
                                </div>
                                <a
                                    href={profileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>

                            {/* Phone Preview */}
                            <div className="w-full">
                                <PhonePreview url={profileUrl} />
                            </div>
                        </div>
                    </aside>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
                <div className="flex items-center justify-around px-2 py-2 pb-safe">
                    <Link
                        href="/admin"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px]",
                            pathname === "/admin"
                                ? "text-blue-600"
                                : "text-gray-500"
                        )}
                    >
                        <Settings size={22} className={pathname === "/admin" ? "text-blue-600" : ""} />
                        <span className="text-[10px] font-medium">Biztree</span>
                    </Link>

                    <Link
                        href="/admin/dashboard"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px]",
                            pathname === "/admin/dashboard"
                                ? "text-blue-600"
                                : "text-gray-500"
                        )}
                    >
                        <LayoutDashboard size={22} className={pathname === "/admin/dashboard" ? "text-blue-600" : ""} />
                        <span className="text-[10px] font-medium">Prehľad</span>
                    </Link>

                    <Link
                        href="/admin/services"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px]",
                            pathname === "/admin/services"
                                ? "text-blue-600"
                                : "text-gray-500"
                        )}
                    >
                        <Users size={22} className={pathname === "/admin/services" ? "text-blue-600" : ""} />
                        <span className="text-[10px] font-medium">Služby</span>
                    </Link>

                    <Link
                        href="/admin/bookings"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px]",
                            pathname === "/admin/bookings"
                                ? "text-blue-600"
                                : "text-gray-500"
                        )}
                    >
                        <Calendar size={22} className={pathname === "/admin/bookings" ? "text-blue-600" : ""} />
                        <span className="text-[10px] font-medium">Rezervácie</span>
                    </Link>

                    <Link
                        href="/admin/seo"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[60px]",
                            pathname === "/admin/seo"
                                ? "text-blue-600"
                                : "text-gray-500"
                        )}
                    >
                        <Settings size={22} className={pathname === "/admin/seo" ? "text-blue-600" : ""} />
                        <span className="text-[10px] font-medium">SEO</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
