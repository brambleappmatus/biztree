"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/contexts/language-context";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [error, setError] = useState("");

    const provider = searchParams.get("provider");
    const isOAuth = provider === "google" || provider === "apple";

    useEffect(() => {
        const handleAutoLogin = async () => {
            // For OAuth users, they're already logged in - just redirect after delay
            if (isOAuth) {
                setTimeout(() => {
                    router.push("/admin");
                    router.refresh();
                }, 2000);
                return;
            }

            // For email/password registration, get credentials from sessionStorage
            const email = sessionStorage.getItem("register_email");
            const password = sessionStorage.getItem("register_password");

            // Clear credentials immediately for security
            sessionStorage.removeItem("register_email");
            sessionStorage.removeItem("register_password");

            if (!email || !password) {
                // No credentials found, redirect to login as fallback
                setTimeout(() => {
                    router.push("/login?registered=true");
                }, 2000);
                return;
            }

            try {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.ok) {
                    // Wait a moment to show success screen, then redirect
                    setTimeout(() => {
                        router.push("/admin");
                        router.refresh();
                    }, 1500);
                } else {
                    // Auto-login failed, redirect to login
                    setError("Auto-login failed");
                    setTimeout(() => {
                        router.push("/login?registered=true");
                    }, 2000);
                }
            } catch (err) {
                setError("Auto-login failed");
                setTimeout(() => {
                    router.push("/login?registered=true");
                }, 2000);
            }
        };

        handleAutoLogin();
    }, [isOAuth, router]);

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900">
            {/* Left Side - Success Message */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <div className="w-full max-w-md text-center space-y-8">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                            <svg
                                className="w-12 h-12 text-green-600 dark:text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                    className="animate-[draw-check_0.4s_ease-out_0.2s_forwards]"
                                    style={{
                                        strokeDasharray: 24,
                                        strokeDashoffset: 24,
                                    }}
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Success Text */}
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {t.auth.registrationSuccess}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {t.auth.redirectingToApp}
                        </p>
                    </div>

                    {/* Loader */}
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                    </div>

                    {/* Error message (hidden unless error occurs) */}
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}
                </div>
            </div>

            {/* Right Side - Decorative (matches register page) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 text-center text-white max-w-lg">
                    <h2 className="text-4xl font-bold mb-6">{t.auth.joinBizTree}</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        {t.auth.joinDesc}
                    </p>
                    <div className="grid grid-cols-2 gap-4 opacity-80">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-2xl font-bold mb-1">{t.auth.free}</div>
                            <div className="text-sm text-blue-100">{t.auth.basicPlan}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-2xl font-bold mb-1">{t.auth.fiveMin}</div>
                            <div className="text-sm text-blue-100">{t.auth.quickSetup}</div>
                        </div>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            </div>

            {/* CSS for checkmark animation */}
            <style jsx>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @keyframes draw-check {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
}

// Loading fallback that matches the success page design
function LoadingFallback() {
    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <div className="w-full max-w-md text-center space-y-8">
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
        </div>
    );
}

export default function RegisterSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessContent />
        </Suspense>
    );
}
