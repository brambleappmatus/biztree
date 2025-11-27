"use client";

import { useState } from "react";
import { cancelSubscription } from "@/app/admin/subscription/actions";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface CancelSubscriptionButtonProps {
    subscriptionStatus: string | null;
}

export function CancelSubscriptionButton({ subscriptionStatus }: CancelSubscriptionButtonProps) {
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Only show if user has an active subscription or trial
    if (!subscriptionStatus || (subscriptionStatus !== 'ACTIVE' && subscriptionStatus !== 'TRIAL')) {
        return null;
    }

    const handleCancel = async () => {
        setLoading(true);
        try {
            await cancelSubscription();
            showToast(
                subscriptionStatus === 'TRIAL'
                    ? "Skúšobná doba bola zrušená"
                    : "Predplatné bude zrušené na konci obdobia",
                "success"
            );
            setShowModal(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            showToast(error.message || "Nepodarilo sa zrušiť predplatné", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-center pt-8 pb-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline decoration-dotted underline-offset-4"
                >
                    {subscriptionStatus === 'TRIAL'
                        ? "Zrušiť skúšobnú dobu"
                        : "Zrušiť predplatné"}
                </button>
            </div>

            <ConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleCancel}
                title={subscriptionStatus === 'TRIAL' ? "Zrušiť skúšobnú dobu?" : "Zrušiť predplatné?"}
                description={
                    subscriptionStatus === 'TRIAL'
                        ? "Vaša skúšobná doba bude okamžite zrušená a budete presunutý na Free plán. Nebudete účtovaný."
                        : "Vaše predplatné bude zrušené na konci aktuálneho obdobia. Budete mať prístup k funkciám až do vypršania."
                }
                confirmText={subscriptionStatus === 'TRIAL' ? "Zrušiť skúšobnú dobu" : "Zrušiť predplatné"}
                cancelText="Ponechať"
                variant="danger"
            />
        </>
    );
}
