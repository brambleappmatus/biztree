"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Calendar, Users, Settings, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const [subdomain, setSubdomain] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user's subdomain
        if (session?.user?.id) {
            fetch('/api/user/subdomain')
                .then(res => res.json())
                .then(data => setSubdomain(data.subdomain))
                .catch(err => console.error('Failed to fetch subdomain:', err));
        }
    }, [session]);

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
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                            <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-xl font-bold text-blue-600">BizTree Admin</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <LayoutDashboard size={20} />
                        Prehľad
                    </Link>
                    <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Calendar size={20} />
                        Rezervácie
                    </Link>
                    <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Users size={20} />
                        Služby
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        <Settings size={20} />
                        Nastavenia
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Odhlásiť sa</span>
                    </button>
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <ExternalLink size={18} />
                        Zobraziť môj web
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
