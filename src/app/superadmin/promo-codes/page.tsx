"use client";

import { useState, useEffect } from "react";
import { getPromoCodes, createPromoCode, togglePromoCodeStatus, deletePromoCode, generatePromoCode } from "./actions";
import { getTiersList } from "../actions";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiInput } from "@/components/ui/mui-input";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface PromoCode {
    id: string;
    code: string;
    description: string | null;
    type: string;
    value: any;
    maxUses: number | null;
    currentUses: number;
    validFrom: Date;
    validUntil: Date | null;
    isActive: boolean;
    applicableTierIds: string[];
}

interface Tier {
    id: string;
    name: string;
}

export default function PromoCodesPage() {
    const { showToast } = useToast();
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteData, setDeleteData] = useState<{ id: string; code: string } | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        type: "PERCENTAGE",
        value: "",
        maxUses: "",
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: "",
        applicableTierIds: [] as string[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [promoCodesData, tiersData] = await Promise.all([
                getPromoCodes(),
                getTiersList()
            ]);
            setPromoCodes(promoCodesData);
            setTiers(tiersData);
        } catch (error) {
            console.error(error);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await createPromoCode({
                code: formData.code,
                description: formData.description || undefined,
                type: formData.type,
                value: parseFloat(formData.value),
                maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
                validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
                validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
                applicableTierIds: formData.applicableTierIds
            });

            if (result.error) {
                showToast(result.error, "error");
            } else {
                setShowCreateModal(false);
                setFormData({
                    code: "",
                    description: "",
                    type: "PERCENTAGE",
                    value: "",
                    maxUses: "",
                    validFrom: new Date().toISOString().split('T')[0],
                    validUntil: "",
                    applicableTierIds: []
                });
                await loadData();
                showToast("Promo code created", "success");
            }
        } catch (error) {
            showToast("Failed to create promo code", "error");
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await togglePromoCodeStatus(id);
            await loadData();
            showToast("Status updated", "success");
        } catch (error) {
            showToast("Failed to update status", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteData) return;

        try {
            await deletePromoCode(deleteData.id);
            await loadData();
            showToast("Promo code deleted", "success");
            setDeleteData(null);
        } catch (error) {
            showToast("Failed to delete promo code", "error");
        }
    };

    const handleGenerateCode = () => {
        setFormData({ ...formData, code: generatePromoCode() });
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "PERCENTAGE": return "Percentage";
            case "FIXED_AMOUNT": return "Fixed Amount";
            case "FREE_TRIAL_DAYS": return "Free Trial Days";
            default: return type;
        }
    };

    const getValueDisplay = (type: string, value: any) => {
        switch (type) {
            case "PERCENTAGE": return `${value}%`;
            case "FIXED_AMOUNT": return `€${value}`;
            case "FREE_TRIAL_DAYS": return `${value} days`;
            default: return value;
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Promo Codes</h1>
                <MuiButton onClick={() => setShowCreateModal(true)} startIcon={<Plus size={18} />}>
                    Create Promo Code
                </MuiButton>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Code</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Value</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Usage</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Valid Until</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                            <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promoCodes.map((promo) => (
                            <tr key={promo.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{promo.code}</div>
                                    {promo.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{promo.description}</div>
                                    )}
                                </td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{getTypeLabel(promo.type)}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{getValueDisplay(promo.type, promo.value)}</td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">
                                    {promo.currentUses} / {promo.maxUses || "∞"}
                                </td>
                                <td className="p-4 text-gray-700 dark:text-gray-300">{formatDate(promo.validUntil)}</td>
                                <td className="p-4">
                                    {promo.isActive ? (
                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">Active</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Inactive</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(promo.id)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            title={promo.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {promo.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                        </button>
                                        <button
                                            onClick={() => setDeleteData({ id: promo.id, code: promo.code })}
                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Promo Code</h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <MuiInput
                                        label="Code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                                <MuiButton
                                    type="button"
                                    variant="outlined"
                                    onClick={handleGenerateCode}
                                    startIcon={<Sparkles size={16} />}
                                    className="mt-6"
                                >
                                    Generate
                                </MuiButton>
                            </div>

                            <MuiInput
                                label="Description (Optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    >
                                        <option value="PERCENTAGE">Percentage Off</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                                        <option value="FREE_TRIAL_DAYS">Free Trial Days</option>
                                    </select>
                                </div>

                                <MuiInput
                                    label="Value"
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    required
                                />
                            </div>

                            <MuiInput
                                label="Max Uses (Optional)"
                                type="number"
                                value={formData.maxUses}
                                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Valid From
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Valid Until (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Applicable Tiers (Optional - leave empty for all tiers)
                                </label>
                                <div className="space-y-2">
                                    {tiers.map((tier) => (
                                        <label key={tier.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.applicableTierIds.includes(tier.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFormData({
                                                            ...formData,
                                                            applicableTierIds: [...formData.applicableTierIds, tier.id]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            applicableTierIds: formData.applicableTierIds.filter(id => id !== tier.id)
                                                        });
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{tier.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <MuiButton
                                    type="button"
                                    variant="outlined"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </MuiButton>
                                <MuiButton
                                    type="submit"
                                    className="flex-1"
                                >
                                    Create
                                </MuiButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deleteData}
                onClose={() => setDeleteData(null)}
                onConfirm={handleDelete}
                title="Delete Promo Code?"
                description={`Are you sure you want to delete promo code "${deleteData?.code}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
