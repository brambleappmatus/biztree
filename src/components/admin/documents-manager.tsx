"use client";

import React, { useState, useEffect } from "react";
import { Document, Profile } from "@prisma/client";
import { MuiCard } from "@/components/ui/mui-card";
import { MuiButton } from "@/components/ui/mui-button";
import { Plus, Trash2, Upload, FileText, File, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface DocumentsManagerProps {
    profile: Profile & { documents?: Document[] };
}

const FILE_TYPE_ICONS: Record<string, any> = {
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    xls: File,
    xlsx: File,
    jpg: File,
    png: File,
};

const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENTS = 6;

export default function DocumentsManager({ profile }: DocumentsManagerProps) {
    const { showToast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/documents?profileId=${profile.id}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
        }
    };

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return "Nepodporovaný typ súboru. Povolené: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "Súbor je príliš veľký. Maximum je 10MB";
        }
        return null;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);

        // Check total count
        if (documents.length + files.length > MAX_DOCUMENTS) {
            showToast(`Maximum ${MAX_DOCUMENTS} dokumentov povolených`, "error");
            e.target.value = "";
            return;
        }

        // Validate all files first
        for (const file of files) {
            const error = validateFile(file);
            if (error) {
                showToast(error, "error");
                e.target.value = "";
                return;
            }
        }

        setLoading(true);
        setUploadProgress({ current: 0, total: files.length });

        try {
            let completed = 0;
            for (const file of files) {
                // 1. Upload file to Supabase
                const formData = new FormData();
                formData.append("file", file);
                formData.append("bucket", "documents");

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const error = await uploadRes.json();
                    throw new Error(error.error || "Upload failed");
                }

                const { url } = await uploadRes.json();

                // 2. Create DB record
                const fileExt = file.name.split(".").pop()?.toLowerCase() || "file";
                await fetch("/api/documents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: file.name,
                        url,
                        fileType: fileExt,
                        fileSize: file.size,
                        profileId: profile.id,
                    }),
                });

                completed++;
                setUploadProgress({ current: completed, total: files.length });
            }

            showToast("Dokumenty nahrané", "success");
            await fetchDocuments();

            // Trigger preview refresh
            window.dispatchEvent(new Event('profile-updated'));
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Chyba pri nahrávaní", "error");
        } finally {
            setLoading(false);
            setUploadProgress(null);
            e.target.value = "";
        }
    };

    const deleteDocument = async (id: string) => {
        if (!confirm("Vymazať dokument?")) return;
        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Dokument vymazaný", "success");
                fetchDocuments();

                // Trigger preview refresh
                window.dispatchEvent(new Event('profile-updated'));
            }
        } catch (error) {
            console.error(error);
            showToast("Chyba pri mazaní", "error");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const getFileIcon = (fileType: string) => {
        const Icon = FILE_TYPE_ICONS[fileType.toLowerCase()] || File;
        return Icon;
    };

    return (
        <MuiCard
            title="Dokumenty"
            subtitle="Nahrajte dokumenty, menu, PDF a iné súbory"
        >
            <div className="mt-4 space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading || documents.length >= MAX_DOCUMENTS}
                    />
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="font-medium">Kliknite alebo potiahnite súbory sem</p>
                        <p className="text-xs">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)</p>
                        <p className="text-xs font-semibold">
                            {documents.length} / {MAX_DOCUMENTS} dokumentov
                        </p>
                    </div>
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center flex-col gap-2 rounded-xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            {uploadProgress && (
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nahrávam {uploadProgress.current} z {uploadProgress.total}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Documents List */}
                {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Zatiaľ žiadne dokumenty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {documents.map((doc) => {
                            const Icon = getFileIcon(doc.fileType);
                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{doc.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {doc.fileType.toUpperCase()} • {formatFileSize(doc.fileSize)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteDocument(doc.id)}
                                        className="flex-shrink-0 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MuiCard>
    );
}
