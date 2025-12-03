import React from "react";
import { ProfileCore } from "@/types";
import { Language } from "@/lib/i18n";

interface HeaderBlockProps {
    profile: ProfileCore;
    lang: Language;
    bgImage: string | null;
}

export default function HeaderBlock({ profile, lang, bgImage }: HeaderBlockProps) {
    return (
        <div className="flex flex-col items-center text-center gap-3 py-6 animate-fade-up" style={{ color: 'var(--header-text)' }}>
            {/* Logo */}
            {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover shadow-lg" />
            ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300 shadow-lg">
                    {profile.name.charAt(0).toUpperCase()}
                </div>
            )}

            {/* Name */}
            <h1 className="text-2xl font-bold">{profile.name}</h1>

            {/* About */}
            {profile.about && (
                <p className="text-sm max-w-md opacity-90">{profile.about}</p>
            )}
        </div>
    );
}
