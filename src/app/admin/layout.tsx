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
        <div className={cn("min-h-screen bg-gray-50 flex", inter.className)}>
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                            <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-xl font-bold text-blue-600">BizTree Admin</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden active:scale-95",
                            pathname === "/admin"
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 w-1 bg-blue-600 rounded-r-full transition-transform duration-200",
                            pathname === "/admin" ? "translate-x-0" : "-translate-x-full"
                        )} />
                        <Settings size={20} className={cn("transition-transform duration-200 group-hover:scale-110", pathname === "/admin" && "text-blue-600")} />
                        <span className="relative group-hover:translate-x-1 transition-transform duration-200">Vaše Biztree</span>
                    </Link>

                    <Link
                        href="/admin/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden active:scale-95",
                            pathname === "/admin/dashboard"
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 w-1 bg-blue-600 rounded-r-full transition-transform duration-200",
                            pathname === "/admin/dashboard" ? "translate-x-0" : "-translate-x-full"
                        )} />
                        <LayoutDashboard size={20} className={cn("transition-transform duration-200 group-hover:scale-110", pathname === "/admin/dashboard" && "text-blue-600")} />
                        <span className="relative group-hover:translate-x-1 transition-transform duration-200">Prehľad</span>
                    </Link>

                    <Link
                        href="/admin/services"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden active:scale-95",
                            pathname === "/admin/services"
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 w-1 bg-blue-600 rounded-r-full transition-transform duration-200",
                            pathname === "/admin/services" ? "translate-x-0" : "-translate-x-full"
                        )} />
                        <Users size={20} className={cn("transition-transform duration-200 group-hover:scale-110", pathname === "/admin/services" && "text-blue-600")} />
                        <span className="relative group-hover:translate-x-1 transition-transform duration-200">Služby</span>
                    </Link>

                    <Link
                        href="/admin/bookings"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden active:scale-95",
                            pathname === "/admin/bookings"
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 w-1 bg-blue-600 rounded-r-full transition-transform duration-200",
                            pathname === "/admin/bookings" ? "translate-x-0" : "-translate-x-full"
                        )} />
                        <Calendar size={20} className={cn("transition-transform duration-200 group-hover:scale-110", pathname === "/admin/bookings" && "text-blue-600")} />
                        <span className="relative group-hover:translate-x-1 transition-transform duration-200">Rezervácie</span>
                    </Link>

                    <Link
                        href="/admin/seo"
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden active:scale-95",
                            pathname === "/admin/seo"
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 w-1 bg-blue-600 rounded-r-full transition-transform duration-200",
                            pathname === "/admin/seo" ? "translate-x-0" : "-translate-x-full"
                        )} />
                        <Settings size={20} className={cn("transition-transform duration-200 group-hover:scale-110", pathname === "/admin/seo" && "text-blue-600")} />
                        <span className="relative group-hover:translate-x-1 transition-transform duration-200">SEO</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors active:scale-95 transition-transform"
                    >
                        <LogOut size={18} />
                        <span>Odhlásiť sa</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:flex-row md:ml-64 min-h-screen">
                {/* Center Content */}
                <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-2xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Right Preview Sidebar - Only visible on settings page (now root /admin) */}
                {pathname === "/admin" && (<aside className="w-full md:w-[300px] lg:w-[380px] bg-white border-t md:border-l border-gray-200 p-8">
                    <div className="sticky top-8 flex flex-col items-center gap-6">
                        {/* Visit Site Link (Moved here) */}
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
        </div>
    );
}
