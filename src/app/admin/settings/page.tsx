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
            profile: {
                include: {
                    socialLinks: true,
                    hours: true
                }
            }
        }
    });

    if (!user || !user.profile) {
        redirect("/onboarding");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Nastavenia profilu</h1>
            <ProfileForm profile={user.profile} />
        </div>
    );
}
