import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./layout-client";
import { getProfileFeatures } from "@/lib/licensing";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        // If no session, middleware should have caught this, but just in case
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profiles: { select: { id: true, subdomain: true } } }
    });

    const hasProfile = user?.profiles && user.profiles.length > 0;
    const subdomain = hasProfile ? user.profiles[0].subdomain : null;
    const profileId = hasProfile ? user.profiles[0].id : null;

    // Redirect to onboarding if user has no profile
    // We need to check if we are already on onboarding page? 
    // Wait, this layout is for /admin. /onboarding is likely at /onboarding or /admin/onboarding?
    // If /onboarding is outside /admin layout, then we are safe.
    // Based on file structure, /onboarding wasn't in /admin. Let's assume it's at root /onboarding.

    if (!hasProfile) {
        redirect("/onboarding");
    }

    // Pre-fetch features server-side to eliminate loading state
    const features = profileId ? await getProfileFeatures(profileId) : [];

    return (
        <AdminLayoutClient subdomain={subdomain} initialFeatures={features}>
            {children}
        </AdminLayoutClient>
    );
}
