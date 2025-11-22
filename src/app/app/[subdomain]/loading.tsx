"use client";

import React from "react";

export default function Loading() {
    return (
        <div className="flex flex-col gap-4 p-4 max-w-md mx-auto w-full animate-pulse animate-delayed-fade-in">
            {/* Header Skeleton - Matches HeaderBlock layout */}
            <div className="flex flex-col items-center gap-3 py-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gray-200/80 rounded-full shadow-lg"></div>

                {/* Name */}
                <div className="h-8 bg-gray-200/80 rounded-lg w-1/2 mt-2"></div>

                {/* About/Description */}
                <div className="h-4 bg-gray-200/80 rounded w-3/4"></div>
            </div>

            {/* Contact Buttons Skeleton - Matches ContactButtonsBlock (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="h-28 bg-gray-200/80 rounded-2xl"></div>
                <div className="h-28 bg-gray-200/80 rounded-2xl"></div>
            </div>

            {/* Links Skeleton - Matches LinksBlock (Menu) */}
            <div className="h-14 bg-gray-200/80 rounded-xl w-full"></div>

            {/* Hours Skeleton - Matches HoursBlock */}
            <div className="bg-gray-200/80 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-32 bg-gray-300/50 rounded"></div>
                </div>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-300/50 rounded"></div>
                        <div className="h-4 w-24 bg-gray-300/50 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
