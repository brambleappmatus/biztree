"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
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
                setError("Nesprávny email alebo heslo");
                setLoading(false);
            } else if (result?.ok) {
                // Fetch session to check role and onboarding status
                const response = await fetch("/api/auth/session");
                const session = await response.json();

                // Redirect based on role
                if (session?.user?.role === "SUPERADMIN") {
                    router.push("/superadmin");
                } else if (session?.user?.onboardingCompleted === false) {
                    router.push("/onboarding");
                } else {
                    router.push("/admin");
                }
                router.refresh();
                // Don't set loading to false here - keep it showing until page changes
            }
        } catch (err) {
            setError("Nastala chyba pri prihlasovaní");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Vitajte späť
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Prihláste sa do svojho účtu
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <MuiInput
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <MuiInput
                            label="Heslo"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <MuiButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-full"
                        >
                            {loading ? "Prihlasujem..." : "Prihlásiť sa"}
                        </MuiButton>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Nemáte účet?{" "}
                            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Zaregistrujte sa
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
