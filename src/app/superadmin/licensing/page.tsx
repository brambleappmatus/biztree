"use client";

import { useState, useEffect } from "react";
import { getTiers, getFeatures, updateTierFeatures, createTier, createFeature } from "./actions";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiInput } from "@/components/ui/mui-input";
import { useToast } from "@/components/ui/toast";
import { Check, X, Loader2 } from "lucide-react";

export default function LicensingPage() {
    const { showToast } = useToast();
    const [tiers, setTiers] = useState<any[]>([]);
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // New Tier/Feature state
    const [newTierName, setNewTierName] = useState("");
    const [newTierPrice, setNewTierPrice] = useState("");
    const [newFeatureKey, setNewFeatureKey] = useState("");
    const [newFeatureName, setNewFeatureName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tiersData, featuresData] = await Promise.all([getTiers(), getFeatures()]);
            setTiers(tiersData);
            setFeatures(featuresData);
        } catch (error) {
            console.error(error);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeature = async (tierId: string, featureId: string, isEnabled: boolean) => {
        setUpdating(`${tierId}-${featureId}`);
        try {
            const tier = tiers.find(t => t.id === tierId);
            if (!tier) return;

            const currentFeatureIds = tier.features.map((f: any) => f.featureId);
            let newFeatureIds;

            if (isEnabled) {
                newFeatureIds = [...currentFeatureIds, featureId];
            } else {
                newFeatureIds = currentFeatureIds.filter((id: string) => id !== featureId);
            }

            await updateTierFeatures(tierId, newFeatureIds);
            await loadData();
            showToast("Updated successfully", "success");
        } catch (error) {
            showToast("Failed to update", "error");
        } finally {
            setUpdating(null);
        }
    };

    const handleCreateTier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTier(newTierName, parseFloat(newTierPrice));
            setNewTierName("");
            setNewTierPrice("");
            await loadData();
            showToast("Tier created", "success");
        } catch (error) {
            showToast("Failed to create tier", "error");
        }
    };

    const handleCreateFeature = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createFeature(newFeatureKey, newFeatureName);
            setNewFeatureKey("");
            setNewFeatureName("");
            await loadData();
            showToast("Feature created", "success");
        } catch (error) {
            showToast("Failed to create feature", "error");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Licensing Management</h1>

            {/* Creation Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Tier</h2>
                    <form onSubmit={handleCreateTier} className="space-y-4">
                        <MuiInput
                            label="Name"
                            value={newTierName}
                            onChange={(e) => setNewTierName(e.target.value)}
                            required
                        />
                        <MuiInput
                            label="Price"
                            type="number"
                            value={newTierPrice}
                            onChange={(e) => setNewTierPrice(e.target.value)}
                            required
                        />
                        <MuiButton type="submit">Create Tier</MuiButton>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Feature</h2>
                    <form onSubmit={handleCreateFeature} className="space-y-4">
                        <MuiInput
                            label="Key (e.g. page_dashboard)"
                            value={newFeatureKey}
                            onChange={(e) => setNewFeatureKey(e.target.value)}
                            required
                        />
                        <MuiInput
                            label="Display Name"
                            value={newFeatureName}
                            onChange={(e) => setNewFeatureName(e.target.value)}
                            required
                        />
                        <MuiButton type="submit">Create Feature</MuiButton>
                    </form>
                </div>
            </div>

            {/* Matrix */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                            <th className="p-4 text-left font-medium text-gray-500 dark:text-gray-400">Feature / Tier</th>
                            {tiers.map(tier => (
                                <th key={tier.id} className="p-4 text-center font-medium text-gray-900 dark:text-gray-100">
                                    {tier.name}
                                    <div className="text-xs text-gray-500 font-normal">€{tier.price}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {features.map(feature => (
                            <tr key={feature.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{feature.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">{feature.key}</div>
                                </td>
                                {tiers.map(tier => {
                                    const isEnabled = tier.features.some((f: any) => f.featureId === feature.id);
                                    const isUpdating = updating === `${tier.id}-${feature.id}`;

                                    return (
                                        <td key={tier.id} className="p-4 text-center">
                                            <button
                                                onClick={() => handleToggleFeature(tier.id, feature.id, !isEnabled)}
                                                disabled={isUpdating}
                                                className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors mx-auto
                                                    ${isEnabled
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500'}
                                                `}
                                            >
                                                {isUpdating ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : isEnabled ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <X size={16} />
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
