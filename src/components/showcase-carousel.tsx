"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Showcase {
    id: string;
    name: string;
    imageUrl: string;
    profileUrl: string;
}

interface ShowcaseCarouselProps {
    showcases: Showcase[];
}

export default function ShowcaseCarousel({ showcases }: ShowcaseCarouselProps) {
    const [hoveredDemo, setHoveredDemo] = useState<number | null>(null);

    // If no showcases, show placeholder
    if (showcases.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Žiadne ukážky zatiaľ nie sú k dispozícii.</p>
            </div>
        );
    }

    // Triple the showcases for infinite scroll effect
    const displayShowcases = [...showcases, ...showcases, ...showcases];

    return (
        <div className="flex gap-6 animate-scroll-slow hover:pause-animation">
            {displayShowcases.map((showcase, index) => (
                <button
                    key={`${showcase.id}-${index}`}
                    onClick={() => window.open(showcase.profileUrl, '_blank')}
                    onMouseEnter={() => setHoveredDemo(index)}
                    onMouseLeave={() => setHoveredDemo(null)}
                    className="flex-shrink-0 relative group cursor-pointer transition-all duration-300"
                    style={{ width: '280px' }}
                >
                    {/* Phone Frame */}
                    <div className={cn(
                        "relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl transition-all duration-300",
                        hoveredDemo === index && "scale-105"
                    )}>
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

                        {/* Screen */}
                        <div className={cn(
                            "relative bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19] transition-opacity duration-300",
                            hoveredDemo === index && "opacity-60"
                        )}>
                            {/* Screenshot or placeholder */}
                            {showcase.imageUrl ? (
                                <img
                                    src={showcase.imageUrl}
                                    alt={showcase.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                                    <div className="text-center text-gray-300">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full"></div>
                                        <div className="w-32 h-3 bg-gray-100 rounded mb-2 mx-auto"></div>
                                        <div className="w-24 h-3 bg-gray-100 rounded mx-auto"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hover CTA */}
                    {hoveredDemo === index && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 animate-fade-up">
                            <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2">
                                Otvoriť demo <ExternalLink size={18} />
                            </div>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
