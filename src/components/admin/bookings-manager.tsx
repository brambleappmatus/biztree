"use client";

import React, { useState } from "react";
import { Booking, Service } from "@prisma/client";
import { updateBookingStatus } from "@/app/actions";
import { Loader2, Check, X, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { cn } from "@/lib/utils";

type BookingWithService = Booking & { service: Service };

interface BookingsManagerProps {
    bookings: BookingWithService[];
}

export default function BookingsManager({ bookings }: BookingsManagerProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, status: string) => {
        setLoadingId(id);
        try {
            await updateBookingStatus(id, status);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Chyba pri aktualizácii");
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-green-100 text-green-700";
            case "CANCELLED": return "bg-red-100 text-red-700";
            case "COMPLETED": return "bg-gray-100 text-gray-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Rezervácie</h2>
            </div>

            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        Zatiaľ nemáte žiadne rezervácie.
                    </div>
                ) : (
                    bookings.map((booking) => (
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

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <span className="block text-xs uppercase text-gray-400">Meno</span>
                                        <span className="font-medium text-gray-700">{booking.customerName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase text-gray-400">Email</span>
                                        <span className="font-medium text-gray-700">{booking.customerEmail}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase text-gray-400">Telefón</span>
                                        <span className="font-medium text-gray-700">{booking.customerPhone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                                {booking.status === "CONFIRMED" && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                                            disabled={!!loadingId}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                                        >
                                            {loadingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                            Vybavené
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                            disabled={!!loadingId}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                                        >
                                            {loadingId === booking.id ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                                            Zrušiť
                                        </button>
                                    </>
                                )}
                                {booking.status === "CANCELLED" && (
                                    <span className="text-center text-sm text-gray-400 py-2">Zrušená</span>
                                )}
                                {booking.status === "COMPLETED" && (
                                    <span className="text-center text-sm text-green-600 font-medium py-2">Vybavená</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
