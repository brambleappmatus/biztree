"use client";

import React, { useState } from "react";
import { Profile } from "@prisma/client";
import { Plus, Trash2, GripVertical, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";
import { addLink, deleteLink, updateLinkOrder } from "@/app/actions/links";
import { cn } from "@/lib/utils";

// Define Link interface locally until Prisma client is regenerated
interface LinkItem {
    id: string;
    title: string;
    url: string;
    order: number;
    profileId: string;
}

interface LinksManagerProps {
    profile: Profile & { links?: LinkItem[] };
}

export default function LinksManager({ profile }: LinksManagerProps) {
    const router = useRouter();
    const [newLink, setNewLink] = useState({ title: "", url: "" });
    const [saving, setSaving] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [localLinks, setLocalLinks] = useState<LinkItem[]>(
        (profile.links || []).sort((a, b) => a.order - b.order)
    );

    // Sync with server state when it updates
    React.useEffect(() => {
        setLocalLinks((profile.links || []).sort((a, b) => a.order - b.order));
    }, [profile.links]);

    const handleAddLink = async () => {
        if (!newLink.title.trim() || !newLink.url.trim()) return;

        setSaving(true);

        // Optimistic update
        const tempId = "temp-" + Date.now();
        const tempLink: LinkItem = {
            id: tempId,
            title: newLink.title,
            url: newLink.url,
            order: localLinks.length,
            profileId: profile.id
        };

        setLocalLinks(prev => [...prev, tempLink]);
        setNewLink({ title: "", url: "" });

        try {
            const result = await addLink(profile.id, tempLink.title, tempLink.url);
            if (result.success) {
                startTransition(() => {
                    router.refresh();
                });
            } else {
                // Revert on error
                setLocalLinks(prev => prev.filter(l => l.id !== tempId));
                alert("Chyba pri pridávaní odkazu");
            }
        } catch (error) {
            console.error("Error adding link:", error);
            setLocalLinks(prev => prev.filter(l => l.id !== tempId));
            alert("Chyba pri pridávaní odkazu");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        if (!confirm("Naozaj chcete odstrániť tento odkaz?")) return;

        // Optimistic update
        const previousLinks = localLinks;
        setLocalLinks(prev => prev.filter(l => l.id !== linkId));

        try {
            const result = await deleteLink(linkId);
            if (result.success) {
                startTransition(() => {
                    router.refresh();
                });
            } else {
                // Revert on failure
                setLocalLinks(previousLinks);
                alert("Chyba pri odstraňovaní odkazu");
            }
        } catch (error) {
            console.error("Error deleting link:", error);
            setLocalLinks(previousLinks);
            alert("Chyba pri odstraňovaní odkazu");
        }
    };

    const moveLink = async (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === localLinks.length - 1)
        ) {
            return;
        }

        const newLinks = [...localLinks];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        // Swap
        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];

        // Update orders
        const updatedLinks = newLinks.map((link, idx) => ({
            ...link,
            order: idx
        }));

        // Optimistic update
        const previousLinks = localLinks;
        setLocalLinks(updatedLinks);

        // Save new order
        try {
            await updateLinkOrder(updatedLinks.map(l => ({ id: l.id, order: l.order })));
            startTransition(() => {
                router.refresh();
            });
        } catch (error) {
            console.error("Error updating order:", error);
            setLocalLinks(previousLinks); // Revert
        }
    };

    return (
        <MuiCard
            title="Vlastné odkazy"
            subtitle="Pridajte odkazy na vaše ďalšie stránky, články alebo produkty (Linktree štýl)"
            className="mt-8"
        >
            {/* Existing Links */}
            {localLinks.length > 0 && (
                <div className="space-y-3 mb-6 mt-2">
                    {localLinks.map((link, index) => {
                        const isTemp = link.id.startsWith("temp-");

                        return (
                            <div
                                key={link.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 group transition-opacity",
                                    isTemp && "opacity-70"
                                )}
                            >
                                <div className="flex flex-col gap-1 text-gray-400">
                                    <button
                                        onClick={() => moveLink(index, "up")}
                                        disabled={index === 0 || isTemp}
                                        className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => moveLink(index, "down")}
                                        disabled={index === localLinks.length - 1 || isTemp}
                                        className="hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{link.title}</div>
                                    <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                        <ExternalLink size={10} />
                                        {link.url}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteLink(link.id)}
                                    disabled={isTemp}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    title="Odstrániť"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add New Link */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex-1 w-full">
                    <MuiInput
                        label="Názov odkazu"
                        placeholder="napr. Môj Blog"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className="bg-white dark:bg-gray-800"
                    />
                </div>
                <div className="flex-1 w-full">
                    <MuiInput
                        label="URL adresa"
                        placeholder="https://..."
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="bg-white dark:bg-gray-800"
                    />
                </div>
                <MuiButton
                    onClick={handleAddLink}
                    disabled={!newLink.title || !newLink.url || saving}
                    className="w-full sm:w-auto h-[42px]"
                    startIcon={!saving && <Plus size={18} />}
                    loading={saving}
                >
                    Pridať
                </MuiButton>
            </div>
        </MuiCard>
    );
}
