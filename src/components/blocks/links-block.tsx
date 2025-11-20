import React from "react";
import { ExternalLink } from "lucide-react";
import { getBlockBgClass, isLightBackground } from "@/lib/background-utils";

interface Link {
    id: string;
    title: string;
    url: string;
    order: number;
}

interface LinksBlockProps {
    links: Link[];
    bgImage: string | null;
}

export default function LinksBlock({ links, bgImage }: LinksBlockProps) {
    const blockBgClass = getBlockBgClass(bgImage);
    const isLight = isLightBackground(bgImage);

    if (!links || links.length === 0) return null;

    // Sort by order
    const sortedLinks = [...links].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-2">
            {sortedLinks.map((link) => (
                <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${blockBgClass} p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform`}
                >
                    <span className={`font-medium ${isLight ? "text-white" : "text-gray-900"}`}>
                        {link.title}
                    </span>
                    <ExternalLink
                        className={`w-5 h-5 ${isLight ? "text-white/70" : "text-gray-400"} group-hover:translate-x-1 transition-transform`}
                    />
                </a>
            ))}
        </div>
    );
}
