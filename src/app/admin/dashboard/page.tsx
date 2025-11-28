import React from "react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AdminDashboard(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
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

    // Determine date range based on period param
    const period = typeof searchParams.period === 'string' ? searchParams.period : '30d';
    const fromParam = typeof searchParams.from === 'string' ? searchParams.from : null;
    const toParam = typeof searchParams.to === 'string' ? searchParams.to : null;

    const now = new Date();
    // Set end date to end of today by default
    let endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0); // Start of today

    if (period === 'custom' && fromParam && toParam) {
        startDate = new Date(fromParam);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(toParam);
        endDate.setHours(23, 59, 59, 999);
    } else {
        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 6); // 6 days ago + today = 7 days
                break;
            case '30d':
                startDate.setDate(now.getDate() - 29); // 29 days ago + today = 30 days
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate.setDate(now.getDate() - 29); // Default to 30d
        }
    }

    const pageViews = await prisma.pageView.findMany({
        where: {
            profileId: profile.id,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Calculate analytics metrics
    const totalViews = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map(pv => pv.visitorId)).size;
    const avgTimeSpent = pageViews.filter(pv => pv.timeSpent).length > 0
        ? Math.round(pageViews.filter(pv => pv.timeSpent).reduce((sum, pv) => sum + (pv.timeSpent || 0), 0) / pageViews.filter(pv => pv.timeSpent).length)
        : 0;
    const totalClicks = pageViews.length;

    // Views over time
    // Helper to format date as YYYY-MM-DD in local time
    const formatDateKey = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Generate array of dates between startDate and endDate
    const dates: string[] = [];
    // Clone startDate to avoid modifying it
    const currentDate = new Date(startDate);
    // Reset time part for date comparison
    currentDate.setHours(0, 0, 0, 0);
    const endDateTime = new Date(endDate);
    endDateTime.setHours(0, 0, 0, 0);

    // Limit to 366 days to prevent infinite loops
    let safetyCounter = 0;
    while (currentDate <= endDateTime && safetyCounter < 367) {
        dates.push(formatDateKey(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
    }

    const viewsOverTime = dates.map(dateStr => {
        // Create a date object from the YYYY-MM-DD string treating it as local time
        const [year, month, day] = dateStr.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);

        return {
            date: dateObj.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' }),
            views: pageViews.filter(pv => formatDateKey(pv.createdAt) === dateStr).length
        };
    });

    // Device breakdown
    const deviceCounts = pageViews.reduce((acc, pv) => {
        const device = pv.device || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // Top referrers
    const referrerCounts = pageViews.reduce((acc, pv) => {
        const ref = pv.referrer || 'Priama návšteva';
        acc[ref] = (acc[ref] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([referrer, count]) => ({ referrer, count }));

    const analyticsData = {
        totalViews,
        uniqueVisitors,
        avgTimeSpent,
        totalClicks,
        viewsOverTime,
        deviceBreakdown,
        topReferrers
    };

    return (
        <LockedFeatureGuard featureKey="page_dashboard">
            <div>
                <PageHeader
                    title={`Vitajte, ${profile.name}`}
                    description="Prehľad vašich rezervácií a štatistík."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Dnešné rezervácie</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Celkovo rezervácií</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{profile.bookings.length}</p>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Analytika</h2>
                    <AnalyticsDashboard data={analyticsData} />
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
