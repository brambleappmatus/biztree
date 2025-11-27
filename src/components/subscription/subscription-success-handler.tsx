"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function SubscriptionSuccessHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');
        const sessionId = searchParams.get('session_id');
        const canceled = searchParams.get('canceled');

        // If no params, hide the modal
        if (!success && !sessionId && !canceled) {
            setStatus('checking');
            return;
        }

        if (canceled === 'true') {
            setStatus('error');
            setMessage('Platba bola zrušená');
            setTimeout(() => {
                router.replace('/admin/subscription');
            }, 3000);
            return;
        }

        if (success === 'true' && sessionId) {
            // Show success message
            setStatus('success');
            setMessage('Platba prebehla úspešne! Váš účet sa aktualizuje o chvíľu...');

            // Wait a bit for webhooks to process, then reload
            setTimeout(() => {
                router.replace('/admin/subscription');
                router.refresh();
            }, 3000);
        }
    }, [searchParams, router]);

    if (status === 'checking') {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div className="flex flex-col items-center text-center space-y-4">
                    {status === 'success' ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Úspešná platba!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Presmerovanie...</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Platba zrušená
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
