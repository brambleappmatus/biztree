"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/language-switcher";
import { resetPassword } from "../actions";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (!tokenParam) {
            setError("Neplatný odkaz. Požiadajte o nový reset hesla.");
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (password.length < 8) {
            setError("Heslo musí mať aspoň 8 znakov");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Heslá sa nezhodujú");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Neplatný token");
            setLoading(false);
            return;
        }

        try {
            const result = await resetPassword(token, password);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
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
                            Nové heslo
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Zadajte nové heslo pre váš účet
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="text-green-600 dark:text-green-400 text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                            Heslo bolo zmenené!
                                        </h3>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Vaše heslo bolo úspešne zmenené. Budete presmerovaný na prihlasovaciu stránku...
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                    Prejsť na prihlásenie →
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
                                    label="Nové heslo"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />

                                <MuiInput
                                    label="Potvrdiť heslo"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />

                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        💡 Heslo musí mať aspoň 8 znakov
                                    </p>
                                </div>

                                <MuiButton
                                    type="submit"
                                    disabled={loading || !token}
                                    loading={loading}
                                    className="w-full py-6 text-lg"
                                >
                                    {loading ? "Ukladám..." : "Zmeniť heslo"}
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
                    <div className="text-6xl mb-6">🔑</div>
                    <h2 className="text-4xl font-bold mb-6">Takmer hotovo!</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Vyberte si silné heslo, ktoré si budete pamätať. Odporúčame použiť kombináciu písmen, čísiel a špeciálnych znakov.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-sm text-blue-100">✓ Aspoň 8 znakov</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-sm text-blue-100">✓ Kombinácia písmen a čísiel</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <div className="text-sm text-blue-100">✓ Unikátne heslo</div>
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
