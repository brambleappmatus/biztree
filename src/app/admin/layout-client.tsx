"use client";

import React from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Calendar, Users, Settings, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhonePreview } from "@/components/admin/phone-preview";
import DockMenu from "@/components/admin/DockMenu";
import { FeaturesProvider } from "@/contexts/features-context";

const inter = Inter({ subsets: ["latin"] });

interface AdminLayoutClientProps {
    children: React.ReactNode;
    subdomain: string | null;
}

export default function AdminLayoutClient({
    children,
    subdomain,
}: AdminLayoutClientProps) {
    const pathname = usePathname();

    // Determine the base domain based on environment
    const getProfileUrl = () => {
        if (!subdomain) return '#';

        // Check if we're in production
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;

            // Check for localhost first (development)
            if (hostname === 'localhost' || hostname.includes('localhost')) {
                return `http://${subdomain}.localhost:3000`;
            }

            // Production domains
            if (hostname.includes('biztree.sk')) {
                return `https://${subdomain}.biztree.sk`;
            } else if (hostname.includes('biztree.bio') || hostname.includes('vercel.app')) {
                return `https://${subdomain}.biztree.bio`;
            }
        }

        // Fallback to production domain
        return `https://${subdomain}.biztree.bio`;
    };

    const profileUrl = getProfileUrl();

    return (
        <FeaturesProvider>
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
                <div>
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
            </div>
        </FeaturesProvider>
    );
}
