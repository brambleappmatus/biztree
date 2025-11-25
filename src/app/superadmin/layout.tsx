"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Users, Moon, Sun, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check system preference or localStorage
        const isDark = localStorage.getItem('darkMode') === 'true' ||
            (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        // Redirect if not super admin
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user?.role !== "SUPERADMIN") {
            router.push("/admin");
        }
    }, [session, status, router]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (status === "loading" || session?.user?.role !== "SUPERADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-950 flex", inter.className)}>
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">Super Admin</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/superadmin" className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/superadmin/companies" className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                        <Building2 size={20} />
                        Companies
                    </Link>
                    <Link href="/superadmin/users" className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                        <Users size={20} />
                        Users
                    </Link>
                    <Link href="/superadmin/showcases" className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                        <LayoutDashboard size={20} />
                        Showcases
                    </Link>
                    <Link href="/superadmin/licensing" className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
                        <Shield size={20} />
                        Licensing
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
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
