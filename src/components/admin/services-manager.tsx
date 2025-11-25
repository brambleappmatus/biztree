"use client";

import React, { useState } from "react";
import { Service } from "@prisma/client";
import { createService, updateService, deleteService } from "@/app/actions";
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface ServicesManagerProps {
    profileId: string;
    services: Service[];
    isGoogleConnected: boolean;
}

export default function ServicesManager({ profileId, services, isGoogleConnected }: ServicesManagerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        duration: 30,
        price: 0,
        bookingEnabled: true,
    });

    const resetForm = () => {
        setFormData({ name: "", duration: 30, price: 0, bookingEnabled: true });
        setEditingId(null);
        setIsCreating(false);
    };

    const handleEdit = (service: Service) => {
        setFormData({
            name: service.name,
            duration: service.duration,
            price: Number(service.price),
            bookingEnabled: service.bookingEnabled ?? true,
        });
        setEditingId(service.id);
        setIsCreating(false);
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
            <div className="space-y-6 max-w-3xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Zoznam služieb</h2>
                    <button
                        onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ name: "", duration: 30, price: 0, bookingEnabled: true }); }}
                        disabled={isCreating || !!editingId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Plus size={16} />
                        Pridať službu
                    </button>
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
                            onClick={() => window.location.href = `/api/google-calendar/connect?profileId=${profileId}`}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
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
                                    placeholder="Napr. Strihanie vlasov"
                                />
                            </div>
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
                        services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-blue-100 transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium">{service.name}</h3>
                                        {!service.bookingEnabled && (
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
                                        onClick={() => handleEdit(service)}
                                        disabled={loading || isCreating || !!editingId}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                                    >
                                        <Pencil size={18} />
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
                        ))
                    )}
                </div>
            </div>

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
        </>
    );
}
