"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    featureName?: string;
}

export function PremiumModal({
    isOpen,
    onClose,
    title = "Odomknite Premium funkcie",
    description,
    featureName,
}: PremiumModalProps) {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleUpgrade = () => {
        router.push("/admin/subscription");
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5"
                    >
                        {/* Decorative background pattern */}


                        <div className="relative p-6 pt-8">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                    <Lock size={32} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
                                    {description || (featureName ? `Funkcia ${featureName} je dostupná len vo vyššom balíku.` : "Táto funkcia je dostupná len vo vyššom balíku.")}
                                    <br />
                                    Prejdite na vyšší balík a získajte prístup ihneď.
                                </p>

                                <button
                                    onClick={handleUpgrade}
                                    className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Crown size={18} className="text-yellow-300" />
                                    Prejsť na vyšší balík
                                    <ArrowRight size={16} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                <button
                                    onClick={onClose}
                                    className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Neskôr
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
