"use client";

import React, { useState } from "react";
import { Table } from "@prisma/client";
import { createTable, updateTable, deleteTable } from "@/app/actions/calendar";
import { Loader2, Plus, Pencil, Trash2, X, LayoutGrid, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PremiumModal } from "@/components/ui/premium-modal";
import { isFeatureAllowed } from "@/lib/subscription-limits";
import { Lock } from "lucide-react";

interface TablesManagerProps {
    profileId: string;
    tables: Table[];
    tierName?: string;
}

export default function TablesManager({ profileId, tables, tierName }: TablesManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const router = useRouter();
    const { showToast } = useToast();

    const isLocked = !isFeatureAllowed(tierName, 'tables');
    const [formData, setFormData] = useState({
        name: "",
        capacity: 4,
        shape: "rectangle",
        isActive: true
    });

    const resetForm = () => {
        setFormData({
            name: "",
            capacity: 4,
            shape: "rectangle",
            isActive: true
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (table: Table) => {
        setFormData({
            name: table.name,
            capacity: table.capacity,
            shape: table.shape,
            isActive: table.isActive
        });
        setEditingId(table.id);
        setIsAdding(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (editingId) {
                await updateTable(editingId, formData);
                showToast("Údaje stola boli úspešne aktualizované.", "success");
            } else {
                await createTable(profileId, formData);
                showToast("Nový stôl bol úspešne pridaný.", "success");
            }
            router.refresh();
            resetForm();
        } catch (error) {
            showToast("Nastala chyba pri ukladaní údajov.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsLoading(true);
        try {
            await deleteTable(deleteId);
            showToast("Stôl bol úspešne odstránený.", "success");
            router.refresh();
        } catch (error) {
            showToast("Nepodarilo sa odstrániť stôl.", "error");
        } finally {
            setIsLoading(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Zoznam stolov</h2>
                {!isAdding && (
                    <button
                        onClick={() => {
                            if (isLocked) {
                                setShowPremiumModal(true);
                                return;
                            }
                            setIsAdding(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${isLocked ? "bg-blue-600/50 text-white/50 hover:bg-blue-600/60" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                        {isLocked && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg z-10">
                                <Lock className="w-3 h-3 text-white" />
                            </span>
                        )}
                        <Plus className="w-4 h-4" />
                        Pridať stôl
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">
                            {editingId ? "Upraviť stôl" : "Nový stôl"}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Názov / Číslo stola
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="napr. Stôl 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Kapacita (osôb)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Tvar
                                </label>
                                <select
                                    value={formData.shape}
                                    onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="rectangle">Obdĺžnik</option>
                                    <option value="circle">Kruh</option>
                                    <option value="square">Štvorec</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">
                                        Aktívny (možné rezervovať)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Zrušiť
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? "Uložiť zmeny" : "Vytvoriť stôl"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all shadow-sm"
                    >
                        <div className="flex flex-col gap-4">
                            {/* Header with shape and actions */}
                            <div className="flex justify-between items-start">
                                <div className="flex-shrink-0 flex items-center justify-center">
                                    {table.shape === 'circle' ? (
                                        <svg width="32" height="32" viewBox="0 0 32 32" className="text-gray-400">
                                            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    ) : table.shape === 'rectangle' ? (
                                        <svg width="40" height="24" viewBox="0 0 40 24" className="text-gray-400">
                                            <rect x="1" y="1" width="38" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    ) : (
                                        <svg width="28" height="28" viewBox="0 0 28 28" className="text-gray-400">
                                            <rect x="1" y="1" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                        onClick={() => handleEdit(table)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(table.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Table name */}
                            <h3 className="font-medium text-base leading-tight">{table.name}</h3>

                            {/* Info row */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Users className="w-4 h-4" />
                                    <span>{table.capacity}</span>
                                </div>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${table.isActive
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-red-500/10 text-red-600"
                                    }`}>
                                    {table.isActive ? "Aktívny" : "Neaktívny"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {tables.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
                        <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Zatiaľ nemáte žiadne stoly</p>
                        <button
                            onClick={() => {
                                if (isLocked) {
                                    setShowPremiumModal(true);
                                    return;
                                }
                                setIsAdding(true);
                            }}
                            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all mx-auto relative ${isLocked ? "bg-blue-600/50 text-white/50 hover:bg-blue-600/60" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                            {isLocked && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg z-10">
                                    <Lock className="w-3 h-3 text-white" />
                                </span>
                            )}
                            Pridať prvý stôl
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Odstrániť stôl"
                description="Naozaj chcete odstrániť tento stôl? Táto akcia je nevratná."
                confirmText="Odstrániť"
                cancelText="Zrušiť"
                variant="danger"
            />

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                featureName="Správa stolov"
                description="Vytvorte si digitálnu mapu vašej prevádzky a spravujte rezervácie konkrétnych stolov."
            />
        </div>
    );
}
