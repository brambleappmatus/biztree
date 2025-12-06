"use client";

import { MuiInput } from "@/components/ui/mui-input";
import { Instagram, Facebook, Music, Linkedin, Twitter, Youtube } from "lucide-react";

interface StepSocialMediaProps {
    formData: {
        instagram: string;
        facebook: string;
        tiktok: string;
        linkedin: string;
        twitter: string;
        youtube: string;
    };
    onChange: (data: Partial<StepSocialMediaProps['formData']>) => void;
}

export function StepSocialMedia({ formData, onChange }: StepSocialMediaProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Sociálne siete 🌐
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Prepojte svoj profil so sociálnymi sieťami (voliteľné)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                    <MuiInput
                        label="Instagram"
                        value={formData.instagram}
                        onChange={(e) => onChange({ instagram: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                    <MuiInput
                        label="Facebook"
                        value={formData.facebook}
                        onChange={(e) => onChange({ facebook: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" size={18} />
                    <MuiInput
                        label="TikTok"
                        value={formData.tiktok}
                        onChange={(e) => onChange({ tiktok: e.target.value })}
                        placeholder="https://tiktok.com/@..."
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" size={18} />
                    <MuiInput
                        label="LinkedIn"
                        value={formData.linkedin}
                        onChange={(e) => onChange({ linkedin: e.target.value })}
                        placeholder="https://linkedin.com/..."
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
                    <MuiInput
                        label="Twitter / X"
                        value={formData.twitter}
                        onChange={(e) => onChange({ twitter: e.target.value })}
                        placeholder="https://twitter.com/..."
                        className="pl-10"
                    />
                </div>

                <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600" size={18} />
                    <MuiInput
                        label="YouTube"
                        value={formData.youtube}
                        onChange={(e) => onChange({ youtube: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="pl-10"
                    />
                </div>
            </div>
        </div>
    );
}
