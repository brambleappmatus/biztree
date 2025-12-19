import React from "react";
import { ExternalLink } from "lucide-react";
import { getBlockBgClass } from "@/lib/background-utils";

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

// Ensure URL has a proper protocol (http:// or https://)
function ensureProtocol(url: string): string {
    if (!url) return url;
    // If URL already has a protocol, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Add https:// to URLs without protocol
    return `https://${url}`;
}

export default function LinksBlock({ links, bgImage }: LinksBlockProps) {
    const blockBgClass = getBlockBgClass(bgImage);

    if (!links || links.length === 0) return null;

    // Sort by order
    const sortedLinks = [...links].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-2">
            {sortedLinks.map((link) => (
                <a
                    key={link.id}
                    href={ensureProtocol(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${blockBgClass} p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform`}
                    style={{ color: 'var(--card-text)' }}
                >
                    <span className="font-medium" style={{ color: 'var(--card-text)', opacity: 0.9 }}>
                        {link.title}
                    </span>
                    <ExternalLink
                        className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform"
                        style={{ color: 'var(--card-text)' }}
                    />
                </a>
            ))}
        </div>
    );
}
