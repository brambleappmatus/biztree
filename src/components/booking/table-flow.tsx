"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { sk, enUS, cs } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, CheckCircle, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailability, createBooking } from "@/app/actions";
import { getFullyBookedDates } from "@/app/actions/availability";
import { getTables, getAvailableTables, getMaxTableCapacity } from "@/app/actions/calendar";
import { ProfileCore } from "@/types";
import { useToast } from "@/components/ui/toast";
import { getTranslation, Language } from "@/lib/i18n";

const locales: Record<Language, any> = {
    sk: sk,
    en: enUS,
    cs: cs,
};

interface TableFlowProps {
    service: ProfileCore["services"][0];
    profile: Omit<ProfileCore, "services">;
    onClose: () => void;
    lang: Language;
}

type Step = "date" | "time" | "table" | "details" | "confirmation";

export default function TableFlow({ service, profile, onClose, lang }: TableFlowProps) {
    const { showToast } = useToast();
    const [step, setStep] = useState<Step>("date");
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
    const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [tables, setTables] = useState<any[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [loadingTables, setLoadingTables] = useState(false);
    const [effectiveMaxCapacity, setEffectiveMaxCapacity] = useState(service.maxCapacity || 99);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch max table capacity if needed
    useEffect(() => {
        if (service.requiresTable) {
            getMaxTableCapacity(profile.id).then(cap => {
                if (cap > 0) setEffectiveMaxCapacity(cap);
            });
        } else {
            setEffectiveMaxCapacity(service.maxCapacity || 99);
        }
    }, [service.requiresTable, profile.id, service.maxCapacity]);

    // Fetch fully booked dates when month changes
    useEffect(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        setLoadingAvailability(true);
        getFullyBookedDates(service.id, year, month, numberOfPeople)
            .then((dates) => {
                setFullyBookedDates(dates);
                setLoadingAvailability(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingAvailability(false);
            });
    }, [currentMonth, service.id, numberOfPeople]);

    // Fetch slots when date changes
    useEffect(() => {
        if (date) {
            setLoadingSlots(true);
            getAvailability(service.id, format(date, "yyyy-MM-dd"), numberOfPeople)
                .then((fetchedSlots: any) => {
                    setSlots(fetchedSlots);
                    setLoadingSlots(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingSlots(false);
                });
        }
    }, [date, service.id, numberOfPeople]);

    const handleDateSelect = (day: Date) => {
        setDate(day);
        setStep("time");
    };

    const handleTimeSelect = (t: string) => {
        setTime(t);
        if (service.requiresTable) {
            setStep("table");
            // Fetch tables
            setLoadingTables(true);
            const duration = service.duration > 0 ? service.duration : 30;
            getAvailableTables(service.id, format(date!, "yyyy-MM-dd"), t, duration)
                .then((fetchedTables) => {
                    setTables(fetchedTables);
                    setLoadingTables(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingTables(false);
                });
        } else {
            setStep("details");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;

        // Validate number of people
        if (effectiveMaxCapacity && numberOfPeople > effectiveMaxCapacity) {
            showToast(`Maximálna kapacita je ${effectiveMaxCapacity} osôb`, "error");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createBooking({
                serviceId: service.id,
                date: format(date, "yyyy-MM-dd"),
                time,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                numberOfPeople,
                notes: formData.notes,
                tableId: selectedTableId || undefined,
            });

            if (result.error) {
                showToast(result.error, "error");
            } else {
                setStep("confirmation");
            }
        } catch (error) {
            console.error(error);
            showToast("Something went wrong", "error");
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
        <div className="flex flex-col h-[85vh] max-h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div>
                    <h2 className="font-semibold text-lg">{service.name}</h2>
                    <p className="text-xs text-gray-500">
                        {[
                            service.duration > 0 && `${service.duration} min`,
                            service.price && Number(service.price) > 0 && `${Number(service.price)} ${service.currency}`,
                            service.maxCapacity && `Max. ${service.maxCapacity} osôb`
                        ].filter(Boolean).join(' • ')}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {step === "date" && (
                        <motion.div
                            key="date"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                                    <span className="font-medium capitalize">{format(currentMonth, "MMMM yyyy", { locale: locales[lang] })}</span>
                                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs text-gray-400 font-medium">
                                    {lang === 'en'
                                        ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <div key={d}>{d}</div>)
                                        : ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(d => <div key={d}>{d}</div>)
                                    }
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((day, i) => {
                                        const isSelected = date && isSameDay(day, date);
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                                        const dateStr = format(day, "yyyy-MM-dd");
                                        const isFullyBooked = fullyBookedDates.includes(dateStr);

                                        return (
                                            <button
                                                key={i}
                                                disabled={!isCurrentMonth || isPast || isFullyBooked || loadingAvailability}
                                                onClick={() => handleDateSelect(day)}
                                                className={cn(
                                                    "aspect-square rounded-full flex items-center justify-center text-sm relative transition-all duration-200",
                                                    !isCurrentMonth && "text-gray-300 opacity-0",
                                                    (isPast || isFullyBooked) && "opacity-50",
                                                    isCurrentMonth && !isFullyBooked && !loadingAvailability && "hover:bg-gray-100 dark:hover:bg-gray-800",
                                                    isSelected && "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
                                                    isToday(day) && !isSelected && "text-[var(--primary)] font-bold",
                                                    (isPast || isFullyBooked) && "text-gray-300 cursor-not-allowed hover:bg-transparent",
                                                    loadingAvailability && "opacity-50 cursor-wait"
                                                )}
                                            >
                                                {loadingAvailability && isCurrentMonth ? (
                                                    <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                                                ) : (
                                                    <>
                                                        {format(day, "d")}
                                                        {isToday(day) && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-[var(--primary)] rounded-full" />}
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === "time" && (
                        <motion.div
                            key="time"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setStep("date")} className="text-sm text-[var(--primary)] flex items-center">
                                        <ChevronLeft size={16} /> {getTranslation(lang).booking.back}
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        {date && format(date, "d. MMMM", { locale: locales[lang] })}
                                    </span>
                                </div>

                                {/* Number of People Selector */}
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                                        <Users size={18} />
                                        {getTranslation(lang).booking.numberOfGuests}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-600"
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center">
                                            <span className="text-2xl font-bold">{numberOfPeople}</span>
                                            {effectiveMaxCapacity < 99 && (
                                                <span className="text-xs text-gray-500 block">max. {effectiveMaxCapacity}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setNumberOfPeople(Math.min(effectiveMaxCapacity, numberOfPeople + 1))}
                                            disabled={numberOfPeople >= effectiveMaxCapacity}
                                            className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {loadingSlots ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-[var(--primary)]" />
                                    </div>
                                ) : slots.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {slots.map((s) => (
                                            <button
                                                key={s.time}
                                                onClick={() => handleTimeSelect(s.time)}
                                                className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] border border-transparent hover:border-[var(--primary)]/30 transition-all font-medium"
                                            >
                                                {s.time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        {getTranslation(lang).booking.noSlots}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === "table" && (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setStep("time")} className="text-sm text-[var(--primary)] flex items-center">
                                        <ChevronLeft size={16} /> {getTranslation(lang).booking.back}
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        Výber stola
                                    </span>
                                </div>

                                {loadingTables ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-[var(--primary)]" />
                                    </div>
                                ) : tables.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {tables
                                            .filter(table => table.capacity >= numberOfPeople)
                                            .map((table) => (
                                                <button
                                                    key={table.id}
                                                    onClick={() => {
                                                        setSelectedTableId(table.id);
                                                        setStep("details");
                                                    }}
                                                    className={cn(
                                                        "p-5 rounded-xl border-2 transition-all text-left",
                                                        selectedTableId === table.id
                                                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                                                            : "border-gray-200 hover:border-[var(--primary)]/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="flex-shrink-0 flex items-center justify-center">
                                                            {table.shape === 'circle' ? (
                                                                <svg width="32" height="32" viewBox="0 0 32 32" className="text-[var(--primary)]">
                                                                    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                                                                </svg>
                                                            ) : table.shape === 'rectangle' ? (
                                                                <svg width="40" height="24" viewBox="0 0 40 24" className="text-[var(--primary)]">
                                                                    <rect x="1" y="1" width="38" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                                                                </svg>
                                                            ) : (
                                                                <svg width="28" height="28" viewBox="0 0 28 28" className="text-[var(--primary)]">
                                                                    <rect x="1" y="1" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="font-semibold text-lg">{table.name}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Users size={14} />
                                                        {table.capacity} osôb
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        Žiadne dostupné stoly pre {numberOfPeople} osôb
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === "details" && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex items-center gap-2 mb-6">
                                    <button
                                        onClick={() => setStep(service.requiresTable ? "table" : "time")}
                                        className="text-sm text-[var(--primary)] flex items-center"
                                    >
                                        <ChevronLeft size={16} /> {getTranslation(lang).booking.back}
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        {getTranslation(lang).booking.details}
                                    </span>
                                </div>

                                <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">{getTranslation(lang).booking.date}:</span>
                                            <span className="font-medium">{date && format(date, "d. MMMM yyyy", { locale: locales[lang] })}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">{getTranslation(lang).booking.time}:</span>
                                            <span className="font-medium">{time}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{getTranslation(lang).booking.numberOfGuests}:</span>
                                            <span className="font-medium">{numberOfPeople}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{getTranslation(lang).booking.name}</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{getTranslation(lang).booking.email}</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{getTranslation(lang).booking.phone}</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">{getTranslation(lang).booking.note}</label>
                                        <textarea
                                            rows={3}
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Napr. alergény, špeciálne požiadavky..."
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-white dark:bg-gray-900 mt-auto">
                                <div className="flex items-start gap-3 mb-3">
                                    <input
                                        required
                                        type="checkbox"
                                        id="terms"
                                        form="booking-form"
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                                    />
                                    <label htmlFor="terms" className="text-xs text-gray-500">
                                        {getTranslation(lang).booking.termsAgree} <a href="/legal/terms" target="_blank" className="text-[var(--primary)] hover:underline">{getTranslation(lang).booking.termsLink}</a> {getTranslation(lang).booking.termsAnd} <a href="/legal/privacy" target="_blank" className="text-[var(--primary)] hover:underline">{getTranslation(lang).booking.privacyLink}</a>.
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    form="booking-form"
                                    disabled={submitting}
                                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {submitting && <Loader2 className="animate-spin" size={20} />}
                                    {submitting ? getTranslation(lang).booking.booking : getTranslation(lang).booking.confirm}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "confirmation" && (
                        <motion.div
                            key="confirmation"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{getTranslation(lang).booking.successTitle}</h2>
                            <p className="text-gray-500 mb-4 max-w-xs mx-auto">
                                {getTranslation(lang).booking.successMsg}
                            </p>
                            <p className="text-sm text-gray-400 mb-8">
                                {lang === 'en'
                                    ? `Table for ${numberOfPeople} ${numberOfPeople === 1 ? 'person' : 'people'}`
                                    : `Stôl pre ${numberOfPeople} ${numberOfPeople === 1 ? 'osobu' : numberOfPeople < 5 ? 'osoby' : 'osôb'}`
                                }
                            </p>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                {getTranslation(lang).booking.close}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
