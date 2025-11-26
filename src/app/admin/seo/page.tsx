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

export default function SEOPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SEOFormData>({
        seoTitle: "",
        seoDesc: "",
    });

    // Load current SEO data
    React.useEffect(() => {
        const loadSEOData = async () => {
            try {
                const res = await fetch("/api/user/subdomain");
                const data = await res.json();
                if (data.profile) {
                    setFormData({
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
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update SEO settings:", error);
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
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">biztree.bio</div>
                        <div className="text-blue-600 text-lg font-medium mb-1">
                            {formData.seoTitle || "Váš názov | BizTree"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.seoDesc || "Rezervujte si služby online..."}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Takto bude váš profil vyzerať vo výsledkoch Google vyhľadávania.
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
