import React from "react";
import prisma from "@/lib/prisma";
import ServicesManager from "@/components/admin/services-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";

export default async function ServicesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profiles: { include: { services: true } } }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    return (
        <LockedFeatureGuard featureKey="page_services">
            <div>
                <h1 className="text-2xl font-bold mb-6">Správa služieb</h1>
                <ServicesManager
                    profileId={user.profiles[0].id}
                    services={user.profiles[0].services}
                    isGoogleConnected={!!((user.profiles[0] as any).googleAccessToken && (user.profiles[0] as any).googleRefreshToken)}
                />
            </div>
        </LockedFeatureGuard>
    );
}
