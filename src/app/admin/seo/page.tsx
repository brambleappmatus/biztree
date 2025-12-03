"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiTextArea } from "@/components/ui/mui-textarea";
import { MuiButton } from "@/components/ui/mui-button";
import { Save } from "lucide-react";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";
import { PageHeader } from "@/components/ui/page-header";

interface SEOFormData {
    seoTitle: string;
    seoDesc: string;
}

const BACKGROUND_GRADIENTS: Record<string, string> = {
    "none": "transparent",
    "black": "linear-gradient(to bottom, #000000, #1a1a1a)",
    "dark": "linear-gradient(to bottom, #1a1a1a, #2d2d2d)",
    "white": "linear-gradient(to bottom, #ffffff, #f5f5f5)",
    "blue-purple": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "pink-orange": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "green-blue": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "sunset": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "ocean": "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)",
    "forest": "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    "yellow": "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    "red": "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    "navy": "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    "charcoal": "linear-gradient(135deg, #232526 0%, #414345 100%)",
    "burgundy": "linear-gradient(135deg, #7b4397 0%, #dc2430 100%)",
    "teal": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "peach-fade": "linear-gradient(135deg, #ff9a56 0%, #ffecd2 100%)",
    "lavender-fade": "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "mint-fade": "linear-gradient(135deg, #00d2ff 0%, #e0f9ff 100%)",
    "rose-fade": "linear-gradient(135deg, #ff6b9d 0%, #ffc3d8 100%)",
    "sky-fade": "linear-gradient(135deg, #4facfe 0%, #e0f4ff 100%)",
    "rainbow": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    "tropical": "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd200 100%)",
    "aurora": "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)",
    "cosmic": "linear-gradient(135deg, #667eea 0%, #764ba2 33%, #f093fb 66%, #f5576c 100%)",
    "sunset-rays": "radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.9) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(78, 205, 196, 0.9) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(255, 159, 64, 0.8) 0%, transparent 50%), linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    "neon-dreams": "radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.8) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 20, 147, 0.8) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.6) 0%, transparent 60%), linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    "ocean-depths": "radial-gradient(circle at 40% 40%, rgba(64, 224, 208, 0.7) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(72, 209, 204, 0.7) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(32, 178, 170, 0.6) 0%, transparent 50%), linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    "fire-ice": "radial-gradient(circle at 20% 80%, rgba(255, 69, 0, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 191, 255, 0.8) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.5) 0%, transparent 60%), linear-gradient(135deg, #232526 0%, #414345 100%)",
};

const THEME_COLORS: Record<string, string> = {
    "blue": "#007AFF",
    "emerald": "#34C759",
    "coral": "#FF2D55",
    "graphite": "#8E8E93",
    "lavender": "#AF52DE",
    "amber": "#FF9500",
    "sunshine": "#FFD60A",
    "teal": "#30B0C7",
    "indigo": "#5856D6",
};

