"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addDays } from "date-fns";
import { sk } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, User, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailability, createBooking } from "@/app/actions";
import { ProfileCore } from "@/types";

interface BookingFlowProps {
    service: ProfileCore["services"][0];
    onClose: () => void;
}

type Step = "date" | "time" | "details" | "confirmation";

export default function BookingFlow({ service, onClose }: BookingFlowProps) {
    const [step, setStep] = useState<Step>("date");
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch slots when date changes
    useEffect(() => {
        if (date) {
            setLoadingSlots(true);
            getAvailability(service.id, format(date, "yyyy-MM-dd"))
                .then((fetchedSlots) => {
                    setSlots(fetchedSlots);
                    setLoadingSlots(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingSlots(false);
                });
        }
    }, [date, service.id]);

    const handleDateSelect = (day: Date) => {
        setDate(day);
        setStep("time");
    };

    const handleTimeSelect = (t: string) => {
        setTime(t);
        setStep("details");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;

        setSubmitting(true);
        try {
            const result = await createBooking({
                serviceId: service.id,
                date: format(date, "yyyy-MM-dd"),
                time,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            });

            if (result.error) {
                alert(result.error);
            } else {
                setStep("confirmation");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    // Calendar Logic
    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="font-semibold text-lg">{service.name}</h2>
                        <p className="text-xs text-gray-500">{service.duration} min • {Number(service.price)} €</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1">
                    <AnimatePresence mode="wait">
                        {step === "date" && (
                            <motion.div
                                key="date"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                                    <span className="font-medium capitalize">{format(currentMonth, "MMMM yyyy", { locale: sk })}</span>
                                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs text-gray-400 font-medium">
                                    {["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map(d => <div key={d}>{d}</div>)}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((day, i) => {
                                        const isSelected = date && isSameDay(day, date);
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                                        return (
                                            <button
                                                key={i}
                                                disabled={!isCurrentMonth || isPast}
                                                onClick={() => handleDateSelect(day)}
                                                className={cn(
                                                    "aspect-square rounded-full flex items-center justify-center text-sm relative",
                                                    !isCurrentMonth && "text-gray-300 opacity-0", // Hide non-current month days for cleaner look
                                                    isCurrentMonth && "hover:bg-gray-100 dark:hover:bg-gray-800",
                                                    isSelected && "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
                                                    isToday(day) && !isSelected && "text-[var(--primary)] font-bold",
                                                    isPast && "text-gray-300 cursor-not-allowed hover:bg-transparent"
                                                )}
                                            >
                                                {format(day, "d")}
                                                {isToday(day) && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-[var(--primary)] rounded-full" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === "time" && (
                            <motion.div
                                key="time"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setStep("date")} className="text-sm text-[var(--primary)] flex items-center">
                                        <ChevronLeft size={16} /> Späť
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        {date && format(date, "d. MMMM", { locale: sk })}
                                    </span>
                                </div>

                                {loadingSlots ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-[var(--primary)]" />
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {slots.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleTimeSelect(s)}
                                                className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] border border-transparent hover:border-[var(--primary)]/30 transition-all font-medium"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        Žiadne voľné termíny na tento deň.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === "details" && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setStep("time")} className="text-sm text-[var(--primary)] flex items-center">
                                        <ChevronLeft size={16} /> Späť
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        Údaje
                                    </span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">Služba:</span>
                                            <span className="font-medium">{service.name}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">Dátum:</span>
                                            <span className="font-medium">{date && format(date, "d. MMMM yyyy", { locale: sk })}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Čas:</span>
                                            <span className="font-medium">{time}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Meno a Priezvisko</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Telefón</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold mt-4 hover:bg-[var(--primary)]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin" size={18} />}
                                        {submitting ? "Rezervujem..." : "Potvrdiť rezerváciu"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === "confirmation" && (
                            <motion.div
                                key="confirmation"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Rezervácia potvrdená!</h2>
                                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                    Ďakujeme, {formData.name}. Potvrdenie sme poslali na váš email.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Zavrieť
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
