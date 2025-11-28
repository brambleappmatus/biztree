"use client";

import { useEffect } from "react";
import { syncSubscriptionStatus } from "@/app/admin/subscription/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function SubscriptionSyncer() {
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        const sync = async () => {
            const result = await syncSubscriptionStatus();
            if (result?.success) {
                router.refresh();
                // Optional: showToast("Subscription status synced", "success");
            }
        };

        sync();
    }, [router, showToast]);

    return null;
}
