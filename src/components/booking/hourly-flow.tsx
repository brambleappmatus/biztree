"use client";

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { sk, enUS, cs } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, CheckCircle, Loader2, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailability, createBooking } from "@/app/actions";
import { getFullyBookedDates } from "@/app/actions/availability";
import { getServiceWorkers } from "@/app/actions/calendar";
import { ProfileCore } from "@/types";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";
import googleIcon from "@/assets/google-calendar.png";
import appleIcon from "@/assets/apple-calendar.png";
import { getTranslation, Language } from "@/lib/i18n";

const locales: Record<Language, any> = {
    sk: sk,
    en: enUS,
    cs: cs,
};

interface HourlyFlowProps {
    service: ProfileCore["services"][0];
    profile: Omit<ProfileCore, "services">;
    onClose: () => void;
    lang: Language;
}

type Step = "date" | "time" | "worker" | "details" | "confirmation";
export default function HourlyFlow({ service, profile, onClose, lang }: HourlyFlowProps) {
    const { showToast } = useToast();
    const [step, setStep] = useState<Step>("date");
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [slots, setSlots] = useState<{ time: string; available: boolean; availableWorkers?: any[] }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // Worker selection
    const [workers, setWorkers] = useState<any[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
    const [loadingWorkers, setLoadingWorkers] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Fetch fully booked dates when month changes
    useEffect(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        setLoadingAvailability(true);
        getFullyBookedDates(service.id, year, month)
            .then((dates) => {
                setFullyBookedDates(dates);
                setLoadingAvailability(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingAvailability(false);
            });
    }, [currentMonth, service.id]);

    // Fetch workers if worker selection is enabled
    useEffect(() => {
        if (service.allowWorkerSelection) {
            setLoadingWorkers(true);
            getServiceWorkers(service.id)
                .then((fetchedWorkers) => {
                    setWorkers(fetchedWorkers);
                    setLoadingWorkers(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingWorkers(false);
                });
        }
    }, [service.id, service.allowWorkerSelection]);

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

        // Find the selected slot
        const selectedSlot = slots.find(s => s.time === t);

        // If worker selection is enabled, go to worker step
        if (service.allowWorkerSelection) {
            // Update workers list with ONLY the available workers for this slot
            if (selectedSlot?.availableWorkers && selectedSlot.availableWorkers.length > 0) {
                setWorkers(selectedSlot.availableWorkers);
                setStep("worker");
            } else {
                // Should not happen if slot is available, but as fallback
                console.warn("No workers found for available slot");
                // If not required, we can proceed without worker? 
                // But if allowWorkerSelection is true, we expect workers.
                // Let's assume there are workers if the slot is available.
                setStep("details");
            }
        } else {
            setStep("details");
        }
    };

    const handleWorkerSelect = (workerId: string) => {
        setSelectedWorkerId(workerId);
        setStep("details");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;

        // Validate worker selection if required
        if (service.requireWorker && !selectedWorkerId && service.allowWorkerSelection) {
            showToast("Prosím vyberte pracovníka", "error");
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
                workerId: selectedWorkerId || undefined,
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

    const selectedWorker = workers.find(w => w.id === selectedWorkerId);

    return (
        <div className="flex flex-col h-[85vh] max-h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div>
                    <h2 className="font-semibold text-lg">{service.name}</h2>
                    <p className="text-xs text-gray-500">
                        {[
                            service.duration > 0 && `${service.duration} min`,
                            service.price && Number(service.price) > 0 && `${Number(service.price)} ${service.currency}`
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
                                    <span className="font-medium capitalize">{format(currentMonth, "LLLL yyyy", { locale: locales[lang] })}</span>
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

                    {step === "worker" && (
                        <motion.div
                            key="worker"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setStep("time")} className="text-sm text-[var(--primary)] flex items-center">
                                        <ChevronLeft size={16} /> {getTranslation(lang).booking.back}
                                    </button>
                                    <span className="font-medium flex-1 text-center pr-12">
                                        {getTranslation(lang).booking.selectWorker}
                                    </span>
                                </div>

                                {loadingWorkers ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin text-[var(--primary)]" />
                                    </div>
                                ) : workers.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {workers.map((worker) => (
                                            <button
                                                key={worker.id}
                                                onClick={() => handleWorkerSelect(worker.id)}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-[var(--primary)]/10 border border-transparent hover:border-[var(--primary)]/30 transition-all text-left"
                                            >
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                    {worker.imageUrl ? (
                                                        <Image
                                                            src={worker.imageUrl}
                                                            alt={worker.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                            <Briefcase size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-base">{worker.name}</h3>
                                                    {worker.description && (
                                                        <p className="text-sm text-gray-500 mt-0.5">{worker.description}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                        {!service.requireWorker && (
                                            <button
                                                onClick={() => handleWorkerSelect("")}
                                                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-[var(--primary)]/10 border border-transparent hover:border-[var(--primary)]/30 transition-all text-left"
                                            >
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                                    <User size={24} className="text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-base">{getTranslation(lang).booking.noPreference}</h3>
                                                    <p className="text-sm text-gray-500 mt-0.5">{getTranslation(lang).booking.anyWorker}</p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        {getTranslation(lang).booking.noWorkersAvailable}
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
                                        onClick={() => service.allowWorkerSelection && workers.length > 0 ? setStep("worker") : setStep("time")}
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
                                            <span className="text-gray-500">{getTranslation(lang).booking.service}:</span>
                                            <span className="font-medium">{service.name}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">{getTranslation(lang).booking.date}:</span>
                                            <span className="font-medium">{date && format(date, "d. MMMM yyyy", { locale: locales[lang] })}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">{getTranslation(lang).booking.time}:</span>
                                            <span className="font-medium">{time}</span>
                                        </div>
                                        {selectedWorker && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">{getTranslation(lang).booking.worker}:</span>
                                                <span className="font-medium">{selectedWorker.name}</span>
                                            </div>
                                        )}
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
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="min-h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">{getTranslation(lang).booking.successTitle}</h2>
                                    <p className="text-gray-500 mb-4 max-w-xs mx-auto">
                                        {getTranslation(lang).booking.successMsg.replace('Ďakujeme', `Ďakujeme, ${formData.name}`)}
                                    </p>

                                    {service.locationType === 'google_meet' && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl max-w-xs mx-auto">
                                            <p className="text-sm text-green-800 font-medium mb-1">💻 {getTranslation(lang).booking.onlineMeeting}</p>
                                            <p className="text-xs text-green-600">
                                                {getTranslation(lang).booking.meetLinkInfo}
                                            </p>
                                        </div>
                                    )}

                                    <div className="w-full mb-8">
                                        <p className="text-sm font-medium text-gray-500 mb-3">{getTranslation(lang).booking.addToCalendar}</p>
                                        <div className="flex flex-row gap-3">
                                            <button
                                                onClick={() => {
                                                    if (!date || !time) return;
                                                    const [hours, minutes] = time.split(":").map(Number);
                                                    const startDate = new Date(date);
                                                    startDate.setHours(hours, minutes);
                                                    const endDate = new Date(startDate.getTime() + (service.duration || 30) * 60000);

                                                    const googleUrl = new URL("https://calendar.google.com/calendar/render");
                                                    googleUrl.searchParams.append("action", "TEMPLATE");
                                                    googleUrl.searchParams.append("text", `Rezervácia: ${service.name} - ${profile.name}`);
                                                    googleUrl.searchParams.append("dates", `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`);

                                                    const details = [
                                                        `Rezervácia služby ${service.name}`,
                                                        `Poskytovateľ: ${profile.name}`,
                                                        profile.phone ? `Tel: ${profile.phone}` : "",
                                                        profile.email ? `Email: ${profile.email}` : "",
                                                        `Pre: ${formData.name}`
                                                    ].filter(Boolean).join("\\n");

                                                    googleUrl.searchParams.append("details", details);

                                                    // Add location based on service type
                                                    if (service.locationType === 'google_meet') {
                                                        googleUrl.searchParams.append("location", "Online (Google Meet)");
                                                    } else if (service.locationType === 'custom_address' && service.customAddress) {
                                                        googleUrl.searchParams.append("location", service.customAddress);
                                                    } else if (profile.address) {
                                                        googleUrl.searchParams.append("location", profile.address);
                                                    }

                                                    window.open(googleUrl.toString(), "_blank");
                                                }}
                                                className="flex-1 py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                                            >
                                                <Image src={googleIcon} alt="Google Calendar" width={20} height={20} className="object-contain" />
                                                Google
                                            </button>

                                            <button
                                                onClick={() => {
                                                    if (!date || !time) return;
                                                    const [hours, minutes] = time.split(":").map(Number);
                                                    const startDate = new Date(date);
                                                    startDate.setHours(hours, minutes);
                                                    const endDate = new Date(startDate.getTime() + (service.duration || 30) * 60000);

                                                    const description = [
                                                        `Rezervácia služby ${service.name}`,
                                                        `Poskytovateľ: ${profile.name}`,
                                                        profile.phone ? `Tel: ${profile.phone}` : "",
                                                        profile.email ? `Email: ${profile.email}` : "",
                                                        `Pre: ${formData.name}`
                                                    ].filter(Boolean).join("\\n");

                                                    let location = '';
                                                    if (service.locationType === 'google_meet') {
                                                        location = "Online (Google Meet)";
                                                    } else if (service.locationType === 'custom_address' && service.customAddress) {
                                                        location = service.customAddress;
                                                    } else if (profile.address) {
                                                        location = profile.address;
                                                    }

                                                    const icsContent = [
                                                        "BEGIN:VCALENDAR",
                                                        "VERSION:2.0",
                                                        "BEGIN:VEVENT",
                                                        `DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}`,
                                                        `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}`,
                                                        `SUMMARY:Rezervácia: ${service.name} - ${profile.name}`,
                                                        `DESCRIPTION:${description}`,
                                                        location ? `LOCATION:${location}` : "",
                                                        "END:VEVENT",
                                                        "END:VCALENDAR"
                                                    ].filter(Boolean).join("\\n");

                                                    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
                                                    const link = document.createElement("a");
                                                    link.href = window.URL.createObjectURL(blob);
                                                    link.download = "rezervacia.ics";
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                className="flex-1 py-3 px-4 bg-black text-white hover:bg-gray-900 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                                            >
                                                <Image src={appleIcon} alt="Apple Calendar" width={20} height={20} className="object-contain" />
                                                Apple
                                            </button>
                                        </div>
                                    </div>

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
                </AnimatePresence >
            </div >
        </div >
    );
}
