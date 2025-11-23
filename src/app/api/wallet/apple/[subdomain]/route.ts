import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const { subdomain } = await params;

        // Fetch profile data
        const profile = await prisma.profile.findUnique({
            where: { subdomain },
            select: {
                name: true,
                email: true,
                phone: true,
                about: true,
                address: true,
                avatarUrl: true,
                logo: true,
                subdomain: true,
            },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        // For now, we'll use a simple approach that generates a vCard
        // In production, you'd want to use PassKit.io API or similar service
        // This is a placeholder that returns the profile data for pass generation

        // Generate vCard content
        const vCard = generateVCard(profile);

        // For Apple Wallet, we need to generate a .pkpass file
        // This requires signing with Apple certificates
        // For MVP, we'll return a vCard that can be saved to contacts
        // TODO: Implement proper PKPass generation with signing

        return new NextResponse(vCard, {
            headers: {
                "Content-Type": "text/vcard",
                "Content-Disposition": `attachment; filename="${profile.name.replace(/\s+/g, "_")}.vcf"`,
            },
        });
    } catch (error) {
        console.error("Error generating Apple Wallet pass:", error);
        return NextResponse.json(
            { error: "Failed to generate pass" },
            { status: 500 }
        );
    }
}

function generateVCard(profile: {
    name: string;
    email: string | null;
    phone: string | null;
    about: string | null;
    address: string | null;
    avatarUrl: string | null;
    logo: string | null;
    subdomain: string;
}): string {
    const lines = ["BEGIN:VCARD", "VERSION:3.0"];

    // Name
    const nameParts = profile.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    lines.push(`N:${lastName};${firstName};;;`);
    lines.push(`FN:${profile.name}`);

    // Email
    if (profile.email) {
        lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`);
    }

    // Phone
    if (profile.phone) {
        lines.push(`TEL;TYPE=CELL:${profile.phone}`);
    }

    // Address
    if (profile.address) {
        lines.push(`ADR;TYPE=WORK:;;${profile.address};;;;`);
    }

    // Note/About
    if (profile.about) {
        lines.push(`NOTE:${profile.about}`);
    }

    // URL
    lines.push(`URL:https://${profile.subdomain}.biztree.bio`);

    // Photo (if available)
    if (profile.avatarUrl || profile.logo) {
        const photoUrl = profile.avatarUrl || profile.logo;
        lines.push(`PHOTO;VALUE=URL:${photoUrl}`);
    }

    lines.push("END:VCARD");

    return lines.join("\r\n");
}
