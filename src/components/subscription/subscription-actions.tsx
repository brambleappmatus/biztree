"use client";

import { useState } from "react";
import { MuiButton } from "@/components/ui/mui-button";
import { useToast } from "@/components/ui/toast";
import { createCheckoutSession, createPortalSession, cancelSubscription, reactivateSubscription } from "@/app/admin/subscription/actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { PromoCodeModal } from "@/components/subscription/promo-code-modal";
import { Loader2, Tag, Check, ArrowRight, ArrowDown } from "lucide-react";

interface SubscriptionActionsProps {
    tierId: string | null;
    tierName: string;
    priceId: string;
    hasActiveSubscription: boolean;
    cancelAtPeriodEnd: boolean;
    isDowngrade?: boolean;
    isFree?: boolean;
}

export function SubscriptionActions({
    tierId,
    tierName,
    priceId,
    hasActiveSubscription,
    cancelAtPeriodEnd,
    isDowngrade = false,
    isFree = false
}: SubscriptionActionsProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);

    const handleCheckout = async (code?: string) => {
        setLoading(true);
        try {
            const url = await createCheckoutSession(priceId, code || promoCode || undefined);
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("Nepodarilo sa získať URL pre platbu");
            }
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa vytvoriť checkout", "error");
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const url = await createPortalSession();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("Nepodarilo sa získať URL portálu");
            }
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa otvoriť portál", "error");
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        setLoading(true);
        try {
            await cancelSubscription();
            showToast("Predplatné bude zrušené na konci obdobia", "success");
            setShowCancelModal(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa zrušiť predplatné", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        setLoading(true);
        try {
            await reactivateSubscription();
            showToast("Predplatné bolo obnovené", "success");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa obnoviť predplatné", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPromo = (code: string) => {
        setPromoCode(code);
        setShowPromoModal(false);
        showToast("Promo kód bol aplikovaný", "success");
    };

    // Case 1: Downgrade to Free (Cancel)
    if (isDowngrade && isFree) {
        return (
            <div className="pt-4">
                <MuiButton
                    onClick={() => setShowCancelModal(true)}
                    disabled={loading}
                    variant="outlined"
                    className="w-full h-10 text-sm rounded-xl normal-case bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <div className="flex items-center justify-center gap-2 w-full">
                            <ArrowDown className="w-4 h-4 opacity-60" />
                            <span>Zmeniť</span>
                        </div>
                    )}
                </MuiButton>

                <ConfirmationModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelSubscription}
                    title="Prejsť na Free plán?"
                    description="Vaše aktuálne predplatné bude zrušené na konci fakturačného obdobia. Potom budete automaticky prepnutý na Free plán."
                    confirmText="Potvrdiť zmenu"
                    cancelText="Zrušiť"
                    variant="default"
                />
            </div>
        );
    }

    // Case 2: Downgrade to Paid Tier (Redirect to Portal)
    if (isDowngrade && !isFree) {
        return (
            <div className="pt-4">
                <MuiButton
                    onClick={handleManageSubscription}
                    disabled={loading}
                    variant="outlined"
                    className="w-full h-10 text-sm rounded-xl normal-case bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <div className="flex items-center justify-center gap-2 w-full">
                            <ArrowDown className="w-4 h-4 opacity-60" />
                            <span>Zmeniť</span>
                        </div>
                    )}
                </MuiButton>
                <p className="text-xs text-center text-gray-500 mt-2">
                    Zmena prebehne cez zákaznícky portál
                </p>
            </div>
        );
    }

    // Case 3: Current Active Subscription (Manage/Cancel)
    if (hasActiveSubscription && !isDowngrade) { // Added !isDowngrade check to be safe, though logic above handles it
        return (
            <div className="space-y-4 pt-4">
                {cancelAtPeriodEnd ? (
                    <>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                Vaše predplatné bude zrušené na konci aktuálneho obdobia. Budete mať prístup až do vypršania.
                            </p>
                        </div>
                        <MuiButton
                            onClick={handleReactivate}
                            disabled={loading}
                            className="w-full h-10 text-sm rounded-xl normal-case"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Obnoviť predplatné
                        </MuiButton>
                    </>
                ) : (
                    <>
                        <MuiButton
                            onClick={handleManageSubscription}
                            disabled={loading}
                            className="w-full h-10 text-sm rounded-xl normal-case bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Spravovať fakturáciu
                        </MuiButton>

                        <div className="flex justify-center pt-2">
                            <button
                                onClick={() => setShowCancelModal(true)}
                                disabled={loading}
                                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Zrušiť predplatné
                            </button>
                        </div>
                    </>
                )}

                <ConfirmationModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    onConfirm={handleCancelSubscription}
                    title="Zrušiť predplatné?"
                    description="Vaše predplatné bude zrušené na konci aktuálneho obdobia. Budete mať prístup k funkciám až do vypršania."
                    confirmText="Zrušiť predplatné"
                    cancelText="Ponechať predplatné"
                    variant="danger"
                />
            </div>
        );
    }

    // Case 4: Upgrade / New Subscription
    return (
        <div className="space-y-4 pt-4">
            {/* Promo Code Trigger */}
            {promoCode ? (
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Tag className="w-4 h-4" />
                        <span className="font-medium">{promoCode}</span>
                        <span className="text-xs opacity-75">(Aplikovaný)</span>
                    </div>
                    <button
                        onClick={() => setPromoCode("")}
                        className="text-xs text-green-600 hover:text-green-800 dark:hover:text-green-300 px-2 py-1"
                    >
                        Zmeniť
                    </button>
                </div>
            ) : (
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowPromoModal(true)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Máte promo kód?
                    </button>
                </div>
            )}

            {/* Main Action Button */}
            <div className="space-y-2">
                <MuiButton
                    onClick={() => handleCheckout()}
                    disabled={loading}
                    className="w-full h-10 text-sm rounded-xl normal-case font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <div className="flex items-center justify-center gap-2 w-full">
                            <span>Zmeniť</span>
                            <ArrowRight className="w-4 h-4 opacity-90" />
                        </div>
                    )}
                </MuiButton>

                {/* Trial Badge - moved inside button container */}
                <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs">
                        <Check className="w-3 h-3" />
                        7 dní zadarmo
                    </span>
                </div>
            </div>

            <PromoCodeModal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                onApply={handleApplyPromo}
            />
        </div>
    );
}
