"use client";

import React, { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { sk } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingWithService } from "@/types/booking";

interface BookingCalendarProps {
    bookings: BookingWithService[];
    onStatusUpdate?: (bookingId: string, status: string) => Promise<void>;
}

export default function BookingCalendar({ bookings, onStatusUpdate }: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getBookingsForDay = (day: Date) => {
        return bookings.filter(booking =>
            isSameDay(new Date(booking.startTime), day)
        );
    };

    const selectedDayBookings = selectedDate ? getBookingsForDay(selectedDate) : [];

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        if (!onStatusUpdate) return;
        setLoadingId(bookingId);
        try {
            await onStatusUpdate(bookingId, status);
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500";
            case "CONFIRMED": return "bg-green-500";
            case "COMPLETED": return "bg-gray-400";
            case "CANCELLED": return "bg-red-500";
            default: return "bg-blue-500";
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "CONFIRMED": return "bg-green-100 text-green-700";
            case "COMPLETED": return "bg-gray-100 text-gray-700";
            case "CANCELLED": return "bg-red-100 text-red-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <CalendarIcon size={16} className="text-blue-600" />
                        Kalendár rezervácií
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={prevMonth}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-medium capitalize min-w-[110px] text-center text-xs">
                            {format(currentMonth, "MMMM yyyy", { locale: sk })}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 mb-3">
                    {/* Day Headers */}
                    {["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map(day => (
                        <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
                            {day}
                        </div>
                    ))}

                    {/* Calendar Days */}
                    {days.map((day, i) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const dayBookings = getBookingsForDay(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const hasBookings = dayBookings.length > 0 && isCurrentMonth;

                        // Get the primary status color for the day
                        let bgColorClass = "";
                        let textColorClass = "";

                        if (hasBookings) {
                            const pending = dayBookings.find(b => b.status === "PENDING");
                            const confirmed = dayBookings.find(b => b.status === "CONFIRMED");

                            if (pending) {
                                bgColorClass = "bg-yellow-100 hover:bg-yellow-200";
                                textColorClass = "text-yellow-900 font-semibold";
                            } else if (confirmed) {
                                bgColorClass = "bg-green-100 hover:bg-green-200";
                                textColorClass = "text-green-900 font-semibold";
                            } else if (dayBookings[0].status === "COMPLETED") {
                                bgColorClass = "bg-gray-100 hover:bg-gray-200";
                                textColorClass = "text-gray-700 font-semibold";
                            } else {
                                bgColorClass = "bg-red-50 hover:bg-red-100";
                                textColorClass = "text-red-700 font-semibold";
                            }
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                disabled={!isCurrentMonth}
                                className={cn(
                                    "h-8 w-full rounded flex flex-col items-center justify-center text-xs transition-all",
                                    !isCurrentMonth && "text-gray-200 cursor-not-allowed",
                                    isCurrentMonth && !hasBookings && "hover:bg-gray-50 text-gray-700",
                                    hasBookings && bgColorClass,
                                    hasBookings && textColorClass,
                                    isSelected && "ring-2 ring-blue-500",
                                    isToday(day) && !hasBookings && "bg-blue-500 text-white font-bold hover:bg-blue-600"
                                )}
                            >
                                <span>{format(day, "d")}</span>
                                {hasBookings && dayBookings.length > 1 && (
                                    <span className="text-[8px] leading-none opacity-70">
                                        +{dayBookings.length - 1}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Day Details */}
                {selectedDate && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="font-semibold text-sm mb-2">
                            {format(selectedDate, "d. MMMM yyyy", { locale: sk })}
                        </h4>
                        {selectedDayBookings.length === 0 ? (
                            <p className="text-xs text-gray-400">Žiadne rezervácie</p>
                        ) : (
                            <div className="space-y-1.5">
                                {selectedDayBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="p-2 bg-gray-50 rounded text-xs border border-gray-100"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                                                </span>
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    getStatusBadgeColor(booking.status)
                                                )}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 mb-0.5">{booking.service.name}</p>
                                        <p className="text-[10px] text-gray-500 mb-2">{booking.customerName}</p>

                                        {/* Action Buttons */}
                                        {onStatusUpdate && (booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                            <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200">
                                                {booking.status === "PENDING" && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                                        disabled={!!loadingId}
                                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-500 text-white rounded text-[10px] font-medium hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        {loadingId === booking.id ? <Loader2 className="animate-spin" size={10} /> : <Check size={10} />}
                                                        Potvrdiť
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                                                    disabled={!!loadingId}
                                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-500 text-white rounded text-[10px] font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {loadingId === booking.id ? <Loader2 className="animate-spin" size={10} /> : <Check size={10} />}
                                                    Vybavené
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                                    disabled={!!loadingId}
                                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white text-red-600 border border-red-200 rounded text-[10px] font-medium hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
                                                >
                                                    {loadingId === booking.id ? <Loader2 className="animate-spin" size={10} /> : <X size={10} />}
                                                    Zrušiť
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-medium text-gray-500 mb-1.5">Legenda:</p>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
                            <span className="text-gray-600">Čakajúca</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                            <span className="text-gray-600">Potvrdená</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
                            <span className="text-gray-600">Vybavená</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-50 border border-red-100" />
                            <span className="text-gray-600">Zrušená</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
