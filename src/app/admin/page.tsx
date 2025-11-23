import React from "react";
import prisma from "@/lib/prisma";
import ProfileForm from "@/components/admin/profile-form";
import SettingsSidebar from "@/components/admin/SettingsSidebar";
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
        <div className="relative w-full">
            {/* Sidebar Navigation - Fixed on the left */}
            <aside className="hidden lg:block fixed left-8 top-8 w-56 h-[calc(100vh-4rem)] overflow-y-auto">
                <SettingsSidebar />
            </aside>

            {/* Main Content - Centered with margins for sidebar and preview */}
            <div className="lg:ml-64 lg:mr-0">
                <h1 className="text-2xl font-bold mb-6">Nastavenia profilu</h1>
                <ProfileForm profile={user.profiles[0]} />
            </div>
        </div>
    );
}
