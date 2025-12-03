"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { updateBookingStatus } from "@/app/actions";
import { Loader2, Check, X, Clock, Calendar, Mail, Phone, CalendarDays, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { format, isToday, isTomorrow, isThisWeek, isPast, isFuture, startOfDay } from "date-fns";
import { sk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import BookingCalendar from "./BookingCalendar";
import { BookingWithService } from "@/types/booking";

interface BookingsManagerProps {
    bookings: BookingWithService[];
}

type TabType = "pending" | "today" | "upcoming" | "all" | "archive";
type ServiceTypeFilter = "all" | "HOURLY_SERVICE" | "DAILY_RENTAL" | "TABLE_RESERVATION";

export default function BookingsManager({ bookings: initialBookings }: BookingsManagerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [bookings, setBookings] = useState(initialBookings);
    const [activeTab, setActiveTab] = useState<TabType>("pending");
    const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceTypeFilter>("all");

    // Auto‑refresh every 30 seconds to fetch new reservations
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    // Auto-update past bookings to COMPLETED
    useEffect(() => {
        const updatePastBookings = async () => {
            const now = new Date();
            const pastBookings = bookings.filter(
                booking => new Date(booking.endTime) < now && booking.status === "CONFIRMED"
            );

            for (const booking of pastBookings) {
                try {
                    await updateBookingStatus(booking.id, "COMPLETED");
                } catch (error) {
                    console.error("Failed to auto-update booking:", error);
                }
            }

            if (pastBookings.length > 0) {
                router.refresh();
            }
        };

        updatePastBookings();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        setLoadingId(id);
        try {
            await updateBookingStatus(id, status);

            // Update local state immediately
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.id === id ? { ...booking, status } : booking
                )
            );

            router.refresh();
            showToast("Stav rezervácie aktualizovaný", "success");
        } catch (error) {
            console.error(error);
            showToast("Chyba pri aktualizácii", "error");
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500";
            case "CONFIRMED": return "bg-green-500";
            case "COMPLETED": return "bg-blue-500";
            case "CANCELLED": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const getServiceTypeIcon = (calendarType: string) => {
        switch (calendarType) {
            case "HOURLY_SERVICE": return "⏰";
            case "DAILY_RENTAL": return "📅";
            case "TABLE_RESERVATION": return "🪑";
            default: return "📋";
        }
    };

    const getServiceTypeLabel = (calendarType: string) => {
        switch (calendarType) {
            case "HOURLY_SERVICE": return "Hodinová služba";
            case "DAILY_RENTAL": return "Denný prenájom";
            case "TABLE_RESERVATION": return "Rezervácia stola";
            default: return "Služba";
        }
    };

    // Filter bookings by tab and service type
    const getFilteredBookings = () => {
        const now = new Date();
        const todayStart = startOfDay(now);

        let filtered = bookings;

        // Filter by service type first
        if (serviceTypeFilter !== "all") {
            filtered = filtered.filter(b => b.service.calendarType === serviceTypeFilter);
        }

        // Then filter by tab
        switch (activeTab) {
            case "pending":
                return filtered.filter(b => b.status === "PENDING");
            case "today":
                return filtered.filter(b => isToday(new Date(b.startTime)));
            case "upcoming":
                return filtered.filter(b =>
                    isFuture(new Date(b.startTime)) &&
                    (b.status === "PENDING" || b.status === "CONFIRMED")
                );
            case "archive":
                return filtered.filter(b =>
                    b.status === "COMPLETED" ||
                    b.status === "CANCELLED" ||
                    (isPast(new Date(b.endTime)) && b.status === "CONFIRMED")
                );
            case "all":
            default:
                return filtered;
        }
    };

    // Group bookings by date
    const groupBookingsByDate = (bookings: BookingWithService[]) => {
        const groups: { [key: string]: BookingWithService[] } = {
            "Dnes": [],
            "Zajtra": [],
            "Tento týždeň": [],
            "Neskôr": [],
        };

        bookings.forEach(booking => {
            const startTime = new Date(booking.startTime);
            if (isToday(startTime)) {
                groups["Dnes"].push(booking);
            } else if (isTomorrow(startTime)) {
                groups["Zajtra"].push(booking);
            } else if (isThisWeek(startTime, { weekStartsOn: 1 })) {
                groups["Tento týždeň"].push(booking);
            } else {
                groups["Neskôr"].push(booking);
            }
        });

        return groups;
    };

    const filteredBookings = getFilteredBookings();
    const sortedBookings = [...filteredBookings].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Count bookings per tab
    const getCounts = () => ({
        pending: bookings.filter(b => b.status === "PENDING").length,
        today: bookings.filter(b => isToday(new Date(b.startTime))).length,
        upcoming: bookings.filter(b =>
            isFuture(new Date(b.startTime)) &&
            (b.status === "PENDING" || b.status === "CONFIRMED")
        ).length,
        all: bookings.length,
        archive: bookings.filter(b =>
            b.status === "COMPLETED" ||
            b.status === "CANCELLED" ||
            (isPast(new Date(b.endTime)) && b.status === "CONFIRMED")
        ).length,
    });

    const counts = getCounts();

    return (
        <div className="space-y-6">
            {/* Header with View Toggle */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Rezervácie</h2>
                <div className="flex items-center gap-2">
                    {/* Service Type Filter */}
                    {viewMode === "list" && (
                        <select
                            value={serviceTypeFilter}
                            onChange={(e) => setServiceTypeFilter(e.target.value as ServiceTypeFilter)}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Všetky typy</option>
                            <option value="HOURLY_SERVICE">⏰ Hodinové služby</option>
                            <option value="DAILY_RENTAL">📅 Denné prenájmy</option>
                            <option value="TABLE_RESERVATION">🪑 Rezervácie stolov</option>
                        </select>
                    )}
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                            viewMode === "list"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        <List size={16} />
                        Zoznam
                    </button>
                    <button
                        onClick={() => setViewMode("calendar")}
                        className={cn(
                            "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                            viewMode === "calendar"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        <CalendarDays size={16} />
                        Kalendár
                    </button>
                </div>
            </div>

            {viewMode === "calendar" ? (
                <BookingCalendar bookings={bookings} onStatusUpdate={handleStatusUpdate} />
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={cn(
                                "px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors relative",
                                activeTab === "pending"
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            Čakajúce
                            {counts.pending > 0 && (
                                <span className={cn(
                                    "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                    activeTab === "pending" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                )}>
                                    {counts.pending}
                                </span>
                            )}
                            {activeTab === "pending" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("today")}
                            className={cn(
                                "px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors relative",
                                activeTab === "today"
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            Dnes
                            {counts.today > 0 && (
                                <span className={cn(
                                    "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                    activeTab === "today" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                )}>
                                    {counts.today}
                                </span>
                            )}
                            {activeTab === "today" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={cn(
                                "px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors relative",
                                activeTab === "upcoming"
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            Nadchádzajúce
                            {counts.upcoming > 0 && (
                                <span className={cn(
                                    "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                    activeTab === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                )}>
                                    {counts.upcoming}
                                </span>
                            )}
                            {activeTab === "upcoming" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={cn(
                                "px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors relative",
                                activeTab === "all"
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            Všetky
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                activeTab === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                            )}>
                                {counts.all}
                            </span>
                            {activeTab === "all" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("archive")}
                            className={cn(
                                "px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors relative",
                                activeTab === "archive"
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            Archív
                            {counts.archive > 0 && (
                                <span className={cn(
                                    "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                                    activeTab === "archive" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                )}>
                                    {counts.archive}
                                </span>
                            )}
                            {activeTab === "archive" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-3">
                        {sortedBookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                {activeTab === "pending" && "Žiadne čakajúce rezervácie."}
                                {activeTab === "today" && "Žiadne rezervácie na dnes."}
                                {activeTab === "upcoming" && "Žiadne nadchádzajúce rezervácie."}
                                {activeTab === "archive" && "Žiadne archivované rezervácie."}
                                {activeTab === "all" && "Zatiaľ nemáte žiadne rezervácie."}
                            </div>
                        ) : (
                            sortedBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all animate-fade-up"
                                >
                                    {/* Compact Header Row */}
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            {/* Status Dot */}
                                            <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", getStatusDot(booking.status))} />

                                            {/* Main Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-lg">{getServiceTypeIcon(booking.service.calendarType)}</span>
                                                    <h3 className="font-semibold text-gray-900 truncate">{booking.service.name}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <Clock size={14} className="flex-shrink-0" />
                                                    <span className="font-medium">
                                                        {format(new Date(booking.startTime), "d. MMM yyyy", { locale: sk })}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-medium">
                                                        {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                                                    </span>
                                                    {/* Show nights for daily rentals */}
                                                    {booking.service.calendarType === "DAILY_RENTAL" && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium text-blue-600">
                                                                {Math.ceil((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60 * 24))} {Math.ceil((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60 * 24)) === 1 ? 'noc' : 'nocí'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                                    <span className="font-medium text-gray-700">{booking.customerName}</span>
                                                    <span>•</span>
                                                    <a
                                                        href={`mailto:${booking.customerEmail}`}
                                                        className="text-blue-600 hover:underline truncate"
                                                    >
                                                        {booking.customerEmail}
                                                    </a>
                                                    {booking.customerPhone && (
                                                        <>
                                                            <span>•</span>
                                                            <a
                                                                href={`tel:${booking.customerPhone}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {booking.customerPhone}
                                                            </a>
                                                        </>
                                                    )}
                                                    {/* Show worker for hourly services */}
                                                    {booking.service.calendarType === "HOURLY_SERVICE" && booking.worker && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium text-purple-600">
                                                                👤 {booking.worker.name}
                                                            </span>
                                                        </>
                                                    )}
                                                    {/* Show table info for table reservations */}
                                                    {booking.service.calendarType === "TABLE_RESERVATION" && booking.table && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium text-orange-600">
                                                                Stôl: {booking.table.name}
                                                            </span>
                                                        </>
                                                    )}
                                                    {booking.service.calendarType === "TABLE_RESERVATION" && booking.numberOfPeople && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium text-gray-600">
                                                                {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'osoba' : booking.numberOfPeople <= 4 ? 'osoby' : 'osôb'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            {booking.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                                    disabled={!!loadingId}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                                    title="Potvrdiť"
                                                >
                                                    {loadingId === booking.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                                    Potvrdiť
                                                </button>
                                            )}
                                            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                                                        disabled={!!loadingId}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                                                        title="Vybavené"
                                                    >
                                                        {loadingId === booking.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                                        Vybavené
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                                        disabled={!!loadingId}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        title="Zrušiť"
                                                    >
                                                        {loadingId === booking.id ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                                                    </button>
                                                </>
                                            )}
                                            {booking.status === "COMPLETED" && (
                                                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                                    Vybavená
                                                </div>
                                            )}
                                            {booking.status === "CANCELLED" && (
                                                <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                                                    Zrušená
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
