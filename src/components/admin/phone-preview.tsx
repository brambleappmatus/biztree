import React, { useState } from 'react';
import { ExternalLink, Loader2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhonePreviewProps {
    url: string;
}

export function PhonePreview({ url }: PhonePreviewProps) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const handleRefresh = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage('refresh-profile', '*');
        }
    };

    React.useEffect(() => {
        const handleProfileUpdate = () => {
            handleRefresh();
        };

        window.addEventListener('profile-updated', handleProfileUpdate);
        return () => window.removeEventListener('profile-updated', handleProfileUpdate);
    }, []);

    return (
        <div className="flex flex-col items-center w-full max-w-[304px] mx-auto">
            <div className="relative w-full aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden ring-1 ring-gray-900/10 mx-auto max-w-[285px]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-12 h-4 bg-black/20 rounded-full" />
                </div>

                {/* Screen Content */}
                <div className="w-full h-full bg-white relative">
                    {/* Loading State - Only for initial load */}
                    {isInitialLoad && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-xs font-medium">Loading preview...</span>
                            </div>
                        </div>
                    )}

                    {/* Iframe */}
                    <iframe
                        ref={iframeRef}
                        src={`${url}${url.includes('?') ? '&' : '?'}preview=true`}
                        className={cn(
                            "w-full h-full border-0 transition-opacity duration-300",
                            isInitialLoad ? "opacity-0" : "opacity-100"
                        )}
                        style={{ zoom: 0.85 }}
                        onLoad={() => setIsInitialLoad(false)}
                        title="Mobile Preview"
                    />
                </div>
            </div>
        </div>
    );
}
