// Helper to determine if a background preset is light or dark
export function isLightBackground(bgId: string | null): boolean {
    // Only white background is considered truly "light"
    return bgId === "white";
}

export function isImageBackground(bgId: string | null): boolean {
    // Check if bgId is an image URL (starts with http)
    return bgId?.startsWith("http") || false;
}

export function getTextColorClass(bgId: string | null): string {
    // Image backgrounds = white text for better readability
    if (isImageBackground(bgId)) return "text-white";
    // White background = dark text, all others = white text
    return bgId === "white" ? "text-gray-900" : "text-white";
}

export function getBlockBgClass(bgId: string | null): string {
    // Image backgrounds = semi-transparent white blocks for readability
    if (isImageBackground(bgId)) return "bg-white/90 backdrop-blur-sm border border-white/30";
    // White background = dark blocks with no border
    // All other backgrounds = white blocks with subtle border
    return bgId === "white"
        ? "bg-gray-900/90 backdrop-blur-sm"
        : "bg-white/95 backdrop-blur-sm border border-white/20";
}
