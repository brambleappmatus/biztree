"use client";

import { useState, useEffect } from "react";
import { toggleLifetimeDeals, getLifetimeDealsStatus } from "./actions";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [lifetimeEnabled, setLifetimeEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const status = await getLifetimeDealsStatus();
            setLifetimeEnabled(status);
        } catch (error) {
            showToast("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (enabled: boolean) => {
        setSaving(true);
        try {
            await toggleLifetimeDeals(enabled);
            setLifetimeEnabled(enabled);
            showToast(
                enabled
                    ? "Lifetime deals enabled! Restart server to apply changes."
                    : "Lifetime deals disabled! Restart server to apply changes.",
                "success"
            );
        } catch (error: any) {
            showToast(error.message || "Failed to update settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Manage global application settings
                </p>
            </div>

            {/* Lifetime Deals Toggle */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Lifetime Deals
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl">
                            Enable or disable lifetime deal pricing options on the subscription page.
                            When enabled, users will see a "Lifetime" toggle option alongside Monthly and Yearly pricing.
                        </p>
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                                ⚠️ <strong>Important:</strong> After changing this setting, you must restart the development server
                                for changes to take effect.
                            </p>
                        </div>
                    </div>

                    <div className="ml-6">
                        <button
                            onClick={() => handleToggle(!lifetimeEnabled)}
                            disabled={saving}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${lifetimeEnabled
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${lifetimeEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Current Status:</span>
                        <span className={`font-semibold ${lifetimeEnabled
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {lifetimeEnabled ? '✓ Enabled' : '✗ Disabled'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 How Lifetime Deals Work
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Users pay once and get permanent access to their tier</li>
                    <li>• No recurring billing or subscription management needed</li>
                    <li>• Prices are configured in Stripe as one-time payments</li>
                    <li>• Great for limited-time promotions and special offers</li>
                </ul>
            </div>
        </div>
    );
}
