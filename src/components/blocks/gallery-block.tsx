"use client";

import React, { useState } from "react";
import { GalleryAlbum, GalleryImage } from "@prisma/client";
import { Folder, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import GalleryModal from "@/components/profile/gallery-modal";

interface GalleryBlockProps {
    albums: (GalleryAlbum & { images: GalleryImage[] })[];
    bgImage?: string | null;
}

export default function GalleryBlock({ albums, bgImage }: GalleryBlockProps) {
    const [selectedAlbum, setSelectedAlbum] = useState<(GalleryAlbum & { images: GalleryImage[] }) | null>(null);

    if (!albums || albums.length === 0) return null;

    // Determine text color based on background
    const isDarkBg = bgImage && bgImage !== "none" && !bgImage.startsWith("#f"); // Simple heuristic
    const textColor = isDarkBg ? "text-white" : "text-gray-900";
    const subTextColor = isDarkBg ? "text-gray-300" : "text-gray-500";

    return (
        <>
            <div className={cn(
                "gap-4",
                albums.length === 1 && "grid grid-cols-1",
                albums.length === 2 && "grid grid-cols-2",
                albums.length === 3 && "grid grid-cols-3",
                albums.length >= 4 && "flex overflow-x-auto snap-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-2"
            )}>
                {albums.map((album) => (
                    <button
                        key={album.id}
                        onClick={() => setSelectedAlbum(album)}
                        className={cn(
                            "group relative h-32 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all hover:scale-[1.02] active:scale-[0.98] text-left",
                            albums.length >= 4 && "flex-shrink-0 w-64 snap-start"
                        )}
                    >
                        {album.coverUrl ? (
                            <img
                                src={album.coverUrl}
                                alt={album.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100/50">
                                <Folder className={cn("w-12 h-12 opacity-50", isDarkBg ? "text-white" : "text-gray-900")} />
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                            <h3 className="text-white font-bold text-lg leading-tight truncate">{album.name}</h3>
                            <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium mt-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>{album.images.length} fotiek</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {selectedAlbum && (
                <GalleryModal
                    album={selectedAlbum}
                    onClose={() => setSelectedAlbum(null)}
                />
            )}
        </>
    );
}
