import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = "prDVQPHMZnWoJAPqb10BciATCfCIORtc6DTKiWRQAIs";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    try {
        let apiUrl: string;

        if (query && query.trim()) {
            // Search for specific query
            apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`;
        } else {
            // Get trending/popular photos
            apiUrl = `https://api.unsplash.com/photos?per_page=12&order_by=popular&orientation=landscape`;
        }

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Unsplash API error:", response.status, errorText);
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform the response to only include what we need
        const results = query ? data.results : data;
        const photos = results.map((photo: any) => ({
            id: photo.id,
            urls: {
                regular: photo.urls.regular,
                small: photo.urls.small,
                thumb: photo.urls.thumb,
            },
            alt: photo.alt_description || photo.description || "Background image",
            photographer: {
                name: photo.user.name,
                username: photo.user.username,
                link: photo.user.links.html,
            },
        }));

        return NextResponse.json({ photos });
    } catch (error) {
        console.error("Unsplash API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch images from Unsplash", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
