"use client";

import React, { useState } from "react";
import { Profile, SocialLink } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { SocialIcon } from "react-social-icons";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiSelect } from "@/components/ui/mui-select";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import { useToast } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface SocialLinksManagerProps {
    profile: Profile & { socialLinks: SocialLink[] };
}

const PLATFORMS = [
    { id: "instagram", name: "Instagram" },
    { id: "facebook", name: "Facebook" },
    { id: "twitter", name: "Twitter" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "youtube", name: "YouTube" },
    { id: "whatsapp", name: "WhatsApp" },
    { id: "tiktok", name: "TikTok" },
    { id: "snapchat", name: "Snapchat" },
];

export default function SocialLinksManager({ profile }: SocialLinksManagerProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [newLink, setNewLink] = useState({ platform: "instagram", url: "" });
    const [saving, setSaving] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [optimisticLinks, setOptimisticLinks] = useState(profile.socialLinks);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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
                showToast("Odkaz pridaný", "success");
            } else {
                // Revert on error
                setOptimisticLinks(prev => prev.filter(l => l.id !== tempId));
                showToast("Chyba pri pridávaní odkazu", "error");
            }
        } catch (error) {
            console.error("Error adding social link:", error);
            setOptimisticLinks(prev => prev.filter(l => l.id !== tempId));
            showToast("Chyba pri pridávaní odkazu", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (linkId: string) => {
        setDeleteId(linkId);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        const linkId = deleteId;
        setDeleteId(null); // Close modal immediately

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
                showToast("Odkaz odstránený", "success");
            } else {
                // Revert on error
                setOptimisticLinks(previousLinks);
                showToast("Chyba pri odstraňovaní odkazu", "error");
            }
        } catch (error) {
            console.error("Error deleting social link:", error);
            setOptimisticLinks(previousLinks);
            showToast("Chyba pri odstraňovaní odkazu", "error");
        }
    };

    return (
        <>
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
                            const isTemp = link.id.startsWith("temp-");

                            return (
                                <div
                                    key={link.id}
                                    className={cn(
                                        "flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-opacity",
                                        isTemp && "opacity-70"
                                    )}
                                >
                                    <div className="shrink-0">
                                        <SocialIcon
                                            network={link.platform.toLowerCase()}
                                            url={link.url}
                                            style={{ width: 40, height: 40 }}
                                            fgColor="white"
                                        />
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
                                        onClick={() => handleDeleteClick(link.id)}
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

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Odstrániť odkaz?"
                description="Naozaj chcete odstrániť tento odkaz na sociálnu sieť? Táto akcia je nevratná."
                confirmText="Odstrániť"
                cancelText="Zrušiť"
                variant="danger"
            />
        </>
    );
}
