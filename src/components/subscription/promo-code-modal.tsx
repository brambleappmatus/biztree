"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiButton } from "@/components/ui/mui-button";

interface PromoCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (code: string) => void;
    loading?: boolean;
}

export function PromoCodeModal({
    isOpen,
    onClose,
    onApply,
    loading = false,
}: PromoCodeModalProps) {
    const [mounted, setMounted] = useState(false);
    const [code, setCode] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            onApply(code.trim());
        }
    };

    if (!mounted) return null;

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
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <Tag size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Máte promo kód?
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Zadajte kód kupónu pre získanie zľavy na predplatné.
                                    </p>
                                    <MuiInput
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="napr. ZLAVA20"
                                        className="text-center font-mono tracking-wider uppercase"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        Zrušiť
                                    </button>
                                    <MuiButton
                                        type="submit"
                                        disabled={loading || !code.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {loading ? "Overujem..." : "Použiť kód"}
                                    </MuiButton>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