export default function SEOPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SEOFormData>({
        seoTitle: "",
        seoDesc: "",
    });
    const [profile, setProfile] = useState<{
        name: string;
        avatarUrl: string | null;
        theme: string;
    }>({
        name: "",
        avatarUrl: null,
        theme: "blue",
    });
    const [bgSettings, setBgSettings] = useState<{
        bgImage: string | null;
        bgBlur: boolean;
        bgNoise: boolean;
    }>({
        bgImage: null,
        bgBlur: false,
        bgNoise: false,
    });

    // Load current SEO data
    React.useEffect(() => {
        const loadSEOData = async () => {
            try {
                console.log('Loading SEO data...');
                const res = await fetch("/api/user/subdomain");
                const data = await res.json();
                console.log('Loaded data:', data);
                if (data.profile) {
                    setFormData({
                        seoTitle: data.profile.seoTitle || "",
                        seoDesc: data.profile.seoDesc || "",
                    });
                    setProfile({
                        name: data.profile.name || "",
                        avatarUrl: data.profile.avatarUrl || null,
                        theme: data.profile.theme || "blue",
                    });
                    setBgSettings({
                        bgImage: data.profile.bgImage || null,
                        bgBlur: data.profile.bgBlur || false,
                        bgNoise: data.profile.bgNoise || false,
                    });
                    console.log('Set form data:', {
                        seoTitle: data.profile.seoTitle || "",
                        seoDesc: data.profile.seoDesc || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load SEO data:", error);
            }
        };
        loadSEOData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting SEO data:', formData);
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log('Response:', data);

            if (res.ok) {
                alert('SEO nastavenia boli úspešne uložené!');
                router.refresh();
            } else {
                console.error('Error response:', data);
                alert(`Chyba: ${data.error || 'Nepodarilo sa uložiť nastavenia'}`);
            }
        } catch (error) {
            console.error("Failed to update SEO settings:", error);
            alert('Nepodarilo sa uložiť SEO nastavenia. Skúste to prosím znova.');
        } finally {
            setLoading(false);
        }
    };

    const titleLength = formData.seoTitle.length;
    const descLength = formData.seoDesc.length;

    return (
        <LockedFeatureGuard featureKey="page_seo">
            <div className="max-w-2xl mx-auto space-y-6">
                <PageHeader
                    title="SEO Nastavenia"
                    description="Optimalizujte svoj profil pre vyhľadávače."
                />

                <MuiCard title="Meta Tags">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <MuiInput
                                label="SEO Titulok"
                                value={formData.seoTitle}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, seoTitle: e.target.value })}
                                placeholder="Váš názov | BizTree"
                                maxLength={60}
                            />
                            <p className={`text-xs mt-1 ${titleLength > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                                {titleLength}/60 znakov (optimálne: 50-60)
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Tento titulok sa zobrazí v záložke prehliadača a vo výsledkoch vyhľadávania.
                            </p>
                        </div>

                        <div>
                            <MuiTextArea
                                label="SEO Popis"
                                value={formData.seoDesc}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, seoDesc: e.target.value })}
                                placeholder="Krátky popis vašich služieb..."
                                rows={3}
                                maxLength={160}
                            />
                            <p className={`text-xs mt-1 ${descLength > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                                {descLength}/160 znakov (optimálne: 120-160)
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Tento popis sa zobrazí vo výsledkoch vyhľadávania pod titulkom.
                            </p>
                        </div>

                        <MuiButton type="submit" loading={loading} startIcon={<Save size={18} />}>
                            Uložiť SEO nastavenia
                        </MuiButton>
                    </form>
                </MuiCard>

                <MuiCard title="Náhľad vo vyhľadávaní">
                    <div className="space-y-4">
                        {/* Google Search Preview */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">biztree.bio</div>
                            <div className="text-blue-600 text-lg font-medium mb-1">
                                {formData.seoTitle || "Váš názov | BizTree"}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {formData.seoDesc || "Rezervujte si služby online..."}
                            </div>
                        </div>

                        {/* Social Media Preview with Background */}
                        <div className="relative h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Background Layer */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: bgSettings.bgImage?.startsWith('http')
                                        ? `url(${bgSettings.bgImage})`
                                        : BACKGROUND_GRADIENTS[bgSettings.bgImage || 'dark'] || BACKGROUND_GRADIENTS['dark'],
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />

                            {/* Blur Overlay */}
                            {bgSettings.bgBlur && bgSettings.bgImage?.startsWith('http') && (
                                <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
                            )}

                            {/* Grain Overlay */}
                            {bgSettings.bgNoise && (
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        opacity: 0.08,
                                        backgroundImage: `url('/textures/grain.png')`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        mixBlendMode: 'overlay',
                                    }}
                                />
                            )}

                            {/* Content Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                {/* Avatar with Theme Ring */}
                                {profile.avatarUrl && (
                                    <div
                                        className="w-24 h-24 rounded-full mb-4 p-1"
                                        style={{
                                            background: THEME_COLORS[profile.theme] || THEME_COLORS["blue"],
                                        }}
                                    >
                                        <img
                                            src={profile.avatarUrl}
                                            alt={profile.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="text-2xl font-bold mb-2">
                                    {formData.seoTitle || profile.name || "Váš názov | BizTree"}
                                </div>
                                <div className="text-sm opacity-90">
                                    {formData.seoDesc || "Rezervujte si služby online..."}
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Takto bude váš profil vyzerať vo výsledkoch Google vyhľadávania a pri zdieľaní na sociálnych sieťach.
                    </p>
                </MuiCard>

                <MuiCard title="Tipy pre lepšie SEO">
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Použite kľúčové slová, ktoré vaši zákazníci vyhľadávajú</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Titulok by mal byť výstižný a obsahovať názov vašej firmy</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Popis by mal jasne vysvetliť, čo ponúkate</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Vyhnite sa nadmerným veľkým písmenám a špeciálnym znakom</span>
                        </li>
                    </ul>
                </MuiCard>
            </div>
        </LockedFeatureGuard>
    );
}
