import React from "react";
import prisma from "@/lib/prisma";
import ServicesManager from "@/components/admin/services-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ServicesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: { include: { services: true } } }
    });

    if (!user || !user.profile) {
        redirect("/onboarding");
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Správa služieb</h1>
            <ServicesManager profileId={user.profile.id} services={user.profile.services} />
        </div>
    );
}
