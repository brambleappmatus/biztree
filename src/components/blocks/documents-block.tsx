"use client";

import React from "react";
import { Document } from "@prisma/client";
import { FileText, File, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentsBlockProps {
    documents: Document[];
    bgImage?: string | null;
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

export default function DocumentsBlock({ documents, bgImage }: DocumentsBlockProps) {
    if (!documents || documents.length === 0) return null;

    // Determine if background is an image
    const isImageBg = bgImage?.startsWith("http") || false;

    const getFileIcon = (fileType: string) => {
        const Icon = FILE_TYPE_ICONS[fileType.toLowerCase()] || File;
        return Icon;
    };

    const handleDocumentClick = (doc: Document) => {
        // Open in new tab - browser will handle preview/download
        window.open(doc.url, "_blank");
    };

    return (
        <div
            className={cn(
                "gap-3",
                documents.length === 1 && "grid grid-cols-1",
                documents.length === 2 && "grid grid-cols-2",
                documents.length === 3 && "grid grid-cols-3",
                documents.length >= 4 && "flex overflow-x-auto snap-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            )}
        >
            {documents.map((doc) => {
                const Icon = getFileIcon(doc.fileType);

                return (
                    <button
                        key={doc.id}
                        onClick={() => handleDocumentClick(doc)}
                        className={cn(
                            "group relative h-16 rounded-xl overflow-hidden backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] text-left shadow-sm",
                            documents.length >= 4 && "flex-shrink-0 w-60 snap-start",
                            isImageBg
                                ? "bg-white/90 border border-white/40 hover:bg-white/95"
                                : "bg-white border border-gray-100 hover:border-gray-200"
                        )}
                        style={{ margin: '1px' }}
                    >
                        {/* Icon background */}
                        <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center bg-gray-50/50">
                            <Icon className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 left-14 px-3 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-gray-900 font-semibold text-sm leading-tight truncate pr-6">
                                        {doc.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mt-0.5">
                                        <span className="uppercase font-medium">{doc.fileType}</span>
                                        <span>•</span>
                                        <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                                    </div>
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100 transition-all">
                                    <Download className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
