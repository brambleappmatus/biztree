"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { GalleryAlbum, GalleryImage } from "@prisma/client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryModalProps {
    album: GalleryAlbum & { images: GalleryImage[] };
    onClose: () => void;
}

export default function GalleryModal({ album, onClose }: GalleryModalProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedImageIndex !== null) {
                    setSelectedImageIndex(null);
                } else {
                    onClose();
                }
            }
            if (selectedImageIndex !== null) {
                if (e.key === 'ArrowLeft') {
                    setSelectedImageIndex((prev) =>
                        prev === null ? null : prev > 0 ? prev - 1 : album.images.length - 1
                    );
                }
                if (e.key === 'ArrowRight') {
                    setSelectedImageIndex((prev) =>
                        prev === null ? null : (prev + 1) % album.images.length
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex, album.images.length, onClose]);

    if (!mounted) return null;

    const modalContent = (
        <>
            {/* Album Grid Modal */}
            <AnimatePresence>
                {selectedImageIndex === null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)' }}
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{album.name}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {album.images.length} {album.images.length === 1 ? 'fotka' : 'fotiek'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Image Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {album.images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all"
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.caption || `Image ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox - Completely Separate */}
            <AnimatePresence mode="wait">
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(20px)', willChange: 'opacity' }}
                        onClick={() => setSelectedImageIndex(null)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImageIndex(null)}
                            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:top-8 px-4 py-2 bg-black/50 rounded-full text-white text-sm font-medium">
                            {selectedImageIndex + 1} / {album.images.length}
                        </div>

                        {/* Previous Button */}
                        {album.images.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((prev) =>
                                        prev === null ? null : prev > 0 ? prev - 1 : album.images.length - 1
                                    );
                                }}
                                className="absolute left-4 sm:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                            >
                                <ChevronLeft className="w-8 h-8 text-white" />
                            </button>
                        )}

                        {/* Image */}
                        <motion.div
                            key={selectedImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4 sm:p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={album.images[selectedImageIndex].url}
                                alt={album.images[selectedImageIndex].caption || `Image ${selectedImageIndex + 1}`}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                loading="eager"
                            />
                        </motion.div>

                        {/* Next Button */}
                        {album.images.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((prev) =>
                                        prev === null ? null : (prev + 1) % album.images.length
                                    );
                                }}
                                className="absolute right-4 sm:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    return createPortal(modalContent, document.body);
}
