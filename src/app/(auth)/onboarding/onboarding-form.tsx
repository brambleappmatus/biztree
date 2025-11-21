"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiTextArea } from "@/components/ui/mui-textarea";
import { MuiButton } from "@/components/ui/mui-button";
import { checkSubdomainAvailability, createProfileFromOnboarding } from "../actions";
import { ChevronRight, ChevronLeft, Check, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
    { id: "blue", name: "Blue", color: "#007AFF" },
    { id: "emerald", name: "Emerald", color: "#34C759" },
    { id: "coral", name: "Coral", color: "#FF2D55" },
    { id: "amber", name: "Amber", color: "#FF9500" },
    { id: "lavender", name: "Lavender", color: "#AF52DE" },
    { id: "graphite", name: "Graphite", color: "#8E8E93" },
];

const BACKGROUNDS = [
    { id: "black", name: "Black", gradient: "linear-gradient(to bottom, #000000, #1a1a1a)" },
    { id: "dark", name: "Dark Gray", gradient: "linear-gradient(to bottom, #1a1a1a, #2d2d2d)" },
    { id: "blue-purple", name: "Blue Purple", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "pink-orange", name: "Pink Orange", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: "green-blue", name: "Green Blue", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: "sunset", name: "Sunset", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: "ocean", name: "Ocean", gradient: "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)" },
    { id: "forest", name: "Forest", gradient: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)" },
    { id: "yellow", name: "Golden", gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" },
    { id: "red", name: "Fire Red", gradient: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)" },
    { id: "navy", name: "Navy Blue", gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
    { id: "charcoal", name: "Charcoal", gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
    { id: "burgundy", name: "Burgundy", gradient: "linear-gradient(135deg, #7b4397 0%, #dc2430 100%)" },
    { id: "teal", name: "Teal", gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
];

export default function OnboardingForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [subdomainChecking, setSubdomainChecking] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({
        subdomain: "",
        name: "",
        about: "",
        phone: "",
        email: "",
        theme: "blue",
        bgImage: "black"
    });

    const checkSubdomain = async (subdomain: string) => {
        if (!subdomain || subdomain.length < 3) {
            setSubdomainAvailable(null);
            return;
        }

        setSubdomainChecking(true);
        const result = await checkSubdomainAvailability(subdomain);
        setSubdomainAvailable(result.available);
        setSubdomainChecking(false);
    };

    const handleSubdomainChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setFormData({ ...formData, subdomain: sanitized });

        if (sanitized === "www") {
            setSubdomainAvailable(false);
            return;
        }

        if (sanitized.length >= 3) {
            const timer = setTimeout(() => checkSubdomain(sanitized), 500);
            return () => clearTimeout(timer);
        } else {
            setSubdomainAvailable(null);
        }
    };

    const handleNext = () => {
        if (step === 1 && (!formData.subdomain || !formData.name || !subdomainAvailable)) {
            setError("Vyplňte všetky povinné polia a vyberte dostupnú subdoménu");
            return;
        }
        setError("");
        setStep(step + 1);
    };

    const handleBack = () => {
        setError("");
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            setError("Nie ste prihlásený");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await createProfileFromOnboarding(session.user.id, formData);

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Nastala chyba pri vytváraní profilu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors flex-shrink-0",
                                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}>
                                {step > 1 ? <Check size={16} /> : 1}
                            </div>
                            <div className={cn(
                                "flex-1 h-1 mx-2 rounded transition-colors",
                                step > 1 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                            )} />
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors flex-shrink-0",
                                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}>
                                {step > 2 ? <Check size={16} /> : 2}
                            </div>
                            <div className={cn(
                                "flex-1 h-1 mx-2 rounded transition-colors",
                                step > 2 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                            )} />
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors flex-shrink-0",
                                step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}>
                                {step > 3 ? <Check size={16} /> : 3}
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Základy</span>
                            <span>Informácie</span>
                            <span>Vzhľad</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Subdomain & Name */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Vytvorte si profil
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Začnime s názvom vašej firmy a unikátnou URL adresou
                                </p>
                            </div>

                            <MuiInput
                                label="Názov firmy / Meno *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <div>
                                <MuiInput
                                    label="Subdoména (URL adresa) *"
                                    value={formData.subdomain}
                                    onChange={(e) => handleSubdomainChange(e.target.value)}
                                    required
                                />
                                {formData.subdomain && (
                                    <div className="mt-2 text-sm">
                                        {subdomainChecking ? (
                                            <span className="text-gray-500">Kontrolujem dostupnosť...</span>
                                        ) : subdomainAvailable === true ? (
                                            <span className="text-green-600 dark:text-green-400">
                                                ✓ {formData.subdomain}.biztree.sk je dostupná
                                            </span>
                                        ) : subdomainAvailable === false ? (
                                            <span className="text-red-600 dark:text-red-400">
                                                {formData.subdomain === "www" ? "✗ Subdoména nemôže byť 'www'" : "✗ Táto subdoména už existuje"}
                                            </span>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Info */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Kontaktné informácie
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Pomôžte zákazníkom sa s vami spojiť
                                </p>
                            </div>

                            <MuiTextArea
                                label="O vás / firme"
                                value={formData.about}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                rows={3}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MuiInput
                                    label="Telefón"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />

                                <MuiInput
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Theme & Background */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Prispôsobte si vzhľad
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Vyberte farebnú tému a pozadie
                                </p>
                            </div>

                            {/* Theme Selection */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Farebná téma</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {THEMES.map((theme) => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, theme: theme.id })}
                                            className={cn(
                                                "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                                formData.theme === theme.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full shadow-sm"
                                                style={{ backgroundColor: theme.color }}
                                            />
                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                {theme.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Background Selection */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pozadie</h3>
                                <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-hide -mx-2 px-2">
                                    {BACKGROUNDS.map((bg) => (
                                        <button
                                            key={bg.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, bgImage: bg.id })}
                                            className={cn(
                                                "h-24 w-32 flex-shrink-0 rounded-lg border-2 transition-all relative overflow-hidden snap-start",
                                                formData.bgImage === bg.id
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                            )}
                                        >
                                            <div
                                                className="w-full h-full"
                                                style={{
                                                    background: bg.gradient,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}
                                            />
                                            {formData.bgImage === bg.id && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20">
                                                    <Check className="text-white" size={24} />
                                                </div>
                                            )}
                                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded">
                                                {bg.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        {step > 1 ? (
                            <MuiButton
                                onClick={handleBack}
                                variant="outlined"
                                startIcon={<ChevronLeft size={18} />}
                            >
                                Späť
                            </MuiButton>
                        ) : <div />}

                        {step < 3 ? (
                            <MuiButton
                                onClick={handleNext}
                                startIcon={<ChevronRight size={18} />}
                            >
                                Ďalej
                            </MuiButton>
                        ) : (
                            <MuiButton
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={loading}
                                startIcon={<Check size={18} />}
                            >
                                Dokončiť
                            </MuiButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
