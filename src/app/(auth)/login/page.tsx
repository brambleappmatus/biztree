"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
                callbackUrl: "/admin"
            });

            if (result?.error) {
                setError(t.auth.invalidEmail);
                setLoading(false);
            } else if (result?.ok) {
                // Fetch session to check role and onboarding status
                const response = await fetch("/api/auth/session");
                const session = await response.json();

                // Refresh session first to update server components
                router.refresh();

                // Redirect based on role
                if (session?.user?.role === "SUPERADMIN") {
                    router.push("/superadmin");
                } else if (session?.user?.onboardingCompleted === false) {
                    router.push("/onboarding");
                } else {
                    router.push("/admin");
                }
                // Don't set loading to false here - keep it showing until page changes
            }
        } catch (err) {
            setError(t.messages.saveError);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-900">
            {/* Language Switcher - Top Right */}
            <div className="absolute top-4 right-4 z-50 lg:hidden">
                <LanguageSwitcher variant="compact" />
            </div>
            <div className="absolute top-4 right-4 z-50 hidden lg:block">
                <LanguageSwitcher variant="white" />
            </div>

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start mb-8">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {t.auth.welcomeBack}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t.auth.getStarted}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3 mb-6">
                        <button
                            type="button"
                            onClick={() => signIn("google", { callbackUrl: "/admin" })}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                                    Or with email
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <MuiInput
                            label={t.auth.email}
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <MuiInput
                            label={t.auth.password}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    {t.auth.forgotPassword}
                                </a>
                            </div>
                        </div>

                        <MuiButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-full py-6 text-lg"
                        >
                            {loading ? t.auth.loggingIn : t.auth.signIn}
                        </MuiButton>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                                    {t.common.back}
                                </span>
                            </div>
                        </div>

                        <div className="text-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                {t.auth.noAccount}{" "}
                            </span>
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                {t.auth.createAccount}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 text-center text-white max-w-lg">
                    <h2 className="text-4xl font-bold mb-6">{t.landing.allYouNeed}</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        {t.landing.heroSubtitle}
                    </p>
                    <div className="grid grid-cols-2 gap-4 opacity-80">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-2xl font-bold mb-1">100+</div>
                            <div className="text-sm text-blue-100">{t.landing.activeCompanies}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-2xl font-bold mb-1">24/7</div>
                            <div className="text-sm text-blue-100">{t.landing.onlineBooking}</div>
                        </div>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            </div>
        </div>
    );
}
