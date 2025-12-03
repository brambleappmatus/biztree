"use client";

import React from "react";
import { CalendarType, Worker } from "@prisma/client";
import { X, Users, Lock, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFeatureAllowed, isCalendarTypeAllowed, getRequiredTierForFeature, getRequiredTierForCalendarType } from "@/lib/subscription-limits";

interface ServiceFormProps {
    formData: {
        name: string;
        duration: number;
        price: number;
        bookingEnabled: boolean;
        calendarType: CalendarType;
        minimumDays: number;
        minimumValue: number;
        pricePerDay: number;
        requiresTable: boolean;
        maxCapacity: number;
        allowWorkerSelection: boolean;
        requireWorker: boolean;
        locationType: "business_address" | "custom_address" | "google_meet";
        customAddress: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    loading: boolean;
    editingId: string | null;
    workers: Worker[];
    services: any[];
    tierName?: string;
    enabledFeatures?: string[];
    setPremiumFeature: (feature: { name: string; description: string }) => void;
    setShowPremiumModal: (show: boolean) => void;
    minConstraintType: 'days' | 'value';
    setMinConstraintType: (type: 'days' | 'value') => void;
    assignWorkerToService: (workerId: string, serviceId: string) => Promise<void>;
    removeWorkerFromService: (workerId: string, serviceId: string) => Promise<void>;
    showToast: (message: string, type: "success" | "error") => void;
    router: any;
}

export function ServiceForm({
    formData,
    setFormData,
    onSubmit,
    onCancel,
    loading,
    editingId,
    workers,
    services,
    tierName,
    enabledFeatures,
    setPremiumFeature,
    setShowPremiumModal,
    minConstraintType,
    setMinConstraintType,
    assignWorkerToService,
    removeWorkerFromService,
    showToast,
    router,
}: ServiceFormProps) {
    return (
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{editingId ? "Upraviť službu" : "Nová služba"}</h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Service Name - Large and Prominent */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Názov služby *</label>
                <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder={
                        formData.calendarType === "DAILY_RENTAL"
                            ? "Napr. Chata pod lesom, Apartmán v centre..."
                            : formData.calendarType === "TABLE_RESERVATION"
                                ? "Napr. Hlavná sála, Terasa, VIP stôl..."
                                : "Napr. Strihanie vlasov, Masáž, Konzultácia..."
                    }
                />
            </div>

            {/* Duration & Price - Side by Side */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {formData.calendarType !== "DAILY_RENTAL" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trvanie (min)</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="5"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                    </div>
                )}
                {formData.calendarType === "HOURLY_SERVICE" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cena (€)</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Enable Bookings Toggle */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        id="bookingEnabled"
                        checked={formData.bookingEnabled}
                        onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">Povoliť rezervácie</span>
                </label>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Booking Type - Visual Cards */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Typ rezervácie</label>
                <div className="grid grid-cols-3 gap-3">
                    {/* Hourly Service */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, calendarType: "HOURLY_SERVICE" })}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center",
                            formData.calendarType === "HOURLY_SERVICE"
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                    >
                        <div className="text-3xl mb-2">⏰</div>
                        <div className="text-sm font-medium text-gray-900">Hodinové</div>
                        <div className="text-xs text-gray-500 mt-1">služby</div>
                    </button>

                    {/* Daily Rental */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isCalendarTypeAllowed(tierName, "DAILY_RENTAL")) {
                                setFormData({ ...formData, calendarType: "DAILY_RENTAL" });
                            } else {
                                setPremiumFeature({ name: "Denný prenájom", description: "Umožnite zákazníkom rezervovať si služby na celé dni." });
                                setShowPremiumModal(true);
                            }
                        }}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center relative",
                            formData.calendarType === "DAILY_RENTAL"
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                            !isCalendarTypeAllowed(tierName, "DAILY_RENTAL") && "opacity-60"
                        )}
                    >
                        {!isCalendarTypeAllowed(tierName, "DAILY_RENTAL") && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full p-1.5 shadow-lg">
                                <Lock size={12} />
                            </div>
                        )}
                        <div className="text-3xl mb-2">📅</div>
                        <div className="text-sm font-medium text-gray-900">Denný</div>
                        <div className="text-xs text-gray-500 mt-1">prenájom</div>
                    </button>

                    {/* Table Reservation */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isCalendarTypeAllowed(tierName, "TABLE_RESERVATION")) {
                                setFormData({ ...formData, calendarType: "TABLE_RESERVATION" });
                            } else {
                                setPremiumFeature({ name: "Rezervácia stolov", description: "Umožnite zákazníkom rezervovať si konkrétne stoly." });
                                setShowPremiumModal(true);
                            }
                        }}
                        className={cn(
                            "p-4 rounded-xl border-2 transition-all text-center relative",
                            formData.calendarType === "TABLE_RESERVATION"
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                            !isCalendarTypeAllowed(tierName, "TABLE_RESERVATION") && "opacity-60"
                        )}
                    >
                        {!isCalendarTypeAllowed(tierName, "TABLE_RESERVATION") && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full p-1.5 shadow-lg">
                                <Lock size={12} />
                            </div>
                        )}
                        <div className="text-3xl mb-2">🪑</div>
                        <div className="text-sm font-medium text-gray-900">Stoly</div>
                        <div className="text-xs text-gray-500 mt-1">rezervácia</div>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Advanced Settings - Collapsible */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Pokročilé nastavenia (voliteľné)</h4>

                {/* Worker Settings */}
                {formData.calendarType === "HOURLY_SERVICE" && (
                    <details className="group">
                        <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-900">Nastavenia pracovníkov</span>
                            </div>
                            <div className="text-gray-400 group-open:rotate-180 transition-transform">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </summary>
                        <div className="p-4 space-y-3 animate-fade-in">
                            {workers.length === 0 ? (
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex items-start gap-3">
                                        <Users size={20} className="text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-900 mb-1">
                                                Najprv pridajte pracovníkov
                                            </p>
                                            <p className="text-xs text-amber-700 mb-3">
                                                Aby ste mohli povoliť výber pracovníka, musíte najprv vytvoriť aspoň jedného pracovníka.
                                            </p>
                                            <a
                                                href="/admin/workers"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 underline"
                                            >
                                                Pridať pracovníka →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
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

                                    {/* Worker Assignment - Show for both creating and editing */}
                                    {formData.allowWorkerSelection && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Users size={18} className="text-blue-600" />
                                                <h5 className="text-sm font-medium text-blue-900">
                                                    {editingId ? "Priradiť pracovníkov" : "Vybrať pracovníkov"}
                                                </h5>
                                            </div>
                                            <p className="text-xs text-blue-700 mb-3">
                                                {editingId
                                                    ? "Vyberte pracovníkov, ktorí môžu poskytovať túto službu"
                                                    : "Vyberte pracovníkov, ktorí budú priradení k tejto službe po uložení"}
                                            </p>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {workers.map((worker) => {
                                                    let isAssigned = false;

                                                    if (editingId) {
                                                        // For editing: check actual assignments
                                                        const service = services.find(s => s.id === editingId);
                                                        isAssigned = service?.workers?.some((sw: any) => sw.workerId === worker.id) || false;
                                                    } else {
                                                        // For creating: use local state (we'll need to add this)
                                                        isAssigned = (formData as any).selectedWorkerIds?.includes(worker.id) || false;
                                                    }

                                                    return (
                                                        <div key={worker.id} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-100">
                                                            <input
                                                                type="checkbox"
                                                                id={`worker-${worker.id}`}
                                                                checked={isAssigned}
                                                                onChange={async (e) => {
                                                                    if (editingId) {
                                                                        // Editing mode: update immediately
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
                                                                    } else {
                                                                        // Creating mode: store in local state
                                                                        const currentIds = (formData as any).selectedWorkerIds || [];
                                                                        const newIds = e.target.checked
                                                                            ? [...currentIds, worker.id]
                                                                            : currentIds.filter((id: string) => id !== worker.id);
                                                                        setFormData({ ...formData, selectedWorkerIds: newIds });
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
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </details>
                )}

                {/* Location Settings */}
                {formData.calendarType === "HOURLY_SERVICE" && (
                    <details className="group">
                        <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <MapPin size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-900">Miesto konania</span>
                            </div>
                            <div className="text-gray-400 group-open:rotate-180 transition-transform">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </summary>
                        <div className="p-4 space-y-3 animate-fade-in">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="locationType"
                                        value="business_address"
                                        checked={formData.locationType === "business_address"}
                                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Adresa firmy</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="locationType"
                                        value="custom_address"
                                        checked={formData.locationType === "custom_address"}
                                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Vlastná adresa</span>
                                </label>

                                {formData.locationType === "custom_address" && (
                                    <input
                                        type="text"
                                        placeholder="Zadajte adresu..."
                                        value={formData.customAddress}
                                        onChange={(e) => setFormData({ ...formData, customAddress: e.target.value })}
                                        className="ml-6 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm w-full"
                                    />
                                )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="locationType"
                                        value="google_meet"
                                        checked={formData.locationType === "google_meet"}
                                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Google Meet (online)</span>
                                </label>

                                {formData.locationType === "google_meet" && (
                                    <p className="ml-6 text-xs text-gray-500">
                                        Google Meet link bude automaticky vytvorený a pridaný do kalendára a emailu.
                                    </p>
                                )}
                            </div>
                        </div>
                    </details>
                )}

                {/* Daily Rental Settings */}
                {formData.calendarType === "DAILY_RENTAL" && (
                    <details className="group" open>
                        <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-900">Nastavenia prenájmu</span>
                            </div>
                            <div className="text-gray-400 group-open:rotate-180 transition-transform">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </summary>
                        <div className="p-4 space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cena za deň (€)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.pricePerDay}
                                    onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                />
                            </div>

                            <div className="flex gap-4 mb-3 border-b border-gray-100">
                                <button
                                    type="button"
                                    className={cn(
                                        "pb-2 text-sm font-medium transition-colors relative",
                                        minConstraintType === 'days' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    )}
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
                                    className={cn(
                                        "pb-2 text-sm font-medium transition-colors relative",
                                        minConstraintType === 'value' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    )}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min. počet nocí</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.minimumDays}
                                        onChange={(e) => setFormData({ ...formData, minimumDays: Number(e.target.value) })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Minimálny počet nocí, ktoré si zákazník musí rezervovať.</p>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min. hodnota (€)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minimumValue}
                                        onChange={(e) => setFormData({ ...formData, minimumValue: Number(e.target.value) })}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Minimálna celková suma objednávky.</p>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {/* Table Reservation Settings */}
                {formData.calendarType === "TABLE_RESERVATION" && (
                    <details className="group" open>
                        <summary className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors list-none">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🪑</span>
                                <span className="font-medium text-gray-900">Nastavenia stolov</span>
                            </div>
                            <div className="text-gray-400 group-open:rotate-180 transition-transform">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </summary>
                        <div className="p-4 space-y-3 animate-fade-in">
                            <div className="flex items-center gap-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max. kapacita (osôb)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxCapacity}
                                        onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                                        className="w-full max-w-[100px] p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            )}
                            {formData.requiresTable && (
                                <p className="text-xs text-gray-500">
                                    Kapacita bude určená vybraným stolom. <a href="/admin/tables" className="text-blue-600 hover:underline">Spravovať stoly</a>
                                </p>
                            )}
                        </div>
                    </details>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                >
                    Zrušiť
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    Uložiť
                </button>
            </div>
        </form>
    );
}
