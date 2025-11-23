"use client";

import React, { useState, useEffect } from "react";
import { GalleryAlbum, GalleryImage, Profile } from "@prisma/client";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiButton } from "@/components/ui/mui-button";
import { Plus, Trash2, Upload, Image as ImageIcon, Folder, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface GalleryManagerProps {
    profile: Profile & { albums?: (GalleryAlbum & { images: GalleryImage[] })[] };
}

type AlbumWithImages = GalleryAlbum & { images: GalleryImage[] };

export default function GalleryManager({ profile }: GalleryManagerProps) {
    const { showToast } = useToast();
    const [albums, setAlbums] = useState<AlbumWithImages[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeAlbum, setActiveAlbum] = useState<AlbumWithImages | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState("");
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

    // Fetch albums on mount
    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const res = await fetch(`/api/gallery/albums?profileId=${profile.id}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setAlbums(data);
                // Update active album if selected
                if (activeAlbum) {
                    const updated = data.find((a: any) => a.id === activeAlbum.id);
                    if (updated) setActiveAlbum(updated);
                }
            }
        } catch (error) {
            console.error("Failed to fetch albums", error);
        }
    };

    const createAlbum = async () => {
        if (!newAlbumName.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/gallery/albums", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newAlbumName, profileId: profile.id }),
            });

            if (res.ok) {
                showToast("Album vytvorený", "success");
                setNewAlbumName("");
                setIsCreating(false);
                fetchAlbums();
            } else {
                showToast("Chyba pri vytváraní albumu", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Chyba pri vytváraní albumu", "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteAlbum = async (id: string) => {
        if (!confirm("Naozaj chcete vymazať tento album a všetky fotky v ňom?")) return;
        try {
            const res = await fetch(`/api/gallery/albums/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Album vymazaný", "success");
                if (activeAlbum?.id === id) setActiveAlbum(null);
                fetchAlbums();
            }
        } catch (error) {
            console.error(error);
            showToast("Chyba pri mazaní", "error");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeAlbum || !e.target.files?.length) return;

        const files = Array.from(e.target.files);
        setLoading(true);
        setUploadProgress({ current: 0, total: files.length });

        try {
            let completed = 0;
            for (const file of files) {
                // 1. Upload file
                const formData = new FormData();
                formData.append("file", file);
                formData.append("bucket", "gallery");

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Upload failed");
                const { url } = await uploadRes.json();

                // 2. Create DB record
                await fetch("/api/gallery/images", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url,
                        albumId: activeAlbum.id,
                        caption: file.name.split('.')[0]
                    }),
                });

                completed++;
                setUploadProgress({ current: completed, total: files.length });
            }
            showToast("Obrázky nahrané", "success");
            await fetchAlbums(); // Wait for fetch to complete
        } catch (error) {
            console.error(error);
            showToast("Chyba pri nahrávaní", "error");
        } finally {
            setLoading(false);
            setUploadProgress(null);
            // Reset file input
            e.target.value = "";
        }
    };

    const deleteImage = async (id: string) => {
        if (!confirm("Vymazať obrázok?")) return;
        try {
            const res = await fetch(`/api/gallery/images/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Obrázok vymazaný", "success");
                fetchAlbums();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <MuiCard
            title="Galéria"
            subtitle="Vytvorte albumy a nahrajte fotky vašich prác"
            action={
                !activeAlbum && (
                    <MuiButton
                        variant="outlined"
                        onClick={() => setIsCreating(true)}
                        disabled={isCreating}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nový album
                    </MuiButton>
                )
            }
        >
            <div className="mt-4">
                {/* Album List View */}
                {!activeAlbum ? (
                    <div className="space-y-4">
                        {isCreating && (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <Folder className="w-5 h-5 text-blue-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Názov albumu..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                                    value={newAlbumName}
                                    onChange={(e) => setNewAlbumName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createAlbum()}
                                />
                                <div className="flex gap-1">
                                    <MuiButton onClick={createAlbum} disabled={loading || !newAlbumName}>
                                        Uložiť
                                    </MuiButton>
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="p-2 hover:bg-gray-200 rounded-md text-gray-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {albums.length === 0 && !isCreating ? (
                            <div className="text-center py-8 text-gray-500">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Zatiaľ žiadne albumy</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {albums.map((album: AlbumWithImages) => (
                                    <div
                                        key={album.id}
                                        onClick={() => setActiveAlbum(album)}
                                        className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-blue-500 transition-all hover:shadow-md"
                                    >
                                        {album.coverUrl ? (
                                            <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Folder className="w-10 h-10 opacity-50" />
                                            </div>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                                            <h3 className="text-white font-medium text-sm truncate">{album.name}</h3>
                                            <p className="text-white/70 text-xs">{album.images.length} fotiek</p>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteAlbum(album.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Album Detail View */
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                onClick={() => setActiveAlbum(null)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h3 className="font-semibold text-lg">{activeAlbum.name}</h3>
                        </div>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={loading}
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <Upload className="w-8 h-8 mb-2" />
                                <p className="font-medium">Kliknite alebo potiahnite fotky sem</p>
                                <p className="text-xs">JPG, PNG (max 5MB)</p>
                            </div>
                            {loading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center flex-col gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    {uploadProgress && (
                                        <p className="text-sm font-medium text-gray-700">
                                            Nahrávam {uploadProgress.current} z {uploadProgress.total}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Images Carousel */}
                        <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {activeAlbum.images.map((img: GalleryImage) => (
                                <div key={img.id} className="group relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 snap-start border border-gray-200 dark:border-gray-700">
                                    <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => deleteImage(img.id)}
                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MuiCard>
    );
}
