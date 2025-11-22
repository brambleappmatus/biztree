"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProfileRefresher() {
    const router = useRouter();

    useEffect(() => {
        const handleRefresh = () => {
            console.log("ProfileRefresher: Refreshing via profile-updated event");
            router.refresh();
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.data === 'refresh-profile') {
                console.log("ProfileRefresher: Refreshing via postMessage");
                router.refresh();
            }
        };

        window.addEventListener("profile-updated", handleRefresh);
        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("profile-updated", handleRefresh);
            window.removeEventListener("message", handleMessage);
        };
    }, [router]);

    return null;
}
