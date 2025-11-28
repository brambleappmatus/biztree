"use client";

import { useState } from "react";
import { createPortalSession } from "@/app/admin/subscription/actions";
import { useToast } from "@/components/ui/toast";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Calendar, Shield, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageSubscriptionButtonProps {
    subscriptionStatus: string | null;
    currentTier: any;
    activeSubscription: any;
    priceIds: {
        monthly: Record<string, string>;
        yearly: Record<string, string>;
        lifetime: Record<string, string>;
    };
}

export function CancelSubscriptionButton({
    subscriptionStatus,
    currentTier,
    activeSubscription,
    priceIds
}: ManageSubscriptionButtonProps) {
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Only show if user has an active subscription or trial
    if (!subscriptionStatus || (subscriptionStatus !== 'ACTIVE' && subscriptionStatus !== 'TRIAL')) {
        return null;
    }

    const handleManage = async () => {
        setLoading(true);
        try {
            const url = await createPortalSession();
            window.location.href = url;
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa otvoriť zákaznícky portál", "error");
            setLoading(false);
        }
    };

    // Determine billing cycle
    const getBillingCycle = () => {
        if (!activeSubscription?.stripePriceId) return 'Mesačne';
        const priceId = activeSubscription.stripePriceId;

        if (Object.values(priceIds.lifetime).includes(priceId)) return 'Navždy (Lifetime)';
        if (Object.values(priceIds.yearly).includes(priceId)) return 'Ročne';
        return 'Mesačne';
    };

    const billingCycle = getBillingCycle();
    const expiresAt = activeSubscription?.currentPeriodEnd ? new Date(activeSubscription.currentPeriodEnd) : null;

    return (
        <>
            <div className="text-center pt-8 pb-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors underline decoration-dotted underline-offset-4"
                >
                    Manažovať predplatné
                </button>
            </div>

            {/* Custom Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Manažovať predplatné
                                        </h3>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {/* Current Plan */}
                                        <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Aktuálny plán</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{currentTier?.name || 'Unknown'}</p>
                                            </div>
                                        </div>

                                        {/* Billing Cycle */}
                                        <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Fakturácia</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{billingCycle}</p>
                                            </div>
                                        </div>

                                        {/* Next Payment / Expiration */}
                                        <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                                    {activeSubscription?.cancelAtPeriodEnd ? 'Platnosť končí' : 'Ďalšia platba'}
                                                </p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {expiresAt ? expiresAt.toLocaleDateString('sk-SK') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Zatvoriť
                                        </button>
                                        <button
                                            onClick={handleManage}
                                            disabled={loading}
                                            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? "Načítavam..." : (
                                                <>
                                                    Spravovať platby
                                                    <ExternalLink size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
