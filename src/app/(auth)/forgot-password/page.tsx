"use client";

import { useState } from "react";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";
import { requestPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await requestPasswordReset(email);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("Nastala chyba. Skúste to prosím neskôr.");
        } finally {
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
                            Zabudnuté heslo
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Zadajte váš email a pošleme vám odkaz na reset hesla
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 dark:text-green-400 text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                            Email bol odoslaný!
                                        </h3>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Ak účet s emailom <strong>{email}</strong> existuje, poslali sme vám odkaz na reset hesla. Skontrolujte si svoju emailovú schránku.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    💡 <strong>Tip:</strong> Odkaz je platný len 1 hodinu. Ak email nevidíte, skontrolujte aj spam.
                                </p>
                            </div>

                            <div className="text-center">
                                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                    ← Späť na prihlásenie
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <MuiInput
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <MuiButton
                                    type="submit"
                                    disabled={loading}
                                    loading={loading}
                                    className="w-full py-6 text-lg"
                                >
                                    {loading ? "Odosielam..." : "Odoslať reset email"}
                                </MuiButton>

                                <div className="text-center text-sm">
                                    <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                        ← Späť na prihlásenie
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10 text-center text-white max-w-lg">
                    <div className="text-6xl mb-6">🔐</div>
                    <h2 className="text-4xl font-bold mb-6">Bezpečný reset hesla</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Pošleme vám bezpečný odkaz na reset hesla na váš email. Odkaz bude platný 1 hodinu.
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                        <p className="text-sm text-blue-100">
                            💡 Ak ste sa registrovali cez Google, nemôžete resetovať heslo. Prihláste sa priamo cez Google.
                        </p>
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            </div>
        </div>
    );
}
