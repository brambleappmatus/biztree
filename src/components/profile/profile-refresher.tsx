"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProfileRefresher() {
    const router = useRouter();

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data === "refresh-profile") {
                router.refresh();
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [router]);

    return null;
}
