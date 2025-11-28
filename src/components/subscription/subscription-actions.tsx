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
    mode?: 'subscription' | 'payment';
    buttonText?: string;
    redirectUrl?: string;
    stripeSubscriptionId?: string | null;
    isYearly?: boolean;
    hasUsedTrial?: boolean;
    isCurrentTier?: boolean;
}

export function SubscriptionActions({
    tierId,
    tierName,
    priceId,
    hasActiveSubscription,
    cancelAtPeriodEnd,
    isDowngrade = false,
    isFree = false,
    mode = 'subscription',
    buttonText = "Zmeniť",
    redirectUrl,
    stripeSubscriptionId,
    isYearly = false,
    hasUsedTrial = false,
    isCurrentTier = false
}: SubscriptionActionsProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);

    const handleCheckout = async (code?: string) => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
        }

        setLoading(true);
        try {
            const url = await createCheckoutSession(priceId, code || promoCode || undefined, mode);
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

    // Case 0: Current Free Plan
    if (isFree && isCurrentTier) {
        return (
            <div className="pt-4">
                <div className="w-full h-10 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-default">
                    Aktuálny plán
                </div>
            </div>
        );
    }

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

    // Case 2: Downgrade to Paid Tier
    if (isDowngrade && !isFree) {
        // If it's a trial (no Stripe subscription), start a new checkout
        if (!stripeSubscriptionId) {
            return (
                <div className="pt-4">
                    <MuiButton
                        onClick={() => handleCheckout()}
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
                </div>
            );
        }

        // If it's a paid subscription, use Stripe portal
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
    // Only show if it's the current tier card
    if (hasActiveSubscription && isCurrentTier) {
        return (
            <div className="space-y-4 pt-4">
                {cancelAtPeriodEnd ? (
                    <>
                        <div className="flex justify-center group relative">
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <span>Ukončené</span>
                                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] cursor-help">
                                    i
                                </span>
                            </p>
                            {/* Tooltip on hover */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 text-center">
                                Predplatné bude zrušené na konci obdobia. Prístup k funkciám máte až do vypršania.
                            </div>
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
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={handleManageSubscription}
                            disabled={loading}
                            className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1.5"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Spravovať fakturáciu
                        </button>

                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={loading}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                            Zrušiť predplatné
                        </button>
                    </div>
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
            {/* Promo Code Trigger - Hidden for now */}
            {/* ... */}

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
                            <span>{buttonText}</span>
                            <ArrowRight className="w-4 h-4 opacity-90" />
                        </div>
                    )}
                </MuiButton>

                {/* Trial Badge - only show for monthly subscriptions, not yearly or lifetime, AND if trial not used, AND not Free tier */}
                {mode === 'subscription' && !isYearly && !hasUsedTrial && !isFree && (
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs">
                            <Check className="w-3 h-3" />
                            7 dní zadarmo
                        </span>
                    </div>
                )}
            </div>

            <PromoCodeModal
                isOpen={showPromoModal}
                onClose={() => setShowPromoModal(false)}
                onApply={handleApplyPromo}
            />
        </div>
    );
}
