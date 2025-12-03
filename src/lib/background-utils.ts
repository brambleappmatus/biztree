// Simplified background utilities - no automatic text color logic
export function isImageBackground(bgId: string | null): boolean {
    // Check if bgId is an image URL (starts with http)
    return bgId?.startsWith("http") || false;
}

export function getBlockBgClass(bgId: string | null): string {
    // Use the standardized ios-card class which uses CSS variables for customization
    return "ios-card";
}
