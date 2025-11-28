"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { updateBookingStatus } from "@/app/actions";
import { Loader2, Check, X, Clock, Calendar, Mail, Phone, CalendarDays, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import BookingCalendar from "./BookingCalendar";
import { BookingWithService } from "@/types/booking";

interface BookingsManagerProps {
    bookings: BookingWithService[];
}

export default function BookingsManager({ bookings: initialBookings }: BookingsManagerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [bookings, setBookings] = useState(initialBookings);
    // Sorting mode: recent (default) or upcoming
    const [sortMode, setSortMode] = useState<'recent' | 'upcoming'>('recent');
    // Auto‑refresh every 30 seconds to fetch new reservations
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "CONFIRMED": return "bg-green-100 text-green-700";
            case "COMPLETED": return "bg-gray-100 text-gray-700";
            case "CANCELLED": return "bg-red-100 text-red-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Rezervácie</h2>
                <div className="flex items-center gap-2">
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
                    {/* Sorting dropdown – only shown in list view */}
                    {viewMode === "list" && (
                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value as 'recent' | 'upcoming')}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="recent">Najnovšie</option>
                            <option value="upcoming">Najbližšie</option>
                        </select>
                    )}
                </div>
            </div>

            {viewMode === "calendar" ? (
                <BookingCalendar bookings={bookings} onStatusUpdate={handleStatusUpdate} />
            ) : (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                            Zatiaľ nemáte žiadne rezervácie.
                        </div>
                    ) : (
                        // Apply sorting before rendering list
                        (sortMode === 'recent'
                            ? [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            : [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        ).map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 animate-fade-up"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide", getStatusColor(booking.status))}>
                                            {booking.status}
                                        </span>
                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {format(new Date(booking.createdAt), "d. MMMM yyyy", { locale: sk })}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg mb-1">{booking.service.name}</h3>

                                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                                        <Clock size={16} className="text-blue-600" />
                                        <span className="font-medium">
                                            {format(new Date(booking.startTime), "d. MMMM yyyy", { locale: sk })}
                                        </span>
                                        <span>•</span>
                                        <span className="font-medium">
                                            {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <span className="block text-xs uppercase text-gray-400 mb-1">Meno</span>
                                            <span className="font-medium text-gray-700">{booking.customerName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase text-gray-400 mb-1">Email</span>
                                            <a
                                                href={`mailto:${booking.customerEmail}`}
                                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 break-all"
                                            >
                                                <Mail size={14} className="flex-shrink-0" />
                                                <span className="break-all">{booking.customerEmail}</span>
                                            </a>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase text-gray-400 mb-1">Telefón</span>
                                            {booking.customerPhone ? (
                                                <a
                                                    href={`tel:${booking.customerPhone}`}
                                                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                                >
                                                    <Phone size={14} className="flex-shrink-0" />
                                                    {booking.customerPhone}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                        <>
                                            {booking.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                                    disabled={!!loadingId}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    {loadingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                                    Potvrdiť
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                                                disabled={!!loadingId}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            >
                                                {loadingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                                Vybavené
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                                disabled={!!loadingId}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loadingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                                                Zrušiť
                                            </button>
                                        </>
                                    )}
                                    {booking.status === "CANCELLED" && (
                                        <div className="text-center py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                                            Zrušená
                                        </div>
                                    )}
                                    {booking.status === "COMPLETED" && (
                                        <div className="text-center py-2 px-4 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                                            Vybavená
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
