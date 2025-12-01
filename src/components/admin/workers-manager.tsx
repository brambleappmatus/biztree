"use client";

import React, { useState } from "react";
import { Worker } from "@prisma/client";
import { createWorker, updateWorker, deleteWorker } from "@/app/actions/calendar";
import { Loader2, Plus, Pencil, Trash2, X, Check, Upload, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PremiumModal } from "@/components/ui/premium-modal";
import Image from "next/image";

import { checkWorkerLimit, getPlanLimits } from "@/lib/subscription-limits";
import { Lock } from "lucide-react";

interface WorkersManagerProps {
    profileId: string;
    workers: Worker[];
    tierName?: string;
}

export default function WorkersManager({ profileId, workers, tierName }: WorkersManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState<{ name?: string, description?: string }>({});

    const router = useRouter();
    const { showToast } = useToast();

    const isLocked = !checkWorkerLimit(tierName, workers.length);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
        isActive: true
    });

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            imageUrl: "",
            isActive: true
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (worker: Worker) => {
        setFormData({
            name: worker.name,
            description: worker.description || "",
            imageUrl: worker.imageUrl || "",
            isActive: worker.isActive
        });
        setEditingId(worker.id);
        setIsAdding(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
            showToast("Profilová fotka bola úspešne nahraná.", "success");
        } catch (error) {
            console.error("Upload error:", error);
            showToast("Nepodarilo sa nahrať obrázok.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (editingId) {
                await updateWorker(editingId, formData);
                showToast("Údaje pracovníka boli úspešne aktualizované.", "success");
            } else {
                await createWorker(profileId, formData);
                showToast("Nový pracovník bol úspešne pridaný.", "success");
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
            await deleteWorker(deleteId);
            showToast("Pracovník bol úspešne odstránený.", "success");
            router.refresh();
        } catch (error) {
            showToast("Nepodarilo sa odstrániť pracovníka.", "error");
        } finally {
            setIsLoading(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Zoznam pracovníkov</h2>
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
                        Pridať pracovníka
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">
                            {editingId ? "Upraviť pracovníka" : "Nový pracovník"}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-6">
                            {/* Image Upload */}
                            <div className="flex-shrink-0">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group hover:border-gray-400 transition-colors">
                                    {formData.imageUrl ? (
                                        <Image
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <User className="w-8 h-8 mb-2" />
                                            <span className="text-xs">Fotka</span>
                                        </div>
                                    )}

                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        {uploading ? (
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        ) : (
                                            <Upload className="w-6 h-6 text-white" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Meno a priezvisko
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="napr. Ján Novák"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Popis / Pozícia
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="napr. Senior Kaderník"
                                    />
                                </div>

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
                                disabled={isLoading || uploading}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? "Uložiť zmeny" : "Vytvoriť pracovníka"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workers.map((worker, index) => {
                    const limits = getPlanLimits(tierName);
                    const isOverLimit = index >= limits.maxWorkers;

                    return (
                        <div
                            key={worker.id}
                            className={`group relative flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl transition-all ${isOverLimit ? "opacity-75 bg-gray-50" : "hover:border-blue-500 hover:shadow-md"
                                }`}
                        >
                            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                {worker.imageUrl ? (
                                    <Image
                                        src={worker.imageUrl}
                                        alt={worker.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-base">{worker.name}</h3>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                if (isOverLimit) {
                                                    setPremiumFeature({ name: "Limit pracovníkov", description: "Thto pracovníka nemôžete upravovať, pretože presahuje limit vášho balíka." });
                                                    setShowPremiumModal(true);
                                                    return;
                                                }
                                                handleEdit(worker);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {isOverLimit ? <Lock className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(worker.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {isOverLimit && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold mb-1">
                                        <Lock size={10} />
                                        Mimo limitu
                                    </span>
                                )}
                                {worker.description && (
                                    <p className="text-sm text-gray-500 truncate">{worker.description}</p>
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${worker.isActive
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-red-500/10 text-red-400"
                                        }`}>
                                        {worker.isActive ? "Aktívny" : "Neaktívny"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {workers.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 border border-gray-200 rounded-xl border-dashed">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Zatiaľ nemáte žiadnych pracovníkov</p>
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
                            Pridať prvého pracovníka
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Odstrániť pracovníka"
                description="Naozaj chcete odstrániť tohto pracovníka? Táto akcia je nevratná."
                confirmText="Odstrániť"
                cancelText="Zrušiť"
                variant="danger"
            />

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                featureName="Správa pracovníkov"
                description="Pridaťte ďalších pracovníkov do vášho tímu a spravujte ich rezervácie."
            />
        </div>
    );
}
