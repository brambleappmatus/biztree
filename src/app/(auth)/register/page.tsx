"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import Link from "next/link";
import { registerUser } from "../actions";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Heslá sa nezhodujú");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Heslo musí mať aspoň 6 znakov");
            setLoading(false);
            return;
        }

        try {
            const result = await registerUser({
                email: formData.email,
                password: formData.password
            });

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/login?registered=true");
            }
        } catch (err) {
            setError("Nastala chyba pri registrácii");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Vytvorte si účet
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Začnite s vlastným online profilom
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

                        <MuiInput
                            label="Potvrďte heslo"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />

                        <MuiButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-full"
                        >
                            Zaregistrovať sa
                        </MuiButton>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Už máte účet?{" "}
                            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Prihláste sa
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
