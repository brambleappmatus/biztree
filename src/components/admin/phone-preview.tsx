import React, { useState } from 'react';
import { ExternalLink, Loader2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhonePreviewProps {
    url: string;
}

export function PhonePreview({ url }: PhonePreviewProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // Used to force refresh iframe

    const handleRefresh = () => {
        setIsLoading(true);
        setKey(prev => prev + 1);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-[380px] mx-auto">
            {/* Header / Actions */}
            <div className="w-full flex items-center justify-between mb-4 px-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Smartphone size={16} />
                    <span>Live Preview</span>
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                    <span>Open live</span>
                    <ExternalLink size={12} />
                </a>
            </div>

            {/* Phone Frame */}
            <div className="relative w-full aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-xl border-[8px] border-gray-900 overflow-hidden ring-1 ring-gray-900/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-16 h-4 bg-black/20 rounded-full" />
                </div>

                {/* Screen Content */}
                <div className="w-full h-full bg-white relative">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-xs font-medium">Loading preview...</span>
                            </div>
                        </div>
                    )}

                    {/* Iframe */}
                    <iframe
                        key={key}
                        src={url}
                        className={cn(
                            "w-full h-full border-0 transition-opacity duration-300",
                            isLoading ? "opacity-0" : "opacity-100"
                        )}
                        onLoad={() => setIsLoading(false)}
                        title="Mobile Preview"
                    />
                </div>

                {/* Status Bar Mockup (Optional, for realism) */}
                <div className="absolute top-1 right-5 z-20 flex gap-1">
                    <div className="w-3 h-3 rounded-full border border-gray-600/50" />
                    <div className="w-3 h-3 rounded-full bg-gray-600/50" />
                </div>
            </div>

            {/* Bottom Text */}
            <p className="mt-4 text-xs text-center text-gray-400">
                Changes are saved automatically
            </p>
        </div>
    );
}
