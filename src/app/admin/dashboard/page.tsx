import React from "react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profiles: { include: { bookings: true } } }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    const profile = user.profiles[0];
    const recentBookings = await prisma.booking.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { service: true }
    });

    return (
        <LockedFeatureGuard featureKey="page_dashboard">
            <div>
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Vitajte, {profile.name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Dnešné rezervácie</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Celkovo rezervácií</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{profile.bookings.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Priemerné hodnotenie</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">5.0</p>
                    </div>
                </div>

                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Nedávne rezervácie</h2>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Zákazník</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Služba</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Dátum</th>
                                <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Stav</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">Žiadne rezervácie</td>
                                </tr>
                            ) : (
                                recentBookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{booking.customerName}</td>
                                        <td className="p-4 text-gray-700 dark:text-gray-300">{booking.service.name}</td>
                                        <td className="p-4 text-gray-700 dark:text-gray-300">
                                            {new Date(booking.startTime).toLocaleDateString("sk-SK")} {new Date(booking.startTime).toLocaleTimeString("sk-SK", { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </LockedFeatureGuard>
    );
}
