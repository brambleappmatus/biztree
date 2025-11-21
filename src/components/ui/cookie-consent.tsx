"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if we are in preview mode
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("preview") === "true") {
            return;
        }

        // Check if user has already consented
        const consent = localStorage.getItem("biztree-cookie-consent");
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("biztree-cookie-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-4 md:p-5 max-w-2xl w-full flex flex-col md:flex-row items-start md:items-center gap-4 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="flex-1 text-sm text-gray-600">
                    <p>
                        Používame súbory cookie na zlepšenie vášho zážitku. Používaním našej stránky súhlasíte s našimi{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                            Zásadami ochrany osobných údajov
                        </Link>{" "}
                        a{" "}
                        <Link href="/cookies" className="text-blue-600 hover:underline font-medium">
                            Zásadami používania súborov cookie
                        </Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                        Súhlasím
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
