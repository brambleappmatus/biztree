"use client";

import { useEffect, useState } from "react";
import { getSuperAdminStats } from "./actions";
import { Building2, Users, Calendar, Briefcase } from "lucide-react";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalBookings: 0,
        totalServices: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getSuperAdminStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Super Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Companies</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCompanies}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalBookings}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Services</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalServices}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/superadmin/companies"
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manage Companies</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View, create, and delete companies</p>
                    </a>
                    <a
                        href="/superadmin/users"
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manage Users</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View, assign, and delete users</p>
                    </a>
                    <a
                        href="/superadmin/settings"
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Settings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Configure lifetime deals and more</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
