import { NextResponse } from "next/server";
import { getCurrentUserFeatures } from "@/lib/licensing";

export async function GET() {
    try {
        const features = await getCurrentUserFeatures();
        return NextResponse.json({ features });
    } catch (error) {
        console.error("Failed to fetch user features:", error);
        return NextResponse.json({ features: [] }, { status: 500 });
    }
}
