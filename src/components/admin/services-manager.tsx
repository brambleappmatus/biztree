"use client";

import React, { useState } from "react";
import { Service, CalendarType, Worker } from "@prisma/client";
import { createService, updateService, deleteService } from "@/app/actions";
import { assignWorkerToService, removeWorkerFromService } from "@/app/actions/calendar";
import { Loader2, Plus, Pencil, Trash2, X, Check, Users, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { updateProfileSettings } from "@/app/actions/profile-settings";
import { isFeatureAllowed, checkServiceLimit, isCalendarTypeAllowed, getRequiredTierForFeature, getRequiredTierForCalendarType, getPlanLimits } from "@/lib/subscription-limits";
import { Lock } from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";

interface ServicesManagerProps {
    profileId: string;
    services: (Service & { workers?: any[] })[];
    workers: Worker[];
    isGoogleConnected: boolean;
    allowConcurrentServices?: boolean;
    tierName?: string;
    enabledFeatures?: string[];
}

export default function ServicesManager({ profileId, services, workers, isGoogleConnected, allowConcurrentServices = false, tierName, enabledFeatures }: ServicesManagerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState<{ name: string, description: string }>({ name: "", description: "" });
    const [settingsData, setSettingsData] = useState({
        allowConcurrentServices: allowConcurrentServices,
    });

    const [formData, setFormData] = useState({
        name: "",
        duration: 30,
        price: 0,
        bookingEnabled: true,
        calendarType: "HOURLY_SERVICE" as CalendarType,
        minimumDays: 1,
        minimumValue: 0,
        pricePerDay: 0,
        requiresTable: false,
        maxCapacity: 4,
        allowWorkerSelection: false,
        requireWorker: false,
    });

    const [minConstraintType, setMinConstraintType] = useState<'days' | 'value'>('days');

    const resetForm = () => {
        setFormData({
            name: "",
            duration: 30,
            price: 0,
            bookingEnabled: true,
            calendarType: "HOURLY_SERVICE",
            minimumDays: 1,
            minimumValue: 0,
            pricePerDay: 0,
            requiresTable: false,
            maxCapacity: 4,
            allowWorkerSelection: false,
            requireWorker: false,
        });
        setEditingId(null);
        setIsCreating(false);
        setMinConstraintType('days');
    };

    const handleEdit = (service: Service) => {
        setFormData({
            name: service.name,
            duration: service.duration,
            price: Number(service.price),
            bookingEnabled: service.bookingEnabled ?? true,
            calendarType: service.calendarType,
            minimumDays: service.minimumDays ?? 1,
            minimumValue: Number(service.minimumValue) ?? 0,
            pricePerDay: Number(service.pricePerDay) ?? 0,
            requiresTable: service.requiresTable,
            maxCapacity: service.maxCapacity ?? 4,
            allowWorkerSelection: service.allowWorkerSelection,
            requireWorker: service.requireWorker,
        });
        setEditingId(service.id);
        setIsCreating(false);

        if (Number(service.minimumValue) > 0) {
            setMinConstraintType('value');
        } else {
            setMinConstraintType('days');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateService(editingId, formData);
                showToast("Služba aktualizovaná", "success");
            } else {
                await createService(profileId, formData);
                showToast("Služba vytvorená", "success");
            }
            router.refresh();
            resetForm();
        } catch (error) {
            console.error(error);
            showToast("Chyba pri ukladaní", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        const id = deleteId;
        setDeleteId(null);
        setLoading(true);

        try {
            await deleteService(id);
            router.refresh();
            showToast("Služba vymazaná", "success");
        } catch (error) {
            console.error(error);
            showToast("Chyba pri mazaní", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6 max-w-3xl pb-24">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Zoznam služieb</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                            title="Nastavenia rezervácií"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={() => {
                                if (!checkServiceLimit(tierName, services.length)) {
                                    setPremiumFeature({ name: "Pridať službu", description: "Dosiahli ste limit služieb pre váš plán." });
                                    setShowPremiumModal(true);
                                    return;
                                }
                                resetForm();
                                setIsCreating(true);
                            }}
                            disabled={isCreating || !!editingId}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${!checkServiceLimit(tierName, services.length) ? "bg-blue-600/50 text-white/50 hover:bg-blue-600/60" : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"}`}
                        >
                            {!checkServiceLimit(tierName, services.length) && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg z-10">
                                    <Lock className="w-3 h-3 text-white" />
                                </span>
                            )}
                            <Plus size={16} />
                            Pridať službu
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-medium flex items-center gap-2">
                            <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google Calendar" className="w-6 h-6" />
                            Google Kalendár
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isGoogleConnected
                                ? "Váš kalendár je prepojený. Rezervácie sa automaticky pridávajú."
                                : "Prepojte svoj kalendár pre automatickú synchronizáciu rezervácií."}
                        </p>
                    </div>
                    {isGoogleConnected ? (
                        <button
                            onClick={async () => {
                                if (!confirm("Naozaj chcete odpojiť Google Kalendár?")) return;
                                setLoading(true);
                                try {
                                    const res = await fetch("/api/google-calendar/disconnect", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ profileId }),
                                    });
                                    if (res.ok) {
                                        showToast("Google Kalendár odpojený", "success");
                                        router.refresh();
                                    } else {
                                        showToast("Chyba pri odpájaní", "error");
                                    }
                                } catch (error) {
                                    console.error(error);
                                    showToast("Chyba pri odpájaní", "error");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            Odpojiť
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (!isFeatureAllowed(tierName, 'googleCalendar', enabledFeatures)) {
                                    setPremiumFeature({ name: "Google Kalendár", description: "Synchronizujte rezervácie s Google Kalendárom." });
                                    setShowPremiumModal(true);
                                    return;
                                }
                                window.location.href = "/api/google-calendar/auth";
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors relative"
                        >
                            {!isFeatureAllowed(tierName, 'googleCalendar', enabledFeatures) && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                    <Lock className="w-2.5 h-2.5 text-white" />
                                </span>
                            )}
                            Prepojiť
                        </button>
                    )}
                </div>

                {(isCreating || editingId) && (
                    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-up">
                        <h3 className="font-medium mb-4">{editingId ? "Upraviť službu" : "Nová služba"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Názov služby</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    placeholder={
                                        formData.calendarType === "DAILY_RENTAL"
                                            ? "Napr. Chata pod lesom, Apartmán v centre..."
                                            : formData.calendarType === "TABLE_RESERVATION"
                                                ? "Napr. Hlavná sála, Terasa, VIP stôl..."
                                                : "Napr. Strihanie vlasov, Masáž, Konzultácia..."
                                    }
                                />
                            </div>
                            {formData.calendarType !== "DAILY_RENTAL" && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Trvanie (min)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            {formData.calendarType === "HOURLY_SERVICE" && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cena (€)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="bookingEnabled"
                                    checked={formData.bookingEnabled}
                                    onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="bookingEnabled" className="text-sm font-medium text-gray-700">
                                    Povoliť rezervácie
                                </label>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Typ rezervácie</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="radio"
                                        id="type_hourly"
                                        name="calendarType"
                                        checked={formData.calendarType === "HOURLY_SERVICE"}
                                        onChange={() => setFormData({ ...formData, calendarType: "HOURLY_SERVICE" })}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="type_hourly" className="text-sm font-medium text-gray-700">Hodinové služby</label>
                                </div>

                                <div className={!isCalendarTypeAllowed(tierName, "DAILY_RENTAL") ? "opacity-50" : ""}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="radio"
                                            id="type_daily"
                                            name="calendarType"
                                            checked={formData.calendarType === "DAILY_RENTAL"}
                                            onChange={() => {
                                                if (isCalendarTypeAllowed(tierName, "DAILY_RENTAL")) {
                                                    setFormData({ ...formData, calendarType: "DAILY_RENTAL" });
                                                } else {
                                                    setPremiumFeature({ name: "Denný prenájom", description: "Umožnite zákazníkom rezervovať si služby na celé dni." });
                                                    setShowPremiumModal(true);
                                                }
                                            }}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="type_daily" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Denný prenájom
                                            {!isCalendarTypeAllowed(tierName, "DAILY_RENTAL") && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                    <Lock size={10} />
                                                    {getRequiredTierForCalendarType("DAILY_RENTAL")}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className={!isCalendarTypeAllowed(tierName, "TABLE_RESERVATION") ? "opacity-50" : ""}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            id="type_table"
                                            name="calendarType"
                                            checked={formData.calendarType === "TABLE_RESERVATION"}
                                            onChange={() => {
                                                if (isCalendarTypeAllowed(tierName, "TABLE_RESERVATION")) {
                                                    setFormData({ ...formData, calendarType: "TABLE_RESERVATION" });
                                                } else {
                                                    setPremiumFeature({ name: "Rezervácia stolov", description: "Umožnite zákazníkom rezervovať si konkrétne stoly." });
                                                    setShowPremiumModal(true);
                                                }
                                            }}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="type_table" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Rezervácia stolov
                                            {!isCalendarTypeAllowed(tierName, "TABLE_RESERVATION") && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                    <Lock size={10} />
                                                    {getRequiredTierForCalendarType("TABLE_RESERVATION")}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {formData.calendarType === "HOURLY_SERVICE" && (
                            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                <h4 className="text-sm font-medium mb-3">Nastavenia pracovníkov</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="allowWorkerSelection"
                                            checked={formData.allowWorkerSelection}
                                            onChange={(e) => {
                                                if (!isFeatureAllowed(tierName, 'workerSelection', enabledFeatures) && e.target.checked) {
                                                    setPremiumFeature({ name: "Výber pracovníka", description: "Umožnite zákazníkom vybrať si konkrétneho pracovníka pri rezervácii." });
                                                    setShowPremiumModal(true);
                                                    return;
                                                }
                                                setFormData({ ...formData, allowWorkerSelection: e.target.checked });
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor="allowWorkerSelection" className="text-sm text-gray-700 flex items-center gap-2">
                                            Povoliť výber konkrétneho pracovníka
                                            {!isFeatureAllowed(tierName, 'workerSelection', enabledFeatures) && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                    <Lock size={10} />
                                                    {getRequiredTierForFeature('workerSelection')}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                    {formData.allowWorkerSelection && (
                                        <div className="flex items-center gap-2 ml-6">
                                            <input
                                                type="checkbox"
                                                id="requireWorker"
                                                checked={formData.requireWorker}
                                                onChange={(e) => setFormData({ ...formData, requireWorker: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <label htmlFor="requireWorker" className="text-sm text-gray-700">
                                                Vyžadovať výber pracovníka
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {formData.calendarType === "HOURLY_SERVICE" && editingId && formData.allowWorkerSelection && workers.length > 0 && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users size={18} className="text-blue-600" />
                                    <h4 className="text-sm font-medium text-blue-900">Priradiť pracovníkov</h4>
                                </div>
                                <p className="text-xs text-blue-700 mb-3">Vyberte pracovníkov, ktorí môžu poskytovať túto službu</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {workers.map((worker) => {
                                        const service = services.find(s => s.id === editingId);
                                        const isAssigned = service?.workers?.some((sw: any) => sw.workerId === worker.id) || false;

                                        return (
                                            <div key={worker.id} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-100">
                                                <input
                                                    type="checkbox"
                                                    id={`worker-${worker.id}`}
                                                    checked={isAssigned}
                                                    onChange={async (e) => {
                                                        try {
                                                            if (e.target.checked) {
                                                                await assignWorkerToService(worker.id, editingId);
                                                                showToast(`${worker.name} priradený k službe`, "success");
                                                            } else {
                                                                await removeWorkerFromService(worker.id, editingId);
                                                                showToast(`${worker.name} odstránený zo služby`, "success");
                                                            }
                                                            router.refresh();
                                                        } catch (error) {
                                                            showToast("Chyba pri aktualizácii", "error");
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <label htmlFor={`worker-${worker.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                                                    {worker.name}
                                                    {worker.description && (
                                                        <span className="text-xs text-gray-500 block">{worker.description}</span>
                                                    )}
                                                </label>
                                                {!worker.isActive && (
                                                    <span className="text-xs text-red-500">(Neaktívny)</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {workers.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Zatiaľ nemáte žiadnych pracovníkov. <a href="/admin/workers" className="text-blue-600 hover:underline">Pridať pracovníka</a>
                                    </p>
                                )}
                            </div>
                        )}

                        {formData.calendarType === "DAILY_RENTAL" && (
                            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cena za deň (€)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.pricePerDay}
                                        onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                                        className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex gap-4 mb-3 border-b border-gray-100">
                                    <button
                                        type="button"
                                        className={`pb-2 text-sm font-medium transition-colors relative ${minConstraintType === 'days' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => {
                                            setMinConstraintType('days');
                                            setFormData({ ...formData, minimumValue: 0 });
                                        }}
                                    >
                                        Min. počet nocí
                                        {minConstraintType === 'days' && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className={`pb-2 text-sm font-medium transition-colors relative ${minConstraintType === 'value' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => {
                                            setMinConstraintType('value');
                                            setFormData({ ...formData, minimumDays: 1 });
                                        }}
                                    >
                                        Min. hodnota objednávky
                                        {minConstraintType === 'value' && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                                        )}
                                    </button>
                                </div>

                                {minConstraintType === 'days' ? (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Min. počet nocí</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.minimumDays}
                                            onChange={(e) => setFormData({ ...formData, minimumDays: Number(e.target.value) })}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Minimálny počet nocí, ktoré si zákazník musí rezervovať.</p>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Min. hodnota (€)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.minimumValue}
                                            onChange={(e) => setFormData({ ...formData, minimumValue: Number(e.target.value) })}
                                            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Minimálna celková suma objednávky.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {formData.calendarType === "TABLE_RESERVATION" && (
                            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="requiresTable"
                                        checked={formData.requiresTable}
                                        onChange={(e) => setFormData({ ...formData, requiresTable: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="requiresTable" className="text-sm font-medium text-gray-700">
                                        Vyžadovať priradenie stola
                                    </label>
                                </div>
                                {!formData.requiresTable && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Max. kapacita (osôb)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.maxCapacity}
                                            onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                                            className="w-full max-w-[100px] p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}
                                {formData.requiresTable && (
                                    <p className="text-xs text-gray-500">
                                        Kapacita bude určená vybraným stolom. <a href="/admin/tables" className="text-blue-600 hover:underline">Spravovať stoly</a>
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm"
                            >
                                Zrušiť
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                Uložiť
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {services.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                            Zatiaľ nemáte žiadne služby.
                        </div>
                    ) : (
                        services.map((service, index) => {
                            const limits = getPlanLimits(tierName);
                            const isOverLimit = index >= limits.maxServices;

                            return (
                                <div
                                    key={service.id}
                                    className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center transition-colors ${isOverLimit ? "opacity-75 bg-gray-50" : "hover:border-blue-100"
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{service.name}</h3>
                                            {isOverLimit && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                    <Lock size={10} />
                                                    Mimo limitu
                                                </span>
                                            )}
                                            {!service.bookingEnabled && !isOverLimit && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                    Rezervácie vypnuté
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {service.duration > 0 && `${service.duration} min • `}{Number(service.price)} €
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (isOverLimit) {
                                                    setPremiumFeature({ name: "Limit služieb", description: "Túto službu nemôžete upravovať, pretože presahuje limit vášho balíka. Prejdite na vyšší balík alebo vymažte nadbytočné služby." });
                                                    setShowPremiumModal(true);
                                                    return;
                                                }
                                                handleEdit(service);
                                            }}
                                            disabled={loading || isCreating || !!editingId}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                                        >
                                            {isOverLimit ? <Lock size={18} /> : <Pencil size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(service.id)}
                                            disabled={loading || isCreating || !!editingId}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div >

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Vymazať službu?"
                description="Naozaj chcete vymazať túto službu? Táto akcia je nevratná."
                confirmText="Vymazať"
                cancelText="Zrušiť"
                variant="danger"
            />

            {/* Booking Settings Modal */}
            {
                showSettings && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Nastavenia rezervácií</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settingsData.allowConcurrentServices}
                                            onChange={(e) => {
                                                if (!isFeatureAllowed(tierName, 'concurrentBookings', enabledFeatures) && e.target.checked) {
                                                    setPremiumFeature({ name: "Súbežné rezervácie", description: "Umožnite viacerým zákazníkom rezervovať si rôzne služby súčasne." });
                                                    setShowPremiumModal(true);
                                                    return;
                                                }
                                                setSettingsData({ ...settingsData, allowConcurrentServices: e.target.checked });
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        <div className="flex-1">
                                            <div className="font-medium mb-1 flex items-center gap-2">
                                                Povoliť súbežné rezervácie rôznych služieb
                                                {!isFeatureAllowed(tierName, 'concurrentBookings', enabledFeatures) && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                        <Lock size={10} />
                                                        {getRequiredTierForFeature('concurrentBookings')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {settingsData.allowConcurrentServices ? (
                                                    <>
                                                        <strong>Zapnuté:</strong> Rôzne služby sa navzájom neblokujú. Vhodné pre tímy alebo viacero pracovníkov, kde môžu prebiehať rôzne služby súčasne.
                                                        <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded">
                                                            Príklad: Ak máte "Strihanie" a "Farbenie", zákazníci môžu rezervovať obe služby na rovnaký čas.
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <strong>Vypnuté:</strong> Rezervácia jednej služby blokuje všetky ostatné služby v tom istom čase. Vhodné pre jednotlivcov alebo malé tímy s jedným pracovníkom.
                                                        <div className="mt-2 text-xs bg-gray-50 text-gray-700 p-2 rounded">
                                                            Príklad: Ak máte rezerváciu "Strihanie" o 14:00, "Farbenie" nebude dostupné o 14:00.
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setSettingsData({ allowConcurrentServices });
                                            setShowSettings(false);
                                        }}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        Zrušiť
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                await updateProfileSettings(profileId, settingsData);
                                                showToast("Nastavenia uložené", "success");
                                                setShowSettings(false);
                                                router.refresh();
                                            } catch (error) {
                                                console.error(error);
                                                showToast("Chyba pri ukladaní", "error");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        Uložiť
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                featureName={premiumFeature.name}
                description={premiumFeature.description}
            />
        </>
    );
}
