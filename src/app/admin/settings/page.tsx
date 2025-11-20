import React from "react";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/admin/profile-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            profiles: {
                include: {
                    socialLinks: true,
                    hours: true,
                    links: true
                }
            }
        }
    });

    if (!user || !user.profiles || user.profiles.length === 0) {
        redirect("/onboarding");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Nastavenia profilu</h1>
            <ProfileForm profile={user.profiles[0]} />
        </div>
    );
}
