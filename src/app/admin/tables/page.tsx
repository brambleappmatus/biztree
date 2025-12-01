import React from "react";
import prisma from "@/lib/prisma";
import TablesManager from "@/components/admin/tables-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockedFeatureGuard } from "@/components/admin/LockedFeatureGuard";
import { PageHeader } from "@/components/ui/page-header";

export default async function TablesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                include: {
                    tables: true,
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
                title="Správa stolov"
                description="Spravujte rozloženie stolov a ich kapacity."
            />
            <TablesManager
                profileId={user.profiles[0].id}
                tables={user.profiles[0].tables}
                tierName={user.profiles[0].tier?.name}
            />
        </div>
    );
}
