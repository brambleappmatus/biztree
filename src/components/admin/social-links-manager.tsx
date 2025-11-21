"use client";

import React, { useState } from "react";
import { Profile, SocialLink } from "@prisma/client";
import { Plus, Trash2, Instagram, Facebook, Twitter, Linkedin, Youtube, Link, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiSelect } from "@/components/ui/mui-select";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";

interface SocialLinksManagerProps {
    profile: Profile & { socialLinks: SocialLink[] };
}

const PLATFORMS = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-500" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600" },
    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
];

export default function SocialLinksManager({ profile }: SocialLinksManagerProps) {
    const router = useRouter();
    const [newLink, setNewLink] = useState({ platform: "instagram", url: "" });
    const [saving, setSaving] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [optimisticLinks, setOptimisticLinks] = useState(profile.socialLinks);

    // Sync with server state when it updates
    React.useEffect(() => {
        setOptimisticLinks(profile.socialLinks);
    }, [profile.socialLinks]);

    const addLink = async () => {
        if (!newLink.url.trim()) return;

        setSaving(true);

        // Optimistic update
        const tempId = "temp-" + Date.now();
        const tempLink = {
            id: tempId,
            profileId: profile.id,
            platform: newLink.platform,
            url: newLink.url,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setOptimisticLinks(prev => [...prev, tempLink]);
        setNewLink({ platform: "instagram", url: "" });

        try {
            const response = await fetch("/api/social-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId: profile.id,
                    platform: tempLink.platform,
                    url: tempLink.url,
                }),
            });

            if (response.ok) {
                startTransition(() => {
                    router.refresh();
                    window.dispatchEvent(new Event('profile-updated'));
                });
            } else {
                // Revert on error
                setOptimisticLinks(prev => prev.filter(l => l.id !== tempId));
                alert("Chyba pri pridávaní odkazu");
            }
        } catch (error) {
            console.error("Error adding social link:", error);
            setOptimisticLinks(prev => prev.filter(l => l.id !== tempId));
            alert("Chyba pri pridávaní odkazu");
        } finally {
            setSaving(false);
        }
    };

    const deleteLink = async (linkId: string) => {
        if (!confirm("Naozaj chcete odstrániť tento odkaz?")) return;

        // Optimistic update
        const previousLinks = optimisticLinks;
        setOptimisticLinks(prev => prev.filter(l => l.id !== linkId));

        try {
            const response = await fetch(`/api/social-links/${linkId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                startTransition(() => {
                    router.refresh();
                    window.dispatchEvent(new Event('profile-updated'));
                });
            } else {
                // Revert on error
                setOptimisticLinks(previousLinks);
                alert("Chyba pri odstraňovaní odkazu");
            }
        } catch (error) {
            console.error("Error deleting social link:", error);
            setOptimisticLinks(previousLinks);
            alert("Chyba pri odstraňovaní odkazu");
        }
    };

    return (
        <MuiCard
            title="Sociálne siete"
            subtitle="Prepojte svoj profil so sociálnymi sieťami"
            className="mt-8"
        >
            {/* Existing Links */}
            {optimisticLinks && optimisticLinks.length > 0 && (
                <div className="space-y-3 mb-6 mt-2">
                    {optimisticLinks.map((link) => {
                        const platform = PLATFORMS.find((p) => p.id === link.platform.toLowerCase());
                        const Icon = platform?.icon || Link;
                        const isTemp = link.id.startsWith("temp-");

                        return (
                            <div
                                key={link.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-opacity",
                                    isTemp && "opacity-70"
                                )}
                            >
                                <div className={cn("p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm", platform?.color)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {platform?.name || link.platform}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {link.url}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteLink(link.id)}
                                    disabled={isTemp}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add New Link */}
            <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <MuiSelect
                        label="Platforma"
                        value={newLink.platform}
                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                        options={PLATFORMS.map(p => ({ value: p.id, label: p.name }))}
                        className="mb-0"
                        containerClassName="mb-0 w-full sm:w-48"
                    />
                    <MuiInput
                        label="URL adresa"
                        type="url"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="https://..."
                        className="mb-0"
                        containerClassName="mb-0 w-full"
                    />
                    <MuiButton
                        type="button"
                        onClick={addLink}
                        disabled={saving || !newLink.url.trim()}
                        loading={saving}
                        className="h-[52px] w-[52px] p-0 rounded-lg shrink-0"
                    >
                        <Plus className="w-6 h-6" />
                    </MuiButton>
                </div>
            </div>
        </MuiCard>
    );
}
