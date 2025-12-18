"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, differenceInDays, addDays, isBefore, isAfter, isWithinInterval } from "date-fns";
import { sk, enUS, cs } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBooking, getBookedDateRanges } from "@/app/actions";
import { ProfileCore } from "@/types";
import { useToast } from "@/components/ui/toast";
import { getTranslation, Language } from "@/lib/i18n";

const locales: Record<Language, any> = {
    sk: sk,
    en: enUS,
    cs: cs,
};

interface DailyFlowProps {
    service: ProfileCore["services"][0];
    profile: Omit<ProfileCore, "services">;
    onClose: () => void;
    lang: Language;
}

type Step = "dates" | "details" | "confirmation";

export default function DailyFlow({ service, profile, onClose, lang }: DailyFlowProps) {
    const { showToast } = useToast();
    const [step, setStep] = useState<Step>("dates");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [bookedRanges, setBookedRanges] = useState<Array<{
        start: string;
        end: string;
        startDate: string;
        endDate: string;
    }>>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch booked date ranges on mount
    useEffect(() => {
        getBookedDateRanges(service.id).then(ranges => {
            console.log('Booked ranges for service:', service.id, ranges);
            setBookedRanges(ranges);
        }).catch(console.error);
    }, [service.id]);

    // Check if a date is fully booked (cannot be used for check-in or check-out)
    const isDateFullyBooked = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");

        // A date is fully booked if there's a booking that:
        // - Checks in on this date (14:00) AND checks out on this date or later (10:00)
        // This means the entire day is occupied

        return bookedRanges.some(range => {
            const checkInDate = range.startDate;
            const checkOutDate = range.endDate;

            // If check-in and check-out are on the same day, the date is fully booked
            if (checkInDate === dateStr && checkOutDate === dateStr) {
                return true;
            }

            // If this date is between check-in and check-out (exclusive), it's fully booked
            if (dateStr > checkInDate && dateStr < checkOutDate) {
                return true;
            }

            return false;
        });
    };

    // Check if a date has a check-out (available for check-in after 14:00)
    const hasCheckOut = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return bookedRanges.some(range => range.endDate === dateStr);
    };

    // Check if a date has a check-in (available for check-out before 10:00)
    const hasCheckIn = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return bookedRanges.some(range => range.startDate === dateStr);
    };

    const handleDateSelect = (day: Date) => {
        console.log('Date clicked:', format(day, 'yyyy-MM-dd'));
        if (isDateFullyBooked(day)) {
            showToast("Tento termín je už plne obsadený.", "error");
            return;
        }

        if (!startDate || (startDate && endDate)) {
            // Selecting Start Date
            // Cannot start if someone else is checking in today (afternoon blocked)
            if (hasCheckIn(day)) {
                showToast("Tento termín je už obsadený od 14:00", "error");
                return;
            }
            setStartDate(day);
            setEndDate(null);
        } else {
            // Selecting End Date
            if (isBefore(day, startDate)) {
                // Reset and make it start date
                if (hasCheckIn(day)) {
                    showToast("Tento termín je už obsadený od 14:00", "error");
                    return;
                }
                setStartDate(day);
                setEndDate(null); // Reset endDate when changing startDate
            } else {
                // Validate End Date
                // Cannot end if someone else is checking out today (morning blocked)
                // Wait, if someone checks out at 10:00, that means they stayed last night.
                // If I check out at 10:00, I stayed last night.
                // So if there is a check-out today, that means the night before was booked.
                // So I cannot book the night before.
                // But here I am selecting the END date.
                // If I select today as end date, I check out at 10:00.
                // If someone else checks out at 10:00, they occupied the room last night.
                // So I cannot occupy the room last night.
                // So today is an invalid end date if it has a check-out.
                if (hasCheckOut(day)) {
                    showToast("Tento termín je už obsadený do 10:00", "error");
                    return;
                }

                setEndDate(day);
            }
        }
    };

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const days = differenceInDays(endDate, startDate); // Number of nights
        const pricePerDay = Number(service.pricePerDay) || 0;
        return days * pricePerDay;
    };

    const validateSelection = () => {
        if (!startDate || !endDate) return { valid: false, message: "" };

        const days = differenceInDays(endDate, startDate); // Nights
        const total = calculateTotal();

        if (service.minimumDays && days < service.minimumDays) {
            return { valid: false, message: `Minimálny počet nocí je ${service.minimumDays}.` };
        }

        if (service.minimumValue && total < Number(service.minimumValue)) {
            return { valid: false, message: `Minimálna hodnota objednávky je ${Number(service.minimumValue)} €.` };
        }

        return { valid: true, message: "" };
    };

    const validation = validateSelection();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) return;

        setSubmitting(true);
        try {
            const result = await createBooking({
                serviceId: service.id,
                date: format(startDate, "yyyy-MM-dd"),
                time: "14:00", // Start time for daily rentals (Check-in)
                endDate: format(endDate, "yyyy-MM-dd"), // Pass end date
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
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
                        {Number(service.pricePerDay)} € / noc
                        {service.minimumDays ? ` • Min. ${service.minimumDays} nocí` : ""}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {step === "dates" && (
                        <motion.div
                            key="dates"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
                                    <span className="font-medium capitalize">{format(currentMonth, "LLLL yyyy", { locale: locales[lang] })}</span>
                                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs text-gray-400 font-medium">
                                    {lang === 'en'
                                        ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => <div key={d}>{d}</div>)
                                        : ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(d => <div key={d}>{d}</div>)
                                    }
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-6">
                                    {days.map((day, i) => {
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                                        // Check availability
                                        const fullyBooked = isDateFullyBooked(day);
                                        const checkIn = hasCheckIn(day);
                                        const checkOut = hasCheckOut(day);

                                        // Selection Logic
                                        let isSelected = false;
                                        let isRangeStart = false;
                                        let isRangeEnd = false;
                                        let isRange = false;

                                        if (startDate && isSameDay(day, startDate)) {
                                            isSelected = true;
                                            isRangeStart = true;
                                        }

                                        if (endDate && isSameDay(day, endDate)) {
                                            isSelected = true;
                                            isRangeEnd = true;
                                        }

                                        if (startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate })) {
                                            isSelected = true;
                                            isRange = true;
                                            if (isSameDay(day, startDate)) isRangeStart = true;
                                            if (isSameDay(day, endDate)) isRangeEnd = true;
                                        }

                                        // Styling
                                        let bgClass = "";
                                        let textClass = isCurrentMonth ? "text-gray-700 dark:text-gray-200" : "text-gray-300";
                                        let bgStyle = {};

                                        if (fullyBooked) {
                                            bgClass = "bg-red-50 text-red-300 rounded-none cursor-not-allowed";
                                            // Check if it's a split day (booked but has check-out or check-in)
                                            // Actually, isDateFullyBooked handles the "completely blocked" case.
                                            // If it returns true, it means NO part of the day is available for the *current* user's potential booking?
                                            // Wait, isDateFullyBooked logic:
                                            // if checkIn && checkOut on same day -> fully booked.
                                            // if date is between checkIn and checkOut -> fully booked.

                                            // Visuals for booked days:
                                            // If it has check-out (morning blocked, afternoon free)
                                            if (checkOut && !checkIn) {
                                                // Morning blocked (Top-Left Red), Afternoon Free
                                                bgStyle = { background: "linear-gradient(135deg, #fee2e2 50%, transparent 50%)" };
                                                textClass = "text-red-400";
                                                bgClass = "rounded-none";
                                            } else if (checkIn && !checkOut) {
                                                // Afternoon blocked (Bottom-Right Red), Morning Free
                                                bgStyle = { background: "linear-gradient(135deg, transparent 50%, #fee2e2 50%)" };
                                                textClass = "text-red-400";
                                                bgClass = "rounded-none";
                                            } else {
                                                // Fully booked
                                                bgClass = "bg-red-50 text-red-300 rounded-none";
                                            }
                                        }

                                        // Overwrite with Selection
                                        if (isSelected) {
                                            bgClass = "bg-blue-100 text-blue-700 rounded-none"; // Default range block

                                            // Start Date (No conflict) - I occupy Afternoon (Bottom-Right Blue)
                                            if (isRangeStart && !checkOut) {
                                                // Use lighter blue (#bfdbfe) to match style and fix text visibility
                                                bgStyle = { background: "linear-gradient(135deg, transparent 50%, #bfdbfe 50%)" };
                                                textClass = "text-blue-700";
                                                bgClass = "rounded-none";
                                            }

                                            // End Date (No conflict) - I occupy Morning (Top-Left Blue)
                                            if (isRangeEnd && !checkIn) {
                                                bgStyle = { background: "linear-gradient(135deg, #bfdbfe 50%, transparent 50%)" };
                                                textClass = "text-blue-700";
                                                bgClass = "rounded-none";
                                            }

                                            // Single Day Selection (Start == End)
                                            if (isRangeStart && isRangeEnd) {
                                                bgClass = "bg-blue-200 text-blue-700 rounded-full";
                                                bgStyle = {};
                                            }
                                        }

                                        return (
                                            <button
                                                key={i}
                                                disabled={!isCurrentMonth || isPast || fullyBooked || (isRangeStart && checkOut) || (isRangeEnd && checkIn)}
                                                onClick={() => handleDateSelect(day)}
                                                style={bgStyle}
                                                className={cn(
                                                    "aspect-square flex items-center justify-center text-sm relative overflow-hidden font-medium pointer-events-auto",
                                                    // Default roundness for non-range items (available days)
                                                    // Only apply rounded-full if it's NOT selected (start or end) and NOT booked/split
                                                    !isRange && !isRangeStart && !isRangeEnd && !fullyBooked && !checkIn && !checkOut && "rounded-full",

                                                    !isCurrentMonth && "text-gray-300 opacity-0",
                                                    isPast && "opacity-50",
                                                    isCurrentMonth && !isRange && !fullyBooked && !checkIn && !checkOut && "hover:bg-gray-100 dark:hover:bg-gray-800",
                                                    isToday(day) && !isSelected && "text-[var(--primary)] font-bold",
                                                    bgClass,
                                                    textClass
                                                )}
                                            >
                                                <span className="relative z-10">{format(day, "d")}</span>
                                                {isToday(day) && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-[var(--primary)] rounded-full" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 bg-white dark:bg-gray-900 mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">{getTranslation(lang).booking.total}</p>
                                        <p className="text-xl font-bold">{calculateTotal().toFixed(2)} €</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">{getTranslation(lang).booking.days}</p>
                                        <p className="font-medium">{startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0}</p>
                                    </div>
                                </div>

                                {!validation.valid && startDate && endDate && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {validation.message}
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep("details")}
                                    disabled={!startDate || !endDate || !validation.valid}
                                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {getTranslation(lang).booking.continue}
                                </button>
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
                                    <button onClick={() => setStep("dates")} className="text-sm text-[var(--primary)] flex items-center">
                                        <ChevronLeft size={16} /> {getTranslation(lang).booking.back}
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        {getTranslation(lang).booking.details}
                                    </span>
                                </div>

                                <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">{getTranslation(lang).booking.dateRange}:</span>
                                            <span className="font-medium">
                                                {startDate && format(startDate, "d.M.")} - {endDate && format(endDate, "d.M.yyyy")}
                                            </span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">{getTranslation(lang).booking.numberOfDays}:</span>
                                            <span className="font-medium">{startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                            <span className="font-bold">{getTranslation(lang).booking.totalPrice}:</span>
                                            <span className="font-bold text-[var(--primary)]">{calculateTotal().toFixed(2)} €</span>
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
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[var(--primary)]"
                                            rows={3}
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
                                    {submitting ? getTranslation(lang).booking.submitting : getTranslation(lang).booking.reserve}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "confirmation" && (
                        <motion.div
                            key="confirmation"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="min-h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">{getTranslation(lang).booking.successTitle}</h2>
                                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                        {getTranslation(lang).booking.successMsg}
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                                    >
                                        {getTranslation(lang).booking.close}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
