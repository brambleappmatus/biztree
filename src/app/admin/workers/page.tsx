import React from "react";
import prisma from "@/lib/prisma";
import WorkersManager from "@/components/admin/workers-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";
import { PageHeader } from "@/components/ui/page-header";

export default async function WorkersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                include: {
                    workers: true,
                    tier: true
                }
            }
        }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    return (
        <div>
            <PageHeader
                title="Správa pracovníkov"
                description="Spravujte svoj tím a priraďujte pracovníkov k službám."
            />
            <WorkersManager
                profileId={user.profiles[0].id}
                workers={user.profiles[0].workers}
                tierName={user.profiles[0].tier?.name}
            />
        </div>
    );
}
